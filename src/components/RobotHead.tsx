'use client';

import { useRef, Suspense, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html, Environment } from '@react-three/drei';
import * as THREE from 'three';

// ── Helpers ───────────────────────────────────────────────────────────────────
const lerp = THREE.MathUtils.lerp;
const clamp = THREE.MathUtils.clamp;
function eio(t: number) { t = clamp(t, 0, 1); return t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t; }

type AnimName = 'IDLE' | 'WAVE_ONE' | 'WAVE_BOTH' | 'LOOK_AROUND' | 'BLINK' | 'TILT_HEAD' | 'FALL' | 'CLIMBING';

// ── Particles ─────────────────────────────────────────────────────────────────
function Particles() {
  const ref = useRef<THREE.Points>(null);
  const N = 38;
  const { geo, base, sp, ph } = useMemo(() => {
    const b = new Float32Array(N * 3), sp = new Float32Array(N), ph = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      const a = Math.random() * Math.PI * 2, r = 0.5 + Math.random() * 1.1;
      b[i * 3] = Math.cos(a) * r; b[i * 3 + 1] = -0.9 + Math.random() * 2.2; b[i * 3 + 2] = Math.sin(a) * r * 0.5;
      sp[i] = 0.18 + Math.random() * 0.28; ph[i] = Math.random() * Math.PI * 2;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(b.slice(), 3));
    return { geo: g, base: b, sp, ph };
  }, []);
  const mat = useMemo(() => new THREE.PointsMaterial({ size: .019, color: '#60a5fa', transparent: true, opacity: .5, depthWrite: false, blending: THREE.AdditiveBlending }), []);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    const pa = ref.current.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < N; i++) {
      pa.setY(i, ((base[i * 3 + 1] + 0.9 + t * sp[i]) % 2.2) - 0.9);
      pa.setX(i, base[i * 3] + Math.sin(t * sp[i] + ph[i]) * 0.035);
    }
    pa.needsUpdate = true;
    mat.opacity = 0.35 + 0.18 * Math.sin(t * 1.3);
  });
  return <points ref={ref} geometry={geo} material={mat} />;
}

// ── Eye ───────────────────────────────────────────────────────────────────────
function Eye({ eRef }: { eRef: React.RefObject<THREE.Group | null> }) {
  const pulseRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!pulseRef.current) return;
    const p = 0.7 + 0.3 * Math.sin(clock.getElapsedTime() * 2.4);
    (pulseRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = p * 3.5;
  });
  return (
    <group ref={eRef}>
      <mesh ref={pulseRef}>
        <circleGeometry args={[0.07, 32]} />
        <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={3} roughness={0} side={THREE.DoubleSide} transparent opacity={0.9} />
      </mesh>
      <mesh>
        <torusGeometry args={[0.07, .011, 10, 36]} />
        <meshStandardMaterial color="#7dd3fc" emissive="#7dd3fc" emissiveIntensity={3.5} roughness={0} />
      </mesh>
      <mesh>
        <circleGeometry args={[0.03, 20]} />
        <meshStandardMaterial color="#a78bfa" emissive="#a78bfa" emissiveIntensity={6} roughness={0} side={THREE.DoubleSide} />
      </mesh>
      <pointLight color="#38bdf8" intensity={1.8} distance={0.7} />
    </group>
  );
}

