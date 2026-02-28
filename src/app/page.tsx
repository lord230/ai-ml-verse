"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial, Line } from "@react-three/drei";
import * as THREE from 'three';
import {
  ArrowRight, Cpu, Presentation, Lock,
  Network, Zap, Target, BookOpen, Fingerprint, Layers, GraduationCap
} from "lucide-react";
import { useAuth } from '@/providers/AuthProvider';

// --- 3D Background Particles Component ---
function ParticleCloud(props: React.ComponentProps<typeof Points>) {
  const ref = useRef<THREE.Points>(null);
  const [sphere] = useState(() => {
    const points = new Float32Array(3000 * 3);
    for (let i = 0; i < 3000; i++) {
      const theta = 2 * Math.PI * Math.random();
      const phi = Math.acos(2 * Math.random() - 1);
      const r = Math.cbrt(Math.random()) * 1.5;
      points[i * 3] = r * Math.sin(phi) * Math.cos(theta); // x
      points[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta); // y
      points[i * 3 + 2] = r * Math.cos(phi); // z
    }
    return points;
  });

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= delta / 10;
      ref.current.rotation.y -= delta / 15;
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={sphere} stride={3} frustumCulled={false} {...props}>
        <PointMaterial
          transparent
          color="#38bdf8"
          size={0.005}
          sizeAttenuation={true}
          depthWrite={false}
        />
      </Points>
    </group>
  );
}

// --- Minimal Gradient Descent Demo for Homepage ---
function MiniDescentDemo() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((v) => (v >= 100 ? 0 : v + 1));
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const pathRadius = 40;
  const x = Math.cos((progress / 100) * Math.PI) * pathRadius;
  const y = Math.sin((progress / 100) * Math.PI) * (pathRadius * 0.5);

  return (
    <div className="w-full h-48 bg-slate-950/80 rounded-xl border border-slate-800 relative overflow-hidden flex items-center justify-center">
      {/* Contour Lines */}
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(99,102,241,0.2)_100%)]">
        {[10, 20, 30, 40, 50].map((r) => (
          <div key={r} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border border-slate-500 rounded-[50%]" style={{ width: r * 3, height: r * 1.5 }} />
        ))}
      </div>

      {/* Path */}
      <svg className="absolute inset-0 w-full h-full opacity-30">
        <path d="M 50% 50% m -40 0 a 40 20 0 1 1 80 0" fill="transparent" stroke="#38bdf8" strokeWidth="2" strokeDasharray="4 4" />
      </svg>

      {/* Orbiting Point */}
      <motion.div
        className="absolute w-3 h-3 bg-amber-400 rounded-full shadow-[0_0_15px_rgba(251,191,36,0.8)] z-10"
        style={{ left: `calc(50% + ${x}px)`, top: `calc(50% - ${y}px)` }}
      />

      {/* Target Minimum */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500 font-bold opacity-80 flex items-center justify-center text-xs">X</div>

      <div className="absolute bottom-2 left-3 font-mono text-[10px] text-slate-500">Live Demo: Loss optimization orbit</div>
      <div className="absolute top-2 right-3 font-mono text-[10px] text-indigo-400">LR: 0.05</div>
    </div>
  );
}

