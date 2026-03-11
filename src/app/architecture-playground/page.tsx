"use client";

import React, { useState, useEffect } from 'react';
import { Network, ArrowRight, Activity, HardDrive, Calculator, Settings, Info, Box, Layers, LineChart } from 'lucide-react';
import { motion } from 'framer-motion';

import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';

import PyTorchCNNCanvas from '@/components/visuals/CNN/CNNCanvas';
import { Maximize2, Minimize2, Play, Pause, SkipForward, FastForward, SlidersHorizontal, ChevronRight, Terminal } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// Types
type ArchType = 'mlp' | 'cnn' | 'transformer' | 'scaling';
type Precision = 'FP32' | 'FP16' | 'BF16' | 'FP8';

export default function ArchitecturePlayground() {
    const [archTab, setArchTab] = useState<ArchType>('mlp');

    return (
        <div className="flex-1 flex flex-col p-4 md:p-8 max-w-screen-2xl mx-auto w-full">
            <div className="mb-6 md:flex justify-between items-end">
                <div>
                    <h1 className="text-3xl mt-4 font-bold text-white flex items-center">
                        <Network className="w-8 h-8 mr-3 text-amber-500" />
                        Architecture Playground
                    </h1>
                    <p className="text-slate-400 mt-2 max-w-3xl">
                        Visually understand how neural network architectures work, how parameters scale,
                        memory changes, and compute grows. See the real math behind the models.
                    </p>
                </div>

                {/* Architecture Selector Tabs */}
                <div className="flex space-x-2 mt-6 md:mt-0 bg-slate-900/80 p-1.5 rounded-xl border border-slate-700/50 backdrop-blur-md">
                    <button
                        onClick={() => setArchTab('mlp')}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${archTab === 'mlp' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                    >
                        MLP
                    </button>
                    <button
                        onClick={() => setArchTab('cnn')}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${archTab === 'cnn' ? 'bg-teal-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                    >
                        CNN
                    </button>
                    <button
                        onClick={() => setArchTab('transformer')}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${archTab === 'transformer' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                    >
                        Transformer
                    </button>
                    <button
                        onClick={() => setArchTab('scaling')}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${archTab === 'scaling' ? 'bg-fuchsia-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                    >
                        Scaling Graph
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full min-h-[600px]">
                {/* Left Control Panel & Right Visualization Panel rendered based on Active Tab */}
                {archTab === 'mlp' && <MLPModule />}
                {archTab === 'cnn' && <CNNModule />}
                {archTab === 'transformer' && <TransformerModule />}
                {archTab === 'scaling' && <ScalingModule />}
            </div>
        </div>
    );
}

// -------------------------------------------------------------
// MLP MODULE 
// -------------------------------------------------------------
function MLPModule() {
    const [inputs, setInputs] = useState(3);
    const [hiddenLayers, setHiddenLayers] = useState(2);
    const [hiddenSize, setHiddenSize] = useState(4);
    const [outputs, setOutputs] = useState(2);
    const [precision, setPrecision] = useState<Precision>('FP32');

    // Math logic
    // Params = (Input * Hidden) + (Hidden * Hidden * (Layers - 1)) + (Hidden * Output) + Biases
    // Biases = (Hidden * layers) + Output
    const edgeParams = (inputs * hiddenSize) + (hiddenSize * hiddenSize * (hiddenLayers - 1)) + (hiddenSize * outputs);
    const biasParams = (hiddenSize * hiddenLayers) + outputs;
    const totalParams = edgeParams + biasParams;

    const bytesPerParamMap: Record<Precision, number> = { FP32: 4, FP16: 2, BF16: 2, FP8: 1 };
    const memoryBytes = totalParams * bytesPerParamMap[precision];

    // FLOPs per forward pass (approx 2 ops per MAC: multiply and accumulate)
    const macs = edgeParams;
    const forwardFlops = macs * 2;
    const trainFlops = forwardFlops * 3; // Approx 3x for forward + backward pass

    const [explainOpen, setExplainOpen] = useState(false);

    return (
        <>
            {/* Left Settings */}
            <div className="lg:col-span-4 space-y-6 flex flex-col">
                <div className="glass-panel p-6 rounded-2xl border-indigo-500/30 border-t-4 shadow-lg flex-1">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                        <Settings className="w-5 h-5 mr-2 text-indigo-400" />
                        MLP Configuration
                    </h3>

                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between mb-1">
                                <label className="text-sm font-medium text-slate-300">Input Size (<span className="text-indigo-300 font-mono text-xs">Features</span>)</label>
                                <span className="text-indigo-400 font-mono">{inputs}</span>
                            </div>
                            <input type="range" min="1" max="10" value={inputs} onChange={e => setInputs(Number(e.target.value))} className="w-full accent-indigo-500" />
                        </div>

                        <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700">
                            <div className="mb-4">
                                <div className="flex justify-between mb-1">
                                    <label className="text-sm font-medium text-slate-300">Hidden Layers</label>
                                    <span className="text-indigo-400 font-mono">{hiddenLayers}</span>
                                </div>
                                <input type="range" min="1" max="5" value={hiddenLayers} onChange={e => setHiddenLayers(Number(e.target.value))} className="w-full accent-indigo-500" />
                            </div>

                            <div>
                                <div className="flex justify-between mb-1">
                                    <label className="text-sm font-medium text-slate-300">Hidden Size (<span className="text-indigo-300 font-mono text-xs">Width</span>)</label>
                                    <span className="text-indigo-400 font-mono">{hiddenSize}</span>
                                </div>
                                <input type="range" min="2" max="12" value={hiddenSize} onChange={e => setHiddenSize(Number(e.target.value))} className="w-full accent-indigo-500" />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between mb-1">
                                <label className="text-sm font-medium text-slate-300">Output Size (<span className="text-indigo-300 font-mono text-xs">Classes</span>)</label>
                                <span className="text-indigo-400 font-mono">{outputs}</span>
                            </div>
                            <input type="range" min="1" max="5" value={outputs} onChange={e => setOutputs(Number(e.target.value))} className="w-full accent-indigo-500" />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-slate-300 mb-2 block">Weight Precision</label>
                            <select className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-indigo-500" value={precision} onChange={(e) => setPrecision(e.target.value as Precision)}>
                                <option value="FP32">FP32 (4 bytes)</option>
                                <option value="FP16">FP16 (2 bytes)</option>
                                <option value="BF16">BF16 (2 bytes)</option>
                                <option value="FP8">FP8 (1 byte)</option>
                            </select>
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => setExplainOpen(!explainOpen)}
                    className="w-full p-4 glass-panel hover:bg-slate-800/80 transition-all rounded-xl border border-slate-700 flex justify-between items-center text-slate-300"
                >
                    <span className="font-semibold flex items-center"><Info className="w-4 h-4 mr-2 text-indigo-400" /> Explain this in simple terms</span>
                    <ArrowRight className={`w-4 h-4 transition-transform ${explainOpen ? 'rotate-90' : ''}`} />
                </button>
                {explainOpen && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="p-4 bg-slate-800/50 rounded-xl border border-slate-700 text-sm text-slate-400 leading-relaxed">
                        An MLP (Multi-Layer Perceptron) consists of layers of &quot;neurons&quot;. Every neuron in one layer is connected to every neuron in the next layer.
                        <br /><br />
                        Each <b>connection</b> has a <b>Weight parameter</b>. Each <b>neuron</b> has a <b>Bias parameter</b>.
                        As you increase width (Hidden Size), the number of connections multiplies exponentially because everything connects to everything.
                    </motion.div>
                )}
            </div>

            {/* Right Visualization & Stats */}
            <div className="lg:col-span-8 space-y-6 flex flex-col">
                {/* Animated Network Canvas */}
                <div className="glass-panel p-6 rounded-2xl flex-1 relative overflow-hidden flex items-center justify-center min-h-[350px]">
                    <MLPCanvas inputs={inputs} hiddenSize={hiddenSize} hiddenLayers={hiddenLayers} outputs={outputs} />
                </div>

                {/* Dashboard Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Params */}
                    <div className="glass-panel p-5 rounded-xl border-t-2 border-indigo-500">
                        <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2 flex items-center">
                            <Calculator className="w-4 h-4 mr-2" /> Total Parameters
                        </div>
                        <div className="text-3xl font-extrabold text-white font-mono break-all">{totalParams.toLocaleString()}</div>
                        <div className="text-xs mt-2 text-indigo-300 bg-indigo-500/10 px-2 py-1 inline-block rounded">
                            {edgeParams} Weights + {biasParams} Biases
                        </div>
                    </div>

                    {/* FLOPs */}
                    <div className="glass-panel p-5 rounded-xl border-t-2 border-amber-500">
                        <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2 flex items-center">
                            <Activity className="w-4 h-4 mr-2" /> Compute (FLOPs)
                        </div>
                        <div className="text-2xl font-extrabold text-white font-mono">{forwardFlops.toLocaleString()}</div>
                        <div className="text-xs text-slate-500 mb-2">per Forward Pass</div>
                        <div className="text-sm font-semibold text-amber-400 font-mono bg-amber-500/10 px-2 py-1 inline-block rounded">
                            Train Step: {trainFlops.toLocaleString()}
                        </div>
                    </div>

                    {/* Memory */}
                    <div className="glass-panel p-5 rounded-xl border-t-2 border-teal-500">
                        <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2 flex items-center">
                            <HardDrive className="w-4 h-4 mr-2" /> Storage Memory
                        </div>
                        <div className="text-3xl font-extrabold text-white font-mono">
                            {memoryBytes < 1024 ? `${memoryBytes} B` : `${(memoryBytes / 1024).toFixed(2)} KB`}
                        </div>
                        <div className="text-xs mt-2 text-teal-300 bg-teal-500/10 px-2 py-1 inline-block rounded">
                            At {precision} precision
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

// -------------------------------------------------------------
// CNN MODULE (PyTorch MNIST Architecture)
// -------------------------------------------------------------
function CNNModule() {
    const [drawingData, setDrawingData] = useState<Float32Array>();
    const [prediction, setPrediction] = useState<number | null>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Animation Controls State
    const [animationProgress, setAnimationProgress] = useState(0); // 0 to 100
    const [isPlaying, setIsPlaying] = useState(false);
    const [speed, setSpeed] = useState(1); // 0.1x to 10x

    // Global Hotkeys for Fullscreen Control
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Don't trigger if user is typing in an input (though there are none currently)
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

            if (e.code === 'Space') {
                e.preventDefault(); // prevent scrolling
                setIsPlaying(p => !p);
            } else if (e.code === 'ArrowRight') {
                e.preventDefault();
                setAnimationProgress(p => Math.min(100, p + 5));
            } else if (e.code === 'ArrowLeft') {
                e.preventDefault();
                setAnimationProgress(p => Math.max(0, p - 5));
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Drive animation when playing
    useEffect(() => {
        if (!isPlaying) return;
        let lastTime = performance.now();
        let frameId: number;

        const loop = (time: number) => {
            const dt = (time - lastTime) / 1000;
            lastTime = time;
            setAnimationProgress(p => {
                const next = p + (20 * speed * dt); // 20% per second at 1x speed => 5 seconds full pass
                if (next >= 100) {
                    setIsPlaying(false);
                    return 100;
                }
                return next;
            });
            frameId = requestAnimationFrame(loop);
        };
        frameId = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(frameId);
    }, [isPlaying, speed]);

    // Exact PyTorch MNISTModel stats calculated manually:
    // Conv1: (3*3*1*32)+32 = 320 params. Output: 26x26. FLOPs = 320 * 26 * 26 * 2 = 432,640
    // Conv2: (3*3*32*64)+64 = 18,496 params. Output: 24x24. FLOPs = 18,496 * 24 * 24 * 2 = 21,307,392
    // FC1: (9216*128)+128 = 1,179,776 params. FLOPs = 1,179,776 * 2 = 2,359,552
    // FC2: (128*10)+10 = 1,290 params. FLOPs = 1,290 * 2 = 2,580
    
    const totalParams = 1199882;
    const totalFlops = 24102164;
    const trainFlops = totalFlops * 3;

    // Helper to determine active layer for Math Panel based on progress
    const getActiveLayer = () => {
        if (animationProgress < 15) return 'input';
        if (animationProgress < 30) return 'conv1';
        if (animationProgress < 45) return 'conv2';
        if (animationProgress < 60) return 'pool';
        if (animationProgress < 75) return 'flatten';
        if (animationProgress < 90) return 'fc1';
        return 'fc2';
    };

    const activeLayer = getActiveLayer();

    return (
        <>

            {/* Left panel — direct col child in the outer 12-col grid */}
            <div className="lg:col-span-4 flex flex-col">
                <div className="glass-panel p-5 rounded-2xl border-teal-500/30 border-t-4 shadow-lg flex-1 flex flex-col gap-4">
                    <h3 className="text-lg font-bold text-white flex items-center">
                        <Box className="w-5 h-5 mr-2 text-teal-400" />
                        Interactive Model Input
                    </h3>
                    <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-700">
                        <p className="text-xs text-slate-400 mb-2 font-medium">Draw a digit 0–9</p>
                        <DrawingPad size={28} onDraw={setDrawingData} />
                    </div>
                    <div className="p-4 bg-red-950/20 rounded-xl border border-red-500/30 flex items-center gap-4">
                        <div>
                            <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Prediction</p>
                            <p className="text-5xl font-extrabold text-white drop-shadow-[0_0_12px_rgba(239,68,68,0.8)]">
                                {prediction !== null ? prediction : '–'}
                            </p>
                        </div>
                    </div>
                    
                    <button
                        onClick={() => { setAnimationProgress(0); setIsPlaying(true); }}
                        className="w-full mt-1 py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-bold flex justify-center items-center transition-colors shadow-lg shadow-teal-900/20 border border-teal-500/50"
                    >
                        <Play className="w-5 h-5 mr-2 fill-current" /> Auto Predict
                    </button>

                    <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-700 text-xs text-slate-400 space-y-1 flex-1">
                        <p className="text-slate-200 font-semibold mb-1">PyTorch MNISTModel</p>
                        <p><span className="text-blue-400">Conv1</span> — 32 filters (3×3), ReLU</p>
                        <p><span className="text-purple-400">Conv2</span> — 64 filters (3×3), ReLU</p>
                        <p><span className="text-pink-400">MaxPool</span> — 2×2</p>
                        <p><span className="text-emerald-400">Flatten</span> — 9,216</p>
                        <p><span className="text-amber-400">FC1</span> — 128, ReLU</p>
                        <p><span className="text-red-400">FC2</span> — 10 (Output)</p>
                    </div>
                </div>
            </div>

            {/* Right Visualization & Stats (Center panel now that we have 3 cols) */}
            <div className="flex flex-col gap-5 transition-all lg:col-span-8">
                {/* 3D Canvas Box */}
                {/* 3D Canvas Box */}
                <div 
                    className={isFullscreen 
                        ? "fixed inset-0 z-50 bg-[#03051a] flex flex-col p-4" 
                        : "glass-panel rounded-2xl relative overflow-hidden flex flex-col"} 
                    style={isFullscreen ? {} : { height: 520 }}
                >
                    {/* Minimize button (only in fullscreen) */}
                    {isFullscreen && (
                        <button
                            onClick={() => setIsFullscreen(false)}
                            className="absolute top-4 right-4 z-50 bg-slate-800 text-white p-2 rounded-lg hover:bg-slate-700 border border-slate-700 shadow-xl"
                        >
                            <Minimize2 className="w-5 h-5" />
                        </button>
                    )}

                    {/* Maximize button (only in normal view) */}
                    {!isFullscreen && (
                        <button
                            onClick={() => setIsFullscreen(true)}
                            className="absolute top-4 right-4 z-10 bg-slate-800/80 text-slate-300 p-1.5 rounded-lg hover:text-white hover:bg-slate-700 border border-slate-600 transition-colors shadow-xl"
                        >
                            <Maximize2 className="w-4 h-4" />
                        </button>
                    )}

                    {/* Live PyTorch Sim Badge */}
                    <div className={`absolute top-4 left-4 z-10 bg-slate-900/90 backdrop-blur border border-slate-700 rounded-lg font-mono text-slate-300 shadow-xl overflow-hidden ${isFullscreen ? 'p-3 text-sm max-w-[250px]' : 'p-2 text-xs max-w-[200px]'}`}>
                        <div className={`flex items-center text-teal-400 mb-1 border-b border-slate-700/50 ${isFullscreen ? 'pb-2' : 'pb-1'}`}>
                            <Terminal className={`${isFullscreen ? 'w-4 h-4 mr-2' : 'w-3 h-3 mr-1'}`} /> Live PyTorch Sim
                        </div>
                        <div className={`py-0.5 ${animationProgress > 5 && animationProgress <= 15 ? 'text-white bg-slate-800 rounded px-1 -mx-1' : 'text-slate-500'}`}>x = self.conv1(x)</div>
                        <div className={`py-0.5 ${animationProgress > 15 && animationProgress <= 30 ? 'text-white bg-slate-800 rounded px-1 -mx-1' : 'text-slate-500'}`}>x = F.relu(x)</div>
                        <div className={`py-0.5 ${animationProgress > 30 && animationProgress <= 45 ? 'text-white bg-slate-800 rounded px-1 -mx-1' : 'text-slate-500'}`}>x = self.conv2(x)</div>
                        <div className={`py-0.5 ${animationProgress > 45 && animationProgress <= 60 ? 'text-white bg-slate-800 rounded px-1 -mx-1' : 'text-slate-500'}`}>x = F.max_pool2d(x, 2)</div>
                        <div className={`py-0.5 ${animationProgress > 60 && animationProgress <= 75 ? 'text-white bg-slate-800 rounded px-1 -mx-1' : 'text-slate-500'}`}>x = torch.flatten(x, 1)</div>
                        <div className={`py-0.5 ${animationProgress > 75 && animationProgress <= 90 ? 'text-white bg-slate-800 rounded px-1 -mx-1' : 'text-slate-500'}`}>x = self.fc1(x)</div>
                        <div className={`py-0.5 ${animationProgress > 90 ? 'text-white bg-slate-800 rounded px-1 -mx-1' : 'text-slate-500'}`}>output = self.fc2(x)</div>
                    </div>
                    
                    <div className={`flex-1 min-h-0 relative ${isFullscreen ? 'rounded-xl overflow-hidden border border-slate-800' : ''}`}>
                        {/* We use strict absolute positioning inside this block to ensure the canvas doesn't shift weirdly. The library will auto-fit. */}
                        <PyTorchCNNCanvas drawingData={drawingData} onPrediction={setPrediction} animationProgress={animationProgress} isPlaying={isPlaying} speed={speed} />
                    </div>

                    {/* Animation Controls Bottom Bar */}
                    <div className={isFullscreen 
                        ? "mt-4 h-20 bg-slate-900/90 backdrop-blur border border-slate-700/50 rounded-xl flex items-center px-6 gap-6 shadow-2xl z-10" 
                        : "h-16 bg-slate-900/80 backdrop-blur border-t border-slate-700/50 flex items-center px-4 gap-4"}>
                        
                        <button onClick={() => setIsPlaying(!isPlaying)} className={`rounded-full bg-teal-600 text-white flex items-center justify-center hover:bg-teal-500 transition-colors shrink-0 shadow-lg shadow-teal-900/50 ${isFullscreen ? 'w-12 h-12' : 'w-10 h-10'}`}>
                            {isPlaying ? <Pause className={isFullscreen ? "w-6 h-6" : "w-5 h-5"} /> : <Play className={isFullscreen ? "w-6 h-6 translate-x-0.5" : "w-5 h-5 translate-x-0.5"} />}
                        </button>
                        
                        <button onClick={() => setAnimationProgress(p => Math.min(100, p + 10))} className={`rounded-full bg-slate-800 text-slate-300 flex items-center justify-center hover:bg-slate-700 hover:text-white transition-colors shrink-0 ${isFullscreen ? 'w-10 h-10' : 'w-8 h-8'}`}>
                            <SkipForward className={isFullscreen ? "w-5 h-5" : "w-4 h-4"} />
                        </button>
                        
                        <div className="flex-1 flex items-center gap-3">
                            <span className={`font-mono text-slate-400 font-bold ${isFullscreen ? 'text-sm w-10' : 'text-xs w-8'}`}>{Math.round(animationProgress)}%</span>
                            <input 
                                type="range" min="0" max="100" value={animationProgress} onChange={e => setAnimationProgress(Number(e.target.value))}
                                className={`w-full bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500 ${isFullscreen ? 'h-3' : 'h-2'}`} 
                            />
                        </div>

                        <div className={`flex items-center border-l border-slate-700 shrink-0 ${isFullscreen ? 'gap-3 pl-6' : 'gap-2 pl-4'}`}>
                            <SlidersHorizontal className={`text-slate-400 ${isFullscreen ? 'w-5 h-5' : 'w-4 h-4'}`} />
                            {isFullscreen && <span className="text-xs text-slate-500 font-bold tracking-widest uppercase hidden md:inline">Speed</span>}
                            <select value={speed} onChange={e => setSpeed(Number(e.target.value))} className={`bg-slate-800 text-white border border-slate-600 outline-none cursor-pointer ${isFullscreen ? 'font-bold text-sm rounded-lg p-2' : 'text-xs rounded p-1'}`}>
                                <option value={0.5}>0.5x</option>
                                <option value={1}>1.0x</option>
                                <option value={2}>2.0x</option>
                                <option value={5}>5.0x</option>
                            </select>
                        </div>
                    </div>
                </div>
                {/* Stats row */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="glass-panel p-4 rounded-xl border-t-2 border-indigo-500">
                        <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1 flex items-center gap-1">
                            <Calculator className="w-3 h-3" /> Params
                        </p>
                        <p className="text-2xl font-extrabold text-white font-mono">{totalParams.toLocaleString()}</p>
                        <p className="text-xs mt-1 text-indigo-300 bg-indigo-500/10 px-2 py-0.5 inline-block rounded">MNISTModel exact</p>
                    </div>
                    <div className="glass-panel p-4 rounded-xl border-t-2 border-amber-500">
                        <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1 flex items-center gap-1">
                            <Activity className="w-3 h-3" /> FLOPs
                        </p>
                        <p className="text-xl font-extrabold text-white font-mono">{totalFlops.toLocaleString()}</p>
                        <p className="text-xs mt-1 text-amber-400 bg-amber-500/10 px-2 py-0.5 inline-block rounded">Train ×3: {trainFlops.toLocaleString()}</p>
                    </div>
                    <div className="glass-panel p-4 rounded-xl border-t-2 border-teal-500">
                        <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1 flex items-center gap-1">
                            <HardDrive className="w-3 h-3" /> Output
                        </p>
                        <p className="text-2xl font-extrabold text-teal-400 font-mono">10 nodes</p>
                        <p className="text-xs mt-1 text-teal-300 bg-teal-500/10 px-2 py-0.5 inline-block rounded">Digits 0–9</p>
                    </div>
                </div>
            </div>

            {/* AI Teacher Math Breakdown - DETAILED */}
            <div className="col-span-12 mt-12 bg-slate-900/50 rounded-3xl p-8 border border-slate-700/50 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2 opacity-50"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -z-10 -translate-x-1/2 translate-y-1/2 opacity-50"></div>
                
                <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400 mb-2">
                    How This MNIST Model Thinks
                </h2>
                <p className="text-slate-300 text-sm mb-8 leading-relaxed max-w-4xl">
                    The model is a <strong>Convolutional Neural Network (CNN)</strong> designed to classify handwritten digits (0–9) from the MNIST dataset. 
                    Each input image is <strong>28×28 pixels grayscale</strong>, meaning it has <strong>1 channel</strong>. The model processes the image in three main stages: 
                    <span className="text-teal-400 ml-2">1. Feature Extraction</span>, <span className="text-purple-400 mx-2">2. Spatial Compression</span>, <span className="text-amber-400 mx-2">3. Decision Making</span>.
                </p>

                <div className="space-y-6">
                    {/* Step 1 */}
                    <div className="bg-slate-800/60 p-6 rounded-2xl border border-teal-500/30">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-10 h-10 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400 font-bold text-xl shrink-0">1</div>
                            <h3 className="text-xl font-bold text-teal-300">Seeing Features (First Convolution Layer)</h3>
                        </div>
                        <div className="pl-14">
                            <code className="block bg-[#0d1117] text-teal-200 p-3 rounded-xl font-mono text-sm border border-slate-700 mb-4 overflow-x-auto">
                                self.conv1 = nn.Conv2d(1, 32, kernel_size=3, stride=1)
                            </code>
                            <div className="grid md:grid-cols-2 gap-6 text-sm text-slate-300">
                                <div>
                                    <p className="mb-2"><strong>What happens here:</strong> The model scans the image with <strong>32 small filters (kernels)</strong>. Each filter is 3×3 pixels.</p>
                                    <ul className="list-disc list-inside space-y-1 text-slate-400 ml-2">
                                        <li>Input shape: <code className="text-slate-300">1 × 28 × 28</code></li>
                                        <li>Output shape: <code className="text-teal-300">32 × 26 × 26</code></li>
                                        <li>Why? Output size = (Input - Kernel + 1) &rarr; 28 - 3 + 1 = 26</li>
                                    </ul>
                                </div>
                                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                                    <p className="font-semibold text-slate-200 mb-2">Mathematical Operation:</p>
                                    <p className="font-mono text-xs text-slate-400">Feature(c, y, x) = Bias_c + ΣΣ (Weight_c,i,j × Input_y+i, x+j)</p>
                                    <p className="mt-3">The model <strong>slides a 3×3 window</strong> across the image and multiplies the filter weights with pixel values. These filters learn to detect edges, curves, corners, and stroke thickness.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Step 2 */}
                    <div className="bg-slate-800/60 p-6 rounded-2xl border border-slate-700">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 font-bold text-xl shrink-0">2</div>
                            <h3 className="text-xl font-bold text-slate-200">Non-Linearity (ReLU Activation)</h3>
                        </div>
                        <div className="pl-14">
                            <code className="block bg-[#0d1117] text-slate-300 p-3 rounded-xl font-mono text-sm border border-slate-700 mb-4">
                                x = F.relu(x)
                            </code>
                            <p className="text-sm text-slate-300 mb-2">ReLU function: <code className="text-slate-200">ReLU(x) = max(0, x)</code></p>
                            <p className="text-sm text-slate-400">Removes negative values and introduces <strong>non-linear learning</strong>. Without ReLU, the network becomes just a giant linear function and cannot learn complex patterns.</p>
                        </div>
                    </div>

                    {/* Step 3 */}
                    <div className="bg-slate-800/60 p-6 rounded-2xl border border-blue-500/30">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-xl shrink-0">3</div>
                            <h3 className="text-xl font-bold text-blue-300">Deeper Feature Detection (Second Convolution)</h3>
                        </div>
                        <div className="pl-14">
                            <code className="block bg-[#0d1117] text-blue-200 p-3 rounded-xl font-mono text-sm border border-slate-700 mb-4 overflow-x-auto">
                                self.conv2 = nn.Conv2d(32, 64, kernel_size=3, stride=1)
                            </code>
                            <div className="grid md:grid-cols-2 gap-6 text-sm text-slate-300">
                                <div>
                                    <p className="mb-2">Now the network processes the <strong>feature maps</strong> produced by Conv1.</p>
                                    <ul className="list-disc list-inside space-y-1 text-slate-400 ml-2">
                                        <li>Input shape: <code className="text-slate-300">32 × 26 × 26</code></li>
                                        <li>Output shape: <code className="text-blue-300">64 × 24 × 24</code></li>
                                        <li>Why? 26 - 3 + 1 = 24</li>
                                    </ul>
                                </div>
                                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                                    <p className="mt-1">Each filter now combines <strong>all 32 channels</strong>. This means each filter can detect <strong>complex patterns</strong>, such as loops of digits or intersections.</p>
                                    <p className="mt-2 text-slate-400 italic">Conv1 learns edges &rarr; Conv2 learns digit shapes</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Step 4 & 5 */}
                    <div className="bg-slate-800/60 p-6 rounded-2xl border border-purple-500/30">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-xl shrink-0">4</div>
                            <h3 className="text-xl font-bold text-purple-300">Shrinking the Image (Max Pooling)</h3>
                        </div>
                        <div className="pl-14">
                            <div className="flex items-center gap-4 mb-4">
                                <code className="bg-[#0d1117] text-slate-400 px-3 py-1.5 rounded-lg border border-slate-700 text-xs">x = F.relu(x)</code>
                                <span className="text-slate-500">&rarr;</span>
                                <code className="bg-[#0d1117] text-purple-200 px-3 py-1.5 rounded-lg border border-slate-700 text-xs text-wrap">x = F.max_pool2d(x, 2)</code>
                            </div>
                            <div className="text-sm text-slate-300">
                                <p className="mb-2">Pooling reduces spatial size. <code className="text-slate-300">64 × 24 × 24</code> &rarr; <code className="text-purple-300">64 × 12 × 12</code></p>
                                <p className="text-slate-400 mb-2 font-mono text-xs">Pool(x) = max(x_00, x_01, x_10, x_11)</p>
                                <p><strong>Why pooling helps:</strong> Reduces computation and memory, keeps the strongest features, and improves <strong>translation invariance</strong> (if a digit shifts slightly, the model still recognizes it).</p>
                            </div>
                        </div>
                    </div>

                    {/* Step 6 & 7 */}
                    <div className="bg-slate-800/60 p-6 rounded-2xl border border-emerald-500/30">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-xl shrink-0">5</div>
                            <h3 className="text-xl font-bold text-emerald-300">Flattening & Regularization</h3>
                        </div>
                        <div className="pl-14 space-y-4">
                            <div>
                                <h4 className="font-semibold text-slate-200 mb-1 text-sm">Dropout (Regularization)</h4>
                                <code className="block bg-[#0d1117] text-slate-400 p-2 rounded-lg font-mono text-xs border border-slate-700 mb-1">self.dropout1 = nn.Dropout(0.25)</code>
                                <p className="text-xs text-slate-400">Randomly removes 25% of neurons during training to prevent <strong>overfitting</strong>.</p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-emerald-200 mb-1 text-sm">Flattening</h4>
                                <code className="block bg-[#0d1117] text-emerald-200 p-2 rounded-lg font-mono text-xs border border-slate-700 mb-1">x = torch.flatten(x, 1)</code>
                                <p className="text-xs text-slate-400">Before dense layers, the 3D tensor must become a 1D vector. <code className="text-slate-300">64 × 12 × 12</code> &rarr; <strong className="text-emerald-300">9216 numbers</strong>.</p>
                            </div>
                        </div>
                    </div>

                    {/* Step 8, 9, 10 */}
                    <div className="bg-slate-800/60 p-6 rounded-2xl border border-amber-500/30">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-xl shrink-0">6</div>
                            <h3 className="text-xl font-bold text-amber-300">Fully Connected Layer (Decision Making)</h3>
                        </div>
                        <div className="pl-14">
                            <code className="block bg-[#0d1117] text-amber-200 p-3 rounded-xl font-mono text-sm border border-slate-700 mb-4">
                                self.fc1 = nn.Linear(9216, 128)
                            </code>
                            <div className="text-sm text-slate-300 mb-4">
                                <p className="mb-2">Now the network learns <strong>global relationships</strong>. Mathematical equation: <code className="text-amber-200 font-mono">Y = XW^T + b</code></p>
                                <p className="text-slate-400">The network compresses <strong>9216 features &rarr; 128 important signals</strong>.</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <code className="bg-[#0d1117] text-slate-400 px-3 py-1.5 rounded-lg border border-slate-700 text-xs">x = F.relu(x)</code>
                                <span className="text-slate-500">&rarr;</span>
                                <code className="bg-[#0d1117] text-slate-400 px-3 py-1.5 rounded-lg border border-slate-700 text-xs">self.dropout2 = nn.Dropout(0.5)</code>
                            </div>
                        </div>
                    </div>

                    {/* Step 11 & 12 */}
                    <div className="bg-slate-800/60 p-6 rounded-2xl border border-rose-500/30">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-400 font-bold text-xl shrink-0">7</div>
                            <h3 className="text-xl font-bold text-rose-300">Final Prediction (Logits to Probabilities)</h3>
                        </div>
                        <div className="pl-14">
                            <code className="block bg-[#0d1117] text-rose-200 p-3 rounded-xl font-mono text-sm border border-slate-700 mb-4">
                                self.fc2 = nn.Linear(128, 10)
                            </code>
                            <div className="grid md:grid-cols-2 gap-6 text-sm text-slate-300">
                                <div>
                                    <p className="mb-2">The model predicts <strong>10 classes</strong> (digits 0-9). The raw outputs are called <strong>logits</strong>.</p>
                                    <p className="font-mono text-xs text-rose-300 bg-rose-950/30 p-2 rounded border border-rose-900/50">[2.1, -1.5, 3.7, 0.5, ...]</p>
                                </div>
                                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                                    <p className="font-semibold text-slate-200 mb-1">Softmax & argmax:</p>
                                    <p className="text-xs text-slate-400 mb-2">Converts raw logits into probabilities that sum to 100%.</p>
                                    <p className="font-mono text-xs text-rose-300 bg-rose-950/30 p-2 rounded mb-2 border border-rose-900/50">Softmax: [0.13, 0.02, 0.78, 0.07]</p>
                                    <p className="font-semibold text-white">Prediction = argmax(probabilities) &rarr; "2"</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Summary Flow */}
                    <div className="pt-6 border-t border-slate-800 text-center">
                        <h4 className="text-slate-400 uppercase tracking-widest text-xs font-bold mb-4">Intuition Flow</h4>
                        <div className="flex flex-wrap items-center justify-center gap-3 text-sm font-mono">
                            <span className="bg-slate-800 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700">Input Image</span>
                            <span className="text-slate-500">&rarr;</span>
                            <span className="bg-teal-900/30 text-teal-300 px-3 py-1.5 rounded-lg border border-teal-800">Edge detection</span>
                            <span className="text-slate-500">&rarr;</span>
                            <span className="bg-blue-900/30 text-blue-300 px-3 py-1.5 rounded-lg border border-blue-800">Curve/Loop detection</span>
                            <span className="text-slate-500">&rarr;</span>
                            <span className="bg-purple-900/30 text-purple-300 px-3 py-1.5 rounded-lg border border-purple-800">Digit structure</span>
                            <span className="text-slate-500">&rarr;</span>
                            <span className="bg-rose-900/30 text-rose-300 px-3 py-1.5 rounded-lg border border-rose-800">Classifier Output</span>
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
}

// -------------------------------------------------------------
// TRANSFORMER MODULE
// -------------------------------------------------------------
function TransformerModule() {
    const [layers, setLayers] = useState(12);
    const [dModel, setDModel] = useState(768);
    const [heads, setHeads] = useState(12);
    const [seqLen, setSeqLen] = useState(1024);
    const [vocab, setVocab] = useState(50257);
    const [precision, setPrecision] = useState<Precision>('BF16');

    const [explainOpen, setExplainOpen] = useState(false);

    // Math Logic for Decoder-Only Transformer (e.g. GPT-style)

    // 1. Embedding Params:
    const embedParams = vocab * dModel;

    // 2. Attention Params per layer:
    // Q, K, V projections: 3 * (d_model * d_model) + biases
    const qkvParams = 3 * (dModel * dModel) + (3 * dModel);
    // Output projection: d_model * d_model
    const oProjParams = (dModel * dModel) + dModel;
    const attnParams = qkvParams + oProjParams;

    // 3. FFN Params per layer:
    // Typically FFN hidden size is 4 * d_model
    const ffnHidden = 4 * dModel;
    const ffn1Params = (dModel * ffnHidden) + ffnHidden;
    const ffn2Params = (ffnHidden * dModel) + dModel;
    const ffnParams = ffn1Params + ffn2Params;

    // Total layer params (ignoring LayerNorms which are tiny, 2*d_model per norm)
    const layerNormParams = 4 * dModel;
    const singleLayerParams = attnParams + ffnParams + layerNormParams;

    // Total Params
    const totalParams = embedParams + (layers * singleLayerParams);

    // Memory
    const bytesPerParamMap: Record<Precision, number> = { FP32: 4, FP16: 2, BF16: 2, FP8: 1 };
    const memoryBytes = totalParams * bytesPerParamMap[precision];

    // FLOPs Logic (Per Token Forward Pass):
    // Simplified approx: 2 * params per Token.
    // Self-Attention specific quadratic cost: 2 * seq_len^2 * d_model

    // Total Forward FLOPs for the entire sequence
    const denseFlops = (2 * totalParams) * seqLen;
    const attentionQuadraticFlops = 2 * (seqLen * seqLen * dModel) * layers;

    const forwardFlops = denseFlops + attentionQuadraticFlops;
    // const trainFlops = forwardFlops * 3;

    // KV Cache Memory (Crucial inference stat often misunderstood)
    // 2 (K,V) * layers * seq_len * d_model * precision_bytes
    const kvCacheBytes = 2 * layers * seqLen * dModel * bytesPerParamMap[precision];

    return (
        <>
            {/* Left Settings */}
            <div className="lg:col-span-4 space-y-6 flex flex-col">
                <div className="glass-panel p-6 rounded-2xl border-rose-500/30 border-t-4 shadow-lg flex-1">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                        <Layers className="w-5 h-5 mr-2 text-rose-400" />
                        Transformer Config
                    </h3>

                    <div className="space-y-6">
                        {/* Size Config */}
                        <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700">
                            <div className="mb-4">
                                <div className="flex justify-between mb-1">
                                    <label className="text-sm font-medium text-slate-300">Decoder Layers</label>
                                    <span className="text-rose-400 font-mono">{layers}</span>
                                </div>
                                <input type="range" min="1" max="96" value={layers} onChange={e => setLayers(Number(e.target.value))} className="w-full accent-rose-500" />
                            </div>
                            <div className="mb-4">
                                <div className="flex justify-between mb-1">
                                    <label className="text-sm font-medium text-slate-300">Hidden Size (<span className="text-rose-300 font-mono text-xs">d_model</span>)</label>
                                    <span className="text-rose-400 font-mono">{dModel}</span>
                                </div>
                                <input type="range" min="64" max="8192" step="64" value={dModel} onChange={e => setDModel(Number(e.target.value))} className="w-full accent-rose-500" />
                            </div>
                            <div>
                                <div className="flex justify-between mb-1">
                                    <label className="text-sm font-medium text-slate-300">Attention Heads</label>
                                    <span className="text-rose-400 font-mono">{heads}</span>
                                </div>
                                <input type="range" min="1" max="128" value={heads} onChange={e => setHeads(Number(e.target.value))} className="w-full accent-rose-500" />
                            </div>
                        </div>

                        {/* Context Config */}
                        <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700">
                            <div className="mb-4">
                                <div className="flex justify-between mb-1">
                                    <label className="text-sm font-medium text-slate-300">Sequence Length (<span className="text-rose-300 font-mono text-xs">Context</span>)</label>
                                    <span className="text-rose-400 font-mono">{seqLen}</span>
                                </div>
                                <input type="range" min="128" max="131072" step="128" value={seqLen} onChange={e => setSeqLen(Number(e.target.value))} className="w-full accent-rose-500" />
                            </div>
                            <div>
                                <div className="flex justify-between mb-1">
                                    <label className="text-sm font-medium text-slate-300">Vocab Size</label>
                                    <span className="text-rose-400 font-mono">{vocab.toLocaleString()}</span>
                                </div>
                                <select className="w-full bg-slate-900 border border-slate-700 rounded-md px-2 py-1 text-sm text-white" value={vocab} onChange={e => setVocab(Number(e.target.value))}>
                                    <option value={32000}>Llama (32,000)</option>
                                    <option value={50257}>GPT-2 (50,257)</option>
                                    <option value={100277}>GPT-4 (100,277)</option>
                                    <option value={128256}>Llama 3 (128,256)</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-slate-300 mb-2 block">Weight Precision</label>
                            <select className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-rose-500" value={precision} onChange={(e) => setPrecision(e.target.value as Precision)}>
                                <option value="FP32">FP32 (4 bytes)</option>
                                <option value="FP16">FP16 (2 bytes)</option>
                                <option value="BF16">BF16 (2 bytes)</option>
                                <option value="FP8">FP8 (1 byte)</option>
                            </select>
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => setExplainOpen(!explainOpen)}
                    className="w-full p-4 glass-panel hover:bg-slate-800/80 transition-all rounded-xl border border-slate-700 flex justify-between items-center text-slate-300"
                >
                    <span className="font-semibold flex items-center"><Info className="w-4 h-4 mr-2 text-rose-400" /> Explain this in simple terms</span>
                    <ArrowRight className={`w-4 h-4 transition-transform ${explainOpen ? 'rotate-90' : ''}`} />
                </button>
                {explainOpen && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="p-4 bg-slate-800/50 rounded-xl border border-slate-700 text-sm text-slate-400 leading-relaxed">
                        Transformers process data sequentially but look at the entire context simultaneously.
                        <br /><br />
                        <b>The Problem:</b> Attention is <b>Quadratic</b>. Every token looks at every other token before it. If you double the Sequence Length, the compute required for attention increases by a factor of 4!
                        <br /><br />
                        <b>KV Cache:</b> To generate text efficiently, we save the Attention Keys and Values. This consumes massive VRAM during long conversations.
                    </motion.div>
                )}
            </div>

            {/* Right Visualization & Stats */}
            <div className="lg:col-span-8 space-y-6 flex flex-col">
                {/* Animated Attention Canvas */}
                <div className="glass-panel p-6 rounded-2xl flex-1 relative overflow-hidden flex items-center justify-center min-h-[350px]">
                    <TransformerCanvas layers={layers} heads={heads} seqLen={seqLen} />
                </div>

                {/* Dashboard Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Params */}
                    <div className="glass-panel p-5 rounded-xl border-t-2 border-indigo-500">
                        <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2 flex items-center">
                            <Calculator className="w-4 h-4 mr-2" /> Total Parameters
                        </div>
                        <div className="text-3xl font-extrabold text-white font-mono break-all">{(totalParams / 1e9).toFixed(1)}B <span className="text-sm font-normal text-slate-400">({totalParams.toLocaleString()})</span></div>
                        <div className="text-xs mt-2 text-indigo-300 bg-indigo-500/10 px-2 py-1 inline-block rounded">
                            {embedParams.toLocaleString()} Embeds + {singleLayerParams.toLocaleString()} / Layer
                        </div>
                    </div>

                    {/* FLOPs */}
                    <div className="glass-panel p-5 rounded-xl border-t-2 border-amber-500">
                        <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2 flex items-center">
                            <Activity className="w-4 h-4 mr-2" /> Compute (FLOPs)
                        </div>
                        <div className="text-2xl font-extrabold text-white font-mono break-all font-semibold break-all">{(forwardFlops / 1e12).toFixed(1)} TFLOPs</div>
                        <div className="text-xs text-slate-500 mb-2">Per sequence forward pass</div>
                        <div className="text-sm font-semibold text-amber-400 font-mono bg-amber-500/10 px-2 py-1 inline-block rounded">
                            Quadratic Overhead: {((attentionQuadraticFlops / forwardFlops) * 100).toFixed(1)}%
                        </div>
                    </div>

                    {/* Weight Memory */}
                    <div className="glass-panel p-5 rounded-xl border-t-2 border-teal-500">
                        <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2 flex items-center">
                            <HardDrive className="w-4 h-4 mr-2" /> Base Weight VRAM
                        </div>
                        <div className="text-3xl font-extrabold text-white font-mono">
                            {(memoryBytes / 1024 / 1024 / 1024).toFixed(2)} GB
                        </div>
                        <div className="text-xs mt-2 text-teal-300 bg-teal-500/10 px-2 py-1 inline-block rounded">
                            Static Model Size at {precision}
                        </div>
                    </div>

                    {/* KV Cache Memory */}
                    <div className="glass-panel p-5 rounded-xl border-t-2 border-rose-500 bg-rose-950/20">
                        <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2 flex items-center group relative w-max">
                            <HardDrive className="w-4 h-4 mr-2" /> KV Cache VRAM
                        </div>
                        <div className="text-3xl font-extrabold text-rose-400 font-mono drop-shadow-[0_0_10px_rgba(244,63,94,0.3)]">
                            {(kvCacheBytes / 1024 / 1024 / 1024).toFixed(2)} GB
                        </div>
                        <div className="text-xs mt-2 text-rose-300 bg-rose-500/10 px-2 py-1 inline-block rounded">
                            Per Batch=1 Sequence
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

// -------------------------------------------------------------
// SCALING GRAPH MODULE
// -------------------------------------------------------------
function ScalingModule() {
    const [xType, setXType] = useState<'params' | 'flops' | 'seqlen'>('params');
    const [yType, setYType] = useState<'params' | 'flops' | 'memory'>('flops');
    const [modelFamily, setModelFamily] = useState<'transformer' | 'mlp'>('transformer');

    // Generate hypothetical data points based on selection
    const generateData = () => {
        const labels: string[] = [];
        const datasetData: number[] = [];

        if (modelFamily === 'transformer') {
            // Let's assume a standard family: 110M, 350M, 1B, 3B, 7B, 13B, 70B
            // We'll estimate FLOPs simply as 2 * P * N (with assumed N=2048 for most) 
            // but if xType = seqlen, we hold params fixed at say 7B and scale N from 1K to 128K.

            if (xType === 'seqlen') {
                // Fixed 7B model
                const fixedParams = 7e9;
                const fixedDModel = 4096;
                const fixedLayers = 32;
                const seqs = [1024, 2048, 4096, 8192, 16384, 32768, 65536, 131072];

                seqs.forEach(seq => {
                    labels.push(`${seq / 1024}K`);
                    if (yType === 'flops') {
                        const denseFlops = 2 * fixedParams * seq;
                        const attnFlops = 2 * (seq * seq * fixedDModel) * fixedLayers;
                        datasetData.push((denseFlops + attnFlops) / 1e12); // TFLOPs
                    } else if (yType === 'memory') {
                        // KV Cache memory (BF16)
                        const kvMem = 2 * fixedLayers * seq * fixedDModel * 2;
                        datasetData.push(kvMem / 1e9); // GB
                    } else {
                        // parameters are constant
                        datasetData.push(fixedParams / 1e9); // B
                    }
                });
            } else {
                // Scaling model size
                const models = [
                    { name: '110M', p: 110e6, seq: 1024 },
                    { name: '350M', p: 350e6, seq: 1024 },
                    { name: '1B', p: 1e9, seq: 2048 },
                    { name: '7B', p: 7e9, seq: 4096 },
                    { name: '13B', p: 13e9, seq: 4096 },
                    { name: '70B', p: 70e9, seq: 8192 }
                ];

                models.forEach(m => {
                    if (xType === 'params') labels.push(m.name);
                    if (xType === 'flops') labels.push(`${((2 * m.p * m.seq) / 1e12).toFixed(1)} TFLOPs`);

                    if (yType === 'flops') {
                        datasetData.push((2 * m.p * m.seq) / 1e12); // Approximate TFLOPs
                    } else if (yType === 'memory') {
                        datasetData.push((m.p * 2) / 1e9); // Simple BF16 weights memory purely
                    } else {
                        datasetData.push(m.p / 1e9);
                    }
                });
            }
        } else {
            // MLP standard family expanding width & depth
            // H=[64, 256, 1024, 4096, 16384] Layers=[1, 2, 4, 8, 16]
            const configs = [
                { name: 'Tiny', h: 64, l: 2 },
                { name: 'Small', h: 256, l: 4 },
                { name: 'Base', h: 1024, l: 8 },
                { name: 'Large', h: 4096, l: 16 },
                { name: 'Huge', h: 16384, l: 32 }
            ];

            configs.forEach(c => {
                const p = c.h * c.h * c.l; // Super rough approx of total weights
                const f = 2 * p; // FLOPs per input

                labels.push(c.name);

                if (yType === 'params') datasetData.push(p / 1e6); // Millions
                if (yType === 'flops') datasetData.push(f / 1e6); // MFLOPs
                if (yType === 'memory') datasetData.push((p * 4) / 1e6); // FP32 MB
            });
        }

        return { labels, datasetData };
    };

    const { labels, datasetData } = generateData();

    const chartData = {
        labels,
        datasets: [
            {
                label: yType === 'flops' ? (modelFamily === 'transformer' ? 'Compute (TFLOPs)' : 'Compute (MFLOPs)') :
                    yType === 'memory' ? (modelFamily === 'transformer' ? (xType === 'seqlen' ? 'KV Cache (GB)' : 'Weights (GB)') : 'Memory (MB)') :
                        (modelFamily === 'transformer' ? 'Params (Billion)' : 'Params (Million)'),
                data: datasetData,
                borderColor: '#d946ef', // fuchsia 500
                backgroundColor: 'rgba(217, 70, 239, 0.2)',
                pointBackgroundColor: '#fff',
                pointBorderColor: '#d946ef',
                pointHoverBackgroundColor: '#d946ef',
                pointHoverBorderColor: '#fff',
                fill: true,
                tension: 0.4
            }
        ]
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                titleColor: '#fff',
                bodyColor: '#cbd5e1',
                borderColor: '#475569',
                borderWidth: 1,
                padding: 10
            }
        },
        scales: {
            y: {
                grid: {
                    color: 'rgba(71, 85, 105, 0.2)',
                },
                ticks: {
                    color: '#94a3b8',
                },
                title: {
                    display: true,
                    text: yType.toUpperCase(),
                    color: '#94a3b8'
                }
            },
            x: {
                grid: {
                    color: 'rgba(71, 85, 105, 0.2)',
                },
                ticks: {
                    color: '#94a3b8',
                },
                title: {
                    display: true,
                    text: xType === 'seqlen' ? 'Context Length' : 'Model Scale',
                    color: '#94a3b8'
                }
            }
        }
    };

    return (
        <div className="lg:col-span-12 space-y-6">
            <div className="glass-panel p-6 rounded-2xl border-fuchsia-500/30 border-t-4 shadow-lg w-full flex flex-col md:flex-row gap-6">

                {/* Left Controls */}
                <div className="w-full md:w-1/3 flex flex-col space-y-6">
                    <h3 className="text-xl font-bold text-white flex items-center">
                        <LineChart className="w-5 h-5 mr-2 text-fuchsia-400" />
                        Scaling Laws Simulator
                    </h3>

                    <p className="text-slate-400 text-sm">
                        Observe how computational requirements and memory explode linearly or quadratically as model sizes or context lengths increase.
                        &quot;Scaling Laws&quot; are a fundamental property of deep learning.
                    </p>

                    <div className="space-y-4 pt-4 border-t border-slate-700/50">
                        <div>
                            <label className="text-sm font-medium text-slate-300 mb-2 block">Architecture Family</label>
                            <select className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-fuchsia-500" value={modelFamily} onChange={(e) => setModelFamily(e.target.value as 'transformer' | 'mlp')}>
                                <option value="transformer">Transformer (e.g. LLMs)</option>
                                <option value="mlp">Standard MLP</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-slate-300 mb-2 block">X-Axis (Independent Variable)</label>
                            <select className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-fuchsia-500" value={xType} onChange={(e) => setXType(e.target.value as 'params' | 'flops' | 'seqlen')}>
                                <option value="params">Model Size (Parameters)</option>
                                {modelFamily === 'transformer' && <option value="seqlen">Context Length (Tokens)</option>}
                            </select>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-slate-300 mb-2 block">Y-Axis (Dependent Variable)</label>
                            <select className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-fuchsia-500" value={yType} onChange={(e) => setYType(e.target.value as 'params' | 'flops' | 'memory')}>
                                <option value="flops">Compute Required (FLOPs)</option>
                                <option value="memory">Memory Consumption (VRAM)</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Right Graph */}
                <div className="w-full md:w-2/3 flex items-center justify-center p-4 bg-slate-900/50 rounded-xl border border-slate-700">
                    <Line data={chartData} options={options} />
                </div>

            </div>
        </div>
    );
}

// -------------------------------------------------------------
// DRAWING PAD MODULE
// -------------------------------------------------------------
function DrawingPad({ size = 28, onDraw }: { size: number, onDraw: (data: Float32Array) => void }) {
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = React.useState(false);

    const getPixelData = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        const srcData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        const result = new Float32Array(size * size);
        
        const scale = canvas.width / size;
        for(let y=0; y<size; y++){
            for(let x=0; x<size; x++){
                const px = Math.floor(x * scale + scale/2);
                const py = Math.floor(y * scale + scale/2);
                const idx = (py * canvas.width + px) * 4;
                result[y * size + x] = srcData[idx + 3] / 255;
            }
        }
        onDraw(result);
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(x, y, Math.max(2, 140 / size / 1.5), 0, Math.PI * 2);
        ctx.fill();
        getPixelData();
    };

    return (
        <div className="flex flex-col items-center gap-3">
            <canvas 
                ref={canvasRef} 
                width={140} 
                height={140} 
                className="bg-black border-2 border-slate-700 rounded-md cursor-crosshair shadow-[0_0_15px_rgba(20,184,166,0.15)]"
                onMouseDown={(e) => { setIsDrawing(true); draw(e); }}
                onMouseMove={draw}
                onMouseUp={() => setIsDrawing(false)}
                onMouseLeave={() => setIsDrawing(false)}
            />
            <button 
                className="text-xs bg-slate-800 hover:bg-slate-700 border border-slate-600 px-4 py-1.5 rounded-lg text-slate-300 font-semibold transition-colors w-full max-w-[140px]"
                onClick={() => {
                    if (canvasRef.current) {
                        const ctx = canvasRef.current.getContext('2d');
                        ctx?.clearRect(0,0,140,140);
                        getPixelData();
                    }
                }}
            >
                Clear Pad
            </button>
        </div>
    );
}