// ── Robot Scene ───────────────────────────────────────────────────────────────
function RobotScene() {
  const rootRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const rArmRef = useRef<THREE.Group>(null);
  const lArmRef = useRef<THREE.Group>(null);
  const rElbowRef = useRef<THREE.Group>(null);
  const lElbowRef = useRef<THREE.Group>(null);
  const rHipRef = useRef<THREE.Group>(null);
  const lHipRef = useRef<THREE.Group>(null);
  const eyeLRef = useRef<THREE.Group>(null);
  const eyeRRef = useRef<THREE.Group>(null);
  const topStripRef = useRef<THREE.Mesh>(null);
  const speechDomRef = useRef<HTMLDivElement>(null);

  const speechState = useRef({ show: false, text: '', timer: 0 });

  const anim = useRef({
    name: 'IDLE' as AnimName, t: 0, dur: 0,
    idleTimer: 4 + Math.random() * 3,
    cycle: 0,
    s: { hx: 0, hy: 0, hz: 0, rax: 0, raz: -.12, lax: 0, laz: .12, rex: 0, lex: 0, leg: 0, ry: 0, rz: 0, esc: 1 }
  });

  useFrame(({ clock }, delta) => {
    const A = anim.current; const S = A.s; const t = clock.getElapsedTime();
    const spd = 8; const sp = (v: number, tgt: number) => lerp(v, tgt, Math.min(1, spd * delta));

    // speech bubble DOM update
    const sp2 = speechState.current;
    if (sp2.show) { sp2.timer -= delta; if (sp2.timer <= 0) sp2.show = false; }
    if (speechDomRef.current) {
      speechDomRef.current.style.display = sp2.show ? 'block' : 'none';
      const tx = speechDomRef.current.querySelector('.st') as HTMLElement | null;
      if (tx) tx.textContent = sp2.text;
    }

    // idle countdown
    if (A.name === 'IDLE') {
      A.idleTimer -= delta;
      if (A.idleTimer <= 0) {
        A.cycle++;
        const fall = A.cycle % 10 === 0;
        const pool: [AnimName, number, number][] = fall
          ? [['FALL', 4.0, 1]]
          : [['WAVE_ONE', 2.6, 3], ['WAVE_BOTH', 3.0, 2], ['LOOK_AROUND', 3.0, 3], ['BLINK', .7, 5], ['TILT_HEAD', 2.4, 3]];
        let r = Math.random() * pool.reduce((s, x) => s + x[2], 0); let c = pool[0];
        for (const p of pool) { r -= p[2]; if (r <= 0) { c = p; break; } }
        A.name = c[0]; A.t = 0; A.dur = c[1];
        if (A.name === 'WAVE_ONE') speechState.current = { show: true, text: 'Hi! 👋', timer: 2.0 };
        if (A.name === 'WAVE_BOTH') speechState.current = { show: true, text: 'Hello! 👋👋', timer: 2.2 };
        A.idleTimer = 5 + Math.random() * 3;
      }
    } else {
      A.t += delta;
      if (A.t >= A.dur) {
        if (A.name === 'FALL') { A.name = 'CLIMBING'; A.t = 0; A.dur = 3.0; }
        else { A.name = 'IDLE'; A.t = 0; A.idleTimer = 5 + Math.random() * 3; }
      }
    }

    const p = A.t / Math.max(.001, A.dur);
    let thx = 0, thy = 0, thz = 0, trax = 0, traz = -.12, tlax = 0, tlaz = .12, trex = 0, tlex = 0;
    let tleg = 0, try_ = 0, trz = 0, tesc = 1;
    const swing = Math.sin(t * 1.2) * .18;

    switch (A.name) {
      case 'IDLE':
        tleg = swing; thy = Math.sin(t * .4) * .04; thx = Math.sin(t * .3) * .02; break;
      case 'WAVE_ONE': {
        const lf = eio(Math.min(p * 3, 1));
        trax = -1.8 * lf; traz = -.32 * lf; trex = Math.sin(p * Math.PI * 5) * .6 * lf; tleg = swing * .5; break;
      }
      case 'WAVE_BOTH': {
        const lf = eio(Math.min(p * 2.5, 1));
        trax = -1.6 * lf; traz = -.3 * lf; tlax = -1.6 * lf; tlaz = .3 * lf;
        trex = Math.sin(p * Math.PI * 5) * .5 * lf; tlex = Math.sin(p * Math.PI * 5 + .5) * .5 * lf; tleg = swing * .3; break;
      }
      case 'LOOK_AROUND':
        if (p < .25) thy = -0.7 * eio(p / .25);
        else if (p < .45) thy = -0.7 * eio(1 - (p - .25) / .2);
        else if (p < .55) thy = 0;
        else if (p < .80) thy = 0.7 * eio((p - .55) / .25);
        else thy = 0.7 * eio(1 - (p - .80) / .2);
        tleg = swing * .5; break;
      case 'BLINK':
        tesc = 1 - .95 * eio(1 - Math.abs(p * 2 - 1)); tleg = swing; break;
      case 'TILT_HEAD':
        if (p < .3) thz = -.45 * eio(p / .3);
        else if (p < .7) thz = -.45;
        else thz = -.45 * eio(1 - (p - .7) / .3);
        thx = Math.sin(p * Math.PI * 4) * .03; tleg = swing * .5; break;
      case 'FALL':
        if (p < .15) { trz = -.3 * eio(p / .15); tlax = -1.2 * eio(p / .15); }
        else if (p < .5) { const f = (p - .15) / .35; trz = -Math.PI * .48 * eio(f) - .3; try_ = -.9 * eio(f); tlax = -1.2; }
        else if (p < .8) { trz = -Math.PI * .48; try_ = -.9 + Math.sin(p * Math.PI * 4) * .03; tlax = Math.sin(p * Math.PI * 6) * .8; trax = Math.sin(p * Math.PI * 6 + 1) * .5; }
        else { const f = (p - .8) / .2; trz = -Math.PI * .48 * (1 - f * .3); try_ = -.9; } break;
      case 'CLIMBING':
        if (p < .4) { const f = p / .4; trz = -Math.PI * .48 * (1 - eio(f)); try_ = -.9 + .3 * eio(f); trax = -f; tlax = -f; }
        else if (p < .75) { const f = (p - .4) / .35; trz = 0; try_ = -.6 + .6 * eio(f); trax = -(1 - f); tlax = -(1 - f); }
        else { trz = 0; try_ = 0; tleg = swing * (p - .75) / .25; } break;
    }

    // smooth & apply
    S.hx = sp(S.hx, thx); S.hy = sp(S.hy, thy); S.hz = sp(S.hz, thz);
    S.rax = sp(S.rax, trax); S.raz = sp(S.raz, traz);
    S.lax = sp(S.lax, tlax); S.laz = sp(S.laz, tlaz);
    S.rex = sp(S.rex, trex); S.lex = sp(S.lex, tlex);
    S.leg = sp(S.leg, tleg); S.ry = sp(S.ry, try_); S.rz = sp(S.rz, trz);
    S.esc = lerp(S.esc, tesc, Math.min(1, 12 * delta));

    if (headRef.current) { headRef.current.rotation.set(S.hx, S.hy, S.hz); }
    if (rArmRef.current) { rArmRef.current.rotation.x = S.rax; rArmRef.current.rotation.z = S.raz; }
    if (lArmRef.current) { lArmRef.current.rotation.x = S.lax; lArmRef.current.rotation.z = S.laz; }
    if (rElbowRef.current) rElbowRef.current.rotation.x = lerp(rElbowRef.current.rotation.x, S.rex, Math.min(1, 8 * delta));
    if (lElbowRef.current) lElbowRef.current.rotation.x = lerp(lElbowRef.current.rotation.x, S.lex, Math.min(1, 8 * delta));
    if (rHipRef.current) rHipRef.current.rotation.x = S.leg * .8;
    if (lHipRef.current) lHipRef.current.rotation.x = -S.leg * .8;
    if (eyeLRef.current) eyeLRef.current.scale.y = S.esc;
    if (eyeRRef.current) eyeRRef.current.scale.y = S.esc;
    if (rootRef.current) {
      rootRef.current.position.y = S.ry + (A.name === 'IDLE' ? Math.sin(t * .9) * .018 : 0);
      rootRef.current.rotation.z = S.rz;
    }
    if (topStripRef.current) {
      (topStripRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 1.8 + .8 * Math.sin(t * 2);
    }
  });

  const bMat = { color: '#0f1725', metalness: .35, roughness: .65 };
  const jMat = { color: '#1a2540', metalness: .5, roughness: .5 };

  function Arm({ gRef, eRef, side }: { gRef: React.RefObject<THREE.Group | null>; eRef: React.RefObject<THREE.Group | null>; side: 1 | -1 }) {
    return (
      <group ref={gRef} position={[side * .36, -.17, 0]}>
        <mesh><sphereGeometry args={[.062, 10, 10]} /><meshStandardMaterial {...jMat} /></mesh>
        <mesh position={[0, -.15, 0]}><boxGeometry args={[.11, .26, .11]} /><meshStandardMaterial {...bMat} /></mesh>
        <group ref={eRef} position={[0, -.28, 0]}>
          <mesh><sphereGeometry args={[.052, 10, 10]} /><meshStandardMaterial {...jMat} /></mesh>
          <mesh position={[0, -.13, 0]}><boxGeometry args={[.095, .22, .095]} /><meshStandardMaterial {...bMat} /></mesh>
          <mesh position={[0, -.26, 0]}><boxGeometry args={[.10, .09, .082]} /><meshStandardMaterial {...bMat} /></mesh>
        </group>
      </group>
    );
  }

  function Leg({ gRef, side }: { gRef: React.RefObject<THREE.Group | null>; side: 1 | -1 }) {
    return (
      <group ref={gRef} position={[side * .13, -.645, 0]}>
        <mesh position={[0, -.15, 0]}><boxGeometry args={[.115, .27, .115]} /><meshStandardMaterial {...bMat} /></mesh>
        <mesh position={[0, -.295, 0]}><sphereGeometry args={[.055, 10, 10]} /><meshStandardMaterial {...jMat} /></mesh>
        <mesh position={[0, -.44, 0]}><boxGeometry args={[.10, .23, .10]} /><meshStandardMaterial {...bMat} /></mesh>
        <mesh position={[0, -.575, .02]}><boxGeometry args={[.11, .065, .135]} /><meshStandardMaterial {...bMat} /></mesh>
      </group>
    );
  }

  return (
    <>
      <ambientLight intensity={0.22} color="#c7d2fe" />
      <directionalLight position={[3, 5, 3]} intensity={0.85} color="#dbeafe" />
      <directionalLight position={[-2, 0, -2]} intensity={0.22} color="#6d28d9" />
      <pointLight position={[0, 2, 1]} color="#60a5fa" intensity={1.0} distance={5} />
      <Environment preset="night" />
      <Particles />

      {/* Platform */}
      <mesh position={[0, -1.12, 0]}>
        <boxGeometry args={[1.55, .32, 1.0]} />
        <meshStandardMaterial color="#0c1428" metalness={0.65} roughness={0.35} />
      </mesh>
      {/* Platform front edge glow */}
      <mesh position={[0, -.955, .51]}>
        <boxGeometry args={[1.28, .011, .011]} />
        <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={2.5} roughness={0} />
      </mesh>
      {/* Platform corner dots */}
      {([[-0.72, .51], [0.72, .51], [-0.72, -.51], [0.72, -.51]] as [number, number][]).map(([x, z], i) => (
        <mesh key={i} position={[x, -.955, z]}>
          <sphereGeometry args={[.02, 8, 8]} />
          <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={3} roughness={0} />
        </mesh>
      ))}

      {/* Robot root */}
      <group ref={rootRef}>
        {/* Torso */}
        <mesh position={[0, -.38, 0]}>
          <boxGeometry args={[.52, .52, .36]} />
          <meshStandardMaterial {...bMat} />
        </mesh>
        {/* Chest panel */}
        <mesh position={[0, -.34, .185]}>
          <boxGeometry args={[.32, .28, .012]} />
          <meshStandardMaterial color="#1e293b" metalness={0.3} roughness={0.4} transparent opacity={0.85} />
        </mesh>
        <mesh position={[0, -.29, .192]}>
          <boxGeometry args={[.21, .011, .007]} />
          <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={2.5} roughness={0} />
        </mesh>
        <mesh position={[0, -.37, .192]}>
          <boxGeometry args={[.15, .008, .007]} />
          <meshStandardMaterial color="#a78bfa" emissive="#a78bfa" emissiveIntensity={2.5} roughness={0} />
        </mesh>

        {/* Head */}
        <group ref={headRef} position={[0, .1, 0]}>
          <mesh>
            <boxGeometry args={[.46, .42, .40]} />
            <meshStandardMaterial color="#0d1320" metalness={0.4} roughness={0.58} />
          </mesh>
          {/* Face panel glass */}
          <mesh position={[0, .02, .202]}>
            <boxGeometry args={[.36, .30, .01]} />
            <meshStandardMaterial color="#0ea5e9" metalness={0.1} roughness={0} transparent opacity={0.1} />
          </mesh>
          {/* Face border lines */}
          {([
            [0, .155, .207, .36, .01, .01], [0, -.115, .207, .36, .01, .01],
            [-.175, .02, .207, .01, .30, .01], [.175, .02, .207, .01, .30, .01],
          ] as [number, number, number, number, number, number][]).map(([x, y, z, w, h, d], i) => (
            <mesh key={i} position={[x, y, z]}>
              <boxGeometry args={[w, h, d]} />
              <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={3} roughness={0} />
            </mesh>
          ))}
          {/* Eyes */}
          <group position={[-.095, .055, .206]}><Eye eRef={eyeLRef} /></group>
          <group position={[.095, .055, .206]}><Eye eRef={eyeRRef} /></group>
          {/* Mouth grille */}
          {[-.10, -.035, .03, .095].map((x, i) => (
            <mesh key={i} position={[x, -.09, .206]}>
              <boxGeometry args={[.052, .009, .007]} />
              <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={1.5} roughness={0} />
            </mesh>
          ))}
          {/* Purple energy strip */}
          <mesh ref={topStripRef} position={[0, .22, 0]}>
            <boxGeometry args={[.38, .042, .38]} />
            <meshStandardMaterial color="#7c3aed" emissive="#7c3aed" emissiveIntensity={2} roughness={0.2} />
          </mesh>
          {/* Ear stubs */}
          <mesh position={[-.245, .02, 0]}><boxGeometry args={[.038, .22, .28]} /><meshStandardMaterial {...jMat} /></mesh>
          <mesh position={[.245, .02, 0]}><boxGeometry args={[.038, .22, .28]} /><meshStandardMaterial {...jMat} /></mesh>
          {/* Speech bubble HTML */}
          <Html position={[.34, .38, 0]} center distanceFactor={3}>
            <div ref={speechDomRef} style={{ display: 'none', background: 'rgba(15,23,42,0.92)', border: '1.5px solid rgba(56,189,248,0.7)', borderRadius: 12, padding: '6px 14px', color: '#e0f2fe', fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap', boxShadow: '0 0 18px rgba(56,189,248,0.3)', fontFamily: 'system-ui,sans-serif', pointerEvents: 'none', position: 'relative' }}>
              <span className="st" />
              <div style={{ position: 'absolute', bottom: -7, left: 18, width: 0, height: 0, borderLeft: '7px solid transparent', borderRight: '7px solid transparent', borderTop: '7px solid rgba(56,189,248,0.7)' }} />
            </div>
          </Html>
        </group>

        {/* Arms */}
        <Arm gRef={rArmRef} eRef={rElbowRef} side={1} />
        <Arm gRef={lArmRef} eRef={lElbowRef} side={-1} />
        {/* Legs */}
        <Leg gRef={rHipRef} side={1} />
        <Leg gRef={lHipRef} side={-1} />
      </group>
    </>
  );
}

// ── Export ────────────────────────────────────────────────────────────────────
export default function RobotHead() {
  return (
    <div className="w-full h-full" style={{ minHeight: 420 }}>
      <Canvas camera={{ position: [0, .15, 3.4], fov: 42 }} gl={{ antialias: true, alpha: true }} style={{ background: 'transparent' }} dpr={[1, 1.5]}>
        <Suspense fallback={null}>
          <RobotScene />
        </Suspense>
      </Canvas>
    </div>
  );
}