// --- Minimal Attention Demo for Homepage ---
function MiniAttentionDemo() {
  const tokens = ["The", "quick", "brown", "fox"];
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIdx((v) => (v + 1) % tokens.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [tokens.length]);

  // Fake attention weights (rows: active token, cols: attended token)
  const weights = [
    [0.9, 0.05, 0.02, 0.03], // 'The' attends mostly to itself
    [0.1, 0.8, 0.05, 0.05],   // 'quick'
    [0.05, 0.15, 0.7, 0.1],   // 'brown'
    [0.05, 0.4, 0.4, 0.15],   // 'fox' attends to adjectives
  ];

  return (
    <div className="w-full h-48 bg-slate-950/80 rounded-xl border border-slate-800 relative overflow-hidden flex flex-col p-4">
      <div className="flex justify-between h-full relative">

        {/* Source Tokens */}
        <div className="flex flex-col justify-between z-10 w-16">
          {tokens.map((t, i) => (
            <div key={`src-${i}`} className={`px-2 py-1 rounded text-xs font-mono transition-colors text-center ${activeIdx === i ? 'bg-indigo-500/30 text-indigo-300 border border-indigo-500/50 shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'text-slate-500'}`}>
              {t}
            </div>
          ))}
        </div>

        {/* Attention Lines */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            {tokens.map((_, srcIdx) =>
              tokens.map((_, tgtIdx) => {
                const isActive = activeIdx === srcIdx;
                const weight = weights[srcIdx][tgtIdx];
                const opacity = isActive ? weight : 0.02;
                const strokeWidth = isActive ? Math.max(0.5, weight * 4) : 0.5;
                const color = isActive ? '#818cf8' : '#334155';

                // Y positions in viewBox coordinates (0 to 100)
                // We have 4 items. The centers are roughly at 12.5, 37.5, 62.5, 87.5
                const y1 = 12.5 + srcIdx * 25;
                const y2 = 12.5 + tgtIdx * 25;

                return (
                  <motion.path
                    key={`${srcIdx}-${tgtIdx}`}
                    d={`M 15 ${y1} C 50 ${y1}, 50 ${y2}, 85 ${y2}`}
                    stroke={color}
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    animate={{ opacity }}
                    transition={{ duration: 0.5 }}
                  />
                )
              })
            )}
          </svg>
        </div>

        {/* Target Tokens */}
        <div className="flex flex-col justify-between z-10 w-16">
          {tokens.map((t, i) => {
            const weight = weights[activeIdx][i];
            return (
              <div key={`tgt-${i}`} className="px-2 py-1 rounded text-xs font-mono transition-all duration-500 text-center" style={{ backgroundColor: `rgba(99, 102, 241, ${weight * 0.4})`, color: weight > 0.2 ? '#e0e7ff' : '#64748b' }}>
                {t}
              </div>
            )
          })}
        </div>

      </div>

      <div className="absolute bottom-2 left-3 font-mono text-[10px] text-slate-500">Live Demo: Self-Attention Flow</div>
      <div className="absolute top-2 right-3 font-mono text-[10px] text-purple-400">Head 2/12</div>
    </div>
  );
}

// --- Minimal 3D Neural Network Demo for Homepage ---
function NeuralNetModel() {
  const group = useRef<THREE.Group>(null);
  const layers = [3, 5, 6, 5, 2]; // 3 Input, 5, 6, 5 Hidden, 2 Output
  const layerSpacing = 1.2;
  const nodeSpacing = 0.5;

  const positions: THREE.Vector3[] = [];
  const lines: THREE.Vector3[][] = [];

  // Generate node positions
  layers.forEach((nodeCount, layerIdx) => {
    const x = (layerIdx - (layers.length - 1) / 2) * layerSpacing;
    for (let i = 0; i < nodeCount; i++) {
      const y = (i - (nodeCount - 1) / 2) * nodeSpacing;
      positions.push(new THREE.Vector3(x, y, 0));
    }
  });

  // Generate connection lines
  let currentIdx = 0;
  layers.forEach((nodeCount, layerIdx) => {
    if (layerIdx === layers.length - 1) return; // No forward connections from output layer
    const nextNodeCount = layers[layerIdx + 1];

    for (let i = 0; i < nodeCount; i++) {
      const startNode = positions[currentIdx + i];
      for (let j = 0; j < nextNodeCount; j++) {
        const endNode = positions[currentIdx + nodeCount + j];
        lines.push([startNode, endNode]);
      }
    }
    currentIdx += nodeCount;
  });

  const dummy = new THREE.Object3D();
  const maxPulses = 20;
  const [pulses] = useState(() =>
    Array.from({ length: maxPulses }).map(() => ({
      edgeId: Math.floor(Math.random() * lines.length),
      progress: Math.random(),
      active: Math.random() > 0.5,
      speed: 0.5 + Math.random() * 1.5
    }))
  );

  const instancedMeshRef = useRef<THREE.InstancedMesh>(null);

  useFrame((state, delta) => {
    // Rotation removed for a static, clear view

    if (instancedMeshRef.current && lines.length > 0) {
      pulses.forEach((pulse, i) => {
        if (!pulse.active) {
          if (Math.random() < 0.05) {
            pulse.active = true;
            pulse.edgeId = Math.floor(Math.random() * lines.length);
            pulse.progress = 0;
            pulse.speed = 0.5 + Math.random() * 1.5;
          } else {
            dummy.position.set(100, 100, 100);
            dummy.updateMatrix();
            instancedMeshRef.current!.setMatrixAt(i, dummy.matrix);
          }
        } else {
          pulse.progress += delta * pulse.speed;
          if (pulse.progress >= 1) {
            pulse.active = false;
            dummy.position.set(100, 100, 100);
          } else {
            const edge = lines[pulse.edgeId];
            dummy.position.copy(edge[0]).lerp(edge[1], pulse.progress);
            const scale = Math.sin(pulse.progress * Math.PI) * 0.8;
            dummy.scale.set(scale, scale, scale);
          }
          dummy.updateMatrix();
          instancedMeshRef.current!.setMatrixAt(i, dummy.matrix);
        }
      });
      instancedMeshRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group ref={group}>
      {/* Draw Nodes */}
      {positions.map((pos, i) => (
        <mesh key={`node-${i}`} position={pos}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshBasicMaterial color={i < 3 ? "#38bdf8" : i < 8 ? "#818cf8" : "#fbbf24"} />
        </mesh>
      ))}

      {/* Draw Lines */}
      {lines.map((pair, i) => (
        <Line
          key={`edge-${i}`}
          points={[pair[0], pair[1]]}
          color="#334155"
          lineWidth={1}
          transparent
          opacity={0.4}
        />
      ))}

      {/* Pulses Instanced Mesh */}
      <instancedMesh ref={instancedMeshRef} args={[undefined, undefined, maxPulses]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
      </instancedMesh>
    </group>
  );
}

function MiniNeuralNetDemo() {
  return (
    <div className="w-full h-48 bg-slate-950/80 rounded-xl border border-slate-800 relative overflow-hidden flex flex-col cursor-grab active:cursor-grabbing">
      <Canvas camera={{ position: [0, 0, 3.2] }}>
        <ambientLight intensity={0.5} />
        <NeuralNetModel />
      </Canvas>
      <div className="absolute bottom-2 left-3 font-mono text-[10px] text-slate-500">Live Demo: Deep Neural Network</div>
      <div className="absolute top-2 right-3 font-mono text-[10px] text-sky-400">3x5x6x5x2 Architecture</div>
    </div>
  );
}

export default function PremiumLandingPage() {
  const { user } = useAuth();
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  const [activeDemo, setActiveDemo] = useState<number>(-1);

  useEffect(() => {
    // Pick a random demo on mount to avoid hydration mismatch
    setActiveDemo(Math.floor(Math.random() * 3));
  }, []);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 selection:bg-indigo-500/30 w-full relative -mt-16">

      {/* GLOBAL BACKGROUND ELEMENTS */}
      <div className="fixed inset-0 z-0 opacity-40 mix-blend-screen pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-900/20 rounded-full blur-[120px] translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[100px] -translate-x-1/3 translate-y-1/3"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_40%,#000_60%,transparent_100%)] opacity-20"></div>
      </div>

      {/* 1. HERO SECTION */}
      <div className="relative z-10 min-h-screen flex items-center justify-center pt-24 pb-12 overflow-hidden">

        {/* 3D Background */}
        <div className="absolute inset-0 z-0">
          <Canvas camera={{ position: [0, 0, 1] }}>
            <ParticleCloud />
          </Canvas>
        </div>

        <motion.div
          style={{ opacity, scale }}
          className="w-full max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10"
        >
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold tracking-wider text-indigo-300 backdrop-blur-md mb-8 uppercase"
            >
              <span className="flex h-2 w-2 rounded-full bg-indigo-400 mr-2 animate-pulse shadow-[0_0_8px_rgba(129,140,248,0.8)]"></span>
              Interactive AI Laboratory
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
              className="text-6xl lg:text-7xl xl:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-slate-200 to-slate-500 leading-[1.05] mb-6"
            >
              Understand <br />
              <span className="relative">
                <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-sky-400 to-emerald-400">AI</span>
                <span className="absolute -inset-1 bg-indigo-500/20 blur-xl -z-10 rounded-full"></span>
              </span>.
              <br />
              Visually.<br />
              Deeply.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
              className="text-lg lg:text-xl text-slate-400 leading-relaxed mb-10 max-w-xl font-light"
            >
              Interactive explanations of Convolutional Networks, Transformers, and modern ML architecture built for serious researchers and developers who want more than just theory.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              {user ? (
                <Link href="/dashboard" className="glass-panel group relative flex items-center justify-center px-8 py-4 text-sm font-bold text-white transition-all bg-indigo-600/90 hover:bg-indigo-500 border border-indigo-400/30 rounded-xl overflow-hidden shadow-[0_0_30px_rgba(79,70,229,0.3)] hover:shadow-[0_0_40px_rgba(79,70,229,0.5)]">
                  Enter the Visual Lab
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              ) : (
                <>
                  <Link href="/auth/signup" className="group relative flex items-center justify-center px-8 py-4 text-sm font-bold text-white transition-all bg-indigo-600 hover:bg-indigo-500 border border-indigo-400/30 rounded-xl shadow-[0_0_30px_rgba(79,70,229,0.3)] hover:shadow-[0_0_40px_rgba(79,70,229,0.5)]">
                    <Fingerprint className="w-4 h-4 mr-2 opacity-70" /> Start Learning Now
                  </Link>
                  <Link href="/auth/login" className="group flex items-center justify-center px-8 py-4 text-sm font-bold text-slate-300 transition-all bg-slate-900/50 backdrop-blur-md border border-slate-700 hover:bg-slate-800 hover:text-white rounded-xl">
                    Resume Session
                  </Link>
                </>
              )}
            </motion.div>
          </div>

          {/* Right Side: Demo App visual */}
          <motion.div
            initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.9, delay: 0.4 }}
            className="hidden lg:block relative perspective-1000"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-transparent blur-3xl -z-10 rounded-full" />
            <div className="glass-panel p-6 rounded-2xl border border-slate-700/60 bg-slate-900/60 backdrop-blur-xl shadow-2xl rotate-y-[-10deg] rotate-x-[5deg] transform-style-3d group hover:rotate-y-[0deg] hover:rotate-x-[0deg] transition-transform duration-700 ease-out">
              <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                </div>
                <div className="text-xs font-mono text-slate-500 bg-slate-950 px-2 py-1 rounded">Interactive Frame</div>
              </div>
              {/* Embedded working demo */}
              <div className="w-full h-full relative cursor-crosshair">
                {activeDemo === 0 && <MiniDescentDemo />}
                {activeDemo === 1 && <MiniAttentionDemo />}
                {activeDemo === 2 && <MiniNeuralNetDemo />}
                {activeDemo === -1 && <div className="w-full h-48 bg-slate-950/80 rounded-xl" />}
              </div>
              <div className="mt-4 flex gap-2">
                <div className="h-2 w-1/3 bg-slate-800 rounded-full animate-pulse"></div>
                <div className="h-2 w-1/4 bg-indigo-900/50 rounded-full"></div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* 2. WHAT YOU'LL LEARN (INTERACTIVE CARDS) */}
      <div className="relative z-10 py-32 px-6 max-w-7xl mx-auto border-t border-slate-800/50">
        <div className="text-center mb-20">
          <h2 className="text-sm font-bold tracking-widest text-indigo-400 uppercase mb-3">The Curriculum</h2>
          <h3 className="text-3xl md:text-5xl font-black text-white">Interactive Modules</h3>
          <p className="text-slate-400 mt-4 max-w-2xl mx-auto text-lg leading-relaxed">We transform abstract mathematics and static equations into interactive, visual play-spaces where concepts click immediately.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* CNN Card */}
          <Link href={user ? "/learn/cnn-roadmap" : "/auth/login"} className="glass-panel group relative p-8 rounded-3xl border border-slate-700/50 bg-slate-900/50 hover:bg-slate-800/80 transition-all duration-500 overflow-hidden flex flex-col justify-between h-[400px] cursor-pointer block">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-500/10 transition-colors" />
            <div>
              <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all">
                <Layers className="w-7 h-7" />
              </div>
              <h4 className="text-2xl font-bold text-white mb-3">Convolutional Neural Networks</h4>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">See pooling layers, strides, and sliding convolution filters animate live over images as you adjust the math.</p>
            </div>
            <div className="border border-slate-700/50 bg-slate-950/80 rounded-xl p-3 flex justify-between items-center text-sm font-medium text-slate-300 group-hover:border-emerald-500/30 transition-colors relative z-10">
              {user ? "Open CNN Roadmap" : "Login Required"} {user ? <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform" /> : <Lock className="w-4 h-4 text-slate-500" />}
            </div>
          </Link>

          {/* Transformer Card */}
          <Link href={user ? "/learn/transformers" : "/auth/login"} className="glass-panel group relative p-8 rounded-3xl border border-slate-700/50 bg-slate-900/50 hover:bg-slate-800/80 transition-all duration-500 overflow-hidden flex flex-col justify-between h-[400px] md:-translate-y-8 cursor-pointer block">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-purple-500/10 transition-colors" />
            <div>
              <div className="w-14 h-14 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-2xl flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 group-hover:bg-purple-500/20 transition-all">
                <Network className="w-7 h-7" />
              </div>
              <h4 className="text-2xl font-bold text-white mb-3">Transformers & Attention</h4>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">Visualize self attention token maps bridging textual relationships. Build a multi head attention block from scratch.</p>
            </div>
            <div className="border border-slate-700/50 bg-slate-950/80 rounded-xl p-3 flex justify-between items-center text-sm font-medium text-slate-300 group-hover:border-purple-500/30 transition-colors relative z-10">
              {user ? "Explore Transformer Lab" : "Login Required"} {user ? <ArrowRight className="w-4 h-4 text-purple-400 group-hover:translate-x-1 transition-transform" /> : <Lock className="w-4 h-4 text-slate-500" />}
            </div>
          </Link>

          {/* Systems Card */}
          <Link href={user ? "/tools/model-cost-calculator" : "/auth/login"} className="glass-panel group relative p-8 rounded-3xl border border-slate-700/50 bg-slate-900/50 hover:bg-slate-800/80 transition-all duration-500 overflow-hidden flex flex-col justify-between h-[400px] cursor-pointer block">
            <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-rose-500/10 transition-colors" />
            <div>
              <div className="w-14 h-14 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 group-hover:bg-rose-500/20 transition-all">
                <Cpu className="w-7 h-7" />
              </div>
              <h4 className="text-2xl font-bold text-white mb-3">ML Systems & Scaling</h4>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">Accurately calculate GPU VRAM constraints, multi node training times, and quantization overheads.</p>
            </div>
            <div className="border border-slate-700/50 bg-slate-950/80 rounded-xl p-3 flex justify-between items-center text-sm font-medium text-slate-300 group-hover:border-rose-500/30 transition-colors relative z-10">
              {user ? "Open Cost Simulator" : "Login Required"} {user ? <ArrowRight className="w-4 h-4 text-rose-400 group-hover:translate-x-1 transition-transform" /> : <Lock className="w-4 h-4 text-slate-500" />}
            </div>
          </Link>
        </div>
      </div>

      {/* 3. WHY AI ML VERSE (VALUES) */}
      <div className="relative z-10 py-32 px-6 max-w-7xl mx-auto border-t border-slate-800/50 bg-slate-950/30 mt-12 rounded-[3rem]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center mx-auto md:mx-0">
              <Presentation className="w-5 h-5 text-indigo-400" />
            </div>
            <h4 className="text-xl font-bold text-white">Not Just Theory</h4>
            <p className="text-slate-400 text-sm leading-relaxed">No static textbook diagrams. Every concept is fully visual and interactive, driven by real client-side math.</p>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center mx-auto md:mx-0">
              <BookOpen className="w-5 h-5 text-indigo-400" />
            </div>
            <h4 className="text-xl font-bold text-white">Real Math, Real Code</h4>
            <p className="text-slate-400 text-sm leading-relaxed">See the exact mathematical formulas alongside the animations, helping bridge intuition into raw implementation.</p>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center mx-auto md:mx-0">
              <Target className="w-5 h-5 text-indigo-400" />
            </div>
            <h4 className="text-xl font-bold text-white">Deep Understanding</h4>
            <p className="text-slate-400 text-sm leading-relaxed">Built to push you from foundational understanding to reading advanced research papers with absolute confidence.</p>
          </div>
        </div>
      </div>

      {/* 4. ROADMAP TIMELINE */}
      <div className="relative z-10 py-32 px-6 max-w-5xl mx-auto">
        <h3 className="text-3xl font-black text-center text-white mb-16">The Journey</h3>

        <div className="relative border-l-2 border-slate-800 ml-4 md:ml-0 md:border-l-0">
          {/* Horizontal line for desktop */}
          <div className="hidden md:block absolute top-[28px] left-0 w-full h-[2px] bg-slate-800 -z-10" />

          <div className="flex flex-col md:flex-row justify-between gap-8 md:gap-4 relative pl-8 md:pl-0">
            {[
              { title: "Foundations", desc: "Calculus & Linear Algebra" },
              { title: "Convolutions", desc: "Vision & Filters" },
              { title: "Deep Networks", desc: "ResNets to ViTs" },
              { title: "Attention", desc: "Transformers & LLMs" },
              { title: "Scale", desc: "Systems & deployment" }
            ].map((step, i) => (
              <div key={i} className="flex flex-col items-start md:items-center relative group">
                {/* Dot */}
                <div className="absolute -left-[41px] md:relative md:left-auto md:mb-6 w-14 h-14 bg-slate-900 border-2 border-slate-700 rounded-full flex items-center justify-center shadow-lg group-hover:border-indigo-500 group-hover:scale-110 group-hover:bg-indigo-950 transition-all font-mono text-sm text-slate-500 group-hover:text-indigo-400">
                  0{i + 1}
                </div>
                <h5 className="font-bold text-white mb-1 group-hover:text-white transition-colors text-lg md:text-base">{step.title}</h5>
                <div className="text-xs text-slate-400 md:text-center max-w-[120px] leading-relaxed">{step.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. FINAL CTA & FOOTER */}
      <div className="relative z-10 py-32 px-6 border-t border-slate-800/60 bg-slate-950/50 mt-12 text-center overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />

        <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tighter">
          Stop Memorizing AI.<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">Start Understanding It.</span>
        </h2>

        <Link href={user ? "/dashboard" : "/auth/signup"} className="inline-flex items-center justify-center px-10 py-5 mt-4 text-lg font-bold text-white transition-all bg-indigo-600 hover:bg-indigo-500 border border-indigo-400/50 rounded-2xl shadow-[0_0_40px_rgba(79,70,229,0.4)] hover:shadow-[0_0_60px_rgba(79,70,229,0.6)] group">
          <Zap className="w-5 h-5 mr-3 text-indigo-200 fill-indigo-200" /> Enter the Lab <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-2 transition-transform" />
        </Link>
      </div>

      {/* Developer Note (B.Tech) */}
      <div className="relative z-10 py-8 px-6 bg-[#020617] text-center border-t border-slate-900">
        <div className="max-w-3xl mx-auto glass-panel p-6 border border-slate-800/80 rounded-2xl bg-slate-900/30">
          <div className="flex items-center justify-center mb-3">
            <GraduationCap className="w-5 h-5 text-slate-400 mr-2" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Developer Note</span>
          </div>
          <p className="text-sm text-slate-500 leading-relaxed font-mono">
            Hi, I am a B.Tech final year student. I built this platform to keep track of my progress and visually log the concepts I&apos;ve learned during these 4 years.
            If you find any inaccuracies in the mathematics or implementations I&apos;ve posted, please do notify me! This is a constant work in progress.
          </p>
        </div>
      </div>

    </div>
  );
}
