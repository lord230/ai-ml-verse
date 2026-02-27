"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
    BookOpen, Code, BrainCircuit, Activity, Zap, Layers, Calculator, Maximize, Play, Settings2, ArrowRight
} from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend
} from 'chart.js';

// Setup Prism
import Prism from 'prismjs';
import 'prismjs/components/prism-python';
import 'prismjs/themes/prism-tomorrow.css'; // Dark theme

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// --- 1. Why Transformers? Demo ---
const RNNvsTransformerDemo = () => {
    const [step, setStep] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setStep((s) => (s + 1) % 6);
        }, 1200);
        return () => clearInterval(timer);
    }, []);

    const words = ["The", "cat", "sat", "on", "the", "mat"];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-8">
            {/* RNN */}
            <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-700">
                <h4 className="text-xl font-bold text-rose-400 mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5" /> RNN (Sequential & Slow)
                </h4>
                <div className="flex gap-2 justify-center items-center h-48">
                    {words.map((word, i) => (
                        <div key={'rnn' + i} className="flex flex-col items-center">
                            <motion.div
                                animate={{
                                    backgroundColor: i <= step ? '#f43f5e' : '#1e293b',
                                    scale: i === step ? 1.1 : 1,
                                    borderColor: i <= step ? '#fda4af' : '#334155'
                                }}
                                className="w-12 h-12 rounded-lg border-2 flex items-center justify-center font-bold text-white shadow-lg z-10"
                            >
                                {word}
                            </motion.div>
                            {i < words.length - 1 && (
                                <motion.div
                                    animate={{ width: i < step ? 20 : 0, opacity: i < step ? 1 : 0 }}
                                    className="h-1 bg-rose-500 mt-2 self-start ml-12"
                                />
                            )}
                        </div>
                    ))}
                </div>
                <p className="text-sm text-slate-400 text-center mt-4">Must process &quot;The&quot; before &quot;cat&quot; before &quot;sat&quot;. GPU sits idle waiting!</p>
            </div>

            {/* Transformer */}
            <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-700">
                <h4 className="text-xl font-bold text-emerald-400 mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5" /> Transformer (Massively Parallel)
                </h4>
                <div className="flex gap-2 justify-center items-center h-48 relative">
                    {words.map((word, i) => (
                        <motion.div
                            key={'tf' + i}
                            animate={{
                                backgroundColor: step % 2 === 0 ? '#10b981' : '#1e293b',
                                y: step % 2 === 0 ? -10 : 0,
                                borderColor: step % 2 === 0 ? '#6ee7b7' : '#334155'
                            }}
                            className="w-12 h-12 rounded-lg border-2 flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(16,185,129,0.4)] absolute"
                            style={{ left: `${(i * 18)}%` }}
                            transition={{ duration: 0.5 }}
                        >
                            {word}
                        </motion.div>
                    ))}
                    {/* Attention lines */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
                        {step % 2 === 0 && words.map((_, i) =>
                            words.map((_, j) => (
                                <motion.line
                                    key={`line-${i}-${j}`}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 0.15 }}
                                    x1={`${i * 18 + 8}%`}
                                    y1="50%"
                                    x2={`${j * 18 + 8}%`}
                                    y2="50%"
                                    stroke="#10b981"
                                    strokeWidth="2"
                                />
                            ))
                        )}
                    </svg>
                </div>
                <p className="text-sm text-slate-400 text-center mt-4">Processes EVERYTHING at once. Looks at every other word simultaneously using Attention.</p>
            </div>
        </div>
    );
};


