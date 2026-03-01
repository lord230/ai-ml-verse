import React, { useMemo } from 'react';

// Using a simple CSS-based histogram for maximum portability without heavy libraries
// though Chart.js could be used if preferred.

interface Props {
    tensor: number[][][];
    isNormalized: boolean;
}

export default function DistributionGraph({ tensor, isNormalized }: Props) {
    // Flatten tensor to get all values
    const allValues = useMemo(() => {
        const flat: number[] = [];
        tensor.forEach(b => b.forEach(c => c.forEach(v => flat.push(v))));
        return flat;
    }, [tensor]);

    // Create histogram bins
    const bins = useMemo(() => {
        const numBins = 30;
        // For raw data, typical init range is -4 to 4. For Norm, it's roughly -3 to 3.
        const min = -4;
        const max = 4;
        const step = (max - min) / numBins;

        const counts = new Array(numBins).fill(0);

        allValues.forEach(v => {
            const binIdx = Math.floor((v - min) / step);
            if (binIdx >= 0 && binIdx < numBins) {
                counts[binIdx]++;
            } else if (v >= max) {
                counts[numBins - 1]++;
            } else if (v < min) {
                counts[0]++;
            }
        });

        const maxCount = Math.max(...counts, 1);

        return counts.map((count, i) => ({
            count,
            heightPercent: (count / maxCount) * 100,
            xStart: (min + i * step).toFixed(1)
        }));
    }, [allValues]);

    // Calculate mean and variance for display
    const mean = allValues.reduce((sum, v) => sum + v, 0) / allValues.length;
    const variance = allValues.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / allValues.length;

    return (
        <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50 mt-6 relative overflow-hidden">
            <div className="flex justify-between items-center mb-4 relative z-10">
                <h4 className="text-sm font-semibold text-slate-300">Data Distribution</h4>
                <div className="text-xs space-x-3 font-mono">
                    <span className={Math.abs(mean) < 0.1 ? "text-emerald-400" : "text-amber-400"}>μ ≈ {mean.toFixed(2)}</span>
                    <span className={Math.abs(variance - 1.0) < 0.2 ? "text-emerald-400" : "text-amber-400"}>σ² ≈ {variance.toFixed(2)}</span>
                </div>
            </div>

            <div className="h-32 flex items-end gap-[1px] relative z-10">
                {bins.map((bin, i) => (
                    <div
                        key={i}
                        className={`flex-1 transition-all duration-500 rounded-t-sm relative group ${isNormalized ? 'bg-indigo-500 hover:bg-indigo-400' : 'bg-slate-600 hover:bg-slate-500'}`}
                        style={{ height: `${Math.max(1, bin.heightPercent)}%` }}
                        title={`Range: ${bin.xStart} | Count: ${bin.count}`}
                    />
                ))}
            </div>

            {/* X-Axis Labels */}
            <div className="flex justify-between text-[10px] text-slate-500 mt-2 font-mono relative z-10">
                <span>-4.0</span>
                <span>0.0</span>
                <span>+4.0</span>
            </div>

            {/* Target Bell Curve Overlay Guide */}
            {isNormalized && (
                <div className="absolute inset-0 pointer-events-none opacity-20 flex items-end z-0 px-4">
                    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-32">
                        <path d="M 0 100 Q 25 100 40 50 T 50 0 T 60 50 T 100 100" fill="transparent" stroke="#22d3ee" strokeWidth="2" />
                    </svg>
                </div>
            )}
        </div>
    );
}
