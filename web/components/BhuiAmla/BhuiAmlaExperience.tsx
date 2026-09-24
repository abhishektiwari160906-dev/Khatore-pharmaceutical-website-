'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import {
  generatePlant,
  envelopeAt,
  makeTaperedTubeGeometry,
  buildLeafShape,
  computeLeafBasis,
  smooth01,
  degToRad,
  LEAF_TONES,
  CAPSULE_TONE,
  STAGES,
} from './growth';
import styles from './BhuiAmlaExperience.module.css';

/**
 * Scroll-driven botanical growth study of Bhui Amla (Phyllanthus
 * niruri) — ported from the verified vanilla Three.js prototype
 * (khatore-homepage-v6-1.html), same tuned generation/camera/rotation
 * logic, adapted to React lifecycle (refs instead of getElementById,
 * full teardown on unmount instead of a page-lifetime script).
 *
 * SCROLL = GROWTH. DRAG = EXAMINATION. These stay independent: scroll
 * only ever moves camera distance/height + reveals geometry; drag/idle
 * only ever move rotation.
 */
export function BhuiAmlaExperience() {
  const growthWrapRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fallbackRef = useRef<HTMLCanvasElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const captionNumRef = useRef<HTMLSpanElement>(null);
  const captionEyebrowRef = useRef<HTMLSpanElement>(null);
  const captionBodyRef = useRef<HTMLParagraphElement>(null);
  const railFillRef = useRef<HTMLDivElement>(null);
  const railLabelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const growthWrap = growthWrapRef.current;
    const stage = stageRef.current;
    const hint = hintRef.current;
    const captionNum = captionNumRef.current;
    const captionEyebrow = captionEyebrowRef.current;
    const captionBody = captionBodyRef.current;
    const railFill = railFillRef.current;
    const railLabel = railLabelRef.current;
    if (!growthWrap || !stage || !hint || !captionNum || !captionEyebrow || !captionBody || !railFill || !railLabel) {
      return;
    }

    const reduceMotionMQ = window.matchMedia('(prefers-reduced-motion: reduce)');
    let reducedMotion = reduceMotionMQ.matches;
    const onReducedMotionChange = (e: MediaQueryListEvent) => {
      reducedMotion = e.matches;
    };
    reduceMotionMQ.addEventListener?.('change', onReducedMotionChange);

    const onClass = styles.on as string;
    const draggingClass = styles.isDragging as string;
    const readyClass = styles.isReady as string;
    let currentStageIdx = -1;
    function updateCaption(progress: number) {
      let idx = 0;
      for (let i = 0; i < STAGES.length; i++) if (progress >= STAGES[i]!.p) idx = i;
      if (idx !== currentStageIdx) {
        currentStageIdx = idx;
        const st = STAGES[idx]!;
        captionEyebrow!.classList.remove(onClass);
        captionBody!.classList.remove(onClass);
        requestAnimationFrame(() => {
          captionNum!.textContent = st.num;
          captionEyebrow!.innerHTML = st.eyebrow;
          captionBody!.innerHTML = st.body;
          requestAnimationFrame(() => {
            captionEyebrow!.classList.add(onClass);
            captionBody!.classList.add(onClass);
          });
        });
      }
      railFill!.style.height = (progress * 100).toFixed(1) + '%';
      const activeRailLabel = STAGES[idx]!.rail;
      if (railLabel!.textContent !== activeRailLabel) railLabel!.textContent = activeRailLabel;
      railLabel!.style.top = (progress * 100).toFixed(1) + '%';
      hint!.style.opacity = progress > 0.035 ? '0' : '1';
    }

    const plant = generatePlant();

    function supportsWebGL() {
      try {
        const c = document.createElement('canvas');
        return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
      } catch {
        return false;
      }
    }

    let cleanup = () => {};

    if (supportsWebGL() && canvasRef.current) {
      cleanup = initWebGL(canvasRef.current);
    } else if (fallbackRef.current) {
      cleanup = initFallback2D(fallbackRef.current);
    }

    function initWebGL(canvas: HTMLCanvasElement) {
      const isMobile = window.matchMedia('(max-width: 640px)').matches;
      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(30, 1, 0.05, 50);
      const TAN_HALF_FOV_V = Math.tan(degToRad(30) / 2);

      const hemi = new THREE.HemisphereLight(0xf5f7fc, 0x2c3b5a, 1.25);
      scene.add(hemi);
      const key = new THREE.DirectionalLight(0xfff8ec, 3.1);
      key.position.set(3.2, 5.5, 4.0);
      scene.add(key);
      const fillLight = new THREE.DirectionalLight(0xdfe6f5, 0.95);
      fillLight.position.set(-3.5, 2.0, -2.5);
      scene.add(fillLight);

      const rotGroup = new THREE.Group();
      scene.add(rotGroup);

      const tubeGeoms = plant.growthUnits.map((u) =>
        makeTaperedTubeGeometry(u.curve, u.sStart, u.sEnd, u.radiusBase, u.radiusEnd, u.color, u.pathSegments, u.radialSegments),
      );
      const woodGeo = mergeGeometries(tubeGeoms, false)!;
      tubeGeoms.forEach((g) => g.dispose());
      const woodMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.92, metalness: 0.02 });
      const woodMesh = new THREE.Mesh(woodGeo, woodMat);
      woodMesh.geometry.setDrawRange(0, 0);
      rotGroup.add(woodMesh);

      const leafShape = buildLeafShape();
      const leafGeo = new THREE.ShapeGeometry(leafShape, 6);
      leafGeo.computeVertexNormals();
      const leafMat = new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 0.7,
        metalness: 0,
        side: THREE.DoubleSide,
        emissive: new THREE.Color('#159552'),
        emissiveIntensity: 0.16,
      });
      const leafCount = plant.leaves.length;
      const leafMesh = new THREE.InstancedMesh(leafGeo, leafMat, leafCount);
      leafMesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(leafCount * 3), 3);

      interface LeafBase {
        position: THREE.Vector3;
        quaternion: THREE.Quaternion;
        scale: THREE.Vector3;
        phase: number;
        speed: number;
        amp: number;
        threshold: number;
      }
      const leafBase: LeafBase[] = new Array(leafCount);
      const tmpMatrix = new THREE.Matrix4();
      const tmpQuat = new THREE.Quaternion();
      const swayAxis = new THREE.Vector3(0, 1, 0.2).normalize();
      const swayQuat = new THREE.Quaternion();

      plant.leaves.forEach((leaf, i) => {
        const baseLen = THREE.MathUtils.lerp(0.204, 0.122, i / leafCount) * leaf.scaleJitter;
        const quat = computeLeafBasis(leaf.position, leaf.tangent, leaf.sideSign);
        const jitterEuler = new THREE.Euler(degToRad(leaf.asymJitter * 10), degToRad(leaf.asymJitter * 6), degToRad(leaf.asymJitter * 14));
        quat.multiply(new THREE.Quaternion().setFromEuler(jitterEuler));
        leafBase[i] = {
          position: leaf.position.clone().addScaledVector(new THREE.Vector3(0, -1, 0), 0.012),
          quaternion: quat,
          scale: new THREE.Vector3(baseLen, baseLen * (0.85 + Math.random() * 0.23), baseLen),
          phase: leaf.phase,
          speed: leaf.speed,
          amp: leaf.amp,
          threshold: leaf.growthThreshold,
        };
        leafMesh.setColorAt(i, LEAF_TONES[leaf.toneIndex]!);
      });
      if (leafMesh.instanceColor) leafMesh.instanceColor.needsUpdate = true;
      leafMesh.frustumCulled = false;
      rotGroup.add(leafMesh);

      const capGeo = new THREE.SphereGeometry(1, 6, 5);
      const capMat = new THREE.MeshStandardMaterial({ color: CAPSULE_TONE, roughness: 0.75 });
      const capCount = Math.max(plant.capsules.length, 1);
      const capMesh = new THREE.InstancedMesh(capGeo, capMat, capCount);
      const capBase = plant.capsules.map((c) => ({ position: c.position, threshold: c.growthThreshold }));
      if (plant.capsules.length === 0) capBase.push({ position: new THREE.Vector3(), threshold: 2 });
      capMesh.frustumCulled = false;
      rotGroup.add(capMesh);

      let typePlane: THREE.Mesh | null = null;
      let typeTexture: THREE.CanvasTexture | null = null;
      function buildTypeTexture() {
        const tw = 2048;
        const th = 1024;
        const tc = document.createElement('canvas');
        tc.width = tw;
        tc.height = th;
        const ctx = tc.getContext('2d')!;
        ctx.clearRect(0, 0, tw, th);
        ctx.font = '200 420px "DM Sans", system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.lineWidth = 5;
        ctx.strokeStyle = '#C8D0E4';
        ctx.fillStyle = 'rgba(255,255,255,0.94)';
        ctx.fillText('BHUI AMLA', tw / 2, th / 2 + 30);
        ctx.strokeText('BHUI AMLA', tw / 2, th / 2 + 30);
        const tex = new THREE.CanvasTexture(tc);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.needsUpdate = true;
        typeTexture = tex;
        const planeH = plant.maxHeight * 0.32;
        const planeW = planeH * (tw / th);
        const geo = new THREE.PlaneGeometry(planeW, planeH);
        const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: false, alphaTest: 0.08, toneMapped: false });
        typePlane = new THREE.Mesh(geo, mat);
        typePlane.position.set(0, plant.maxHeight * 0.46, -0.05);
        rotGroup.add(typePlane);
      }
      let typeTextureCancelled = false;
      if (document.fonts?.ready) {
        document.fonts
          .load('200 420px "DM Sans"')
          .catch(() => {})
          .finally(() =>
            document.fonts.ready
              .then(() => {
                if (!typeTextureCancelled) buildTypeTexture();
              })
              .catch(() => {
                if (!typeTextureCancelled) buildTypeTexture();
              }),
          );
      } else {
        buildTypeTexture();
      }

      function frameCamera(w: number, h: number) {
        if (w <= 0 || h <= 0) return;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h, false);
      }
      frameCamera(stage!.clientWidth, stage!.clientHeight);

      const BASE_YAW = -10;
      const BASE_PITCH = 5;
      const YAW_RANGE = 40;
      const PITCH_RANGE = 18;
      let dragYaw = 0;
      let dragPitch = 0;
      let dragging = false;
      let lastX = 0;
      let lastY = 0;
      let idleT0: number | null = null;
      let resumeIdleAt = 0;

      function applyRotation(idleYawDelta: number) {
        const yaw = THREE.MathUtils.clamp(BASE_YAW + dragYaw + (idleYawDelta || 0), BASE_YAW - YAW_RANGE, BASE_YAW + YAW_RANGE);
        const pitch = THREE.MathUtils.clamp(BASE_PITCH + dragPitch, BASE_PITCH - PITCH_RANGE, BASE_PITCH + PITCH_RANGE);
        rotGroup.rotation.y = degToRad(yaw);
        rotGroup.rotation.x = degToRad(pitch);
      }
      applyRotation(0);

      // Pointer Events only -- covers mouse, touch and pen in one model.
      // A previous version also listened for raw touchstart/touchmove/
      // touchend/touchcancel in parallel, which double-handles the same
      // physical touch gesture (browsers dispatch both event families
      // for touch input) and forced preventDefault() on every move to
      // stop the duplicate/native handling from fighting the rotation.
      // That preventDefault() is what silently blocked page scrolling:
      // called unconditionally on pointerdown/pointermove, it suppressed
      // the browser's default scroll action for ANY touch landing on
      // `.gstage` -- and `.gstage` is the full 100vh stage for this
      // entire 460vh scroll-driven section, so that was effectively the
      // whole screen. Combined with `touch-action: pan-y` (see the CSS),
      // vertical drags are now left to the browser's native scroll
      // entirely; only non-mouse-default gestures (drag-to-rotate) are
      // handled here, so no preventDefault is needed at all.
      // One handler for every pointer type (mouse, touch, pen). For
      // touch, `touch-action: pan-y` on `.gstage` (see the CSS) is what
      // lets a vertical swipe fall through to native page scroll -- the
      // browser fires `pointercancel` here when it claims a gesture as
      // a scroll, which resets `dragging` the same as a normal release.
      function pointerDown(e: PointerEvent) {
        dragging = true;
        stage!.classList.add(draggingClass);
        lastX = e.clientX;
        lastY = e.clientY;
      }
      function pointerMove(e: PointerEvent) {
        if (!dragging) return;
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        lastX = e.clientX;
        lastY = e.clientY;
        dragYaw = THREE.MathUtils.clamp(dragYaw + dx * 0.26, -YAW_RANGE, YAW_RANGE);
        dragPitch = THREE.MathUtils.clamp(dragPitch - dy * 0.16, -PITCH_RANGE, PITCH_RANGE);
        applyRotation(0);
      }
      function pointerUp() {
        if (!dragging) return;
        dragging = false;
        stage!.classList.remove(draggingClass);
        idleT0 = null;
        resumeIdleAt = performance.now() + 1800;
      }
      stage!.addEventListener('pointerdown', pointerDown as EventListener);
      window.addEventListener('pointermove', pointerMove as EventListener, { passive: true });
      window.addEventListener('pointerup', pointerUp);
      window.addEventListener('pointercancel', pointerUp);
      window.addEventListener('pointerleave', pointerUp);

      let isVisible = true;
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            isVisible = e.isIntersecting;
          });
        },
        { threshold: 0.02 },
      );
      io.observe(stage!);
      const onVisibilityChange = () => {
        isVisible = isVisible && document.visibilityState === 'visible';
      };
      document.addEventListener('visibilitychange', onVisibilityChange);

      const onResize = () => frameCamera(stage!.clientWidth, stage!.clientHeight);
      window.addEventListener('resize', onResize);

      let targetProgress = reducedMotion ? 1 : 0;
      let smoothProgress = targetProgress;
      function readScrollProgress() {
        if (reducedMotion) return 1;
        const rect = growthWrap!.getBoundingClientRect();
        const total = rect.height - window.innerHeight;
        if (total <= 0) return 1;
        return THREE.MathUtils.clamp(-rect.top / total, 0, 1);
      }

      const camPos = new THREE.Vector3(0, 0.35, 3.6);
      const camTarget = new THREE.Vector3(0, 0.3, 0);
      const wantPos = new THREE.Vector3();
      const wantTarget = new THREE.Vector3();

      const GROWTH_FLOOR = 0.035;
      const LEAF_REVEAL_LAG = 0.012;
      let currentEffP = GROWTH_FLOOR;

      function applyGrowth(p: number) {
        const effP = THREE.MathUtils.lerp(GROWTH_FLOOR, 1, p);
        currentEffP = effP;
        const drawCount = Math.floor((effP * plant.totalIndexCount) / 6) * 6;
        woodMesh.geometry.setDrawRange(0, drawCount);

        const env = envelopeAt(plant.envelope, effP);
        const focusY = THREE.MathUtils.lerp(env.minY * 0.3, env.maxY, 0.72);
        const topHalf = Math.max(env.maxY - focusY, 0.05);
        const botHalf = Math.max(focusY - env.minY, 0.05);
        const distForHeight = (Math.max(topHalf, botHalf) / TAN_HALF_FOV_V) * 1.08;
        const tanHalfFovH = TAN_HALF_FOV_V * (camera.aspect || 1);
        const distForWidth = (env.maxR / Math.max(tanHalfFovH, 0.0001)) * 1.08;
        const dist = THREE.MathUtils.clamp(Math.max(distForHeight, distForWidth), 2.6, 22);
        wantPos.set(0, focusY + dist * 0.09, dist);
        wantTarget.set(0, focusY, 0);
        camPos.lerp(wantPos, reducedMotion ? 1 : 0.16);
        camTarget.lerp(wantTarget, reducedMotion ? 1 : 0.16);
        camera.position.copy(camPos);
        camera.lookAt(camTarget);

        if (typePlane) typePlane.scale.setScalar(Math.max(smooth01(0.22, 0.42, p), 0.001));
        updateCaption(p);
      }

      let frameSkip = 0;
      let raf = 0;
      const tmpScale = new THREE.Vector3();
      const ZERO_QUAT = new THREE.Quaternion();
      const TMP_CAP_SCALE = new THREE.Vector3();
      let reducedMotionDoneOnce = false;

      function animate(now: number) {
        raf = requestAnimationFrame(animate);
        if (!isVisible) return;

        targetProgress = readScrollProgress();
        smoothProgress += (targetProgress - smoothProgress) * (reducedMotion ? 1 : 0.22);
        applyGrowth(smoothProgress);

        if (!reducedMotion && !dragging && now > resumeIdleAt) {
          if (idleT0 === null) idleT0 = now;
          const elapsed = (now - idleT0) / 1000;
          applyRotation(Math.sin(elapsed * 0.12) * 8);
        } else if (dragging || reducedMotion) {
          applyRotation(0);
        }

        if (!reducedMotion) {
          frameSkip = (frameSkip + 1) % (isMobile ? 2 : 1);
          if (frameSkip === 0) {
            const t = now * 0.001;
            for (let i = 0; i < leafCount; i++) {
              const b = leafBase[i]!;
              const bStart = Math.min(b.threshold + LEAF_REVEAL_LAG, 1);
              const bEnd = Math.min(bStart + 0.025, 1);
              const reveal = smooth01(bStart, bEnd, currentEffP);
              if (reveal <= 0.001) {
                tmpMatrix.makeScale(0, 0, 0);
                leafMesh.setMatrixAt(i, tmpMatrix);
                continue;
              }
              const sway = Math.sin(t * b.speed + b.phase) * b.amp;
              swayQuat.setFromAxisAngle(swayAxis, sway);
              tmpQuat.copy(b.quaternion).multiply(swayQuat);
              tmpMatrix.compose(b.position, tmpQuat, tmpScale.copy(b.scale).multiplyScalar(reveal));
              leafMesh.setMatrixAt(i, tmpMatrix);
            }
            leafMesh.instanceMatrix.needsUpdate = true;
            for (let i = 0; i < capBase.length; i++) {
              const c = capBase[i]!;
              const cStart = Math.min(c.threshold + LEAF_REVEAL_LAG, 1);
              const cEnd = Math.min(cStart + 0.02, 1);
              const reveal = smooth01(cStart, cEnd, currentEffP);
              tmpMatrix.compose(c.position, ZERO_QUAT, TMP_CAP_SCALE.set(0.028, 0.022, 0.028).multiplyScalar(reveal));
              capMesh.setMatrixAt(i, tmpMatrix);
            }
            capMesh.instanceMatrix.needsUpdate = true;
          }
        } else if (!reducedMotionDoneOnce) {
          for (let i = 0; i < leafCount; i++) {
            const b = leafBase[i]!;
            tmpMatrix.compose(b.position, b.quaternion, b.scale);
            leafMesh.setMatrixAt(i, tmpMatrix);
          }
          leafMesh.instanceMatrix.needsUpdate = true;
          for (let i = 0; i < capBase.length; i++) {
            tmpMatrix.compose(capBase[i]!.position, ZERO_QUAT, TMP_CAP_SCALE.set(0.028, 0.022, 0.028));
            capMesh.setMatrixAt(i, tmpMatrix);
          }
          capMesh.instanceMatrix.needsUpdate = true;
          reducedMotionDoneOnce = true;
        }

        renderer.render(scene, camera);
      }
      raf = requestAnimationFrame(animate);
      canvas.classList.add(readyClass);

      return () => {
        typeTextureCancelled = true;
        cancelAnimationFrame(raf);
        reduceMotionMQ.removeEventListener?.('change', onReducedMotionChange);
        stage!.removeEventListener('pointerdown', pointerDown as EventListener);
        window.removeEventListener('pointermove', pointerMove as EventListener);
        window.removeEventListener('pointerup', pointerUp);
        window.removeEventListener('pointercancel', pointerUp);
        window.removeEventListener('pointerleave', pointerUp);
        window.removeEventListener('resize', onResize);
        document.removeEventListener('visibilitychange', onVisibilityChange);
        io.disconnect();
        woodGeo.dispose();
        woodMat.dispose();
        leafGeo.dispose();
        leafMat.dispose();
        capGeo.dispose();
        capMat.dispose();
        typeTexture?.dispose();
        typePlane?.geometry.dispose();
        (typePlane?.material as THREE.Material | undefined)?.dispose();
        renderer.dispose();
      };
    }

    function initFallback2D(canvas: HTMLCanvasElement) {
      canvas.hidden = false;
      if (canvasRef.current) canvasRef.current.hidden = true;
      updateCaption(1);
      hint!.style.opacity = '0';

      const ctx = canvas.getContext('2d')!;
      function project(p: THREE.Vector3) {
        return { x: p.x - p.z * 0.32, y: -p.y - p.z * 0.16 };
      }
      function draw() {
        const w = stage!.clientWidth;
        const h = stage!.clientHeight;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, w, h);
        const scale = h / (plant.maxHeight * 1.5);
        const originX = w / 2;
        const originY = h * 0.82;
        const toScreen = (p: THREE.Vector3) => {
          const pr = project(p);
          return { x: originX + pr.x * scale, y: originY + pr.y * scale };
        };

        ctx.save();
        ctx.font = `200 ${Math.round(h * 0.2)}px "DM Sans", system-ui, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.strokeStyle = '#C8D0E4';
        ctx.lineWidth = 1.5;
        ctx.fillText('BHUI AMLA', w / 2, originY - plant.maxHeight * 0.46 * scale);
        ctx.strokeText('BHUI AMLA', w / 2, originY - plant.maxHeight * 0.46 * scale);
        ctx.restore();

        ctx.lineCap = 'round';
        plant.growthUnits.forEach((u) => {
          ctx.strokeStyle = '#' + u.color.getHexString();
          const segs = Math.max(2, Math.round(u.pathSegments));
          for (let i = 0; i < segs; i++) {
            const t0 = THREE.MathUtils.lerp(u.sStart, u.sEnd, i / segs);
            const t1 = THREE.MathUtils.lerp(u.sStart, u.sEnd, (i + 1) / segs);
            const p0 = toScreen(u.curve.getPointAt(t0));
            const p1 = toScreen(u.curve.getPointAt(t1));
            ctx.lineWidth = Math.max(1, THREE.MathUtils.lerp(u.radiusBase, u.radiusEnd, 0.5) * scale * 2.2);
            ctx.beginPath();
            ctx.moveTo(p0.x, p0.y);
            ctx.lineTo(p1.x, p1.y);
            ctx.stroke();
          }
        });
        plant.leaves.forEach((leaf) => {
          const p = toScreen(leaf.position);
          ctx.fillStyle = '#' + LEAF_TONES[leaf.toneIndex]!.getHexString();
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(Math.atan2(-leaf.tangent.y, leaf.tangent.x * leaf.sideSign) * 0.4);
          ctx.beginPath();
          ctx.ellipse(0, 0, 0.11 * scale, 0.045 * scale, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });
        plant.capsules.forEach((c) => {
          const p = toScreen(c.position);
          ctx.fillStyle = '#0E6A3A';
          ctx.beginPath();
          ctx.arc(p.x, p.y, Math.max(1, 0.03 * scale), 0, Math.PI * 2);
          ctx.fill();
        });
        canvas.classList.add(readyClass);
      }
      draw();
      window.addEventListener('resize', draw);
      return () => window.removeEventListener('resize', draw);
    }

    return () => {
      cleanup();
    };
    // Mount/unmount effect only — this owns its full WebGL lifecycle and
    // intentionally never re-runs on prop/state change (there are none).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className={styles.botanical} aria-label="The Bhui Amla botanical study">
      <div className={styles.scene}>
        <div className={styles.lead}>
          <span className={styles.eyebrow}>The Ingredient Study</span>
          <h2 className={styles.leadHeading}>
            Ground amla. <em>Carried into every formulation.</em>
          </h2>
          <p className={styles.pullQ}>
            &quot;Bhui Amla&quot; — literally ground amla — carries its seed capsules beneath each leaf, close to
            the earth it grows from. One of the botanicals in Khatore&apos;s traditional formulation lineage.
          </p>
          <ol className={styles.stepNav}>
            <li className={styles.stepNavItem}>The Plant</li>
            <li className={styles.stepNavItem}>The Process</li>
            <li className={styles.stepNavItem}>The Product</li>
          </ol>
        </div>
      </div>

      <div className={styles.growthWrap} ref={growthWrapRef}>
        <div className={styles.growthSticky}>
          <div className={styles.gstage} ref={stageRef}>
            <div className={styles.gMeta}>
              <strong>Botanical Study</strong> &nbsp;·&nbsp; Phyllanthus niruri
            </div>
            <div className={styles.gGround} />
            <canvas ref={canvasRef} className={styles.gCanvas} aria-hidden="true" />
            <canvas ref={fallbackRef} className={styles.gFallback2d} hidden aria-hidden="true" />
            <p className={styles.srOnly}>
              A scroll-driven growth study of Bhui Amla (Phyllanthus niruri): roots, then stem, then alternating
              branches, then two-row leaflets and seed capsules, mapped to Khatore&apos;s founding story from 1984
              through to its present global reach.
            </p>

            <div className={styles.gHint} ref={hintRef}>
              <span>Scroll to trace the growth</span>
              <span className={styles.gHintLine} />
            </div>

            <div className={styles.gCaption}>
              <span className={styles.gCaptionNum} ref={captionNumRef}>
                Stage 01 / 05
              </span>
              <span className={styles.gCaptionEyebrow} ref={captionEyebrowRef}>
                1984 — Foundation
              </span>
              <p className={styles.gCaptionBody} ref={captionBodyRef}>
                The roots run deep. Khatore began with a commitment to Ayurvedic knowledge that has continued
                across generations.
              </p>
            </div>

            <div className={styles.gRail}>
              <div className={styles.gRailFill} ref={railFillRef} />
              <div className={styles.gRailLabel} ref={railLabelRef} style={{ top: '0%' }}>
                Roots
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
