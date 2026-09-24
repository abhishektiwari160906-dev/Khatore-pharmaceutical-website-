'use client';

import { useEffect, useMemo, useRef, useState, type MutableRefObject } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { COUNTRY_GEO, HUB_COUNTRY, type CountryGeo } from '@/data/geo';
import { getCountryLineGeometry } from './countryGeometry';
import { buildArcPoints, latLonToVector3 } from './sphereMath';
import styles from './Globe3D.module.css';

const RADIUS = 1.6;
const MARKER_RADIUS = RADIUS * 1.012;
const AUTO_ROTATE_SPEED = 0.045; // rad/s -- deliberately slow, "very slow automatic rotation"
const RESUME_AFTER_MS = 2200;

function Marker({
  country,
  reducedMotion,
  onSelect,
  isDraggingRef,
}: {
  country: CountryGeo;
  reducedMotion: boolean;
  onSelect: (c: CountryGeo) => void;
  isDraggingRef: MutableRefObject<boolean>;
}) {
  const dotRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const position = useMemo(() => latLonToVector3(country.lat, country.lon, MARKER_RADIUS), [country]);
  const phase = useMemo(() => Math.random() * Math.PI * 2, []);

  useFrame(({ clock }) => {
    if (reducedMotion) return;
    const t = clock.getElapsedTime() * 1.6 + phase;
    const pulse = 0.75 + Math.sin(t) * 0.25;
    if (dotRef.current) dotRef.current.scale.setScalar(pulse);
    if (ringRef.current) {
      const ringT = (clock.getElapsedTime() * 0.5 + phase / (Math.PI * 2)) % 1;
      ringRef.current.scale.setScalar(1 + ringT * 1.8);
      (ringRef.current.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 0.5 * (1 - ringT));
    }
  });

  return (
    <group
      position={position}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation();
        if (isDraggingRef.current) return;
        onSelect(country);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        document.body.style.cursor = '';
      }}
    >
      <mesh ref={dotRef}>
        <sphereGeometry args={[0.018, 12, 12]} />
        <meshBasicMaterial color="#f4d06f" toneMapped={false} />
      </mesh>
      <mesh ref={ringRef} rotation={[0, 0, 0]}>
        <ringGeometry args={[0.02, 0.024, 24]} />
        <meshBasicMaterial color="#f4d06f" transparent opacity={0.4} side={THREE.DoubleSide} toneMapped={false} />
      </mesh>
      {/* Larger, invisible hit-target -- the visible dot is small and
          precise tapping on mobile is unreliable at that size. */}
      <mesh visible={false}>
        <sphereGeometry args={[0.055, 8, 8]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </group>
  );
}

function NetworkArcs({ reducedMotion }: { reducedMotion: boolean }) {
  const hub = COUNTRY_GEO.find((c) => c.name === HUB_COUNTRY)!;
  const arcs = useMemo(
    () =>
      COUNTRY_GEO.filter((c) => c.name !== HUB_COUNTRY).map((c) => ({
        country: c,
        points: buildArcPoints(hub.lat, hub.lon, c.lat, c.lon, RADIUS),
      })),
    [hub],
  );
  const materials = useRef<THREE.LineBasicMaterial[]>([]);

  useFrame(({ clock }) => {
    if (reducedMotion) return;
    const t = clock.getElapsedTime();
    materials.current.forEach((mat, i) => {
      if (!mat) return;
      mat.opacity = 0.16 + 0.14 * (0.5 + 0.5 * Math.sin(t * 0.6 + i * 0.7));
    });
  });

  return (
    <group>
      {arcs.map((arc, i) => (
        <line key={arc.country.name}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[new Float32Array(arc.points.flatMap((p) => [p.x, p.y, p.z])), 3]}
            />
          </bufferGeometry>
          <lineBasicMaterial
            ref={(m) => {
              if (m) materials.current[i] = m;
            }}
            color="#f4d06f"
            transparent
            opacity={0.22}
            toneMapped={false}
          />
        </line>
      ))}
    </group>
  );
}

function CountryBorders() {
  const geometry = useMemo(() => getCountryLineGeometry(RADIUS * 1.001), []);
  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial color="#f4d06f" transparent opacity={0.28} toneMapped={false} />
    </lineSegments>
  );
}

