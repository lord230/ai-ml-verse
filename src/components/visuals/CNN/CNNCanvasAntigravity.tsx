"use client";

import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

// Math/Colors
const DORMANT_COLOR = new THREE.Color('#0891b2'); // dim cyan
const ACTIVE_COLOR = new THREE.Color('#ffffff'); // blazing white-gold
const LAYER_COLORS = ['#3b82f6', '#8b5cf6', '#d946ef', '#10b981', '#f59e0b'];

interface Props {
    inputRes: number;
    inChannels: number;
    filters: number;
    numLayers: number;
    kernelSize: number;
    stride: number;
    padding: number;
    isAntigravity: boolean;
    drawingData?: Float32Array;
    onPrediction?: (pred: number) => void;
}

interface LayerData {
    res: number;
    channels: number;
    activations: Float32Array;
    weights: Float32Array; // filters connecting previous layer to this one
    zPos: number; // world Z position
    width: number; // world X/Y size
}

function DarkNebula() {
    return (
        <group>
            <color attach="background" args={['#020617']} />
            <fog attach="fog" args={['#020617', 10, 80]} />
            <Sparkles count={3000} scale={60} size={2} color="#4f46e5" speed={0.2} opacity={0.15} />
            <Sparkles count={1000} scale={60} size={3} color="#db2777" speed={0.1} opacity={0.1} />
        </group>
    );
}

