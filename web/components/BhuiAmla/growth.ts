/**
 * Bhui Amla botanical generation — ported verbatim (algorithm untouched)
 * from the verified/tuned prototype (khatore-homepage-v6-1.html,
 * "BHUI AMLA — scroll-driven botanical growth study"). Only change from
 * that source: the RNG and output arrays are function-local instead of
 * module-level globals, so `generatePlant()` is safe to call more than
 * once (React StrictMode double-invoke, remount on client navigation)
 * without accumulating stale geometry across calls.
 *
 * 5-stem clump + 2 basal shoots + alternating branches + mid-canopy
 * sub-branches + two-row leaflets + seed capsules, all pushed into one
 * ordered `growthUnits` array in depth-first growth order — that single
 * ordering is what makes scroll-driven growth cheap: the merged wood
 * mesh's index buffer is built in that exact order, so revealing the
 * plant is just geometry.setDrawRange(0, N).
 */
import * as THREE from 'three';

function mulberry32(seed: number) {
  return function rng() {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const lerp = THREE.MathUtils.lerp;
export const smooth01 = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};
export const degToRad = THREE.MathUtils.degToRad;

// Brand green corrected to #159552 (was #3D7835) — these three tones
// are the same --green-dk/--green/--green-lt relationship as the CSS
// tokens in globals.css, recalculated from the new base the same way,
// so the plant's own material colors stay coherent with the rest of
// the UI. Botanical generation logic (below) is untouched.
export const GREEN_DK = new THREE.Color('#0E6A3A');
export const GREEN = new THREE.Color('#159552');
export const GREEN_LT = new THREE.Color('#1BBA63');
export const LEAF_TONES = [new THREE.Color('#0E6A3A'), new THREE.Color('#159552'), new THREE.Color('#1BBA63')];
export const CAPSULE_TONE = new THREE.Color('#0E6A3A');
const ROOT_TONE = new THREE.Color('#0E6A3A');

export interface GrowthUnit {
  curve: THREE.CatmullRomCurve3;
  sStart: number;
  sEnd: number;
  radiusBase: number;
  radiusEnd: number;
  color: THREE.Color;
  pathSegments: number;
  radialSegments: number;
  indexCount: number;
  cumStart: number;
  cumEnd: number;
}
export interface LeafDatum {
  position: THREE.Vector3;
  tangent: THREE.Vector3;
  sideSign: number;
  toneIndex: number;
  scaleJitter: number;
  asymJitter: number;
  phase: number;
  speed: number;
  amp: number;
  growthThreshold: number;
}
export interface CapsuleDatum {
  position: THREE.Vector3;
  growthThreshold: number;
}
export interface EnvelopePoint {
  p: number;
  minY: number;
  maxY: number;
  maxR: number;
}
export interface Plant {
  growthUnits: GrowthUnit[];
  leaves: LeafDatum[];
  capsules: CapsuleDatum[];
  maxHeight: number;
  totalIndexCount: number;
  envelope: EnvelopePoint[];
}

export function generatePlant(seed = 19840917): Plant {
  const rng = mulberry32(seed);
  const rand = (a = 0, b = 1) => a + rng() * (b - a);

  type PendingUnit = Omit<GrowthUnit, 'indexCount' | 'cumStart' | 'cumEnd'>;
  const growthUnits: PendingUnit[] = [];
  const leavesOut: (Omit<LeafDatum, 'growthThreshold'> & { unitRef: PendingUnit; localS: number })[] = [];
  const capsulesOut: { position: THREE.Vector3; unitRef: PendingUnit; localS: number }[] = [];

  function pushUnit(
    curve: THREE.CatmullRomCurve3,
    sStart: number,
    sEnd: number,
    radiusAtStart: number,
    radiusAtEnd: number,
    color: THREE.Color,
    pathSegments: number,
    radialSegments: number,
  ): PendingUnit {
    const unit: PendingUnit = {
      curve,
      sStart,
      sEnd,
      radiusBase: radiusAtStart,
      radiusEnd: radiusAtEnd,
      color,
      pathSegments,
      radialSegments,
    };
    growthUnits.push(unit);
    return unit;
  }

  function placeLeafPair(curve: THREE.CatmullRomCurve3, s: number, toneBase: number, unit: PendingUnit, localS: number, scale: number) {
    const bPoint = curve.getPointAt(s);
    const bTangent = curve.getTangentAt(s).normalize();
    [1, -1].forEach((rowSign, rowIdx) => {
      const toneIndex = rng() < 0.2 ? 0 : clamp(toneBase - (rowIdx === 0 ? 0 : 1), 1, LEAF_TONES.length - 1);
      leavesOut.push({
        position: bPoint.clone(),
        tangent: bTangent.clone(),
        sideSign: rowSign * (rng() > 0.15 ? 1 : -1),
        toneIndex,
        scaleJitter: rand(0.78, 1.18) * scale,
        asymJitter: rand(-1, 1),
        phase: rand(0, Math.PI * 2),
        speed: rand(0.35, 0.75),
        amp: rand(0.035, 0.09),
        unitRef: unit,
        localS,
      });
      if (s > 0.25 && s < 0.8 && rng() < 0.16) {
        capsulesOut.push({ position: bPoint.clone().addScaledVector(new THREE.Vector3(0, -1, 0), 0.03), unitRef: unit, localS });
      }
    });
  }

  function addLeavesInRange(curve: THREE.CatmullRomCurve3, sStart: number, sEnd: number, leafPairs: number, toneBase: number, unit: PendingUnit, densityScale: number) {
    const span = sEnd - sStart;
    if (span <= 1e-5 || leafPairs <= 0) return;
    for (let lp = 1; lp <= leafPairs; lp++) {
      const frac = clamp((lp / (leafPairs + 0.6)) * rand(0.94, 1.05), 0.02, 0.99);
      const s = sStart + frac * span;
      placeLeafPair(curve, s, toneBase, unit, frac, densityScale);
      if (rng() < 0.11) {
        const frac2 = clamp(frac + rand(-0.05, 0.05) / Math.max(span, 0.05), 0.02, 0.99);
        placeLeafPair(curve, sStart + frac2 * span, toneBase, unit, frac2, densityScale * rand(0.7, 0.92));
      }
    }
  }

  function growSegmented(
    curve: THREE.CatmullRomCurve3,
    radiusBase: number,
    radiusTip: number,
    color: THREE.Color,
    toneBase: number,
    leafPairsTotal: number,
    densityScale: number,
    children: { s: number; spawn: () => void }[],
    pathSegTotal: number,
    radialSegments: number,
  ) {
    const sorted = children.slice().sort((a, b) => a.s - b.s);
    let prevS = 0;
    const boundaries = sorted.map((c) => c.s).concat([1]);
    boundaries.forEach((boundS, i) => {
      const segStart = prevS;
      const segEnd = Math.max(boundS, prevS + 1e-4);
      const segSpan = segEnd - segStart;
      if (segSpan > 1e-4) {
        const segPathSegs = Math.max(2, Math.round(pathSegTotal * segSpan));
        const rAtStart = lerp(radiusBase, radiusTip, segStart);
        const rAtEnd = lerp(radiusBase, radiusTip, segEnd);
        const unit = pushUnit(curve, segStart, segEnd, rAtStart, rAtEnd, color, segPathSegs, radialSegments);
        const segLeafPairs = Math.round(leafPairsTotal * segSpan);
        addLeavesInRange(curve, segStart, segEnd, segLeafPairs, toneBase, unit, densityScale);
      }
      if (i < sorted.length) sorted[i]!.spawn();
      prevS = boundS;
    });
  }

  function makeBranchPositions(count: number, height: number) {
    const gap0 = height / (count * 0.62);
    const decay = 0.965;
    const positions: number[] = [];
    let h = height * 0.085;
    let gap = gap0;
    for (let i = 0; i < count; i++) {
      positions.push(clamp(h / height, 0.04, 0.965));
      gap *= decay * rand(0.78, 1.28);
      h += gap;
    }
    return positions;
  }

  function buildStemPoints({
    baseX,
    baseZ,
    height,
    segments,
    xWanderAmp,
    zWanderAmp,
    lean,
  }: {
    baseX: number;
    baseZ: number;
    height: number;
    segments: number;
    xWanderAmp: number;
    zWanderAmp: number;
    lean: { x: number; z: number };
  }) {
    const pts: THREE.Vector3[] = [];
    const freqA = rand(0.55, 0.85);
    const freqB = rand(1.3, 1.9);
    const phaseA = rand(0, Math.PI * 2);
    const phaseB = rand(0, Math.PI * 2);
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const wob = Math.sin(t * Math.PI * freqA + phaseA) * xWanderAmp + Math.sin(t * Math.PI * freqB + phaseB) * xWanderAmp * 0.35;
      const wobZ = Math.cos(t * Math.PI * (freqA * 0.8) + phaseB) * zWanderAmp + Math.cos(t * Math.PI * (freqB * 0.6) + phaseA) * zWanderAmp * 0.4;
      pts.push(new THREE.Vector3(baseX + wob + lean.x * t, t * height, baseZ + wobZ + lean.z * t));
    }
    return pts;
  }

  function spawnBranch(
    originPoint: THREE.Vector3,
    sideSign: number,
    zSign: number,
    t: number,
    lenScale: number,
    radiusBase: number,
    radiusTip: number,
    color: THREE.Color,
    toneBase: number,
    densityScale: number,
    allowSub: boolean,
  ) {
    const azJitter = rand(-0.14, 0.14);
    const baseAz = sideSign > 0 ? 0 : Math.PI;
    const az = baseAz + azJitter + (zSign > 0 ? 0.12 : -0.12);
    const riseAmt = rand(0.02, 0.1);
    const outward = new THREE.Vector3(Math.cos(az) * (1 - riseAmt), riseAmt, Math.sin(az) * (1 - riseAmt)).normalize();
    const lenFalloff = 1 - t * 0.6;
    const branchLen = lenScale * lenFalloff * rand(0.68, 1.3);
    const midPt = originPoint.clone().addScaledVector(outward, branchLen * 0.55).addScaledVector(new THREE.Vector3(0, 1, 0), branchLen * 0.1);
    const tipPt = originPoint.clone().addScaledVector(outward, branchLen).addScaledVector(new THREE.Vector3(0, 1, 0), branchLen * 0.16 * rand(0.6, 1));
    const branchCurve = new THREE.CatmullRomCurve3([originPoint.clone(), midPt, tipPt], false, 'catmullrom', 0.5);

    const leafPairsTotal = Math.round(lerp(9, 4, t) * rand(0.85, 1.2) * densityScale);
    const children: { s: number; spawn: () => void }[] = [];
    if (allowSub) {
      const midCanopy = 1 - Math.abs(t - 0.45) / 0.45;
      const subChance = clamp(midCanopy * 0.14, 0.02, 0.14);
      let subCount = rng() < subChance ? 1 : 0;
      if (subCount === 1 && rng() < 0.18) subCount = 2;
      for (let i = 0; i < subCount; i++) {
        const sAtt = rand(0.32, 0.78);
        const subSide = rng() > 0.5 ? 1 : -1;
        const subZ = rng() > 0.5 ? 1 : -1;
        children.push({
          s: sAtt,
          spawn: () =>
            spawnBranch(
              branchCurve.getPointAt(sAtt),
              subSide,
              subZ,
              rand(0.15, 0.55),
              branchLen * rand(0.4, 0.62),
              radiusBase * 0.5,
              Math.max(radiusTip * 0.5, 0.003),
              color,
              clamp(toneBase + 1, 1, LEAF_TONES.length - 1),
              densityScale * 0.65,
              false,
            ),
        });
      }
    }
    growSegmented(branchCurve, radiusBase, radiusTip, color, toneBase, leafPairsTotal, densityScale, children, 8, 5);
  }

  interface StemDef {
    baseX: number;
    baseZ: number;
    height: number;
    branches: number;
    radiusBase: number;
    radiusTip: number;
    xWanderAmp: number;
    zWanderAmp: number;
    lean: { x: number; z: number };
    color: THREE.Color;
    isMain: boolean;
    toneBase: number;
  }

  function spawnStem(def: StemDef) {
    const segments = 28;
    const points = buildStemPoints({ ...def, segments });
    const curve = new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.4);
    const branchTs = makeBranchPositions(def.branches, def.height);
    let sideSign = rng() > 0.5 ? 1 : -1;
    let zPhase = 0;
    const children = branchTs.map((t, bi) => {
      sideSign *= -1;
      if (bi % 3 === 2) zPhase += 1;
      const zSign = zPhase % 2 === 0 ? 1 : -1;
      const capturedSide = sideSign;
      const capturedZ = zSign;
      return {
        s: t,
        spawn: () => {
          const stemPoint = curve.getPointAt(t);
          const radiusBase = lerp(def.radiusBase, def.radiusTip, t) * 0.62;
          const radiusTip = Math.max(radiusBase * 0.28, 0.0035);
          spawnBranch(stemPoint, capturedSide, capturedZ, t, def.height * 0.31, radiusBase, radiusTip, def.isMain ? GREEN : GREEN_LT, def.toneBase, 1, true);
        },
      };
    });
    growSegmented(curve, def.radiusBase, def.radiusTip, def.color, def.toneBase, 0, 1, children, 26, 7);
    return { curve, height: def.height };
  }

  function spawnRoots() {
    const count = 6;
    for (let i = 0; i < count; i++) {
      const az = (i / count) * Math.PI * 2 + rand(-0.35, 0.35);
      const depth = rand(0.55, 0.95);
      const spread = rand(0.35, 0.75);
      const dir = new THREE.Vector3(Math.cos(az) * spread, -1, Math.sin(az) * spread).normalize();
      const mid = new THREE.Vector3(0, -0.02, 0).addScaledVector(dir, depth * 0.5).addScaledVector(new THREE.Vector3(0, -1, 0), depth * 0.12);
      const tip = new THREE.Vector3(0, -0.02, 0).addScaledVector(dir, depth);
      const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0.02, 0), mid, tip], false, 'catmullrom', 0.45);
      growSegmented(curve, 0.0161, 0.0025, ROOT_TONE, 0, 0, 1, [], 6, 5);
    }
  }

  spawnRoots();
  const stemDefs: StemDef[] = [
    { baseX: 0.0, baseZ: 0.0, height: 6.35, branches: 16, radiusBase: 0.0322, radiusTip: 0.0062, xWanderAmp: 0.34, zWanderAmp: 0.42, lean: { x: 0.08, z: -0.08 }, color: GREEN_DK, isMain: true, toneBase: 1 },
    { baseX: -0.22, baseZ: 0.14, height: 4.35, branches: 11, radiusBase: 0.0205, radiusTip: 0.0043, xWanderAmp: 0.3, zWanderAmp: 0.32, lean: { x: -0.42, z: 0.3 }, color: GREEN, isMain: false, toneBase: 2 },
    { baseX: 0.19, baseZ: -0.16, height: 5.55, branches: 12, radiusBase: 0.0242, radiusTip: 0.005, xWanderAmp: 0.28, zWanderAmp: 0.34, lean: { x: 0.36, z: -0.34 }, color: GREEN, isMain: false, toneBase: 2 },
    { baseX: -0.12, baseZ: 0.34, height: 3.05, branches: 8, radiusBase: 0.0136, radiusTip: 0.0037, xWanderAmp: 0.22, zWanderAmp: 0.22, lean: { x: -0.3, z: 0.2 }, color: GREEN_LT, isMain: false, toneBase: 2 },
    { baseX: 0.14, baseZ: -0.38, height: 3.55, branches: 9, radiusBase: 0.0149, radiusTip: 0.0037, xWanderAmp: 0.24, zWanderAmp: 0.24, lean: { x: 0.24, z: -0.22 }, color: GREEN_DK, isMain: false, toneBase: 1 },
  ];
  stemDefs.forEach(spawnStem);
  const maxHeight = Math.max(...stemDefs.map((d) => d.height));

  let cum = 0;
  const finalUnits: GrowthUnit[] = growthUnits.map((u) => {
    const indexCount = u.pathSegments * u.radialSegments * 6;
    const cumStart = cum;
    cum += indexCount;
    return { ...u, indexCount, cumStart, cumEnd: cum };
  });
  const total = cum;
  // finalUnits and growthUnits share the same object identity per entry
  // order, so we can zip localS thresholds back onto the pending refs.
  const unitIndex = new Map<PendingUnit, GrowthUnit>();
  growthUnits.forEach((u, i) => unitIndex.set(u, finalUnits[i]!));

  const leaves: LeafDatum[] = leavesOut.map((l) => {
    const u = unitIndex.get(l.unitRef)!;
    const { unitRef, localS, ...rest } = l;
    return { ...rest, growthThreshold: (u.cumStart + localS * (u.cumEnd - u.cumStart)) / total };
  });
  const capsules: CapsuleDatum[] = capsulesOut.map((c) => {
    const u = unitIndex.get(c.unitRef)!;
    return { position: c.position, growthThreshold: (u.cumStart + c.localS * (u.cumEnd - u.cumStart)) / total };
  });

  const envelope: EnvelopePoint[] = [{ p: 0, minY: 0, maxY: 0.05, maxR: 0.1 }];
  let minY = Infinity;
  let maxY = -Infinity;
  let maxR = 0;
  finalUnits.forEach((u) => {
    const p1 = u.cumEnd / total;
    [u.sStart, u.sEnd].forEach((s) => {
      const pt = u.curve.getPointAt(s);
      minY = Math.min(minY, pt.y);
      maxY = Math.max(maxY, pt.y);
      maxR = Math.max(maxR, Math.hypot(pt.x, pt.z));
    });
    envelope.push({ p: p1, minY, maxY, maxR });
  });
  envelope.push({ p: 1, minY, maxY: Math.max(maxY, maxHeight), maxR });

  return { growthUnits: finalUnits, leaves, capsules, maxHeight, totalIndexCount: total, envelope };
}

