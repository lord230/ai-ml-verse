import React from 'react';
import { NormalizationType, NormStats } from './useNormalizationEngine';

interface Props {
    normType: NormalizationType;
    stats: NormStats;
    isNormalized: boolean;
}

import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

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
                <div className="flex flex-col gap-2 pt-2 text-slate-300 overflow-x-auto">
                    <div className="flex items-center gap-4">
                        <InlineMath math="\mu = \frac{1}{m} \sum_{i=1}^m x_i" />
                        <span className="text-emerald-400 opacity-80">(≈ {displayMean.toFixed(3)})</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <InlineMath math="\sigma^2 = \frac{1}{m} \sum_{i=1}^m (x_i - \mu)^2" />
                        <span className="text-emerald-400 opacity-80">(≈ {displayVar.toFixed(3)})</span>
                    </div>
                </div>

                {/* 3. Final Step Output */}
                <div className={`pt-4 border-t border-slate-700/50 transition-all duration-500 overflow-x-auto ${isNormalized ? 'text-white' : 'text-slate-500'}`}>
                    <div className="flex flex-col gap-3">
                        <BlockMath math="\hat{x}_i = \frac{x_i - \mu}{\sqrt{\sigma^2 + \epsilon}}" />
                        <BlockMath math="y_i = \gamma \hat{x}_i + \beta" />
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
