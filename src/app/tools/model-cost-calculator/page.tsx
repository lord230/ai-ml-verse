"use client";

import React, { useState, useMemo } from 'react';
import {
    simulateTraining,
    MLModelConfig,
    TrainingStrategy,
    GPUs
} from '@/lib/simulator';
import {
    Cpu, Settings, Layers, Info, ShieldAlert, CheckCircle2, ChevronDown, ChevronRight, Zap, Coins, SplitSquareHorizontal
} from 'lucide-react';
import { Pie, Bar, Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip as ChartTooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Title,
    Filler
} from 'chart.js';

ChartJS.register(ArcElement, ChartTooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Filler);

export default function ModelCostCalculator() {
    const [config, setConfig] = useState<MLModelConfig>({
        paramsMillions: 7000,
        datasetSize: 1_000_000,
        batchSize: 32,
        epochs: 3
    });

    const [strategy, setStrategy] = useState<TrainingStrategy>({
        precision: 'BF16',
        enableLoRA: false,
        loraRank: 16,
        loraPercent: 0.1,
        enableQAT: false,
        qatBits: 8,
        enableCheckpointing: false,
        enableDDP: false,
        numGPUs: 2,
        interconnect: 'NVLink'
    });

    const [currency, setCurrency] = useState<'USD' | 'EUR' | 'GBP' | 'INR'>('USD');
    const currencyRates = { USD: 1, EUR: 0.92, GBP: 0.79, INR: 83.5 };
    const currencySymbols = { USD: '$', EUR: '€', GBP: '£', INR: '₹' };

    const rate = currencyRates[currency];
    const sym = currencySymbols[currency];

    const [selectedGpuId, setSelectedGpuId] = useState(GPUs[5].id);
    const selectedGPU = GPUs.find(g => g.id === selectedGpuId) || GPUs[5];

    const [compareMode, setCompareMode] = useState(false);
    const [selectedCompareGpuId, setSelectedCompareGpuId] = useState(GPUs[4].id);
    const compareGPU = GPUs.find(g => g.id === selectedCompareGpuId) || GPUs[4];

    const results = useMemo(() => {
        return simulateTraining(config, strategy, selectedGPU);
    }, [config, strategy, selectedGPU]);

    const compareResults = useMemo(() => {
        if (!compareMode) return null;
        return simulateTraining(config, strategy, compareGPU);
    }, [config, strategy, compareGPU, compareMode]);

    const memChartData = {
        labels: results.memoryBreakdown.map(b => b.label),
        datasets: [{
            data: results.memoryBreakdown.map(b => Number(b.value.toFixed(2))),
            backgroundColor: ['#6366f1', '#14b8a6', '#f59e0b', '#ec4899', '#8b5cf6'],
            borderWidth: 0,
            hoverOffset: 4
        }]
    };

    const costComparisonData = {
        labels: compareMode ? [selectedGPU.name, compareGPU.name] : ['Base FP32', 'Current Opts'],
        datasets: [{
            label: `Cost (${sym})`,
            data: compareMode
                ? [results.cost * rate, (compareResults?.cost || 0) * rate]
                : [
                    ((results.costSavingsFP32 ?? 0) + results.cost) * rate,
                    results.cost * rate
                ],
            backgroundColor: compareMode ? ['#4f46e5', '#ec4899'] : ['#334155', '#4f46e5'],
            borderRadius: 6
        }]
    };

    // Time scaling graph data for 1, 2, 4, 8 GPUs
    const timeScalingData = useMemo(() => {
        const gpuCounts = [1, 2, 4, 8];
        const times = gpuCounts.map(count => {
            const strat = { ...strategy, enableDDP: count > 1, numGPUs: count };
            return simulateTraining(config, strat, selectedGPU).totalTimeHours;
        });

        return {
            labels: gpuCounts.map(c => `${c} GPU${c > 1 ? 's' : ''}`),
            datasets: [{
                label: 'Training Time (hrs)',
                data: times,
                borderColor: '#14b8a6',
                backgroundColor: 'rgba(20, 184, 166, 0.1)',
                borderWidth: 2,
                pointBackgroundColor: '#14b8a6',
                tension: 0.3,
                fill: true
            }]
        };
    }, [config, strategy, selectedGPU]);

    const [activeTab, setActiveTab] = useState<'Precision' | 'LoRA' | 'Arch'>('Precision');

    return (
        <div className="flex-1 flex flex-col p-4 md:p-8 max-w-screen-2xl mx-auto w-full">
            <div className="mb-6 items-center justify-between md:flex">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center">
                        <Cpu className="w-8 h-8 mr-3 text-indigo-500" />
                        Model Cost Simulator
                    </h1>
                    <p className="text-slate-400 mt-2 max-w-3xl">
                        Tune precision modes, quantization, and architectural overrides to see real-time impact on
                        hardware limits, projected training time, and overall cloud costs.
                    </p>
                </div>
                <div className="mt-4 md:mt-0 flex items-center space-x-2 bg-slate-800/50 p-1.5 rounded-lg border border-slate-700/50">
                    <Coins className="w-4 h-4 text-slate-400 ml-2" />
                    {(['USD', 'EUR', 'GBP', 'INR'] as const).map(c => (
                        <button
                            key={c}
                            onClick={() => setCurrency(c)}
                            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${currency === c ? 'bg-indigo-500 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                        >
                            {c}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* LEFT PANEL: Inputs (Collapsible Sections) */}
                <div className="lg:col-span-4 space-y-4">

                    <CollapsibleSection title="Base Model Config" icon={Settings} defaultOpen={true} color="text-indigo-400">
                        <div className="space-y-4 pt-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">
                                    Parameters (Millions)
                                </label>
                                <input
                                    type="number" className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                                    value={config.paramsMillions}
                                    onChange={(e) => setConfig({ ...config, paramsMillions: Number(e.target.value) })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Dataset Size (Tokens/Items)</label>
                                <input
                                    type="number" className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                                    value={config.datasetSize}
                                    onChange={(e) => setConfig({ ...config, datasetSize: Number(e.target.value) })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Batch Size</label>
                                    <input type="number" className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:ring-2 focus:ring-indigo-500" value={config.batchSize} onChange={(e) => setConfig({ ...config, batchSize: Number(e.target.value) })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Epochs</label>
                                    <input type="number" className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:ring-2 focus:ring-indigo-500" value={config.epochs} onChange={(e) => setConfig({ ...config, epochs: Number(e.target.value) })} />
                                </div>
                            </div>
                        </div>
                    </CollapsibleSection>

                    <CollapsibleSection title="Hardware & Scale" icon={Zap} defaultOpen={true} color="text-amber-400">
                        <div className="space-y-4 pt-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Primary GPU Instance</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {GPUs.map(g => (
                                        <button
                                            key={g.id}
                                            onClick={() => setSelectedGpuId(g.id)}
                                            className={`px-3 py-2 rounded-lg border text-sm text-left transition-all ${selectedGpuId === g.id
                                                ? 'bg-amber-500/10 border-amber-500 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                                                : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:border-slate-500'
                                                }`}
                                        >
                                            <div className="font-semibold">{g.name}</div>
                                            <div className="text-xs opacity-80">{g.vramGB}GB • {sym}{(g.hourlyCost * rate).toFixed(2)}/hr</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-2 border-t border-slate-700">
                                <ToggleRow
                                    label="Compare GPU Hardware"
                                    checked={compareMode}
                                    onChange={setCompareMode}
                                    tooltip="Select a second GPU to directly compare training time and cost on the charts."
                                />
                                {compareMode && (
                                    <div className="mt-3 bg-slate-900/40 p-3 rounded-lg border border-slate-700/50">
                                        <label className="block text-xs font-medium text-slate-400 mb-2">Secondary Comparison GPU</label>
                                        <select
                                            className="w-full bg-slate-900/80 border border-slate-600 rounded px-2 py-1.5 text-sm text-white focus:ring-1 focus:ring-amber-500 outline-none"
                                            value={selectedCompareGpuId}
                                            onChange={(e) => setSelectedCompareGpuId(e.target.value)}
                                        >
                                            {GPUs.map(g => (
                                                <option key={'cmp-' + g.id} value={g.id} disabled={g.id === selectedGpuId}>
                                                    {g.name} ({g.vramGB}GB) - {sym}{(g.hourlyCost * rate).toFixed(2)}/hr
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-3 pt-4 mt-2 border-t border-slate-700">
                                <ToggleRow
                                    label="Distributed Data Parallel"
                                    checked={strategy.enableDDP}
                                    onChange={(v) => setStrategy({ ...strategy, enableDDP: v })}
                                    tooltip="Replicates model across GPUs. Splits batch."
                                />

                                {strategy.enableDDP && (
                                    <div className="grid grid-cols-2 gap-4 pl-4 border-l-2 border-amber-500/30">
                                        <div>
                                            <label className="text-xs text-slate-400">GPUs Count</label>
                                            <input type="number" className="w-full bg-slate-900/50 border border-slate-700 rounded md px-2 py-1 text-sm text-white focus:ring-1 focus:ring-amber-500" value={strategy.numGPUs} onChange={e => setStrategy({ ...strategy, numGPUs: Number(e.target.value) })} />
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-400 text-amber-400 flex items-center justify-between group/tt">
                                                Interconnect
                                                <div className="relative">
                                                    <Info className="w-3.5 h-3.5 text-slate-500 cursor-help" />
                                                    <div className="opacity-0 group-hover/tt:opacity-100 transition-opacity absolute bottom-full mb-2 right-0 w-48 p-3 bg-slate-800 border border-slate-700 rounded shadow-lg text-xs text-slate-300 pointer-events-none z-50">
                                                        Scaling efficiency modeling:<br /> - PCIe (~75%)<br /> - NVLink (~85%)<br /> - Infiniband (~90%)
                                                    </div>
                                                </div>
                                            </label>
                                            <select className="w-full bg-slate-900/50 border border-slate-700 rounded md px-2 py-1.5 text-sm text-white focus:ring-1 focus:ring-amber-500 mt-0.5" value={strategy.interconnect} onChange={e => setStrategy({ ...strategy, interconnect: e.target.value as 'PCIe' | 'NVLink' | 'Infiniband' })}>
                                                <option value="PCIe">PCIe</option>
                                                <option value="NVLink">NVLink</option>
                                                <option value="Infiniband">Infiniband</option>
                                            </select>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CollapsibleSection>

                    <CollapsibleSection title="Advanced Features" icon={Layers} defaultOpen={true} color="text-teal-400">
                        <div className="pt-2">
                            {/* Tabs Implementation */}
                            <div className="flex space-x-1 border-b border-slate-700 mb-4 pb-1">
                                <button onClick={() => setActiveTab('Precision')} className={`px-3 py-1.5 text-xs font-semibold rounded-t-md transition-colors ${activeTab === 'Precision' ? 'bg-slate-800 text-teal-400 border-b-2 border-teal-400 relative top-[1px]' : 'text-slate-400 hover:text-white'}`}>Precision & QAT</button>
                                <button onClick={() => setActiveTab('LoRA')} className={`px-3 py-1.5 text-xs font-semibold rounded-t-md transition-colors ${activeTab === 'LoRA' ? 'bg-slate-800 text-indigo-400 border-b-2 border-indigo-400 relative top-[1px]' : 'text-slate-400 hover:text-white'}`}>LoRA Parameter</button>
                                <button onClick={() => setActiveTab('Arch')} className={`px-3 py-1.5 text-xs font-semibold rounded-t-md transition-colors ${activeTab === 'Arch' ? 'bg-slate-800 text-rose-400 border-b-2 border-rose-400 relative top-[1px]' : 'text-slate-400 hover:text-white'}`}>Architecture</button>
                            </div>

                            {/* Tab Panels */}
                            {activeTab === 'Precision' && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300">
                                    <div>
                                        <label className="flex items-center text-sm font-medium text-slate-300 mb-2 group relative w-max">
                                            Base Precision Mode
                                            <Info className="w-3.5 h-3.5 ml-2 text-slate-500 cursor-help" />
                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full mb-2 left-0 w-64 p-3 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-300 pointer-events-none z-50">
                                                Mixed precision accelerates math and reduces VRAM dynamically (e.g., BF16, FP8 speedups). Shows exact impact to Optimizer states.
                                            </div>
                                        </label>
                                        <div className="flex bg-slate-900/50 p-1 rounded-lg border border-slate-700">
                                            {['FP32', 'FP16', 'BF16', 'FP8', 'FP4'].map(p => (
                                                <button
                                                    key={p}
                                                    className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${strategy.precision === p ? 'bg-teal-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                                                    onClick={() => setStrategy({ ...strategy, precision: p as 'FP32' | 'FP16' | 'BF16' | 'FP8' | 'FP4' })}
                                                >
                                                    {p}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="pt-2 border-t border-slate-700/50">
                                        <ToggleRow
                                            label="Quantization-Aware (QAT)"
                                            checked={strategy.enableQAT}
                                            onChange={(v) => setStrategy({ ...strategy, enableQAT: v })}
                                            tooltip="Simulates post-training quantization behavior. Drastically drops main weight VRAM footprint while keeping FP precision optimized."
                                        />
                                        {strategy.enableQAT && (
                                            <div className="pl-4 border-l-2 border-teal-500/30 mt-3 flex items-center">
                                                <label className="text-xs text-slate-400 mr-3">Bit Width Projection:</label>
                                                <select className="bg-slate-900/50 border border-slate-700 rounded md text-sm text-white pl-2 pr-6 py-1 outline-none focus:border-teal-500" value={strategy.qatBits} onChange={(e) => setStrategy({ ...strategy, qatBits: Number(e.target.value) as 4 | 8 })}>
                                                    <option value={8}>8-bit Integers</option>
                                                    <option value={4}>4-bit Block</option>
                                                </select>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'LoRA' && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300">
                                    <ToggleRow
                                        label="Enable LoRA Training"
                                        checked={strategy.enableLoRA}
                                        onChange={(v) => setStrategy({ ...strategy, enableLoRA: v })}
                                        tooltip="Low-Rank Adaptation. Freezes main weights and dramatically reduces trainable parameters to strip optimizer state VRAM bottlenecks."
                                    />
                                    {strategy.enableLoRA && (
                                        <div className="grid grid-cols-2 gap-4 pl-4 border-l-2 border-indigo-500/30 mt-3 pt-1">
                                            <div>
                                                <label className="text-xs text-slate-400">Rank Size (r)</label>
                                                <input type="number" className="w-full bg-slate-900/50 border border-slate-700 rounded md px-2 py-1 text-sm text-white focus:ring-1 focus:ring-indigo-500" value={strategy.loraRank} onChange={e => setStrategy({ ...strategy, loraRank: Number(e.target.value) })} />
                                            </div>
                                            <div>
                                                <label className="text-xs text-slate-400">% Layers Adapted</label>
                                                <input type="number" step="0.01" className="w-full bg-slate-900/50 border border-slate-700 rounded md px-2 py-1 text-sm text-white focus:ring-1 focus:ring-indigo-500" value={strategy.loraPercent} onChange={e => setStrategy({ ...strategy, loraPercent: Number(e.target.value) })} />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'Arch' && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300">
                                    <ToggleRow
                                        label="Gradient Checkpointing"
                                        checked={strategy.enableCheckpointing}
                                        onChange={(v) => setStrategy({ ...strategy, enableCheckpointing: v })}
                                        tooltip="Trades additional compute overhead (+20% time) to reduce peak activation memory thresholds by ~30%."
                                    />
                                </div>
                            )}
                        </div>
                    </CollapsibleSection>

                </div>

                {/* RIGHT PANEL: Results Dashboard */}
                <div className="lg:col-span-8 flex flex-col space-y-6">

                    {/* Top Row KPIs */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className={`glass-panel p-6 rounded-2xl relative overflow-hidden transition-all duration-300 border-2 ${results.isOOM ? 'border-red-500/50 bg-red-950/20 shadow-[0_0_30px_rgba(239,68,68,0.15)]' : 'border-emerald-500/30 bg-emerald-950/10 hover:shadow-[0_0_30px_rgba(16,185,129,0.1)]'}`}>
                            <div className="text-slate-400 text-sm font-medium mb-1">Peak VRAM / GPU</div>
                            <div className={`text-4xl font-extrabold ${results.isOOM ? 'text-red-400' : 'text-emerald-400'}`}>
                                {results.vramPerGPU.toFixed(1)} <span className="text-lg">GB</span>
                            </div>
                            <div className="mt-2 text-sm text-slate-500 flex items-center justify-between w-full">
                                <span>Max limit: {selectedGPU.vramGB} GB</span>
                                {results.isOOM && <span className="font-bold text-red-500 ml-2 animate-pulse">OOM</span>}
                            </div>

                            <div className="absolute top-4 right-4">
                                {results.isOOM ? <ShieldAlert className="w-8 h-8 text-red-500 opacity-50" /> : <CheckCircle2 className="w-8 h-8 text-emerald-500 opacity-50" />}
                            </div>
                        </div>

                        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden hover:shadow-[0_0_30px_rgba(255,255,255,0.05)] transition-all">
                            <div className="text-slate-400 text-sm font-medium mb-1">Estimated Time</div>
                            <div className="text-4xl font-extrabold text-white">
                                {results.totalTimeHours < 1 ? (results.totalTimeHours * 60).toFixed(0) + ' min' : results.totalTimeHours.toFixed(1) + ' hrs'}
                            </div>
                            {strategy.enableDDP && (
                                <div className="mt-2 text-xs text-amber-500/80 font-medium bg-amber-500/10 rounded px-2 py-1 inline-block">
                                    Scaling Efficiency: {results.efficiencyPercent.toFixed(1)}%
                                </div>
                            )}
                        </div>

                        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden hover:shadow-[0_0_30px_rgba(99,102,241,0.1)] transition-all border border-indigo-500/10">
                            <div className="text-slate-400 text-sm font-medium mb-1">Projected Cost</div>
                            <div className="text-4xl font-extrabold text-indigo-400 drop-shadow-md">
                                {sym}{(results.cost * rate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                            {results.costSavingsFP32 && results.costSavingsFP32 > 0 && (
                                <div className="mt-2 text-xs text-indigo-300 font-medium bg-indigo-500/20 rounded px-2 py-1 inline-block">
                                    Saved {sym}{(results.costSavingsFP32 * rate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} vs FP32
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Middle Row Charts (Pie + Line for Time Scaling) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-center items-center h-80 relative">
                            <h4 className="text-sm font-medium text-slate-300 w-full text-left mb-4 px-2">Memory Allocation Details</h4>
                            <div className="w-full max-h-[220px] flex justify-center">
                                <Pie
                                    data={memChartData}
                                    options={{
                                        maintainAspectRatio: false,
                                        color: '#94a3b8',
                                        plugins: { legend: { position: 'right', labels: { color: '#cbd5e1', font: { size: 11 } } } }
                                    }}
                                />
                            </div>
                        </div>

                        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-center items-center h-80 relative">
                            <h4 className="text-sm font-medium text-slate-300 w-full text-left mb-4 px-2">Total Time Scaling (vs GPUS)</h4>
                            <div className="w-full h-full max-h-[220px]">
                                <Line
                                    data={timeScalingData}
                                    options={{
                                        maintainAspectRatio: false,
                                        scales: {
                                            y: { grid: { color: '#1e293b' }, ticks: { color: '#94a3b8', callback(val) { return val + 'h' } } },
                                            x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
                                        },
                                        plugins: {
                                            legend: { display: false },
                                            tooltip: { callbacks: { label: (ctx) => Number(ctx.raw).toFixed(2) + ' hrs' } }
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Bottom Row Chart (Bar Cost Comparison) */}
                    <div className="glass-panel p-6 rounded-2xl flex flex-col justify-center items-center h-64 relative">
                        <h4 className="flex items-center text-sm font-medium text-slate-300 w-full text-left mb-4 px-2 hover:text-white transition-colors">
                            {compareMode ? <><SplitSquareHorizontal className="w-4 h-4 mr-2 text-pink-500" /> GPU Hardware Comparison (Cost)</> : 'Cumulative Cost Comparison (Baseline FP32 vs Yours)'}
                        </h4>
                        <div className="w-full h-full max-h-[160px]">
                            <Bar
                                data={costComparisonData}
                                options={{
                                    maintainAspectRatio: false,
                                    indexAxis: 'y',
                                    scales: {
                                        x: { grid: { color: '#1e293b' }, ticks: { color: '#94a3b8', callback: (val) => sym + val } },
                                        y: { grid: { display: false }, ticks: { color: '#94a3b8', font: { weight: 'normal' } } }
                                    },
                                    plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx) => sym + Number(ctx.raw).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) } } }
                                }}
                            />
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

// Reusable Collapsible wrapper for the left panel logic
function CollapsibleSection({ title, icon: Icon, children, defaultOpen = true, color = "text-indigo-400" }: { title: string, icon: React.ElementType, children: React.ReactNode, defaultOpen?: boolean, color?: string }) {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="glass-panel rounded-2xl overflow-hidden transition-all duration-300 border border-slate-700/50 shadow-sm relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 bg-slate-800/20 hover:bg-slate-800/60 transition-colors group outline-none focus:ring-1 focus:ring-slate-500"
            >
                <div className="flex items-center">
                    <Icon className={`w-5 h-5 mr-3 ${color} group-hover:scale-110 transition-transform`} />
                    <h3 className="text-base font-semibold text-white">{title}</h3>
                </div>
                {isOpen ? <ChevronDown className={`w-5 h-5 ${color} opacity-70`} /> : <ChevronRight className="w-5 h-5 text-slate-500" />}
            </button>
            {isOpen && (
                <div className="p-5 pt-2 relative animate-in fade-in zoom-in-95 duration-200">
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-slate-700 to-transparent opacity-50"></div>
                    {children}
                </div>
            )}
        </div>
    );
}

function ToggleRow({ label, checked, onChange, tooltip }: { label: string, checked: boolean, onChange: (v: boolean) => void, tooltip?: string }) {
    return (
        <div className="flex items-center justify-between group">
            <div className="flex items-center space-x-2">
                <span className="text-sm text-slate-300 group-hover:text-white transition-colors">{label}</span>
                {tooltip && (
                    <div className="relative flex items-center">
                        <Info className="w-3.5 h-3.5 text-slate-500 cursor-help" />
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full mb-2 left-0 w-56 p-2 bg-slate-800 border border-slate-700 rounded shadow-lg text-xs text-slate-300 pointer-events-none z-50">
                            {tooltip}
                        </div>
                    </div>
                )}
            </div>
            <button
                className={`w-10 h-5 rounded-full relative transition-colors shadow-inner outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500 ${checked ? 'bg-indigo-500' : 'bg-slate-700'}`}
                onClick={() => onChange(!checked)}
            >
                <span className={`absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform shadow-sm ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
        </div>
    );
}