export function envelopeAt(envelope: EnvelopePoint[], p: number): EnvelopePoint {
  p = clamp(p, 0, 1);
  for (let i = 1; i < envelope.length; i++) {
    const b = envelope[i]!;
    if (p <= b.p) {
      const a = envelope[i - 1]!;
      const t = b.p > a.p ? (p - a.p) / (b.p - a.p) : 0;
      return { p, minY: lerp(a.minY, b.minY, t), maxY: lerp(a.maxY, b.maxY, t), maxR: lerp(a.maxR, b.maxR, t) };
    }
  }
  return envelope[envelope.length - 1]!;
}

export function makeTaperedTubeGeometry(
  curve: THREE.CatmullRomCurve3,
  sStart: number,
  sEnd: number,
  radiusStart: number,
  radiusEnd: number,
  color: THREE.Color,
  pathSegments: number,
  radialSegments: number,
) {
  const positions: number[] = [];
  const normals: number[] = [];
  const colors: number[] = [];
  const indices: number[] = [];
  let prevNormal = new THREE.Vector3(0, 0, 1);
  for (let i = 0; i <= pathSegments; i++) {
    const t = lerp(sStart, sEnd, i / pathSegments);
    const center = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t).normalize();
    let normal = new THREE.Vector3().crossVectors(prevNormal, tangent);
    if (normal.lengthSq() < 1e-8) normal = prevNormal.clone();
    else normal.crossVectors(tangent, normal).normalize();
    if (normal.lengthSq() < 1e-8) {
      const fallbackUp = Math.abs(tangent.y) > 0.98 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0);
      normal = new THREE.Vector3().crossVectors(tangent, fallbackUp).normalize();
    }
    const binormal = new THREE.Vector3().crossVectors(tangent, normal).normalize();
    prevNormal = normal;
    const radius = lerp(radiusStart, radiusEnd, i / pathSegments);
    for (let k = 0; k < radialSegments; k++) {
      const angle = (k / radialSegments) * Math.PI * 2;
      const nx = Math.cos(angle);
      const ny = Math.sin(angle);
      const vx = normal.x * nx + binormal.x * ny;
      const vy = normal.y * nx + binormal.y * ny;
      const vz = normal.z * nx + binormal.z * ny;
      positions.push(center.x + vx * radius, center.y + vy * radius, center.z + vz * radius);
      normals.push(vx, vy, vz);
      colors.push(color.r, color.g, color.b);
    }
  }
  for (let i = 0; i < pathSegments; i++) {
    const a0 = i * radialSegments;
    const b0 = (i + 1) * radialSegments;
    for (let k = 0; k < radialSegments; k++) {
      const k2 = (k + 1) % radialSegments;
      indices.push(a0 + k, b0 + k, b0 + k2);
      indices.push(a0 + k, b0 + k2, a0 + k2);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geo.setIndex(indices);
  return geo;
}

export function buildLeafShape() {
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.quadraticCurveTo(0.3, 0.25, 0.63, 0.2);
  s.quadraticCurveTo(0.93, 0.15, 1.02, 0.0);
  s.quadraticCurveTo(0.91, -0.17, 0.57, -0.19);
  s.quadraticCurveTo(0.25, -0.21, 0, 0);
  return s;
}

export function computeLeafBasis(point: THREE.Vector3, tangent: THREE.Vector3, sideSign: number) {
  const worldUp = new THREE.Vector3(0, 1, 0);
  const xAxis = new THREE.Vector3().crossVectors(tangent, worldUp);
  if (xAxis.lengthSq() < 1e-6) xAxis.set(1, 0, 0);
  xAxis.normalize().multiplyScalar(sideSign);
  let zAxis = new THREE.Vector3().lerpVectors(worldUp, tangent.clone().negate(), 0.18).normalize();
  const yAxis = new THREE.Vector3().crossVectors(zAxis, xAxis).normalize();
  zAxis = new THREE.Vector3().crossVectors(xAxis, yAxis).normalize();
  const m = new THREE.Matrix4().makeBasis(xAxis, yAxis, zAxis);
  return new THREE.Quaternion().setFromRotationMatrix(m);
}

export interface Stage {
  p: number;
  num: string;
  eyebrow: string;
  body: string;
  rail: string;
}

export const STAGES: Stage[] = [
  { p: 0.0, num: 'Stage 01 / 05', eyebrow: '1984 — Foundation', body: 'The roots run deep. Khatore began with a commitment to Ayurvedic knowledge that has continued across generations.', rail: 'Roots' },
  { p: 0.17, num: 'Stage 02 / 05', eyebrow: 'Knowledge — Khatore', body: 'A single stem carries that knowledge forward — <strong>discipline</strong>, continuity, decades of formulation practice.', rail: 'Stem' },
  { p: 0.38, num: 'Stage 03 / 05', eyebrow: 'Formulations + Research', body: 'Branches extend outward — each one a <strong>formulation</strong>, an Ayurvedic principle, a line of research.', rail: 'Branches' },
  { p: 0.62, num: 'Stage 04 / 05', eyebrow: 'Knowledge + Products', body: "Foliage fills in — the breadth of Khatore's <strong>products</strong> and the botanical evidence behind them.", rail: 'Leaves' },
  { p: 0.85, num: 'Stage 05 / 05', eyebrow: 'Trust + Global Reach', body: 'The full specimen — the same botanical study behind <strong>Kamalahar</strong>, trusted in 30+ countries.', rail: 'Full Canopy' },
];
