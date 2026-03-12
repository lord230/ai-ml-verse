"use client";

import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

// ─── Colors ────────────────────────────────────────────────────────────────
const DORMANT = new THREE.Color('#0f766e'); // Dark teal
const ACTIVE  = new THREE.Color('#ffffff'); // Glowing white
// Colors for specific activation moments:
// Conv: Teal, Pool: Violet, Flatten: Emerald, FC: Amber
const LAYER_COLORS = [
    '#2dd4bf', // Input -> Teal
    '#2dd4bf', // Conv1 -> Teal
    '#2dd4bf', // Conv2 -> Teal
    '#a78bfa', // Pool -> Violet
    '#34d399', // Flatten -> Emerald
    '#fbbf24', // FC1 -> Amber
    '#f87171'  // FC2 -> Red/Orange
];

// ─── Types ─────────────────────────────────────────────────────────────────
interface Props {
    drawingData?: Float32Array;
    onPrediction?: (pred: number | null) => void;
    onLayerHover?: (layerId: string | null) => void;
    animationProgress: number;
    isPlaying: boolean;
    speed?: number;
}

interface LayerDef {
    type: 'input' | 'conv' | 'pool' | 'flatten' | 'fc';
    name: string;
    resX: number; resY: number;
    channels: number; visualChannels: number;
    activations: Float32Array;
    weights: Float32Array;
    biases?: Float32Array;
    zPos: number;
    width: number;
}