// --- 2. Self Attention Demo ---
const SelfAttentionSimulator = () => {
    const [seqLen, setSeqLen] = useState(6);
    const [hiddenSize, setHiddenSize] = useState(64);
    const [activeToken, setActiveToken] = useState<number | null>(null);

    const words = ["The", "bank", "of", "the", "river", "is", "steep", "and", "muddy", "today"].slice(0, seqLen);

    // Dummy attention matrix focusing "bank" strongly on "river"
    const generateAttention = (idx: number, len: number) => {
        const weights = Array(len).fill(0.1);
        weights[idx] = 0.6; // Self
        if (words[idx] === 'bank' && words.includes('river')) {
            weights[words.indexOf('river')] = 0.8;
            weights[idx] = 0.2;
        }
        if (words[idx] === 'river' && words.includes('bank')) {
            weights[words.indexOf('bank')] = 0.8;
            weights[idx] = 0.2;
        }
        // Normalize
        const sum = weights.reduce((a, b) => a + b, 0);
        return weights.map(w => w / sum);
    };

    return (
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 md:p-8 my-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -z-10 group-hover:bg-indigo-500/20 transition-colors" />

            <div className="flex flex-col md:flex-row gap-8">
                {/* Controls */}
                <div className="w-full md:w-1/3 bg-slate-800/50 p-5 rounded-xl border border-slate-700/50 h-max">
                    <h4 className="font-bold text-white mb-4 flex items-center gap-2"><Settings2 className="w-4 h-4 text-indigo-400" /> Matrix Controls</h4>
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-semibold text-slate-400 mb-2 block flex justify-between">
                                Sequence Length (N) <span className="text-indigo-300">{seqLen}</span>
                            </label>
                            <input type="range" min="3" max="10" value={seqLen} onChange={e => { setSeqLen(Number(e.target.value)); setActiveToken(null); }} className="w-full accent-indigo-500" />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-slate-400 mb-2 block flex justify-between">
                                Hidden Size (d_model) <span className="text-indigo-300">{hiddenSize}</span>
                            </label>
                            <input type="range" min="16" max="512" step="16" value={hiddenSize} onChange={e => setHiddenSize(Number(e.target.value))} className="w-full accent-indigo-500" />
                        </div>
                        <div className="mt-6 p-4 bg-black/30 rounded-lg border border-slate-800 font-mono text-xs text-slate-300 space-y-2">
                            <div className="text-amber-400 font-bold mb-2">Shapes:</div>
                            <div>Q: [{seqLen}, {hiddenSize}]</div>
                            <div>Kᵀ: [{hiddenSize}, {seqLen}]</div>
                            <div className="pt-2 border-t border-slate-800 text-indigo-300">
                                Score: [{seqLen}, {seqLen}]
                            </div>
                        </div>
                    </div>
                </div>

                {/* Heatmap / Interaction */}
                <div className="flex-1 flex flex-col items-center justify-center relative min-h-[300px]">
                    <p className="text-sm text-slate-400 mb-6 text-center">Hover over a token to see its Softmax Attention Distribution (Q × Kᵀ)</p>

                    <div className="flex flex-wrap justify-center gap-3 mb-10 z-10 w-full relative">
                        {words.map((word, i) => (
                            <button
                                key={i}
                                onMouseEnter={() => setActiveToken(i)}
                                onMouseLeave={() => setActiveToken(null)}
                                className={`px-4 py-2 rounded-lg font-bold border-2 transition-all duration-300 ${activeToken === i ? 'bg-indigo-600 border-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.5)] z-20 scale-110' : 'bg-slate-800 border-slate-600 text-slate-300 hover:border-slate-400 z-10'}`}
                            >
                                {word}
                            </button>
                        ))}

                        {/* Connection lines */}
                        <svg className="absolute inset-0 w-full h-[200px] pointer-events-none -top-4 -left-4" style={{ zIndex: 0, overflow: 'visible' }}>
                            {activeToken !== null && words.map((_, i) => {
                                const weight = generateAttention(activeToken, seqLen)[i];
                                // Rough calculations for line pos
                                const startX = (activeToken / Math.max(1, seqLen - 1)) * 100;
                                const endX = (i / Math.max(1, seqLen - 1)) * 100;

                                return (
                                    <motion.path
                                        key={`att-${i}`}
                                        initial={{ pathLength: 0, opacity: 0 }}
                                        animate={{ pathLength: 1, opacity: weight > 0.05 ? 1 : 0.2 }}
                                        d={`M ${startX}% 50 C ${startX}% -50, ${endX}% -50, ${endX}% 50`}
                                        fill="transparent"
                                        stroke={`rgba(99, 102, 241, ${weight})`}
                                        strokeWidth={Math.max(1, weight * 15)}
                                        strokeLinecap="round"
                                        style={{ filter: `drop-shadow(0 0 5px rgba(99,102,241,${weight}))` }}
                                    />
                                );
                            })}
                        </svg>
                    </div>

                    {activeToken !== null && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full flex flex-col items-center bg-indigo-900/20 p-4 rounded-xl border border-indigo-500/30">
                            <span className="text-xs font-bold uppercase text-indigo-400 tracking-widest mb-3">{words[activeToken]} Attention Vector</span>
                            <div className="flex w-full h-8 rounded-lg overflow-hidden border border-slate-700">
                                {generateAttention(activeToken, seqLen).map((w, i) => (
                                    <div
                                        key={i}
                                        style={{ width: `${w * 100}%`, backgroundColor: `hsl(230, 80%, ${Math.max(20, w * 70)}%)` }}
                                        className="h-full group relative transition-all duration-300 flex items-center justify-center border-r border-slate-800 last:border-0"
                                    >
                                        {w > 0.1 && <span className="text-[10px] text-white/80 font-bold mix-blend-difference">{words[i]}</span>}
                                        <div className="opacity-0 group-hover:opacity-100 absolute -top-8 px-2 py-1 bg-slate-900 text-xs text-white rounded whitespace-nowrap z-50 pointer-events-none">
                                            {words[i]}: {(w * 100).toFixed(1)}%
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
};


// --- 4. Positional Encoding Graph ---
const PositionalEncodingChart = () => {
    const [dModel, setDModel] = useState(128);
    const [pos, setPos] = useState(0);

    const chartData = useMemo(() => {
        const labels = Array.from({ length: 64 }, (_, i) => i);
        const data = labels.map(i => {
            const divTerm = Math.pow(10000, (2 * Math.floor(i / 2)) / dModel);
            if (i % 2 === 0) {
                return Math.sin(pos / divTerm);
            } else {
                return Math.cos(pos / divTerm);
            }
        });

        return {
            labels,
            datasets: [{
                label: `PE Vector for Position ${pos}`,
                data,
                borderColor: '#14b8a6',
                backgroundColor: 'rgba(20, 184, 166, 0.2)',
                borderWidth: 2,
                pointRadius: 0,
                tension: 0.1,
                fill: true
            }]
        };
    }, [pos, dModel]);

    return (
        <div className="flex flex-col md:flex-row gap-8 bg-slate-900/50 p-6 rounded-2xl border border-slate-700 my-8 shadow-inner">
            <div className="w-full md:w-1/3 space-y-6 flex flex-col justify-center">
                <div>
                    <h4 className="text-lg font-bold text-teal-400 mb-2 flex items-center gap-2"><Maximize className="w-5 h-5" /> Inspect the Formula</h4>
                    <pre className="p-3 bg-black/50 rounded-lg text-xs font-mono text-teal-300 border border-teal-500/20 overflow-x-auto">
                        {`PE(pos, 2i)   = sin(pos/10000^(2i/d_model))
PE(pos, 2i+1) = cos(pos/10000^(2i/d_model))`}
                    </pre>
                </div>

                <div>
                    <label className="text-xs font-semibold text-slate-400 mb-2 block flex justify-between">
                        Word Position (pos) <span className="text-teal-400">{pos}</span>
                    </label>
                    <input type="range" min="0" max="100" value={pos} onChange={e => setPos(Number(e.target.value))} className="w-full accent-teal-500" />
                    <p className="text-xs text-slate-500 mt-2">Notice how higher dimensions (right side of graph) change much slower, acting like the hour hand of a clock.</p>
                </div>
            </div>

            <div className="flex-1 h-[250px]">
                <Line
                    data={chartData}
                    options={{
                        maintainAspectRatio: false,
                        animation: { duration: 0 },
                        scales: {
                            y: { min: -1.2, max: 1.2, grid: { color: '#1e293b' }, ticks: { color: '#64748b' } },
                            x: { grid: { display: false }, ticks: { color: '#64748b' }, title: { display: true, text: 'Dimension Index (i)', color: '#94a3b8' } }
                        },
                        plugins: { legend: { labels: { color: '#cbd5e1' } } }
                    }}
                />
            </div>
        </div>
    );
};


// --- Code Editor Block Component ---
const CodeBlock = ({ code, title, highlights = [] }: { code: string, title: string, highlights?: number[] }) => {
    useEffect(() => {
        Prism.highlightAll();
    }, [code]);

    return (
        <div className="my-6 rounded-xl overflow-hidden border border-slate-700 shadow-2xl bg-[#1d1f21]">
            <div className="flex items-center justify-between px-4 py-2 bg-slate-800/80 border-b border-slate-700">
                <div className="flex items-center gap-2">
                    <Code className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-mono text-slate-300">{title}</span>
                </div>
                <div className="flex space-x-1.5">
                    <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                </div>
            </div>
            <pre className="p-5 text-sm md:text-[15px] font-mono leading-relaxed overflow-x-auto m-0 bg-transparent">
                <code className="language-python">{code}</code>
            </pre>
        </div>
    );
};


// --- Main Page Structure ---
export default function TransformersLearningPage() {
    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-200">
            {/* HER0 */}
            <header className="pt-20 pb-16 px-4 md:px-8 border-b border-slate-800 bg-gradient-to-b from-indigo-950/20 to-transparent relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-64 bg-indigo-600/10 blur-[100px] rounded-full point-events-none" />
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <div className="inline-flex py-1 px-3 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-6 items-center gap-2">
                        <BrainCircuit className="w-4 h-4" /> Architecture Deep Dive
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight leading-tight">
                        Mastering Transformers <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-rose-400">
                            From Basics to Bare Metal
                        </span>
                    </h1>
                    <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                        The architecture that ate the world. Learn exactly how "Attention is All You Need" changed AI forever by building it up layer by layer, equation by equation, to a working PyTorch implementation.
                    </p>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 md:px-8 py-16 space-y-24">

                {/* 1. Why Transformers */}
                <section>
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                            <span className="text-indigo-400 font-bold text-xl">1</span>
                        </div>
                        <h2 className="text-3xl font-bold text-white tracking-tight">The Bottleneck of the Past</h2>
                    </div>

                    <div className="prose prose-invert prose-indigo max-w-none text-slate-300 leading-relaxed text-lg mb-8">
                        <p>Before 2017, Recurrent Neural Networks (RNNs) and LSTMs ruled sequence tasks like translation. But they had a fatal flaw: <strong>They were sequential.</strong></p>
                        <p>To process word 100, an RNN had to wait for words 1 through 99. This meant GPUs, which excel at doing thousands of things at once, were sitting idle. Furthermore, by the time the RNN reached word 100, it had largely "forgotten" the context of word 1 (the vanishing gradient / long-range dependency problem).</p>
                    </div>

                    <RNNvsTransformerDemo />

                    <div className="bg-emerald-950/20 border border-emerald-900/50 p-6 rounded-xl mt-6">
                        <h4 className="font-bold text-emerald-400 flex items-center gap-2 mb-2"><CheckCircle2 className="w-5 h-5" /> The Transformer Solution</h4>
                        <p className="text-slate-300">Transformers threw away recurrence entirely. They process the <em>entire seqeuence</em> in one huge matrix multiplication. To understand context without sequence, they introduced the most important mechanism in modern AI: <strong>Self-Attention.</strong></p>
                    </div>
                </section>

                {/* 2. Self Attention Intuition */}
                <section>
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
                            <span className="text-purple-400 font-bold text-xl">2</span>
                        </div>
                        <h2 className="text-3xl font-bold text-white tracking-tight">Scaled Dot-Product Attention</h2>
                    </div>

                    <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed text-lg mb-8">
                        <p>Attention asks a fundamental question: <em>"When I look at this word, which other words in the sentence are important for its meaning?"</em></p>
                        <p>It achieves this using a brilliant database retrieval metaphor originally designed by researchers:</p>
                        <ul className="space-y-2 marker:text-purple-400">
                            <li><strong className="text-emerald-400">Query (Q):</strong> What am I looking for? (e.g., "I am an adjective looking for the noun I modify.")</li>
                            <li><strong className="text-amber-400">Key (K):</strong> What do I contain? (e.g., "I am a noun referring to geography.")</li>
                            <li><strong className="text-rose-400">Value (V):</strong> My actual semantic meaning.</li>
                        </ul>
                    </div>

                    <div className="bg-black/40 p-6 rounded-2xl border border-slate-800 text-center shadow-inner overflow-x-auto my-8">
                        <p className="font-serif italic text-slate-400 mb-4 text-sm">The equation that defines modern AI:</p>
                        <div className="text-2xl md:text-3xl font-mono text-white flex items-center justify-center gap-2 flex-wrap">
                            Attention(Q, K, V) = <span className="text-indigo-400">softmax</span><span className="text-slate-500">(</span><div className="flex flex-col items-center mx-1"><span className="border-b border-white px-2">Q × Kᵀ</span><span className="text-slate-400">√<span className="text-xs">d_k</span></span></div><span className="text-slate-500">)</span> × V
                        </div>
                    </div>

                    <SelfAttentionSimulator />
                </section>

                {/* 3. Multi Head */}
                <section>
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center border border-rose-500/30">
                            <span className="text-rose-400 font-bold text-xl">3</span>
                        </div>
                        <h2 className="text-3xl font-bold text-white tracking-tight">Multi-Head Attention</h2>
                    </div>

                    <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed text-lg mb-8">
                        <p>
                            If you only have one attention mechanism (one set of Q,K,V matrices), a word can only focus on one defining relationship. But language is complex.
                        </p>
                        <p>
                            By splitting the embeddings into multiple "Heads", the network can learn different representation subspaces simultaneously. One head might track grammar (subjects to verbs), another might track entity references ("he" refers to "John"), and another tracks rhyme or rhythm!
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-900/50 p-6 md:p-8 rounded-2xl border border-slate-700 items-center">
                        <div>
                            <h4 className="font-bold text-white mb-4">Parameter Math</h4>
                            <div className="space-y-3 bg-black/40 p-4 rounded-lg font-mono text-sm text-slate-300 border border-slate-800">
                                <div className="flex justify-between border-b border-slate-800 pb-2"><span>Inputs:</span> <span>d_model = 512, heads = 8</span></div>
                                <div className="flex justify-between"><span>d_k (dims per head):</span> <span className="text-emerald-400">512 / 8 = 64</span></div>
                                <div className="flex justify-between"><span>Proj. Matrices (Wq, Wk, Wv):</span> <span>3 × (512 × 512)</span></div>
                                <div className="flex justify-between"><span>Output Projection (Wo):</span> <span>1 × (512 × 512)</span></div>
                                <div className="flex justify-between font-bold text-white pt-2 border-t border-slate-800"><span>Total Params per Block:</span> <span className="text-rose-400">1,048,576</span></div>
                            </div>
                        </div>
                        <div className="flex flex-col items-center justify-center text-center">
                            <Layers className="w-16 h-16 text-rose-500/50 mb-4" />
                            <p className="text-sm text-slate-400">Instead of computing one giant $512 \times 512$ attention matrix, PyTorch reshapes the tensor and computes 8 parallel $64 \times 64$ matrices across the batch dimension. It's incredibly fast on GPUs.</p>
                        </div>
                    </div>
                </section>

                {/* 4. Positional Encoding */}
                <section>
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center border border-teal-500/30">
                            <span className="text-teal-400 font-bold text-xl">4</span>
                        </div>
                        <h2 className="text-3xl font-bold text-white tracking-tight">Giving Sequence an Order</h2>
                    </div>

                    <p className="text-lg text-slate-300 leading-relaxed max-w-3xl mb-8">
                        Because Transformers process everything simultaneously, they inherently have no concept of sequence order. To a raw transformer, "Dog bites man" and "Man bites dog" are exactly identical bags of words. We fix this by injecting <strong>Positional Embeddings</strong> directly into the inputs before they hit the network.
                    </p>

                    <PositionalEncodingChart />

                </section>

                {/* 9. Build From Scratch */}
                <section>
                    <div className="flex items-center gap-4 mb-8 border-b border-slate-800 pb-6">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-rose-500 flex items-center justify-center shadow-lg">
                            <Code className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">Build it in PyTorch</h2>
                            <p className="text-slate-400 mt-1">Let's translate everything we learned into a real, runnable architecture.</p>
                        </div>
                    </div>

                    <CodeBlock
                        title="transformer.py"
                        code={`import torch
import torch.nn as nn
import math

class SelfAttention(nn.Module):
    def __init__(self, embed_size, heads):
        super(SelfAttention, self).__init__()
        self.embed_size = embed_size
        self.heads = heads
        self.head_dim = embed_size // heads

        assert (self.head_dim * heads == embed_size), "Embed size needs to be divisible by heads"

        self.values = nn.Linear(self.head_dim, self.head_dim, bias=False)
        self.keys = nn.Linear(self.head_dim, self.head_dim, bias=False)
        self.queries = nn.Linear(self.head_dim, self.head_dim, bias=False)
        self.fc_out = nn.Linear(heads * self.head_dim, embed_size)

    def forward(self, values, keys, query, mask):
        N = query.shape[0]
        value_len, key_len, query_len = values.shape[1], keys.shape[1], query.shape[1]

        # Split embedding into self.heads pieces
        values = values.reshape(N, value_len, self.heads, self.head_dim)
        keys = keys.reshape(N, key_len, self.heads, self.head_dim)
        queries = query.reshape(N, query_len, self.heads, self.head_dim)

        values = self.values(values)
        keys = self.keys(keys)
        queries = self.queries(queries)

        # Einsum does matrix multiplication for query*keys for each batch and head
        # Q: (N, query_len, heads, head_dim)
        # K_T: (N, key_len, heads, head_dim) --> mapped to (N, heads, query_len, key_len)
        energy = torch.einsum("nqhd,nkhd->nhqk", [queries, keys])

        if mask is not None:
            energy = energy.masked_fill(mask == 0, float("-1e20"))

        # Attention(Q, K, V) = softmax(Q*K^T / sqrt(d_k)) * V
        attention = torch.softmax(energy / (self.embed_size ** (1/2)), dim=3)
        out = torch.einsum("nhql,nlhd->nqhd", [attention, values]).reshape(
            N, query_len, self.heads * self.head_dim
        )

        return self.fc_out(out)

class TransformerBlock(nn.Module):
    def __init__(self, embed_size, heads, dropout, forward_expansion):
        super(TransformerBlock, self).__init__()
        self.attention = SelfAttention(embed_size, heads)
        self.norm1 = nn.LayerNorm(embed_size)
        self.norm2 = nn.LayerNorm(embed_size)

        self.feed_forward = nn.Sequential(
            nn.Linear(embed_size, forward_expansion * embed_size),
            nn.ReLU(),
            nn.Linear(forward_expansion * embed_size, embed_size)
        )
        self.dropout = nn.Dropout(dropout)

    def forward(self, value, key, query, mask):
        attention = self.attention(value, key, query, mask)
        # Add & Norm (Residual Connection 1)
        x = self.dropout(self.norm1(attention + query))
        
        forward = self.feed_forward(x)
        # Add & Norm (Residual Connection 2)
        out = self.dropout(self.norm2(forward + x))
        
        return out
`}
                    />

                </section>

                {/* 10. Implementation Challenge */}
                <section className="bg-slate-900 border border-indigo-500/30 rounded-2xl p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-3xl -z-10" />
                    <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                        <Play className="w-6 h-6 text-indigo-400" fill="currentColor" /> Code Challenge
                    </h3>
                    <p className="text-slate-400 mb-8">Copy the code above into a Jupyter Notebook and try breaking it to see what happens. True understanding comes from debugging.</p>

                    <div className="space-y-4">
                        {[
                            ["Remove Positional Encoding", "The model will lose all understanding of word order. 'Dog bites man' becomes mathematically identical to 'Man bites dog'. Loss will plateau immediately on translation tasks."],
                            ["Remove the scaling factor 1/sqrt(d_k)", "The dot products will get extremely large. the Softmax function will instantly output a '1' for the highest value and '0' for everything else (Zero gradients), halting training."],
                            ["Reduce Heads to 1", "The model will structurally function perfectly fine, but accuracy will drop as it can no longer compute multiple distinct representation sub-spaces (grammar, entity relation, etc) at once."]
                        ].map(([title, desc], i) => (
                            <details key={i} className="group bg-slate-900/80 border border-slate-700/50 rounded-xl">
                                <summary className="flex items-center justify-between p-4 cursor-pointer font-bold text-slate-200 hover:text-indigo-300 transition-colors">
                                    <span>Task {i + 1}: {title}</span>
                                    <ChevronRight className="w-5 h-5 text-slate-500 group-open:rotate-90 transition-transform" />
                                </summary>
                                <div className="p-4 pt-0 text-sm text-slate-400 border-t border-slate-800/50 mt-2">
                                    <span className="font-bold text-rose-400 mr-2">What breaks?</span> {desc}
                                </div>
                            </details>
                        ))}
                    </div>

                    <div className="mt-8 flex justify-center">
                        <Link href="/architecture-playground" className="group flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-8 rounded-full shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:shadow-[0_0_30px_rgba(79,70,229,0.7)] transition-all transform hover:-translate-y-1">
                            <BrainCircuit className="w-5 h-5" />
                            Build a Transformer in the Playground
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </section>

                {/* Spacer */}
                <div className="h-16"></div>
            </main>
        </div >
    );
}

// ChevronRight definition for details block
function ChevronRight(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m9 18 6-6-6-6" />
        </svg>
    )
}

function CheckCircle2(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <path d="m9 11 3 3L22 4" />
        </svg>
    )
}
