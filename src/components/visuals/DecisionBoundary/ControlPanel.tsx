"use client";

import React from 'react';
import { Play, Square, RefreshCcw, Hand, Database, Settings2, Sigma } from 'lucide-react';
import { DatasetType } from './DatasetGenerator';
import { ModelType } from './Models';

interface ControlPanelProps {
    dataset: DatasetType;
    setDataset: (d: DatasetType) => void;
    modelType: ModelType;
    setModelType: (m: ModelType) => void;
    isTraining: boolean;
    setIsTraining: (b: boolean) => void;
    resetModel: () => void;
    generateData: () => void;

    // Hyperparams
    lr: number;
    setLr: (n: number) => void;
    reg: number;
    setReg: (n: number) => void;
    noise: number;
    setNoise: (n: number) => void;

    // Canvas brush
    brushClass: number;
    setBrushClass: (c: number) => void;
}

export function ControlPanel({
    dataset, setDataset,
    modelType, setModelType,
    isTraining, setIsTraining,
    resetModel, generateData,
    lr, setLr, reg, setReg, noise, setNoise,
    brushClass, setBrushClass
}: ControlPanelProps) {

    return (
        <div className="glass-panel p-6 rounded-2xl flex flex-col space-y-8 w-full">
            <div>
                <h3 className="text-lg font-bold text-white flex items-center mb-4">
                    <Database className="w-5 h-5 mr-2 text-indigo-400" />
                    Data Setup
                </h3>

                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Dataset</label>
                        <select
                            value={dataset}
                            onChange={(e) => setDataset(e.target.value as DatasetType)}
                            className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        >
                            <option value="linear">Linearly Separable</option>
                            <option value="moons">Two Moons</option>
                            <option value="circles">Concentric Circles</option>
                            <option value="xor">XOR Pattern</option>
                            <option value="custom">Custom (Draw Points)</option>
                        </select>
                    </div>

                    {dataset === 'custom' && (
                        <div>
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Paint Brush</label>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setBrushClass(0)}
                                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all ${brushClass === 0 ? 'bg-amber-500/20 text-amber-400 border-amber-500/50' : 'bg-slate-800 text-slate-400 border-slate-700'}`}
                                >
                                    Class 0
                                </button>
                                <button
                                    onClick={() => setBrushClass(1)}
                                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all ${brushClass === 1 ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/50' : 'bg-slate-800 text-slate-400 border-slate-700'}`}
                                >
                                    Class 1
                                </button>
                            </div>
                        </div>
                    )}

                    {dataset !== 'custom' && (
                        <div>
                            <div className="flex justify-between mb-1">
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Noise</label>
                                <span className="text-xs font-mono text-indigo-300">{noise.toFixed(2)}</span>
                            </div>
                            <input
                                type="range" min="0" max="1" step="0.05"
                                value={noise} onChange={(e) => setNoise(Number(e.target.value))}
                                className="w-full accent-indigo-500"
                            />
                        </div>
                    )}

                    <button
                        onClick={generateData}
                        className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors border border-slate-600 flex items-center justify-center"
                    >
                        <RefreshCcw className="w-4 h-4 mr-2" />
                        Regenerate Data
                    </button>
                </div>
            </div>

            <hr className="border-slate-800" />

            <div>
                <h3 className="text-lg font-bold text-white flex items-center mb-4">
                    <Sigma className="w-5 h-5 mr-2 text-rose-400" />
                    Model & Training
                </h3>

                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Architecture</label>
                        <select
                            value={modelType}
                            onChange={(e) => setModelType(e.target.value as ModelType)}
                            className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none"
                        >
                            <option value="logistic">Logistic Regression</option>
                            <option value="svm">Linear SVM (Simplified)</option>
                            <option value="knn">K-Nearest Neighbors</option>
                            <option value="mlp">Neural Network (2-Layer MLP)</option>
                        </select>
                    </div>

                    {modelType !== 'knn' && (
                        <>
                            <div>
                                <div className="flex justify-between mb-1">
                                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Learning Rate</label>
                                    <span className="text-xs font-mono text-rose-300">{lr.toFixed(3)}</span>
                                </div>
                                <input
                                    type="range" min="0.001" max="0.5" step="0.005"
                                    value={lr} onChange={(e) => setLr(Number(e.target.value))}
                                    className="w-full accent-rose-500"
                                />
                            </div>

                            <div>
                                <div className="flex justify-between mb-1">
                                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">L2 Regularization</label>
                                    <span className="text-xs font-mono text-rose-300">{reg.toFixed(4)}</span>
                                </div>
                                <input
                                    type="range" min="0" max="0.1" step="0.001"
                                    value={reg} onChange={(e) => setReg(Number(e.target.value))}
                                    className="w-full accent-rose-500"
                                />
                            </div>
                        </>
                    )}

                    <div className="flex gap-2 pt-2">
                        <button
                            onClick={() => setIsTraining(!isTraining)}
                            className={`flex-1 py-3 rounded-xl flex items-center justify-center font-bold transition-all shadow-lg ${isTraining ? 'bg-rose-500/20 text-rose-400 border border-rose-500/50 hover:bg-rose-500/30' : 'bg-emerald-600 text-white hover:bg-emerald-500 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]'}`}
                        >
                            {isTraining ? (
                                <><Square className="w-5 h-5 mr-2 fill-current" /> Pause</>
                            ) : (
                                <><Play className="w-5 h-5 mr-2 fill-current" /> Train</>
                            )}
                        </button>
                        <button
                            onClick={resetModel}
                            className="px-4 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-white rounded-xl flex items-center justify-center transition-colors"
                            title="Reset Model Weights"
                        >
                            <RefreshCcw className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

        </div>
    );
}