// ─── Scene ─────────────────────────────────────────────────────────────────
function Scene({ props }: { props: Props }) {
    const layers = useMemo<LayerDef[]>(() => {
        let z = -45;
        const step = 14;

        const L: LayerDef[] = [
            {
                type: 'input', name: 'Input 28×28',
                resX: 28, resY: 28, channels: 1, visualChannels: 1,
                activations: new Float32Array(28 * 28).fill(0),
                weights: new Float32Array(0), biases: new Float32Array(0), zPos: z, width: 18,
            },
            {
                type: 'conv', name: 'Conv1 (3×3, 32)',
                resX: 26, resY: 26, channels: 32, visualChannels: 6,
                activations: new Float32Array(26 * 26 * 32).fill(0),
                weights: new Float32Array(288).fill(0), biases: new Float32Array(32).fill(0),
                zPos: z += step, width: 17,
            },
            {
                type: 'conv', name: 'Conv2 (3×3, 64)',
                resX: 24, resY: 24, channels: 64, visualChannels: 5,
                activations: new Float32Array(24 * 24 * 64).fill(0),
                weights: new Float32Array(18432).fill(0), biases: new Float32Array(64).fill(0),
                zPos: z += step, width: 15,
            },
            {
                type: 'pool', name: 'MaxPool 2×2',
                resX: 12, resY: 12, channels: 64, visualChannels: 5,
                activations: new Float32Array(12 * 12 * 64).fill(0),
                weights: new Float32Array(0), biases: new Float32Array(0), zPos: z += step, width: 9,
            },
            {
                type: 'flatten', name: 'Flatten (9216)',
                resX: 32, resY: 32, channels: 1, visualChannels: 1,
                activations: new Float32Array(9216).fill(0),
                weights: new Float32Array(0), biases: new Float32Array(0), zPos: z += step, width: 12,
            },
            {
                type: 'fc', name: 'FC1 (128)',
                resX: 128, resY: 1, channels: 1, visualChannels: 1,
                activations: new Float32Array(128).fill(0),
                weights: new Float32Array(1179648).fill(0), biases: new Float32Array(128).fill(0),
                zPos: z += step, width: 36,
            },
            {
                type: 'fc', name: 'Output (0–9)',
                resX: 10, resY: 1, channels: 1, visualChannels: 1,
                activations: new Float32Array(10).fill(0),
                weights: new Float32Array(1280).fill(0), biases: new Float32Array(10).fill(0),
                zPos: z += step, width: 14,
            },
        ];
        return L;
    }, []);

    // ── Fetch PyTorch Weights ──
    useEffect(() => {
        const fetchWeights = async () => {
            const fileMap = [
                { name: 'conv1_weight', l: 1, k: 'weights' }, { name: 'conv1_bias', l: 1, k: 'biases' },
                { name: 'conv2_weight', l: 2, k: 'weights' }, { name: 'conv2_bias', l: 2, k: 'biases' },
                { name: 'fc1_weight', l: 5, k: 'weights' }, { name: 'fc1_bias', l: 5, k: 'biases' },
                { name: 'fc2_weight', l: 6, k: 'weights' }, { name: 'fc2_bias', l: 6, k: 'biases' }
            ];
            for (const f of fileMap) {
                try {
                    const res = await fetch(`/models/mnist_cnn/${f.name}.bin`);
                    if (res.ok) {
                        const buf = await res.arrayBuffer();
                        if (f.k === 'weights') layers[f.l].weights = new Float32Array(buf);
                        if (f.k === 'biases') layers[f.l].biases = new Float32Array(buf);
                    }
                } catch (e) {
                    console.error("Failed to load", f.name);
                }
            }
        };
        fetchWeights();
    }, [layers]);

    const meshRefs = useRef<(THREE.InstancedMesh | null)[]>([]);
    const scanRef  = useRef<THREE.LineSegments>(null);
    const cableRef = useRef<THREE.LineSegments>(null);
    const dummy    = useMemo(() => new THREE.Object3D(), []);

    const visualCount = (l: LayerDef) =>
        l.type === 'flatten' ? 32 * 32 : l.resX * l.resY * l.visualChannels;

    const getPos = (lIdx: number, x: number, y: number, c: number, out: THREE.Vector3) => {
        const l = layers[lIdx];
        if (!l) return out.set(0, 0, 0);
        if (l.type === 'flatten') {
            const sp = l.width / 32;
            out.set((x - 16 + 0.5) * sp, -(y - 16 + 0.5) * sp, l.zPos);
        } else if (l.type === 'fc') {
            const sp = l.width / l.resX;
            out.set((x - l.resX / 2 + 0.5) * sp, 0, l.zPos);
        } else {
            const vc = Math.min(c, l.visualChannels - 1);
            const sp = l.width / l.resX;
            const zo = l.visualChannels > 1 ? 0.7 : 0;
            out.set((x - l.resX / 2 + 0.5) * sp, -(y - l.resY / 2 + 0.5) * sp,
                    l.zPos + (vc - l.visualChannels / 2 + 0.5) * zo);
        }
        return out;
    };

    const cableGeo = useMemo(() => {
        const g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(1200 * 6), 3));
        return g;
    }, []);

    // ── Initialize node positions ───────────────────────────────────────────
    useEffect(() => {
        layers.forEach((l, li) => {
            const m = meshRefs.current[li];
            if (!m) return;
            const vc = visualCount(l);
            for (let i = 0; i < vc; i++) {
                if (l.type === 'flatten') {
                    const vx = i % 32, vy = Math.floor(i / 32), sp = l.width / 32;
                    dummy.position.set((vx - 16 + 0.5) * sp, -(vy - 16 + 0.5) * sp, l.zPos);
                } else if (l.type === 'fc') {
                    const sp = l.width / l.resX;
                    dummy.position.set((i - l.resX / 2 + 0.5) * sp, 0, l.zPos);
                } else {
                    const area = l.resX * l.resY;
                    const c = Math.floor(i / area), rem = i % area;
                    const y = Math.floor(rem / l.resX), x = rem % l.resX;
                    getPos(li, x, y, c, dummy.position);
                }
                const isOutput = l.type === 'fc' && l.resX === 10;
                dummy.scale.setScalar(isOutput ? 0.7 : l.type === 'fc' ? 0.18 : 0.18);
                dummy.updateMatrix();
                m.setMatrixAt(i, dummy.matrix);
                m.setColorAt(i, DORMANT);
            }
            m.instanceMatrix.needsUpdate = true;
            if (m.instanceColor) m.instanceColor.needsUpdate = true;
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [layers]);

    // ── Sync drawing data ──────────────────────────────────────────────────
    useEffect(() => {
        if (!props.drawingData || !layers[0]) return;
        const m = meshRefs.current[0];
        const col = new THREE.Color();
        for (let i = 0; i < Math.min(props.drawingData.length, 784); i++) {
            layers[0].activations[i] = (props.drawingData[i] - 0.1307) / 0.3081; // PyTorch MNIST Normalization
        }
        if (m && m.instanceColor) {
            for (let i = 0; i < 784; i++) {
                const visualIntensity = Math.min(1, Math.max(0, props.drawingData[i]));
                col.copy(DORMANT).lerp(ACTIVE, visualIntensity);
                m.setColorAt(i, col);
            }
            m.instanceColor.needsUpdate = true;
        }
    }, [props.drawingData, layers]);

    // ── State machine ──────────────────────────────────────────────────────
    const sim = useRef({
        lIdx: 1, iIdx: 0,
        tc: new THREE.Color(), tp: new THREE.Vector3(), sp2: new THREE.Vector3(),
        lastProgress: props.animationProgress,
        wasPlaying: props.isPlaying
    });

    useFrame(() => {
        const s = sim.current;

        // Define progress segments for each layer computing phase
        const segments = [
            { l: 1, start: 0, end: 15 },
            { l: 2, start: 15, end: 35 },
            { l: 3, start: 35, end: 50 },
            { l: 4, start: 50, end: 65 },
            { l: 5, start: 65, end: 85 },
            { l: 6, start: 85, end: 100 },
        ];

        let targetL = 1;
        let targetI = 0;

        for (const seg of segments) {
            if (props.animationProgress >= seg.start && props.animationProgress < seg.end) {
                targetL = seg.l;
                const ratio = (props.animationProgress - seg.start) / (seg.end - seg.start);
                targetI = Math.floor(ratio * layers[seg.l].activations.length);
                break;
            }
        }
        if (props.animationProgress >= 100) {
            targetL = layers.length; // Allow it to reach layer 7 conceptually so layer 6 finishes fully
            targetI = 0;
            
            // Failsafe: if we are at 100%, guarantee we pass out the prediction regardless of inner loop timing states.
            if (s.lIdx >= layers.length - 1 && props.onPrediction) {
                let best = 0;
                let bv = -Infinity;
                for (let i = 0; i < 10; i++) if (layers[6].activations[i] > bv) { bv = layers[6].activations[i]; best = i; }
                props.onPrediction(best);
            }
        }

        // Did we scrub backwards or restart?
        if (s.lIdx > targetL || (s.lIdx === targetL && s.iIdx > targetI + 50)) {
            // Scrub backwards: clear future activations
            for (let li = Math.min(targetL, layers.length - 1); li < layers.length; li++) {
                const startClear = li === targetL ? targetI : 0;
                for (let i = startClear; i < layers[li].activations.length; i++) {
                    layers[li].activations[i] = 0;
                }
                const m = meshRefs.current[li];
                if (m && m.instanceColor) {
                    for (let i = startClear; i < visualCount(layers[li]); i++) {
                        m.setColorAt(i, DORMANT);
                    }
                    m.instanceColor.needsUpdate = true;
                }
            }
            s.lIdx = targetL;
            s.iIdx = targetI;
            
            if (targetL === 1 && targetI === 0) {
                // prediction reset
                if (props.onPrediction) props.onPrediction(null);
                // Also reset layer 6 (output) colors specifically
                const fm = meshRefs.current[6];
                if (fm && fm.instanceColor) {
                    for (let i = 0; i < 10; i++) {
                        fm.setColorAt(i, DORMANT);
                        getPos(6, i, 0, 0, dummy.position);
                        dummy.scale.setScalar(0.7);
                        dummy.updateMatrix();
                        fm.setMatrixAt(i, dummy.matrix);
                    }
                    fm.instanceColor.needsUpdate = true;
                    fm.instanceMatrix.needsUpdate = true;
                }
            }
        }

        // If practically paused, don't do massive computations for no reason except catching up
        if (!props.isPlaying && s.lIdx === targetL && s.iIdx === targetI) {
            // Only hide scanBox when really paused in sync
            if (scanRef.current && (s.lIdx > 2 || (s.lIdx === targetL && s.iIdx === targetI))) {
                scanRef.current.visible = false;
            }
            return;
        }
        
        let cdx = 0;
        const cab = cableGeo.attributes.position.array as Float32Array;
        
        // At most compute 5000 nodes per frame to keep stable 60FPS but guarantee it keeps up with timeline
        let computed = 0;
        
        while (computed < 5000) {
            if (s.lIdx > targetL || (s.lIdx === targetL && s.iIdx >= targetI)) {
                break; // caught up to animation UI
            }
            
            if (s.lIdx >= layers.length) break;

            const curr = layers[s.lIdx];
            const prev = layers[s.lIdx - 1];
            
            if (s.iIdx >= curr.activations.length) {
                // Layer done
                if (s.lIdx === layers.length - 1 && props.onPrediction) {
                    let best = 0;
                    let bv = -Infinity;
                    for (let i = 0; i < 10; i++) if (curr.activations[i] > bv) { bv = curr.activations[i]; best = i; }
                    props.onPrediction(best);
                    const fm = meshRefs.current[s.lIdx];
                    if (fm && fm.instanceColor) {
                        for (let i = 0; i < 10; i++) {
                            s.tc.set(i === best ? '#ef4444' : '#0891b2');
                            fm.setColorAt(i, s.tc);
                            getPos(s.lIdx, i, 0, 0, dummy.position);
                            dummy.scale.setScalar(i === best ? 1.2 : 0.7);
                            dummy.updateMatrix();
                            fm.setMatrixAt(i, dummy.matrix);
                        }
                        fm.instanceColor.needsUpdate = true;
                        fm.instanceMatrix.needsUpdate = true;
                    }
                }
                s.lIdx++; s.iIdx = 0; continue;
            }

            if (curr.type === 'conv') {
                const c = Math.floor(s.iIdx / (curr.resX * curr.resY));
                const rem = s.iIdx % (curr.resX * curr.resY);
                const cy = Math.floor(rem / curr.resX), cx = rem % curr.resX;
                getPos(s.lIdx, cx, cy, c, s.tp);
                let sum = curr.biases ? curr.biases[c] : 0;
                
                for (let ky = 0; ky < 3; ky++) for (let kx = 0; kx < 3; kx++) {
                    const ix = cx + kx, iy = cy + ky;
                    for (let ic = 0; ic < prev.channels; ic++) {
                        const ii = ic * (prev.resX * prev.resY) + iy * prev.resX + ix;
                        const wi = c * (9 * prev.channels) + ic * 9 + ky * 3 + kx;
                        const v = prev.activations[ii] * curr.weights[wi];
                        sum += v;
                        if (Math.abs(v) > 0.1 && cdx < 400 && ic < prev.visualChannels) {
                            getPos(s.lIdx - 1, ix, iy, ic, s.sp2);
                            cab[cdx*6]=s.sp2.x; cab[cdx*6+1]=s.sp2.y; cab[cdx*6+2]=s.sp2.z;
                            cab[cdx*6+3]=s.tp.x; cab[cdx*6+4]=s.tp.y; cab[cdx*6+5]=s.tp.z;
                            cdx++;
                        }
                    }
                }
                curr.activations[s.iIdx] = Math.max(0, sum); // ReLU activation
                
                if (scanRef.current && computed === 0) { // visualize scanning box on the first processed node of this frame
                    const sp = prev.width / prev.resX;
                    scanRef.current.position.set((cx+1.5-prev.resX/2)*sp, -(cy+1.5-prev.resY/2)*sp, prev.zPos);
                    scanRef.current.scale.set(3*sp, 3*sp, prev.visualChannels*0.7+0.5);
                    scanRef.current.visible = true;
                }
            } else if (curr.type === 'pool') {
                const c = Math.floor(s.iIdx / (curr.resX * curr.resY));
                const rem = s.iIdx % (curr.resX * curr.resY);
                const cy = Math.floor(rem / curr.resX), cx = rem % curr.resX;
                let mx = -Infinity;
                for (let ky = 0; ky < 2; ky++) for (let kx = 0; kx < 2; kx++) {
                    const ii = c*(prev.resX*prev.resY) + (cy*2+ky)*prev.resX + (cx*2+kx);
                    if (prev.activations[ii] > mx) mx = prev.activations[ii];
                }
                curr.activations[s.iIdx] = mx;
                if (scanRef.current) scanRef.current.visible = false;
            } else if (curr.type === 'flatten') {
                curr.activations[s.iIdx] = prev.activations[s.iIdx] ?? 0;
                if (scanRef.current) scanRef.current.visible = false;
            } else if (curr.type === 'fc') {
                let sum = curr.biases ? curr.biases[s.iIdx] : 0;
                for (let i = 0; i < prev.activations.length; i++) {
                    const v = prev.activations[i] * curr.weights[s.iIdx * prev.activations.length + i];
                    sum += v;
                    if (Math.abs(v) > 0.25 && cdx < 400 && i % 50 === 0) {
                        getPos(s.lIdx-1, i % prev.resX, Math.floor(i/prev.resX), 0, s.sp2);
                        getPos(s.lIdx, s.iIdx, 0, 0, s.tp);
                        cab[cdx*6]=s.sp2.x; cab[cdx*6+1]=s.sp2.y; cab[cdx*6+2]=s.sp2.z;
                        cab[cdx*6+3]=s.tp.x; cab[cdx*6+4]=s.tp.y; cab[cdx*6+5]=s.tp.z;
                        cdx++;
                    }
                }
                curr.activations[s.iIdx] = s.lIdx === layers.length-1 ? sum : Math.max(0, sum);
                if (scanRef.current) scanRef.current.visible = false;
            }

            // Color update
            const m = meshRefs.current[s.lIdx];
            if (m && m.instanceColor) {
                const act = curr.activations[s.iIdx];
                const vi = curr.type === 'flatten' ? Math.min(1023, Math.floor(s.iIdx / (9216/1024))) : s.iIdx;
                if (vi < visualCount(curr)) {
                    s.tc.copy(DORMANT).lerp(ACTIVE, Math.min(1, Math.max(0, act * 0.5)));
                    m.setColorAt(vi, s.tc);
                    m.instanceColor.needsUpdate = true;
                }
            }
            s.iIdx++;
            computed++;
        }

        cableGeo.setDrawRange(0, cdx * 2);
        cableGeo.attributes.position.needsUpdate = true;

        // Keep input synced if drawing
        const im = meshRefs.current[0];
        if (im && im.instanceColor && props.drawingData) {
            for (let i = 0; i < 784; i++) {
                s.tc.copy(DORMANT).lerp(ACTIVE, layers[0].activations[i]);
                im.setColorAt(i, s.tc);
            }
            im.instanceColor.needsUpdate = true;
        }
    });

    const boxGeo = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(1, 1, 1)), []);

    return (
        <group rotation={[Math.PI / 10, -Math.PI / 8, 0]}>
            <color attach="background" args={['#03051a']} />
            <fog attach="fog" args={['#03051a', 30, 110]} />
            <Sparkles count={800} scale={60} size={0.8} color="#6366f1" speed={0.1} opacity={0.08} />

            {layers.map((l, i) => {
                const vc = visualCount(l);
                return (
                    <group key={i}>
                        {/* Glass slab — hoverable */}
                        <mesh
                            position={[0, 0, l.zPos]}
                            onPointerOver={(e) => { e.stopPropagation(); props.onLayerHover?.(l.name); }}
                            onPointerOut={() => props.onLayerHover?.(null)}
                        >
                            <boxGeometry args={[l.width + 1, (l.type === 'fc' ? 3 : l.width) + 1, 0.15]} />
                            <meshPhysicalMaterial
                                color={LAYER_COLORS[i % LAYER_COLORS.length]}
                                transparent opacity={0.07} transmission={0.95} roughness={0.1}
                            />
                        </mesh>

                        {/* Layer label — fixed small size via style to avoid bleed-through */}
                        <Html
                            position={[0, (l.type === 'fc' ? 2 : l.width / 2) + 1.5, l.zPos]}
                            center
                            style={{ pointerEvents: 'none', whiteSpace: 'nowrap' }}
                        >
                            <div style={{ fontFamily: 'monospace', fontSize: 9, color: '#cbd5e1', fontWeight: 700, letterSpacing: 1, textShadow: '0 0 6px #000' }}>
                                {l.name}
                            </div>
                        </Html>

                        {/* Output digit labels */}
                        {l.resX === 10 && l.type === 'fc' && Array.from({ length: 10 }, (_, d) => (
                            <Html
                                key={d}
                                position={[(d - 4.5) * (l.width / 10), -2, l.zPos]}
                                center
                                style={{ pointerEvents: 'none' }}
                            >
                                <div style={{ fontSize: 9, fontWeight: 900, color: '#fff', background: 'rgba(0,0,0,0.6)', border: '1px solid #475569', padding: '1px 4px', borderRadius: 3 }}>
                                    {d}
                                </div>
                            </Html>
                        ))}

                        {/* Nodes */}
                        <instancedMesh
                            ref={(el) => { if (el) meshRefs.current[i] = el; }}
                            args={[undefined, undefined, vc]}
                        >
                            <sphereGeometry args={[1, 8, 8]} />
                            <meshStandardMaterial toneMapped={false} emissiveIntensity={2.5} />
                        </instancedMesh>
                    </group>
                );
            })}

            {/* Scanning kernel box */}
            <lineSegments ref={scanRef} geometry={boxGeo} visible={false}>
                <lineBasicMaterial color="#14b8a6" transparent opacity={0.6} />
            </lineSegments>

            {/* Cables */}
            <lineSegments ref={cableRef} geometry={cableGeo}>
                <lineBasicMaterial color="#fcd34d" transparent opacity={0.2} />
            </lineSegments>

            <ambientLight intensity={0.6} />
            <pointLight position={[10, 15, 10]} intensity={3} color="#6366f1" />
            <pointLight position={[-10, -10, -5]} intensity={1.5} color="#10b981" />
        </group>
    );
}

// ─── Canvas Wrapper ─────────────────────────────────────────────────────────
export default function CNNCanvas(props: Props) {
    return (
        <div style={{ position: 'absolute', inset: 0, background: '#03051a' }}>
            <Canvas
                camera={{ position: [0, 25, 70], fov: 45 }}
                style={{ width: '100%', height: '100%' }}
                gl={{ antialias: true }}
            >
                <OrbitControls
                    enableDamping
                    dampingFactor={0.04}
                    autoRotate
                    autoRotateSpeed={0.25}
                    minDistance={10}
                    maxDistance={120}
                />
                <Scene props={props} />
            </Canvas>

            {/* Hint */}
            <div style={{
                position: 'absolute', bottom: 10, right: 12,
                fontSize: 9, color: 'rgba(148,163,184,0.5)', fontFamily: 'monospace',
                pointerEvents: 'none',
            }}>
                Drag to orbit · Scroll to zoom
            </div>
        </div>
    );
}
