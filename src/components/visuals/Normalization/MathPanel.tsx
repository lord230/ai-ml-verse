import React from 'react';
import { NormalizationType, NormStats } from './useNormalizationEngine';

interface Props {
    normType: NormalizationType;
    stats: NormStats;
    isNormalized: boolean;
}

// Math formatting helper
const Frac = ({ n, d }: { n: React.ReactNode, d: React.ReactNode }) => (
    <span className="inline-flex flex-col items-center justify-center align-middle mx-1 text-[0.95em]">
        <span className="border-b border-indigo-400/60 pb-[2px] mb-[2px] leading-none px-1">{n}</span>
        <span className="leading-none pt-[1px] px-1">{d}</span>
    </span>
);

export default function MathPanel({ normType, stats, isNormalized }: Props) {

    // Select the first standard normal calculation for display as an example
    const displayMean = stats.means[0] !== undefined ? stats.means[0] : 0;
    const displayVar = stats.variances[0] !== undefined ? stats.variances[0] : 1;

    return (
        <div className="bg-slate-900/40 rounded-xl p-5 border border-slate-700/50 mt-6 relative overflow-hidden backdrop-blur-md">
            <h4 className="text-sm font-semibold text-slate-300 mb-4 border-b border-slate-700/50 pb-2">Mathematical Formulation</h4>

            <div className="space-y-4 font-mono text-sm tracking-wide">

                {/* 1. Dimensions Target */}
                <div className="flex flex-col gap-1">
                    <span className="text-xs text-slate-500 uppercase tracking-wider">Averaged Over</span>
                    <span className="text-indigo-300 font-bold bg-indigo-500/10 px-2 py-1 rounded inline-block w-max">
                        {stats.dimsUsed}
                    </span>
                </div>

                {/* 2. Mean & Variance Equations */}
                <div className="flex flex-col gap-2 pt-2">
                    <div className="flex items-center text-slate-300">
                        <span className="text-amber-400 font-bold mr-2 text-lg">μ</span> =
                        <Frac n="1" d="m" />
                        <span className="text-lg">∑</span> x<sub className="text-[10px] ml-[1px]">i</sub>
                        <span className="ml-4 text-emerald-400 opacity-80">(≈ {displayMean.toFixed(3)})</span>
                    </div>

                    <div className="flex items-center text-slate-300">
                        <span className="text-rose-400 font-bold mr-2 text-lg">σ²</span> =
                        <Frac n="1" d="m" />
                        <span className="text-lg">∑</span> (x<sub className="text-[10px] ml-[1px]">i</sub> - μ)²
                        <span className="ml-4 text-emerald-400 opacity-80">(≈ {displayVar.toFixed(3)})</span>
                    </div>
                </div>

                {/* 3. Final Step Output */}
                <div className={`pt-4 border-t border-slate-700/50 transition-all duration-500 ${isNormalized ? 'text-white' : 'text-slate-500'}`}>
                    <div className="flex items-center">
                        <span className="font-bold mr-2">x̂<sub className="text-[10px] ml-[1px]">i</sub></span> =
                        <Frac n="x - μ" d={<span>√(σ² + ε)</span>} />
                    </div>
                    <div className="flex items-center mt-2">
                        <span className="font-bold mr-2 text-cyan-400">y<sub className="text-[10px] ml-[1px]">i</sub></span> =
                        <span className="text-fuchsia-400">γ</span>x̂<sub className="text-[10px] ml-[1px]">i</sub> + <span className="text-amber-400">β</span>
                    </div>
                </div>

                {/* Epsilon note */}
                <div className="text-[10px] text-slate-500 pt-2 text-right">
                    * ε (epsilon) = 1e-5 for numerical stability
                </div>

            </div>
        </div>
    );
}