// ------------------------------------------------------------------
// SCANNING SWEEP & PHYSICS SIMULATOR
// ------------------------------------------------------------------
function CNNPhysicsSimulator({ config }: { config: Props }) {
    const { inputRes, inChannels, filters, numLayers, kernelSize, stride, padding, isAntigravity } = config;

    // Build the layer architecture metadata once
    const layers = useMemo(() => {
        const _layers: LayerData[] = [];
        let currentRes = inputRes;
        
        // Input
        _layers.push({
            res: currentRes,
            channels: inChannels,
            activations: new Float32Array(currentRes * currentRes * inChannels).map(() => Math.random()),
            weights: new Float32Array(0),
            zPos: -15, // start far back
            width: 15
        });

        // Hidden Conv Layers
        for (let i = 0; i < numLayers; i++) {
            const outRes = Math.max(1, Math.floor((currentRes - kernelSize + 2 * padding) / stride) + 1);
            const inCh = i === 0 ? inChannels : filters;
            const wghts = new Float32Array(kernelSize * kernelSize * inCh * filters).map(() => (Math.random() * 2 - 1));
            
            _layers.push({
                res: outRes,
                channels: filters,
                activations: new Float32Array(outRes * outRes * filters).fill(0),
                weights: wghts,
                zPos: -15 + (i + 1) * 12,
                width: 15 * (outRes / inputRes) // scale physically
            });
            currentRes = outRes;
        }

        // Final Fully Connected Layer (0-9 Digits)
        // We will visualize it as a 1x10 grid (res=1, channels=10)
        _layers.push({
            res: 10,
            channels: 1, // Layout flat as 10x1 instead of 1x1x10 for visual clarity
            activations: new Float32Array(10).fill(0),
            weights: new Float32Array(currentRes * currentRes * filters * 10).map(() => (Math.random() * 2 - 1)),
            zPos: -15 + (numLayers + 1) * 12,
            width: 15 // keep width same as input roughly
        });

        return _layers;
    }, [inputRes, inChannels, filters, numLayers, kernelSize, stride, padding]);

    // Refs for 3D elements
    const meshRefs = useRef<(THREE.InstancedMesh | null)[]>([]);
    const scanningBoxRef = useRef<THREE.LineSegments>(null);
    const tensionCablesRef = useRef<THREE.LineSegments>(null);
    const particlesRef = useRef<THREE.InstancedMesh>(null);

    // Simulation State
    const simState = useRef({
        layerIdx: 1, // Start computing layer 1
        outY: 0,
        outX: 0,
        outC: 0,
        tempColor: new THREE.Color(),
        particleIdx: 0
    });

    // Particle system data (velocity, target pos, age)
    const MAX_PARTICLES = 5000;
    const particleData = useMemo(() => {
        return Array.from({ length: MAX_PARTICLES }).map(() => ({
            pos: new THREE.Vector3(0, -999, 0),
            vel: new THREE.Vector3(),
            life: 0,
            active: false
        }));
    }, []);

    const dummy = useMemo(() => new THREE.Object3D(), []);

    // Initialize InstancedMeshes (Neurons)
    useEffect(() => {
        layers.forEach((layer, lIdx) => {
            const mesh = meshRefs.current[lIdx];
            if (!mesh) return;

            const spacing = layer.width / Math.max(1, layer.res);
            const zOffset = layer.channels > 1 ? 0.8 : 0;

            let idx = 0;
            for (let c = 0; c < layer.channels; c++) {
                for (let y = 0; y < layer.res; y++) {
                    for (let x = 0; x < layer.res; x++) {
                        const px = (x - layer.res / 2 + 0.5) * spacing;
                        const py = -(y - layer.res / 2 + 0.5) * spacing;
                        const pz = layer.zPos + (c - layer.channels / 2 + 0.5) * zOffset;
                        
                        dummy.position.set(px, py, pz);
                        dummy.scale.setScalar(0.2);
                        dummy.updateMatrix();
                        
                        mesh.setMatrixAt(idx, dummy.matrix);
                        mesh.setColorAt(idx, DORMANT_COLOR);
                        idx++;
                    }
                }
            }
            mesh.instanceMatrix.needsUpdate = true;
            if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
        });
    }, [layers, dummy]);

    // Geometry for Scanning Box & Tension Cables
    const boxGeo = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(1, 1, 1)), []);
    const cableGeo = useMemo(() => {
        const geo = new THREE.BufferGeometry();
        // pre-allocate max reasonable lines (e.g. 5x5 * 16 channels = 400 lines * 2 verts * 3 float)
        const maxLines = 7 * 7 * 32;
        geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(maxLines * 6), 3));
        return geo;
    }, []);

    // Helper to get neuron world position
    const getNeuronPos = (layerIdx: number, x: number, y: number, c: number, target: THREE.Vector3) => {
        const l = layers[layerIdx];
        if (!l) return target.set(0,0,0);
        const spacing = l.width / Math.max(1, l.res);
        const zOffset = l.channels > 1 ? 0.8 : 0;
        
        target.x = (x - l.res / 2 + 0.5) * spacing;
        target.y = -(y - l.res / 2 + 0.5) * spacing;
        target.z = l.zPos + (c - l.channels / 2 + 0.5) * zOffset;
        return target;
    };

    // Sync Drawing Data dynamically
    useEffect(() => {
        if (config.drawingData && layers[0]) {
            for(let i=0; i<Math.min(config.drawingData.length, layers[0].activations.length); i++) {
                layers[0].activations[i] = config.drawingData[i];
            }
        }
    }, [config.drawingData, layers]);

    // physics tick
    useFrame((state, delta) => {
        const time = state.clock.getElapsedTime();
        const s = simState.current;

        // Ensure we don't try to compute the drawing input or beyond our bounds
        const maxComputeLayers = layers.length - 1; // Exclude the final FC layer from the sliding window

        // --- 1. COMPUTE PIXELS ---
        // Speed: Compute multiple pixels per frame to keep up
        const pixelsPerFrame = 4; 
        
        for (let step = 0; step < pixelsPerFrame; step++) {
            if (s.layerIdx >= maxComputeLayers) {
                // Compute final FC Layer predictions based on Conv activations
                const fcLayer = layers[maxComputeLayers];
                const lastConvLayer = layers[maxComputeLayers - 1];
                let maxVal = -Infinity;
                let bestPred = 0;

                for (let i = 0; i < 10; i++) {
                    // Extremely basic pseudo-classification to make numbers pop
                    let sum = 0;
                    for(let j=0; j < lastConvLayer.activations.length; j++) {
                        // Sparse weight reading
                        sum += lastConvLayer.activations[j] * fcLayer.weights[(j * 10 + i) % fcLayer.weights.length];
                    }
                    // Apply softmax-like amplification
                    fcLayer.activations[i] = Math.max(0, sum);
                    if (fcLayer.activations[i] > maxVal) { maxVal = fcLayer.activations[i]; bestPred = i; }
                }
                
                // Normalize and glow FC layer
                const fcMesh = meshRefs.current[maxComputeLayers];
                if (fcMesh && fcMesh.instanceColor) {
                    for(let i=0; i<10; i++) {
                        const isPred = (i === bestPred) && maxVal > 0.1;
                        s.tempColor.copy(DORMANT_COLOR);
                        if (isPred) s.tempColor.set('#ef4444'); // Bright red to highlight prediction
                        else s.tempColor.lerp(ACTIVE_COLOR, Math.min(1, fcLayer.activations[i] / (maxVal || 1)));
                        fcMesh.setColorAt(i, s.tempColor);

                        dummy.position.copy(new THREE.Vector3());
                        getNeuronPos(maxComputeLayers, i, 0, 0, dummy.position);
                        dummy.scale.setScalar(isPred ? 0.5 : 0.2); // make winner much larger
                        dummy.updateMatrix();
                        fcMesh.setMatrixAt(i, dummy.matrix);
                    }
                    fcMesh.instanceColor.needsUpdate = true;
                    fcMesh.instanceMatrix.needsUpdate = true;
                }

                if (config.onPrediction && maxVal > 0.1) {
                    config.onPrediction(bestPred);
                }

                // Restart from layer 1
                s.layerIdx = 1;
                s.outY = 0;
                s.outX = 0;
                s.outC = 0;
                // Only re-randomize if NO drawing data is provided, otherwise let it keep the drawn shape
                if (!config.drawingData) {
                    for(let i=0; i<layers[0].activations.length; i++) {
                        if (Math.random() > 0.95) layers[0].activations[i] = Math.random();
                    }
                }
            }

            const currLayer = layers[s.layerIdx];
            const prevLayer = layers[s.layerIdx - 1];
            
            // Math for one output pixel
            let sum = 0;
            const inStartX = s.outX * stride - padding;
            const inStartY = s.outY * stride - padding;
            
            const cablePositions = cableGeo.attributes.position.array as Float32Array;
            let cableCount = 0;

            const targetPos = new THREE.Vector3();
            getNeuronPos(s.layerIdx, s.outX, s.outY, s.outC, targetPos);

            // Antigravity physics applies sine wave offset to output neurons
            if (isAntigravity) {
                const idx = s.outC * (currLayer.res * currLayer.res) + s.outY * currLayer.res + s.outX;
                const floatOffset = Math.sin(time * 3 + idx) * 0.5;
                targetPos.y += floatOffset;
            }

            for (let ky = 0; ky < kernelSize; ky++) {
                for (let kx = 0; kx < kernelSize; kx++) {
                    const ix = inStartX + kx;
                    const iy = inStartY + ky;
                    
                    if (ix >= 0 && ix < prevLayer.res && iy >= 0 && iy < prevLayer.res) {
                        for (let ic = 0; ic < prevLayer.channels; ic++) {
                            const inIdx = ic * (prevLayer.res * prevLayer.res) + iy * prevLayer.res + ix;
                            const wIdx = s.outC * (kernelSize * kernelSize * prevLayer.channels) + ic * (kernelSize * kernelSize) + ky * kernelSize + kx;
                            
                            const val = prevLayer.activations[inIdx] * currLayer.weights[wIdx];
                            sum += val;

                            // Draw tension cable if activation is high enough
                            if (Math.abs(val) > 0.1 && cableCount < 400) {
                                const sourcePos = new THREE.Vector3();
                                getNeuronPos(s.layerIdx - 1, ix, iy, ic, sourcePos);
                                
                                if (isAntigravity) {
                                    sourcePos.y += Math.sin(time * 3 + inIdx) * 0.5; // source also floats
                                }

                                cablePositions[cableCount * 6 + 0] = sourcePos.x;
                                cablePositions[cableCount * 6 + 1] = sourcePos.y;
                                cablePositions[cableCount * 6 + 2] = sourcePos.z;
                                
                                cablePositions[cableCount * 6 + 3] = targetPos.x;
                                cablePositions[cableCount * 6 + 4] = targetPos.y;
                                cablePositions[cableCount * 6 + 5] = targetPos.z;
                                cableCount++;
                            }
                        }
                    }
                }
            }

            cableGeo.setDrawRange(0, cableCount * 2);
            cableGeo.attributes.position.needsUpdate = true;

            // ReLU Activation
            const activatedVal = Math.max(0, sum); // ReLU
            const outIdx = s.outC * (currLayer.res * currLayer.res) + s.outY * currLayer.res + s.outX;
            currLayer.activations[outIdx] = activatedVal;

            // Update Color of this neuron
            const mesh = meshRefs.current[s.layerIdx];
            if (mesh && mesh.instanceColor) {
                // Dim down everything slowly or just light up what's active
                s.tempColor.copy(DORMANT_COLOR).lerp(ACTIVE_COLOR, Math.min(1, activatedVal));
                mesh.setColorAt(outIdx, s.tempColor);
                
                // physics transform update only for the floating effect
                if (isAntigravity) {
                    dummy.position.copy(targetPos);
                    dummy.scale.setScalar(0.2 + Math.min(0.3, activatedVal * 0.2));
                    dummy.updateMatrix();
                    mesh.setMatrixAt(outIdx, dummy.matrix);
                    mesh.instanceMatrix.needsUpdate = true;
                }

                mesh.instanceColor.needsUpdate = true;
            }

            // Spawn Particles on strong fire
            if (activatedVal > 0.5) {
                const p = particleData[s.particleIdx % MAX_PARTICLES];
                p.pos.copy(targetPos);
                
                if (isAntigravity) {
                    // Drift upward, orbital spiral
                    const angle = Math.random() * Math.PI * 2;
                    p.vel.set(Math.cos(angle) * 0.05, 0.1 + Math.random() * 0.1, Math.sin(angle) * 0.05);
                } else {
                    // Fall downward like sparks
                    p.vel.set((Math.random()-0.5)*0.1, -0.2 - Math.random() * 0.2, (Math.random()-0.5)*0.1);
                }
                p.life = 1.0;
                p.active = true;
                s.particleIdx++;
            }

            // Advance coordinates
            s.outC++;
            if (s.outC >= currLayer.channels) {
                s.outC = 0;
                s.outX++;
                if (s.outX >= currLayer.res) {
                    s.outX = 0;
                    s.outY++;
                    if (s.outY >= currLayer.res) {
                        s.outY = 0;
                        s.layerIdx++;
                    }
                }
            }
        }

        // --- 2. UPDATE PARTICLES & PHYSICS ---
        // Dim neurons slowly
        for (let l = 1; l < layers.length; l++) {
            const mesh = meshRefs.current[l];
            if (!mesh || !mesh.instanceColor) continue;
            // Ensure Color of input layer is always synced to drawn data too!
            const inputMesh = meshRefs.current[0];
            if (inputMesh && inputMesh.instanceColor) {
               for(let i=0; i<layers[0].activations.length; i++) {
                   s.tempColor.copy(DORMANT_COLOR).lerp(ACTIVE_COLOR, layers[0].activations[i]);
                   inputMesh.setColorAt(i, s.tempColor);
               } 
               inputMesh.instanceColor.needsUpdate = true;
            }

            // Move Particles
        const pMesh = particlesRef.current;
        if (pMesh) {
            let activeCount = 0;
            particleData.forEach((p, i) => {
                if (p.active) {
                    p.pos.add(p.vel);
                    p.life -= delta * 0.8;
                    
                    if (isAntigravity) {
                        // orbital force towards center Y axis
                        p.vel.x -= p.pos.x * 0.005;
                        p.vel.z -= p.pos.z * 0.005;
                    } else {
                        // gravity
                        p.vel.y -= 0.01;
                    }

                    if (p.life <= 0) {
                        p.active = false;
                        p.pos.set(0, -999, 0); // hide
                    }
                    
                    dummy.position.copy(p.pos);
                    dummy.scale.setScalar(p.life * 0.1);
                    dummy.updateMatrix();
                    pMesh.setMatrixAt(i, dummy.matrix);
                    
                    // Fade color
                    s.tempColor.set('#ffffff').lerp(new THREE.Color('#9333ea'), 1 - p.life);
                    pMesh.setColorAt(i, s.tempColor);
                    
                    activeCount++;
                }
            });
            pMesh.instanceMatrix.needsUpdate = true;
            if(pMesh.instanceColor) pMesh.instanceColor.needsUpdate = true;
        }
        }

        // Update Scanning Box bounds over Input Layer
        if (scanningBoxRef.current && s.layerIdx < maxComputeLayers) {
            const prevL = layers[s.layerIdx - 1];
            const inStartX = s.outX * stride - padding;
            const inStartY = s.outY * stride - padding;
            
            // Box center and size based on kernel mapped to physical space
            const spacing = prevL.width / Math.max(1, prevL.res);
            const boxWidth = kernelSize * spacing;
            const centerX = (inStartX + kernelSize / 2 - prevL.res / 2) * spacing;
            const centerY = -(inStartY + kernelSize / 2 - prevL.res / 2) * spacing;

            scanningBoxRef.current.position.set(centerX, centerY, prevL.zPos);
            scanningBoxRef.current.scale.set(boxWidth, boxWidth, prevL.channels * 0.8 + 0.5);
            
            // Oscillation effect
            (scanningBoxRef.current.material as THREE.Material).opacity = 0.3 + Math.sin(time * 10) * 0.2;
        }
    });

    return (
        <group>
            {/* Layers */}
            {layers.map((l, i) => {
                const count = l.res * l.res * l.channels;
                return (
                    <group key={`layer-${i}`}>
                        {/* Frosted Glass Slab */}
                        <mesh position={[0, 0, l.zPos - (l.channels > 1 ? l.channels * 0.4 : 0.2)]}>
                            <boxGeometry args={[l.width + 1, l.width + 1, 0.2]} />
                            <meshPhysicalMaterial 
                                color={LAYER_COLORS[i % LAYER_COLORS.length]}
                                transparent
                                opacity={0.15}
                                transmission={0.9} 
                                roughness={0.2}
                            />
                        </mesh>
                        <Html position={[0, l.width/2 + 1, l.zPos]} center className="pointer-events-none">
                            <div className="text-xs font-mono font-bold tracking-widest text-[#94a3b8] mix-blend-screen drop-shadow-md">
                                {i === 0 ? 'INPUT' : (i === layers.length - 1 ? 'OUTPUT (0-9)' : `CONV${i}`)} {i === layers.length - 1 ? '' : `${l.res}x${l.res}x${l.channels}`}
                            </div>
                        </Html>

                        {/* Special labels for the 0-9 output nodes */}
                        {i === layers.length - 1 && Array.from({ length: 10 }).map((_, digit) => {
                            const spacing = l.width / Math.max(1, l.res);
                            const px = (digit - l.res / 2 + 0.5) * spacing;
                            return (
                                <Html key={digit} position={[px, -1, l.zPos]} center className="pointer-events-none">
                                    <div className="text-xs font-bold text-white opacity-80 backdrop-blur bg-black/40 px-1.5 py-0.5 rounded border border-slate-600">
                                        {digit}
                                    </div>
                                </Html>
                            );
                        })}

                        {/* Neurons InstancedMesh */}
                        <instancedMesh
                            ref={(el) => { if (el) meshRefs.current[i] = el }}
                            args={[undefined, undefined, count]}
                        >
                            <sphereGeometry args={[1, 16, 16]} />
                            <meshStandardMaterial toneMapped={false} emissiveIntensity={2} />
                        </instancedMesh>
                    </group>
                );
            })}

            {/* Scanning Kernel Box */}
            <lineSegments ref={scanningBoxRef} geometry={boxGeo}>
                <lineBasicMaterial color="#14b8a6" transparent opacity={0.5} />
            </lineSegments>

            {/* Tension Cables (Weights) */}
            <lineSegments ref={tensionCablesRef} geometry={cableGeo}>
                <lineBasicMaterial color="#fcd34d" transparent opacity={0.4} />
            </lineSegments>

            {/* Antigravity Particles */}
            <instancedMesh ref={particlesRef} args={[undefined, undefined, MAX_PARTICLES]}>
                <sphereGeometry args={[1, 8, 8]} />
                <meshBasicMaterial toneMapped={false} />
            </instancedMesh>
        </group>
    );
}

