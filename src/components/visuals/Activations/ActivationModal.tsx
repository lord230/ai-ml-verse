'use client';

import React, { useState, useEffect } from 'react';
import { ActivationFunction, ACTIVATIONS } from '@/lib/math/activations';
import { InteractiveGraph } from './InteractiveGraph';
import { NNEffectDemo } from './NNEffectDemo';
import { X, Settings2, SigmaSquare, Activity, ChevronDown, ListFilter, Beaker } from 'lucide-react';
import 'katex/dist/katex.min.css';
import { BlockMath } from 'react-katex';

interface ActivationModalProps {
    activation: ActivationFunction | null;
    onClose: () => void;
}

export const ActivationModal: React.FC<ActivationModalProps> = ({ activation, onClose }) => {
    const [isAdvancedMode, setIsAdvancedMode] = useState(false);
    const [animatedX, setAnimatedX] = useState<number>(0);
    const [isAnimating, setIsAnimating] = useState(true);
    const [params, setParams] = useState<Record<string, number>>({});

    // New States for comparison feature
    const [compareId, setCompareId] = useState<string | 'none'>('none');
    const [showDerivToggle, setShowDerivToggle] = useState(false);

    // Reset state when activation changes
    useEffect(() => {
        if (activation) {
            const initialParams: Record<string, number> = {};
            activation.params?.forEach(p => {
                initialParams[p.id] = p.default;
            });
            setParams(initialParams);
            setAnimatedX(-5);
            setIsAnimating(true);
            setCompareId('none');
            // Show derivative by default if advanced mode
            setShowDerivToggle(isAdvancedMode);
        }
    }, [activation]);

    // Track advanced mode changes
    useEffect(() => {
        if (isAdvancedMode) {
            setShowDerivToggle(true);
        } else {
            setShowDerivToggle(false);
        }
    }, [isAdvancedMode]);

    // Handle background click to close
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    // Sweep animation for the big graph
    useEffect(() => {
        if (!activation || !isAnimating) return;

        let frame: number;
        let lastTime = performance.now();
        let direction = 1;

        const animate = (time: number) => {
            const dt = time - lastTime;
            lastTime = time;

            setAnimatedX(prev => {
                let nextX = prev + (dt * 0.003) * direction;
                if (nextX > 5) {
                    nextX = 5;
                    direction = -1;
                } else if (nextX < -5) {
                    nextX = -5;
                    direction = 1;
                }
                return nextX;
            });
            frame = requestAnimationFrame(animate);
        };

        frame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(frame);
    }, [activation, isAnimating]);


    if (!activation) return null;

    const currentFn = (x: number) => activation.fn(x, params);
    const currentDerivativeFn = (x: number) => activation.derivativeFn(x, params);

    // Comparison
    const compareAct = ACTIVATIONS.find(a => a.id === compareId);
    const compareFn = compareAct ? (x: number) => compareAct.fn(x) : undefined;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-hidden">
            {/* Dark blur Backdrop */}
            <div
                className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl transition-opacity duration-300"
                onClick={onClose}
            >
                {/* Subtle background particles or glows */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
            </div>

            {/* Modal Box */}
            <div className="relative w-full max-w-[1400px] bg-slate-900/90 border border-slate-700/60 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[90vh] lg:h-[85vh] animate-in fade-in zoom-in-95 duration-300 backdrop-blur-md">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900/80 z-10 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500/20 to-cyan-500/10 flex items-center justify-center border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                            <SigmaSquare className="w-6 h-6 text-purple-400" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black font-sans tracking-tight text-white flex items-center gap-3 drop-shadow-sm">
                                {activation.name}
                                <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded-md border border-cyan-400/20">
                                    Range: {activation.outputRange}
                                </span>
                            </h2>
                            <p className="text-sm text-slate-400 mt-1 font-medium">{activation.shortDesc}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">

                        {/* Close button */}
                        <button
                            onClick={onClose}
                            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-all hover:rotate-90"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Content Body - 3 Columns */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">

                        {/* ---------------------------------------------------------------- */}
                        {/* LEFT COLUMN: Concept + Formula (lg:col-span-3)                    */}
                        {/* ---------------------------------------------------------------- */}
                        <div className="lg:col-span-3 flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-2 pb-6">

                            {/* Mode Toggle */}
                            <div className="bg-slate-800/40 p-1.5 rounded-xl border border-slate-700/50 flex relative">
                                <div
                                    className="absolute inset-y-1.5 w-[calc(50%-6px)] bg-slate-700 rounded-lg shadow transition-all duration-300"
                                    style={{ left: isAdvancedMode ? 'calc(50% + 3px)' : '6px' }}
                                />
                                <button
                                    onClick={() => setIsAdvancedMode(false)}
                                    className={`relative z-10 flex-1 py-1.5 text-sm font-semibold transition-colors ${!isAdvancedMode ? 'text-white' : 'text-slate-400 hover:text-slate-300'}`}
                                >
                                    Beginner
                                </button>
                                <button
                                    onClick={() => setIsAdvancedMode(true)}
                                    className={`relative z-10 flex-1 py-1.5 text-sm font-semibold transition-colors ${isAdvancedMode ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-300'}`}
                                >
                                    Advanced
                                </button>
                            </div>

                            {/* Explanation Box */}
                            <div className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700/50">
                                <h3 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2 uppercase tracking-wide">
                                    <span className="w-1.5 h-4 bg-purple-500 rounded-full inline-block"></span>
                                    Overview
                                </h3>
                                <p className="text-slate-300 text-sm leading-relaxed">
                                    {isAdvancedMode ? activation.advancedDesc : activation.shortDesc}
                                </p>
                            </div>

                            {/* Math Formula block */}
                            <div className="bg-slate-900/80 rounded-2xl p-6 border border-slate-700 shadow-inner">
                                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <ListFilter className="w-4 h-4" />
                                    Definition
                                </h3>
                                <div className="space-y-4 font-sans">
                                    <div>
                                        <div className="text-xs text-slate-400 mb-2">Function f(x):</div>
                                        <div className="text-base text-purple-300 bg-black/40 px-4 py-2 rounded-xl border border-purple-500/20 shadow-inner overflow-x-auto">
                                            <BlockMath math={activation.formula} />
                                        </div>
                                    </div>

                                    {/* Gradient Behavior (Collapsible in Advanced mode) */}
                                    {isAdvancedMode && (
                                        <div className="animate-in fade-in slide-in-from-top-2 duration-400 mt-6 pt-6 border-t border-slate-800">
                                            <div className="text-xs font-bold text-cyan-500/80 mb-2 uppercase tracking-wide">Gradient Behavior</div>
                                            <p className="text-[11px] text-slate-400 mb-2 font-sans leading-relaxed">
                                                The derivative determines how gradients pass backwards during backpropagation.
                                            </p>
                                            <div className="text-sm text-cyan-300 bg-black/40 px-4 py-2 rounded-xl border border-cyan-500/20 shadow-inner overflow-x-auto">
                                                <BlockMath math={activation.derivativeFormula} />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                        </div>

                        {/* ---------------------------------------------------------------- */}
                        {/* CENTER COLUMN: Interactive Graph (lg:col-span-6)                  */}
                        {/* ---------------------------------------------------------------- */}
                        <div className="lg:col-span-6 flex flex-col gap-4">

                            {/* Graph Controls */}
                            <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-800/40 p-3 rounded-2xl border border-slate-700/50">
                                <div className="flex gap-4 items-center">
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            checked={showDerivToggle}
                                            onChange={(e) => setShowDerivToggle(e.target.checked)}
                                            className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-slate-900"
                                        />
                                        <span className="text-sm font-medium text-slate-300 group-hover:text-cyan-400 transition-colors">Show Derivative</span>
                                    </label>
                                </div>

                                {/* Compare Dropdown */}
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-slate-500 font-medium">Compare with:</span>
                                    <div className="relative">
                                        <select
                                            value={compareId}
                                            onChange={(e) => setCompareId(e.target.value)}
                                            className="appearance-none bg-slate-900 border border-slate-700 text-slate-300 text-sm rounded-lg pl-3 pr-8 py-1.5 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                                        >
                                            <option value="none">None</option>
                                            <optgroup label="Functions">
                                                {ACTIVATIONS.filter(a => a.id !== activation.id).map(a => (
                                                    <option key={a.id} value={a.id}>{a.name}</option>
                                                ))}
                                            </optgroup>
                                        </select>
                                        <ChevronDown className="w-3 h-3 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    </div>
                                </div>
                            </div>

                            {/* Graph Container */}
                            <div className="relative flex-1 min-h-[400px] w-full bg-slate-950 rounded-3xl border border-slate-700 overflow-hidden shadow-[inset_0_2px_20px_rgba(0,0,0,0.5)] group">

                                {/* Inner coordinate labels */}
                                <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-slate-900/80 to-transparent z-10 flex justify-between px-6 pt-4 pointer-events-none">
                                    <span className="text-xs font-mono text-slate-500">-5</span>
                                    <span className="text-xs font-mono text-slate-500">+5</span>
                                </div>
                                <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-slate-900/80 to-transparent z-10 flex flex-col justify-between items-end pb-6 pr-4 pointer-events-none">
                                    <span className="text-xs font-mono text-slate-500">+2</span>
                                    <span className="text-xs font-mono text-slate-500">-2</span>
                                </div>

                                <InteractiveGraph
                                    fn={currentFn}
                                    derivativeFn={currentDerivativeFn}
                                    showDerivative={showDerivToggle}
                                    compareFn={compareFn}
                                    animatedValueX={animatedX}
                                    className="cursor-crosshair w-full h-full"
                                />

                                {/* Interactive region to track mouse */}
                                <div
                                    className="absolute inset-0 z-20"
                                    onMouseMove={(e) => {
                                        setIsAnimating(false);
                                        const rect = e.currentTarget.getBoundingClientRect();
                                        const xPos = (e.clientX - rect.left) / rect.width;
                                        setAnimatedX(xPos * 10 - 5);
                                    }}
                                    onMouseLeave={() => setIsAnimating(true)}
                                />

                                {/* Floating Legend Panel */}
                                <div className="absolute bottom-6 right-6 bg-slate-900/90 backdrop-blur-md border border-slate-700 p-4 rounded-xl shadow-2xl z-30 pointer-events-none text-xs font-mono min-w-[160px]">
                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 bg-purple-500 rounded-sm shadow-[0_0_8px_rgba(168,85,247,0.6)]"></div>
                                                <span className="text-slate-300 font-bold">f(x)</span>
                                            </div>
                                            <span className="text-purple-300">{currentFn(animatedX).toFixed(3)}</span>
                                        </div>

                                        {showDerivToggle && (
                                            <div className="flex items-center justify-between gap-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3 h-0.5 border-t-2 border-dashed border-cyan-400"></div>
                                                    <span className="text-slate-400 font-bold">f'(x)</span>
                                                </div>
                                                <span className="text-cyan-300">{currentDerivativeFn(animatedX).toFixed(3)}</span>
                                            </div>
                                        )}

                                        {compareFn && compareAct && (
                                            <div className="flex items-center justify-between gap-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3 h-0.5 border-t-2 border-dashed border-amber-500"></div>
                                                    <span className="text-slate-400 font-bold truncate max-w-[60px]" title={compareAct.name}>{compareAct.name}</span>
                                                </div>
                                                <span className="text-amber-400">{compareFn(animatedX)?.toFixed(3) ?? '0.000'}</span>
                                            </div>
                                        )}

                                        <div className="mt-2 pt-2 border-t border-slate-700 flex justify-between gap-4 text-slate-500 font-bold">
                                            <span>Input x:</span>
                                            <span>{animatedX.toFixed(3)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ---------------------------------------------------------------- */}
                        {/* RIGHT COLUMN: Controls (lg:col-span-3)                            */}
                        {/* ---------------------------------------------------------------- */}
                        <div className="lg:col-span-3 flex flex-col gap-6">

                            {/* Parameters Control Panel */}
                            <div className="bg-slate-800/30 rounded-3xl p-6 border border-slate-700/50 flex-none h-auto">
                                <h3 className="text-sm font-bold text-slate-200 mb-6 flex items-center gap-2 uppercase tracking-wide">
                                    <Settings2 className="w-4 h-4 text-amber-500" />
                                    Parameters
                                </h3>

                                {activation.params && activation.params.length > 0 ? (
                                    <div className="space-y-6">
                                        {activation.params.map(param => (
                                            <div key={param.id} className="flex flex-col gap-3 group">
                                                <div className="flex justify-between items-end">
                                                    <div className="flex flex-col">
                                                        <span className="text-xs text-slate-400">{param.name}</span>
                                                        <span className="text-sm font-mono text-amber-400 font-bold flex items-center gap-2">
                                                            <span className="bg-slate-900 px-1 py-0.5 rounded text-xs border border-slate-700 text-amber-500/80">{param.symbol}</span>
                                                            = {params[param.id]?.toFixed(2) ?? param.default}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="relative isolate px-1">
                                                    <input
                                                        type="range"
                                                        min={param.min}
                                                        max={param.max}
                                                        step={param.step}
                                                        value={params[param.id] ?? param.default}
                                                        onChange={(e) => setParams(prev => ({ ...prev, [param.id]: parseFloat(e.target.value) }))}
                                                        className="w-full accent-amber-500 bg-slate-900 rounded-lg appearance-none h-2 cursor-pointer outline-none shadow-inner"
                                                    />
                                                </div>
                                                <div className="flex justify-between text-[10px] text-slate-500 font-mono px-1">
                                                    <span>{param.min}</span>
                                                    <span>{param.max}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center p-6 text-center border border-dashed border-slate-700 rounded-xl bg-slate-900/50">
                                        <Beaker className="w-8 h-8 text-slate-600 mb-2" />
                                        <p className="text-xs text-slate-500">This activation function has no learned or adjustable parameters.</p>
                                    </div>
                                )}
                            </div>

                            {/* Demo flow takes remaining height */}
                            <div className="flex-1 min-h-[250px] relative">
                                <div className="absolute inset-0">
                                    <NNEffectDemo fn={currentFn} />
                                </div>
                            </div>

                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};
