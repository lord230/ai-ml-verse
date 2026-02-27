"use client";

import React, { useState } from 'react';
import { Network, ArrowRight, Activity, HardDrive, Calculator, Settings, Info, Box, Layers, LineChart } from 'lucide-react';
import { motion } from 'framer-motion';

import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';

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
// CNN MODULE
// -------------------------------------------------------------
function CNNModule() {
    const [inputRes, setInputRes] = useState(32);
    const [inChannels, setInChannels] = useState(3);
    const [kernelSize, setKernelSize] = useState(3);
    const [filters, setFilters] = useState(16);
    const [numLayers, setNumLayers] = useState(2);
    const [stride, setStride] = useState(1);
    const [padding, setPadding] = useState(1); // Assuming 'same' padding typical for stride 1
    const [precision, setPrecision] = useState<Precision>('FP32');

    const [explainOpen, setExplainOpen] = useState(false);

    // Math logic calculation per layer 
    // Out_res = floor((in_res - kernel + 2*padding) / stride) + 1

    // We'll calculate total params across layers assuming identical blocks for simplicity
    // Layer 1 params: (kernel*kernel*inChannels * filters) + filters
    // Layer i params (i>1): (kernel*kernel*filters * filters) + filters

    const l1Params = (kernelSize * kernelSize * inChannels * filters) + filters;
    const lOtherParams = (kernelSize * kernelSize * filters * filters) + filters;

    const totalParams = l1Params + (numLayers - 1) * lOtherParams;

    // Approximate FLOPs
    // 2 * params * out_res * out_res
    let currentRes = inputRes;
    let totalFlops = 0;

    const layerStats = [];

    for (let i = 0; i < numLayers; i++) {
        const outRes = Math.floor((currentRes - kernelSize + 2 * padding) / stride) + 1;

        // Handle negative/invalid resolutions gracefully in UI
        const safeOutRes = Math.max(1, outRes);
        const paramsThisLayer = i === 0 ? l1Params : lOtherParams;

        // MACs = params * output_pixels
        const layerFlops = (paramsThisLayer * safeOutRes * safeOutRes) * 2;
        totalFlops += layerFlops;

        layerStats.push({
            layer: i + 1,
            res: safeOutRes,
            channels: filters,
            params: paramsThisLayer
        });

        currentRes = safeOutRes;
    }

    const bytesPerParamMap: Record<Precision, number> = { FP32: 4, FP16: 2, BF16: 2, FP8: 1 };
    // const memoryBytes = totalParams * bytesPerParamMap[precision];
    const trainFlops = totalFlops * 3;

    return (
        <>
            {/* Left Settings */}
            <div className="lg:col-span-4 space-y-6 flex flex-col">
                <div className="glass-panel p-6 rounded-2xl border-teal-500/30 border-t-4 shadow-lg flex-1">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                        <Box className="w-5 h-5 mr-2 text-teal-400" />
                        CNN Block Config
                    </h3>

                    <div className="space-y-6">
                        {/* Input Specs */}
                        <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700">
                            <div className="mb-4">
                                <div className="flex justify-between mb-1">
                                    <label className="text-sm font-medium text-slate-300">Input Resolution (WxH)</label>
                                    <span className="text-teal-400 font-mono">{inputRes}x{inputRes}</span>
                                </div>
                                <input type="range" min="4" max="32" step="2" value={inputRes} onChange={e => setInputRes(Number(e.target.value))} className="w-full accent-teal-500" />
                            </div>
                            <div>
                                <div className="flex justify-between mb-1">
                                    <label className="text-sm font-medium text-slate-300">Input Channels (RGB=3)</label>
                                    <span className="text-teal-400 font-mono">{inChannels}</span>
                                </div>
                                <input type="range" min="1" max="16" value={inChannels} onChange={e => setInChannels(Number(e.target.value))} className="w-full accent-teal-500" />
                            </div>
                        </div>

                        {/* Conv Specs */}
                        <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700">
                            <div className="mb-4">
                                <div className="flex justify-between mb-1">
                                    <label className="text-sm font-medium text-slate-300">Conv Layers Count</label>
                                    <span className="text-teal-400 font-mono">{numLayers}</span>
                                </div>
                                <input type="range" min="1" max="5" value={numLayers} onChange={e => setNumLayers(Number(e.target.value))} className="w-full accent-teal-500" />
                            </div>
                            <div className="mb-4">
                                <div className="flex justify-between mb-1">
                                    <label className="text-sm font-medium text-slate-300">Filters (<span className="text-teal-300 font-mono text-xs">per layer</span>)</label>
                                    <span className="text-teal-400 font-mono">{filters}</span>
                                </div>
                                <input type="range" min="4" max="128" step="4" value={filters} onChange={e => setFilters(Number(e.target.value))} className="w-full accent-teal-500" />
                            </div>
                            <div>
                                <div className="flex justify-between mb-1">
                                    <label className="text-sm font-medium text-slate-300">Kernel Size</label>
                                    <span className="text-teal-400 font-mono">{kernelSize}x{kernelSize}</span>
                                </div>
                                <input type="range" min="1" max="7" step="2" value={kernelSize} onChange={e => setKernelSize(Number(e.target.value))} className="w-full accent-teal-500" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <div className="flex justify-between mb-1">
                                    <label className="text-sm font-medium text-slate-300">Stride</label>
                                    <span className="text-teal-400 font-mono">{stride}</span>
                                </div>
                                <input type="range" min="1" max="4" value={stride} onChange={e => setStride(Number(e.target.value))} className="w-full accent-teal-500" />
                            </div>
                            <div>
                                <div className="flex justify-between mb-1">
                                    <label className="text-sm font-medium text-slate-300">Padding</label>
                                    <span className="text-teal-400 font-mono">{padding}</span>
                                </div>
                                <input type="range" min="0" max="3" value={padding} onChange={e => setPadding(Number(e.target.value))} className="w-full accent-teal-500" />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-slate-300 mb-2 block">Weight Precision</label>
                            <select className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-teal-500" value={precision} onChange={(e) => setPrecision(e.target.value as Precision)}>
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
                    <span className="font-semibold flex items-center"><Info className="w-4 h-4 mr-2 text-teal-400" /> Explain this in simple terms</span>
                    <ArrowRight className={`w-4 h-4 transition-transform ${explainOpen ? 'rotate-90' : ''}`} />
                </button>
                {explainOpen && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="p-4 bg-slate-800/50 rounded-xl border border-slate-700 text-sm text-slate-400 leading-relaxed">
                        A CNN (Convolutional Neural Network) slides small boxes (&quot;kernels&quot;) over images.
                        Instead of connecting everything to everything like an MLP, <b>Weights are shared</b> across space.
                        <br /><br />
                        This means <b>Parameters stay very low</b>, but <b>Memory and Compute (FLOPs) can be extremely high</b> because the kernel sweeps across every pixel of the input image multiple times.
                    </motion.div>
                )}
            </div>

            {/* Right Visualization & Stats */}
            <div className="lg:col-span-8 space-y-6 flex flex-col">
                {/* Animated Convolution Canvas */}
                <div className="glass-panel p-6 rounded-2xl flex-1 relative overflow-hidden flex items-center justify-center min-h-[350px]">
                    <CNNCanvas inputRes={inputRes} outRes={layerStats[layerStats.length - 1]?.res || 1} numLayers={numLayers} kernelSize={kernelSize} stride={stride} padding={padding} />
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
                            L1: {l1Params} + Deep: {lOtherParams} / L
                        </div>
                    </div>

                    {/* FLOPs */}
                    <div className="glass-panel p-5 rounded-xl border-t-2 border-amber-500">
                        <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2 flex items-center">
                            <Activity className="w-4 h-4 mr-2" /> Compute (FLOPs)
                        </div>
                        <div className="text-2xl font-extrabold text-white font-mono break-all font-semibold break-all">{totalFlops.toLocaleString()}</div>
                        <div className="text-xs text-slate-500 mb-2">per Forward Pass</div>
                        <div className="text-sm font-semibold text-amber-400 font-mono bg-amber-500/10 px-2 py-1 inline-block rounded">
                            Train Step: {trainFlops.toLocaleString()}
                        </div>
                    </div>

                    {/* Details / Memory */}
                    <div className="glass-panel p-5 rounded-xl border-t-2 border-teal-500">
                        <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2 flex items-center">
                            <HardDrive className="w-4 h-4 mr-2" /> Output Geometry
                        </div>
                        <div className="text-3xl font-extrabold text-teal-400 font-mono">
                            {layerStats[layerStats.length - 1]?.res}x{layerStats[layerStats.length - 1]?.res}
                        </div>
                        <div className="text-xs mt-2 text-teal-300 bg-teal-500/10 px-2 py-1 inline-block rounded">
                            {filters} output channels
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