// ------------------------------------------------------------------
// MAIN CANVAS WRAPPER
// ------------------------------------------------------------------
export default function CNNCanvasAntigravity(props: Props) {
    return (
        <div className="w-full h-full relative" style={{ background: '#020617' }}>
            <Canvas camera={{ position: [-25, 10, 30], fov: 50 }}>
                <DarkNebula />
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={2} color="#4f46e5" />
                <pointLight position={[-10, -10, -10]} intensity={1} color="#10b981" />
                
                <OrbitControls enableDamping dampingFactor={0.05} autoRotate={props.isAntigravity} autoRotateSpeed={0.5} />
                
                <CNNPhysicsSimulator config={props} />
            </Canvas>
            
            {/* HUD Overlay */}
            <div className="absolute top-4 left-4 bg-slate-900/80 border border-slate-700/50 p-4 rounded-xl backdrop-blur-md text-xs font-mono shadow-xl pointer-events-none">
                <div className="text-white font-bold mb-2">Live CNN Simulation</div>
                <div className="text-emerald-400 mb-1 flex justify-between"><span>Compute:</span> <span>Active</span></div>
                <div className="text-indigo-400 flex justify-between"><span>Physics:</span> <span>{props.isAntigravity ? 'Zero-G Orbital ⚛' : 'Standard Gravity ↓'}</span></div>
                
                <div className="mt-3 pt-3 border-t border-slate-700/50 text-slate-400">
                    <span className="text-fuchsia-400">f(x)</span> = ReLU( Σ (w_i * x_i) + b )
                </div>
            </div>
            
            {/* Hints */}
            <div className="absolute bottom-4 right-4 bg-slate-900/60 p-2 rounded text-slate-400 text-xs text-right opacity-70 pointer-events-none">
                Drag to orbit • Scroll to zoom
            </div>
        </div>
    );
}
