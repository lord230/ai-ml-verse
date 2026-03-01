"use client";

import React from 'react';

interface Props {
    history: { epoch: number, loss: number }[];
}

export default function LossGraph({ history }: Props) {

    // Config for SVG Graph
    const width = 400;
    const height = 150;
    const padding = 20;

    // We only show the last N epochs so it doesn't get infinitely squished
    const maxPoints = 50;
    const displayHistory = history.slice(-maxPoints);

    let polylinePoints = "";

    if (displayHistory.length > 1) {
        const maxLoss = Math.max(...displayHistory.map(d => d.loss), 0.1);
        const minLoss = 0; // Loss is usually >= 0 (MSE)

        polylinePoints = displayHistory.map((pt, idx) => {
            const x = padding + (idx / (displayHistory.length - 1)) * (width - 2 * padding);
            const y = height - padding - ((pt.loss - minLoss) / (maxLoss - minLoss)) * (height - 2 * padding);
            return `${x},${y}`;
        }).join(" ");
    } else if (displayHistory.length === 1) {
        // If only 1 point, just draw a dot in the middle left
        polylinePoints = `${padding},${height / 2}`;
    }

    return (
        <div className="glass-panel p-6 rounded-2xl flex-1 border-slate-700/50 min-h-[200px] flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white">Loss Curve</h3>
                {history.length > 0 && (
                    <span className="text-xs font-mono text-rose-400 bg-rose-500/10 px-2 py-1 rounded">
                        Loss: {history[history.length - 1].loss.toFixed(6)}
                    </span>
                )}
            </div>

            <div className="flex-1 bg-slate-900/50 rounded-xl relative overflow-hidden flex items-center justify-center border border-slate-800/50">
                {history.length === 0 ? (
                    <span className="text-slate-500 text-sm">Start training to see loss...</span>
                ) : (
                    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" preserveAspectRatio="none">
                        {/* Grid lines */}
                        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#334155" strokeWidth="1" />
                        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#334155" strokeWidth="1" />

                        {/* Line Chart */}
                        <polyline
                            points={polylinePoints}
                            fill="none"
                            stroke="#f43f5e"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="transition-all duration-300"
                        />

                        {/* Current Point Dot */}
                        {displayHistory.length > 0 && (
                            <circle
                                cx={
                                    displayHistory.length === 1 ? padding :
                                        padding + ((displayHistory.length - 1) / (displayHistory.length - 1)) * (width - 2 * padding)
                                }
                                cy={
                                    displayHistory.length === 1 ? height / 2 :
                                        height - padding - ((displayHistory[displayHistory.length - 1].loss) / Math.max(...displayHistory.map(d => d.loss), 0.1)) * (height - 2 * padding)
                                }
                                r="4"
                                fill="#fff"
                                stroke="#f43f5e"
                                strokeWidth="2"
                                className="transition-all duration-300"
                            />
                        )}

                        {/* Axis Labels */}
                        <text x={width / 2} y={height - 2} fill="#64748b" fontSize="10" textAnchor="middle">Training Steps</text>
                        <text x={12} y={height / 2} fill="#64748b" fontSize="10" transform={`rotate(-90 12,${height / 2})`} textAnchor="middle" letterSpacing="1">Loss (MSE)</text>
                    </svg>
                )}
            </div>
        </div>
    );
}