// -------------------------------------------------------------
// VISUALIZATION LOGIC: MLP Canvas 
// -------------------------------------------------------------
function MLPCanvas({ inputs, hiddenSize, hiddenLayers, outputs }: { inputs: number, hiddenSize: number, hiddenLayers: number, outputs: number }) {
    const canvasRef = React.useRef<HTMLCanvasElement>(null);

    React.useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // We will draw: Input layer -> Hidden Layers -> Output layer
        // Nodes are circles, lines represent weights.

        const width = canvas.width;
        const height = canvas.height;
        ctx.clearRect(0, 0, width, height);

        const layers = [
            { size: inputs, color: '#3b82f6', label: 'Input' }, // blue
            ...Array(hiddenLayers).fill({ size: hiddenSize, color: '#6366f1', label: 'Hidden' }), // indigo
            { size: outputs, color: '#10b981', label: 'Output' } // emerald
        ];

        const layerSpacing = width / (layers.length + 1);

        // Calculate Node coordinates
        const nodes: { x: number, y: number, layerIdx: number }[] = [];
        const maxNodesPerLayer = Math.max(inputs, hiddenSize, outputs);

        // Draw lines first (so they are under the nodes)
        ctx.lineWidth = 1;
        for (let l = 0; l < layers.length - 1; l++) {
            const currentLayerSize = layers[l].size;
            const nextLayerSize = layers[l + 1].size;

            const currentX = (l + 1) * layerSpacing;
            const nextX = (l + 2) * layerSpacing;

            // To center the nodes vertically
            const currentStartY = (height / 2) - ((currentLayerSize - 1) * 30 / 2);
            const nextStartY = (height / 2) - ((nextLayerSize - 1) * 30 / 2);

            for (let i = 0; i < currentLayerSize; i++) {
                const y1 = currentStartY + (i * 30);
                nodes.push({ x: currentX, y: y1, layerIdx: l });

                for (let j = 0; j < nextLayerSize; j++) {
                    const y2 = nextStartY + (j * 30);

                    // Subtle line
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(99, 102, 241, ${0.4 / Math.sqrt(currentLayerSize * nextLayerSize)})`; // Fade out dense connections
                    ctx.moveTo(currentX, y1);
                    ctx.lineTo(nextX, y2);
                    ctx.stroke();
                }
            }
        }

        // Capture the final output nodes coordinates since they aren't pushed in the start-node loop
        const lastL = layers.length - 1;
        const lastX = (lastL + 1) * layerSpacing;
        const lastStartY = (height / 2) - ((layers[lastL].size - 1) * 30 / 2);
        for (let j = 0; j < layers[lastL].size; j++) {
            nodes.push({ x: lastX, y: lastStartY + (j * 30), layerIdx: lastL });
        }

        // Draw Nodes
        nodes.forEach(node => {
            ctx.beginPath();
            ctx.fillStyle = layers[node.layerIdx].color;
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1.5;
            ctx.arc(node.x, node.y, 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Add subtle glow
            ctx.shadowBlur = 10;
            ctx.shadowColor = layers[node.layerIdx].color;
            ctx.fill();
            ctx.shadowBlur = 0; // reset
        });

    }, [inputs, hiddenSize, hiddenLayers, outputs]);

    return <canvas ref={canvasRef} width={800} height={400} className="w-full h-full max-w-full rounded-lg" />;
}

// -------------------------------------------------------------
// VISUALIZATION LOGIC: CNN Canvas 
// -------------------------------------------------------------
function CNNCanvas({ inputRes, outRes, numLayers, kernelSize, stride, padding }: { inputRes: number, outRes: number, numLayers: number, kernelSize: number, stride: number, padding: number }) {
    const canvasRef = React.useRef<HTMLCanvasElement>(null);

    React.useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;

        // Use true sliding bounds to explicitly let the user see parameters change visually
        const visInRes = inputRes;
        const visPad = padding;
        const paddedVisInRes = visInRes + 2 * visPad;

        const visKernel = Math.min(kernelSize, paddedVisInRes);
        const visStride = stride > 0 ? stride : 1;

        let visOutRes = Math.floor((visInRes - visKernel + 2 * visPad) / visStride) + 1;
        if (visOutRes < 1) visOutRes = 1;

        // Generate deterministic pseudo-random matrices to prevent flicker
        const inputData = new Array(paddedVisInRes * paddedVisInRes).fill(0);
        for (let i = 0; i < inputData.length; i++) {
            const y = Math.floor(i / paddedVisInRes);
            const x = i % paddedVisInRes;
            if (x < visPad || x >= paddedVisInRes - visPad || y < visPad || y >= paddedVisInRes - visPad) {
                inputData[i] = 0; // padding is 0
            } else {
                inputData[i] = Math.floor(((x * 13 + y * 7) % 5) + 1); // predictable numbers 1-5
            }
        }

        const filterData = new Array(visKernel * visKernel).fill(1);
        for (let i = 0; i < filterData.length; i++) {
            const y = Math.floor(i / visKernel);
            const x = i % visKernel;
            filterData[i] = ((x * 3 + y * 11) % 3) - 1; // predictable numbers -1, 0, 1
        }

        // Precompute outputs
        const outputData = new Array(visOutRes * visOutRes).fill(0);
        for (let oy = 0; oy < visOutRes; oy++) {
            for (let ox = 0; ox < visOutRes; ox++) {
                const kStart_x = ox * visStride;
                const kStart_y = oy * visStride;
                let sum = 0;
                for (let ky = 0; ky < Math.min(visKernel, paddedVisInRes - kStart_y); ky++) {
                    for (let kx = 0; kx < Math.min(visKernel, paddedVisInRes - kStart_x); kx++) {
                        const inIndex = (kStart_y + ky) * paddedVisInRes + (kStart_x + kx);
                        const fIndex = ky * visKernel + kx;
                        if (inIndex < inputData.length && fIndex < filterData.length) {
                            sum += inputData[inIndex] * filterData[fIndex];
                        }
                    }
                }
                outputData[oy * visOutRes + ox] = sum;
            }
        }

        const drawConv = (time: number) => {
            const width = canvas.width;
            const height = canvas.height;
            ctx.clearRect(0, 0, width, height);

            const totalSteps = visOutRes * visOutRes;
            const msPerStep = Math.max(100, 4000 / Math.max(totalSteps, 1)); // adjust speed elegantly
            const currentStep = Math.floor(time / msPerStep) % Math.max(totalSteps, 1);

            const outCellY = Math.floor(currentStep / visOutRes);
            const outCellX = currentStep % visOutRes;

            const kernelStartX = outCellX * visStride;
            const kernelStartY = outCellY * visStride;

            // Geometry bounding dynamically
            const availableWidth = (width / 3) - 20;
            const maxCellSize = Math.floor(availableWidth / Math.max(paddedVisInRes, 1));
            const cellSize = Math.min(40, Math.max(4, maxCellSize));
            const showText = cellSize >= 14;

            const inputMapSize = paddedVisInRes * cellSize;
            const filterMapSize = visKernel * cellSize;
            const outputMapSize = visOutRes * cellSize;

            const centerY = (height / 2) - 20; // Room for math text at bottom

            // Split 3 areas
            const inStartX = Math.max(10, (width / 3) / 2 - (inputMapSize / 2));
            const inStartY = centerY - (inputMapSize / 2);

            const filterStartX = width / 2 - (filterMapSize / 2);
            const filterStartY = centerY - (filterMapSize / 2);

            const outStartX = width - ((width / 3) / 2) - (outputMapSize / 2);
            const outStartY = centerY - (outputMapSize / 2);

            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // 1) CURRENT INPUT GRID
            ctx.fillStyle = '#94a3b8';
            ctx.font = '14px sans-serif';
            ctx.fillText(`Input + Padding`, inStartX + inputMapSize / 2, inStartY - 20);
            ctx.font = '12px monospace';

            for (let y = 0; y < paddedVisInRes; y++) {
                for (let x = 0; x < paddedVisInRes; x++) {
                    const px = inStartX + x * cellSize;
                    const py = inStartY + y * cellSize;

                    const isPad = x < visPad || x >= paddedVisInRes - visPad || y < visPad || y >= paddedVisInRes - visPad;
                    const isKernelOverlap = x >= kernelStartX && x < kernelStartX + visKernel && y >= kernelStartY && y < kernelStartY + visKernel;

                    ctx.fillStyle = isKernelOverlap ? 'rgba(20, 184, 166, 0.25)' : (isPad ? '#0f172a' : '#1e293b');
                    ctx.fillRect(px, py, cellSize, cellSize);

                    ctx.strokeStyle = isKernelOverlap ? '#14b8a6' : 'rgba(71, 85, 105, 0.4)';
                    ctx.lineWidth = isKernelOverlap ? 2 : 1;
                    ctx.strokeRect(px, py, cellSize, cellSize);

                    if (showText) {
                        const val = inputData[y * paddedVisInRes + x];
                        ctx.fillStyle = isKernelOverlap ? '#5eead4' : (isPad ? '#475569' : '#94a3b8');
                        ctx.fillText(val.toString(), px + cellSize / 2, py + cellSize / 2);
                    }
                }
            }

            // 2) KERNEL / FILTER GRID
            ctx.fillStyle = '#94a3b8';
            ctx.font = '14px sans-serif';
            ctx.fillText(`Filter (${kernelSize}x${kernelSize})`, filterStartX + filterMapSize / 2, filterStartY - 20);
            ctx.font = '12px monospace';

            for (let y = 0; y < visKernel; y++) {
                for (let x = 0; x < visKernel; x++) {
                    const px = filterStartX + x * cellSize;
                    const py = filterStartY + y * cellSize;

                    ctx.fillStyle = 'rgba(139, 92, 246, 0.2)'; // violet
                    ctx.fillRect(px, py, cellSize, cellSize);

                    ctx.strokeStyle = '#8b5cf6';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(px, py, cellSize, cellSize);

                    if (showText) {
                        const val = filterData[y * visKernel + x];
                        ctx.fillStyle = '#c4b5fd';
                        ctx.fillText(val.toString(), px + cellSize / 2, py + cellSize / 2);
                    }
                }
            }

            // 3) OUTPUT FEATURE MAP GRID
            ctx.fillStyle = '#94a3b8';
            ctx.font = '14px sans-serif';
            ctx.fillText(`Output Map`, outStartX + outputMapSize / 2, outStartY - 20);
            ctx.font = '12px monospace';

            for (let y = 0; y < visOutRes; y++) {
                for (let x = 0; x < visOutRes; x++) {
                    const px = outStartX + x * cellSize;
                    const py = outStartY + y * cellSize;

                    const cellStep = y * visOutRes + x;
                    const isCurrent = cellStep === currentStep;
                    const isComputed = cellStep <= currentStep;

                    ctx.fillStyle = isCurrent ? 'rgba(234, 179, 8, 0.3)' : (isComputed ? '#1e293b' : '#0f172a');
                    ctx.fillRect(px, py, cellSize, cellSize);

                    ctx.strokeStyle = isCurrent ? '#facc15' : 'rgba(71, 85, 105, 0.4)';
                    ctx.lineWidth = isCurrent ? 2 : 1;
                    ctx.strokeRect(px, py, cellSize, cellSize);

                    if (isComputed && showText) {
                        const val = outputData[cellStep];
                        ctx.fillStyle = isCurrent ? '#fef08a' : '#cbd5e1';
                        ctx.fillText(val.toString(), px + cellSize / 2, py + cellSize / 2);
                    }
                }
            }

            // 4) CONNECTION HIGHLIGHT LINES
            // From Input to Filter
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(20, 184, 166, 0.4)';
            ctx.setLineDash([3, 3]);
            ctx.moveTo(inStartX + kernelStartX * cellSize, inStartY + kernelStartY * cellSize);
            ctx.lineTo(filterStartX, filterStartY);
            ctx.moveTo(inStartX + (kernelStartX + visKernel) * cellSize, inStartY + (kernelStartY + visKernel) * cellSize);
            ctx.lineTo(filterStartX + filterMapSize, filterStartY + filterMapSize);
            ctx.stroke();

            // From Filter to Output cell
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(234, 179, 8, 0.6)';
            ctx.moveTo(filterStartX + filterMapSize, filterStartY + filterMapSize / 2);
            ctx.lineTo(outStartX + outCellX * cellSize, outStartY + outCellY * cellSize + cellSize / 2);
            ctx.stroke();
            ctx.setLineDash([]);

            // 5) MATHEMATICAL FORMULA DISPLAY AT BOTTOM
            ctx.fillStyle = '#e2e8f0';
            ctx.font = '15px monospace';

            let mathString = `Map[${outCellY},${outCellX}] = `;
            let termCount = 0;
            // Limit to 3 terms dynamically so it fits smoothly on the screen
            const maxTermsToDisplay = visKernel * visKernel <= 4 ? 4 : 3;

            for (let ky = 0; ky < visKernel; ky++) {
                for (let kx = 0; kx < visKernel; kx++) {
                    if (termCount < maxTermsToDisplay) {
                        const idx = (kernelStartY + ky) * paddedVisInRes + (kernelStartX + kx);
                        const inVal = inputData[idx] || 0;
                        const fVal = filterData[ky * visKernel + kx];
                        mathString += `${termCount > 0 ? ' + ' : ''}(${inVal} × ${fVal})`;
                        termCount++;
                    }
                }
            }
            if (visKernel * visKernel > maxTermsToDisplay) mathString += ` + ...`;
            mathString += ` = ${outputData[currentStep]}`;

            ctx.fillText(mathString, width / 2, height - 30);
        };

        const renderLoop = (time: number) => {
            drawConv(time);
            animationFrameId = requestAnimationFrame(renderLoop);
        };

        renderLoop(0);

        return () => cancelAnimationFrame(animationFrameId);

    }, [inputRes, outRes, numLayers, kernelSize, stride, padding]);

    return <canvas ref={canvasRef} width={800} height={400} className="w-full h-full max-w-full rounded-lg" />;
}

// -------------------------------------------------------------
// VISUALIZATION LOGIC: Transformer Canvas 
// Quadratic Attention visualization
// -------------------------------------------------------------
function TransformerCanvas({ layers, heads, seqLen }: { layers: number, heads: number, seqLen: number }) {
    const canvasRef = React.useRef<HTMLCanvasElement>(null);

    React.useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;

        const drawTransformer = (time: number) => {
            const width = canvas.width;
            const height = canvas.height;
            ctx.clearRect(0, 0, width, height);

            // Draw Token Sequence (Bottom X Axis)
            const visualTokens = Math.min(20, Math.ceil(seqLen / 100)); // clamp for visual sanity
            const tokenGridSize = (width - 100) / visualTokens;
            const yBase = height - 50;
            const yAttentionTop = 100;

            ctx.lineWidth = 1;

            // Draw tokens
            for (let t = 0; t < visualTokens; t++) {
                const x = 50 + (t * tokenGridSize) + (tokenGridSize / 2);
                const y = yBase;

                // Token Box
                ctx.fillStyle = '#1e293b';
                ctx.strokeStyle = '#475569';
                ctx.fillRect(x - 10, y, 20, 20);
                ctx.strokeRect(x - 10, y, 20, 20);

                // Show glowing "Currently generating token" moving across
                const speed = 0.002;
                const currentAnimatingToken = Math.floor((time * speed) % visualTokens);

                // Draw Attention matrix grid (Quadratic)
                const opacityQuadratic = Math.min(1, seqLen / 10000);

                if (t <= currentAnimatingToken) {
                    // Draw connections backwards to represent "Attention" looking at history
                    for (let prev = 0; prev <= t; prev++) {
                        const prevX = 50 + (prev * tokenGridSize) + (tokenGridSize / 2);

                        // Calculate arch height (higher for longer distances)
                        const dist = t - prev;
                        const archHeight = yBase - 20 - (dist * 10);

                        ctx.beginPath();

                        // Highlight active calculation brightly
                        if (t === currentAnimatingToken) {
                            ctx.strokeStyle = `rgba(244, 63, 94, ${0.8 - (dist * 0.05)})`;
                            ctx.lineWidth = 1.5;
                        } else {
                            // Static past connections
                            ctx.strokeStyle = `rgba(148, 163, 184, ${0.1 * opacityQuadratic})`;
                            ctx.lineWidth = 0.5;
                        }

                        ctx.moveTo(x, yBase);
                        ctx.quadraticCurveTo((x + prevX) / 2, archHeight, prevX, yBase);
                        ctx.stroke();
                    }
                }

                // Highlighting active token
                if (t === currentAnimatingToken) {
                    ctx.shadowBlur = 15;
                    ctx.shadowColor = '#f43f5e';
                    ctx.fillStyle = '#f43f5e';
                    ctx.fillRect(x - 10, y, 20, 20);
                    ctx.shadowBlur = 0;

                    // "QKV" Beams shooting up to layers block representation
                    ctx.beginPath();
                    ctx.moveTo(x, yBase);
                    ctx.lineTo(width / 2, yAttentionTop + 40);
                    ctx.strokeStyle = 'rgba(244, 63, 94, 0.4)';
                    ctx.setLineDash([5, 5])
                    ctx.stroke();
                    ctx.setLineDash([])
                }
            }

            // Draw Block representing Transformer Layers (Top center)
            const blockWidth = 200;
            const blockHeight = 80;
            const activeLayersDraw = Math.min(10, layers);
            const stackYOffset = 4;

            for (let l = activeLayersDraw; l > 0; l--) {
                const x = (width / 2) - (blockWidth / 2) + (l * 2);
                const y = yAttentionTop - (l * stackYOffset);

                ctx.fillStyle = l === 1 ? '#312e81' : '#1e1b4b'; // Deep indigo to represent layers
                ctx.fillRect(x, y, blockWidth, blockHeight);

                ctx.strokeStyle = '#6366f1';
                ctx.lineWidth = 1;
                ctx.strokeRect(x, y, blockWidth, blockHeight);

                if (l === 1) {
                    ctx.fillStyle = '#818cf8';
                    ctx.font = '12px Courier';
                    ctx.fillText(`L x${layers} / H x${heads}`, x + 10, y + 20);
                    ctx.fillText(`Multi-Head Attn`, x + 10, y + 45);
                    ctx.fillText(`FFN`, x + 10, y + 65);
                }
            }

            // Draw formula floating in empty space
            ctx.fillStyle = 'rgba(148, 163, 184, 0.5)';
            ctx.font = 'italic 14px monospace';
            ctx.fillText('Computational Complexity: O(L * d_model * N²)', 50, 50);

        };

        const renderLoop = (time: number) => {
            drawTransformer(time);
            animationFrameId = requestAnimationFrame(renderLoop);
        };

        renderLoop(0);

        return () => cancelAnimationFrame(animationFrameId);

    }, [layers, heads, seqLen]);

    return <canvas ref={canvasRef} width={800} height={400} className="w-full h-full max-w-full rounded-lg" />;
}
