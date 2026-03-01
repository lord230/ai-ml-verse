import React from 'react';
import { NormalizationType } from './useNormalizationEngine';
import { ExplainerMode } from './NormalizationVisualizer';
import { Settings2, BarChart2, BookOpen } from 'lucide-react';

interface Props {
    normType: NormalizationType;
    setNormType: (t: NormalizationType) => void;
    mode: ExplainerMode;
    setMode: (m: ExplainerMode) => void;
    isNormalized: boolean;
    setIsNormalized: (n: boolean) => void;
    batchSize: number;
    setBatchSize: (b: number) => void;
    channels: number;
    setChannels: (c: number) => void;
    features: number;
    setFeatures: (f: number) => void;
    groupSize: number;
    setGroupSize: (g: number) => void;
}

export default function ControlPanel({
    normType, setNormType, mode, setMode, isNormalized, setIsNormalized,
    batchSize, setBatchSize, channels, setChannels, features, setFeatures,
    groupSize, setGroupSize
}: Props) {

    return (
        <div className="glass-panel p-6 rounded-2xl flex flex-col gap-6 border-slate-700/50 w-full">

            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-700/50 pb-4">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                    <Settings2 className="w-5 h-5 text-slate-400" />
                    Controls
                </h3>
            </div>

            {/* Mode Toggle */}
            <div className="bg-slate-900/50 p-1 rounded-xl flex shadow-inner">
                <button
                    onClick={() => setMode('beginner')}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${mode === 'beginner' ? 'bg-teal-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                >
                    <BookOpen className="w-4 h-4" /> Intuition
                </button>
                <button
                    onClick={() => setMode('advanced')}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${mode === 'advanced' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                >
                    <BarChart2 className="w-4 h-4" /> Math
                </button>
            </div>

            {/* Normalization Strategy Selector */}
            <div className="space-y-3">
                <label className="text-sm font-medium text-slate-300">Normalization Type</label>
                <div className="grid grid-cols-2 gap-2">
                    {(['batch', 'layer', 'instance', 'group'] as NormalizationType[]).map((type) => (
                        <button
                            key={type}
                            onClick={() => setNormType(type)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${normType === type
                                    ? 'bg-white text-slate-900 shadow-[0_0_15px_rgba(255,255,255,0.3)] scale-105 z-10'
                                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                }`}
                        >
                            {type.charAt(0).toUpperCase() + type.slice(1)}Norm
                        </button>
                    ))}
                </div>
            </div>

            {/* Core Interaction Override */}
            <div className="mt-2 py-4 border-t border-slate-700/50">
                <button
                    onClick={() => setIsNormalized(!isNormalized)}
                    className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all duration-500 shadow-lg ${isNormalized
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-white shadow-emerald-500/20 hover:shadow-emerald-500/40'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                >
                    {isNormalized ? 'Revert to Raw Data' : 'Apply Normalization ✨'}
                </button>
            </div>

            {/* Tensor Shape Control */}
            <div className="space-y-4 pt-4 border-t border-slate-700/50">
                <h4 className="text-sm font-medium text-slate-300">Tensor Dimensions</h4>

                <div className="space-y-2">
                    <div className="flex justify-between">
                        <label className="text-xs text-slate-400">Batch Size (N)</label>
                        <span className="text-xs font-mono text-blue-400">{batchSize}</span>
                    </div>
                    <input
                        type="range" min="1" max="8" step="1"
                        value={batchSize} onChange={(e) => setBatchSize(parseInt(e.target.value))}
                        className="w-full accent-blue-500"
                    />
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between">
                        <label className="text-xs text-slate-400">Channels (C)</label>
                        <span className="text-xs font-mono text-green-400">{channels}</span>
                    </div>
                    <input
                        type="range" min="1" max="12" step="1"
                        value={channels} onChange={(e) => setChannels(parseInt(e.target.value))}
                        className="w-full accent-green-500"
                    />
                </div>

                {normType === 'group' && (
                    <div className="space-y-2 pl-4 border-l-2 border-slate-700/50">
                        <div className="flex justify-between">
                            <label className="text-xs text-slate-400">Group Size (G)</label>
                            <span className="text-xs font-mono text-yellow-400">{groupSize}</span>
                        </div>
                        <input
                            type="range" min="1" max={channels} step="1"
                            value={groupSize} onChange={(e) => setGroupSize(parseInt(e.target.value))}
                            className="w-full accent-yellow-500"
                        />
                    </div>
                )}

                <div className="space-y-2">
                    <div className="flex justify-between">
                        <label className="text-xs text-slate-400">Features/Sequence (L)</label>
                        <span className="text-xs font-mono text-red-400">{features}</span>
                    </div>
                    <input
                        type="range" min="2" max="10" step="1"
                        value={features} onChange={(e) => setFeatures(parseInt(e.target.value))}
                        className="w-full accent-red-500"
                    />
                </div>
            </div>

        </div>
    );
}
