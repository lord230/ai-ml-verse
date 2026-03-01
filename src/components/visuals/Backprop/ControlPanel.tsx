"use client";

import React from 'react';
import { ExplainerMode } from './BackpropVisualizer';
import { Play, Pause, RotateCcw, FastForward, Settings2 } from 'lucide-react';
import LossGraph from './LossGraph';

interface Props {
    mode: ExplainerMode;
    setMode: (m: ExplainerMode) => void;
    isPlaying: boolean;
    handlePlayPause: () => void;
    currentStep: number;
    handleNext: () => void;
    handlePrev: () => void;
    speed: number;
    setSpeed: (s: number) => void;
    learningRate: number;
    setLearningRate: (lr: number) => void;
    handleReset: () => void;
    inputs: number[];
    setInputs: (i: number[]) => void;
    target: number;
    setTarget: (t: number) => void;
    lossHistory: { epoch: number, loss: number }[];
}

export default function ControlPanel({
    mode, setMode, isPlaying, handlePlayPause, currentStep, handleNext, handlePrev,
    speed, setSpeed, learningRate, setLearningRate, handleReset, inputs, setInputs, target, setTarget, lossHistory
}: Props) {
    return (
        <div className="glass-panel p-6 rounded-2xl flex flex-col lg:flex-row gap-8 border-slate-700/50 w-full mb-12">

            {/* Left Column: Core Controls */}
            <div className="flex-1 flex flex-col gap-6 lg:w-2/3">
                <div className="flex items-center justify-between border-b border-slate-700/50 pb-4">
                    <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                        <Settings2 className="w-5 h-5 text-slate-400" />
                        Controls
                    </h3>
                </div>

                {/* Mode Toggle */}
                <div className="bg-slate-900/50 p-1 rounded-xl flex shadow-inner">
                    <button
                        onClick={() => setMode('eli10')}
                        className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${mode === 'eli10' ? 'bg-violet-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                    >
                        Explain Like I'm 10
                    </button>
                    <button
                        onClick={() => setMode('advanced')}
                        className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${mode === 'advanced' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                    >
                        Advanced Math Mode
                    </button>
                </div>

                {/* Playback Controls */}
                <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                        <button
                            onClick={handlePrev}
                            disabled={currentStep === 0}
                            className="flex-1 p-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white rounded-xl transition-colors font-semibold shadow-md"
                        >
                            Prev Step
                        </button>
                        <button
                            onClick={handleNext}
                            className="flex-1 p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-colors font-semibold shadow-[0_0_15px_rgba(79,70,229,0.5)]"
                        >
                            Next Step
                        </button>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={handlePlayPause}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-colors font-semibold shadow-md ${isPlaying ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-[0_0_15px_rgba(217,119,6,0.5)]' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'}`}
                        >
                            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-1" />}
                            {isPlaying ? 'Auto-Playing...' : 'Auto Play'}
                        </button>
                        <button
                            onClick={handleReset}
                            className="p-3 bg-slate-800/50 hover:bg-slate-700 transition-colors rounded-xl text-slate-400 hover:text-white group shadow-md"
                            title="Reset Training"
                        >
                            <RotateCcw className="w-5 h-5 group-hover:-rotate-90 transition-transform duration-300" />
                        </button>
                    </div>
                </div>

                {/* Parameters */}
                <div className="space-y-4">
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <label className="text-sm text-slate-400">Learning Rate</label>
                            <span className="text-sm font-mono text-violet-400">{learningRate.toFixed(3)}</span>
                        </div>
                        <input
                            type="range"
                            min="0.01" max="1.0" step="0.01"
                            value={learningRate}
                            onChange={(e) => setLearningRate(parseFloat(e.target.value))}
                            className="w-full accent-violet-500"
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <label className="text-sm text-slate-400">Animation Speed</label>
                            <span className="text-sm font-mono text-emerald-400">{speed}x</span>
                        </div>
                        <input
                            type="range"
                            min="0.5" max="3" step="0.5"
                            value={speed}
                            onChange={(e) => setSpeed(parseFloat(e.target.value))}
                            className="w-full accent-emerald-500"
                        />
                    </div>
                </div>

                {/* Inputs & Target */}
                <div className="pt-4 border-t border-slate-700/50 space-y-4">
                    <h4 className="text-sm font-medium text-slate-300">Data Point</h4>
                    <div className="flex gap-4">
                        <div className="flex-1 grid grid-cols-3 gap-2">
                            {inputs.map((val, idx) => (
                                <div key={idx} className="flex flex-col gap-1">
                                    <span className="text-xs text-slate-500 truncate">x{idx + 1}</span>
                                    <input
                                        type="number" step="0.1"
                                        value={val} onChange={(e) => {
                                            const newInputs = [...inputs];
                                            newInputs[idx] = parseFloat(e.target.value) || 0;
                                            setInputs(newInputs);
                                        }}
                                        className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-white focus:border-violet-500 focus:outline-none"
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="flex flex-col gap-1 w-1/4">
                            <span className="text-xs text-slate-500">True Target (y)</span>
                            <input
                                type="number" step="0.1"
                                value={target} onChange={(e) => setTarget(parseFloat(e.target.value) || 0)}
                                className="bg-slate-900 border border-amber-700/50 rounded-lg p-2 text-sm text-amber-200 focus:border-amber-500 focus:outline-none"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column: Loss Curve Integration */}
            <div className="flex-1 lg:w-1/3 min-h-[300px] flex flex-col relative">
                <LossGraph history={lossHistory} />
            </div>

        </div>
    );
}