function GlobeScene({
  reducedMotion,
  onSelect,
}: {
  reducedMotion: boolean;
  onSelect: (c: CountryGeo) => void;
}) {
  const rotGroup = useRef<THREE.Group>(null);
  const isDraggingRef = useRef(false);
  const autoAngleRef = useRef(0.4);
  const resumeAtRef = useRef(0);
  const dragYawRef = useRef(0);
  const dragPitchRef = useRef(0);
  const { gl } = useThree();

  useEffect(() => {
    const el = gl.domElement;
    let lastX = 0;
    let lastY = 0;
    let dragDistance = 0;

    function down(e: PointerEvent) {
      isDraggingRef.current = true;
      dragDistance = 0;
      lastX = e.clientX;
      lastY = e.clientY;
    }
    function move(e: PointerEvent) {
      if (!isDraggingRef.current) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      dragDistance += Math.abs(dx) + Math.abs(dy);
      dragYawRef.current += dx * 0.008;
      dragPitchRef.current = THREE.MathUtils.clamp(dragPitchRef.current + dy * 0.006, -0.9, 0.9);
    }
    function up() {
      if (!isDraggingRef.current) return;
      // A tap (near-zero movement) should still count as "not dragging"
      // for the Marker onClick guard by the time the click event fires,
      // but we clear it on a short delay so the guard sees the drag
      // state that was true *during* the gesture, not after.
      const wasRealDrag = dragDistance > 4;
      isDraggingRef.current = false;
      resumeAtRef.current = performance.now() + RESUME_AFTER_MS;
      if (wasRealDrag) {
        // Swallow the click R3F is about to synthesize from this
        // pointerup so a drag-release over a marker never selects it.
        isDraggingRef.current = true;
        requestAnimationFrame(() => {
          isDraggingRef.current = false;
        });
      }
    }
    // No preventDefault anywhere here, and `touch-action: pan-y` on the
    // container (see Globe3D.module.css) is what keeps a vertical swipe
    // free to scroll the page natively -- same lesson as the Bhui Amla
    // fix: never fight the browser's own scroll handling.
    el.addEventListener('pointerdown', down);
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    window.addEventListener('pointerleave', up);
    return () => {
      el.removeEventListener('pointerdown', down);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
      window.removeEventListener('pointerleave', up);
    };
  }, [gl]);

  useFrame((_, delta) => {
    if (!rotGroup.current) return;
    if (reducedMotion) {
      rotGroup.current.rotation.y = 0.4 + dragYawRef.current;
      rotGroup.current.rotation.x = dragPitchRef.current;
      return;
    }
    if (!isDraggingRef.current && performance.now() > resumeAtRef.current) {
      autoAngleRef.current += delta * AUTO_ROTATE_SPEED;
    }
    rotGroup.current.rotation.y = autoAngleRef.current + dragYawRef.current;
    rotGroup.current.rotation.x = dragPitchRef.current;
  });

  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[3, 2, 4]} intensity={1.15} color="#fff6da" />
      <directionalLight position={[-3, -1, -2]} intensity={0.35} color="#1bba63" />

      <group ref={rotGroup}>
        <mesh>
          <sphereGeometry args={[RADIUS, 64, 64]} />
          <meshStandardMaterial color="#0a3323" roughness={0.85} metalness={0.08} />
        </mesh>
        <CountryBorders />
        <NetworkArcs reducedMotion={reducedMotion} />
        {COUNTRY_GEO.map((c) => (
          <Marker key={c.name} country={c} reducedMotion={reducedMotion} onSelect={onSelect} isDraggingRef={isDraggingRef} />
        ))}
      </group>

      {/* Soft atmosphere glow -- a slightly larger back-facing sphere
          with additive blending, the standard cheap-but-effective
          technique, restrained rather than a bright halo. */}
      <mesh scale={1.06}>
        <sphereGeometry args={[RADIUS, 48, 48]} />
        <meshBasicMaterial color="#1bba63" transparent opacity={0.1} side={THREE.BackSide} depthWrite={false} />
      </mesh>
    </>
  );
}

function detectWebGL(): boolean {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch {
    return false;
  }
}

export interface Globe3DProps {
  /** Smaller footprint / lighter camera framing for the homepage teaser. */
  compact?: boolean;
}

export function Globe3D({ compact = false }: Globe3DProps) {
  const [selected, setSelected] = useState<CountryGeo | null>(null);
  const [webgl, setWebgl] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setWebgl(detectWebGL());
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);

  if (!webgl) {
    return (
      <div className={styles.fallback}>
        <div className={styles.fallbackRing} aria-hidden="true" />
        <p className={styles.fallbackText}>Global presence — see the full country list below.</p>
      </div>
    );
  }

  // Camera distance chosen so the sphere (RADIUS=1.6) fills ~78% of
  // the viewport height at this fov -- the previous values (3.9/4.6)
  // put the camera too close to the sphere's near surface, so it
  // overflowed the whole frame and read as a flat dark rectangle
  // rather than a visibly curved globe with room for its atmosphere.
  const cameraZ = compact ? 7.2 : 6.6;

  return (
    <div className={`${styles.wrap} ${compact ? styles.compact : ''}`} style={{ touchAction: 'pan-y' }}>
      <Canvas
        camera={{ position: [0, 0, cameraZ], fov: 32 }}
        gl={{ alpha: true, antialias: true, powerPreference: 'low-power' }}
        dpr={[1, 2]}
      >
        <GlobeScene reducedMotion={reducedMotion} onSelect={setSelected} />
      </Canvas>

      {selected && (
        <div className={styles.panel} role="dialog" aria-label={`${selected.name} — Khatore presence`}>
          <button type="button" className={styles.panelClose} onClick={() => setSelected(null)} aria-label="Close">
            ×
          </button>
          <span className={styles.panelEyebrow}>Global Presence</span>
          <h3 className={styles.panelName}>{selected.name}</h3>
          <p className={styles.panelBody}>Patient presence established.</p>
        </div>
      )}
    </div>
  );
}
