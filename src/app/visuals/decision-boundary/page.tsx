"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Scissors, Play, RefreshCw, Shuffle } from 'lucide-react'; // Changed RotateCcw to RefreshCw, added Pause (though not used in this snippet)

type Point = { x: number; y: number; label: number };

export default function DecisionBoundaryVisual() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [points, setPoints] = useState<Point[]>([]);
    const [weights, setWeights] = useState({ w1: 0, w2: 0, b: 0 });
    const [isPlaying, setIsPlaying] = useState(false);
    const [lr, setLr] = useState(0.05);

    // This generateData creates the initial data points and resets weights
    const generateData = useCallback(() => {
        const pts: Point[] = [];
        for (let i = 0; i < 50; i++) {
            // Class 0: roughly around x=-2, y=-2
            pts.push({ x: -2 + (Math.random() - 0.5) * 3, y: -2 + (Math.random() - 0.5) * 3, label: 0 });
            // Class 1: roughly around x=2, y=2
            pts.push({ x: 2 + (Math.random() - 0.5) * 3, y: 2 + (Math.random() - 0.5) * 3, label: 1 });
        }
        setPoints(pts);
        setWeights({ w1: (Math.random() - 0.5) * 2, w2: (Math.random() - 0.5) * 2, b: (Math.random() - 0.5) * 2 });
        setIsPlaying(false);
    }, []); // No dependencies, so it's stable

    useEffect(() => {
        const t = setTimeout(() => generateData(), 0);
        return () => clearTimeout(t);
    }, [generateData]); // Correctly depends on the memoized generateData

    const sigmoid = (z: number) => 1 / (1 + Math.exp(-z));

    // Training loop using requestAnimationFrame
    useEffect(() => {
        let animationFrameId: number;

        const render = () => {
            if (isPlaying) {
                setWeights(prev => {
                    let dw1 = 0, dw2 = 0, db = 0;

                    // Full Batch Gradient Descent
                    points.forEach(p => {
                        const z = prev.w1 * p.x + prev.w2 * p.y + prev.b;
                        const pred = sigmoid(z);
                        const err = pred - p.label;

                        dw1 += err * p.x;
                        dw2 += err * p.y;
                        db += err;
                    });

                    dw1 /= points.length;
                    dw2 /= points.length;
                    db /= points.length;

                    const newW1 = prev.w1 - lr * dw1;
                    const newW2 = prev.w2 - lr * dw2;
                    const newB = prev.b - lr * db;

                    return { w1: newW1, w2: newW2, b: newB };
                });
            }
            animationFrameId = requestAnimationFrame(render);
        };

        if (isPlaying) {
            animationFrameId = requestAnimationFrame(render);
        }
        return () => cancelAnimationFrame(animationFrameId);
    }, [isPlaying, points, lr]);

    // Drawing
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;

        ctx.clearRect(0, 0, width, height);

        // Transform domain: x, y in [-5, 5]
        const mapX = (x: number) => (x + 5) * (width / 10);
        const mapY = (y: number) => height - ((y + 5) * (height / 10));

        // Draw axes
        ctx.beginPath();
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1;
        ctx.moveTo(0, mapY(0)); ctx.lineTo(width, mapY(0));
        ctx.moveTo(mapX(0), 0); ctx.lineTo(mapX(0), height);
        ctx.stroke();

        // Fill background regions
        // We can sample a grid and color it
        const step = 0.2;
        for (let x = -5; x <= 5; x += step) {
            for (let y = -5; y <= 5; y += step) {
                const z = weights.w1 * x + weights.w2 * y + weights.b;
                const pred = sigmoid(z);

                ctx.fillStyle = pred > 0.5 ? 'rgba(79, 70, 229, 0.05)' : 'rgba(245, 158, 11, 0.05)';
                ctx.fillRect(mapX(x), mapY(y + step), (width / 10) * step, (height / 10) * step);
            }
        }

        // Draw points
        points.forEach(p => {
            ctx.beginPath();
            ctx.fillStyle = p.label === 1 ? '#4f46e5' : '#f59e0b';
            ctx.strokeStyle = '#1e293b';
            ctx.lineWidth = 1;
            ctx.arc(mapX(p.x), mapY(p.y), 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        });

        // Draw Decision Boundary line: w1*x + w2*y + b = 0  => y = (-w1*x - b) / w2
        if (Math.abs(weights.w2) > 0.001) {
            ctx.beginPath();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.setLineDash([8, 4]);

            const x1 = -5;
            const y1 = (-weights.w1 * x1 - weights.b) / weights.w2;
            const x2 = 5;
            const y2 = (-weights.w1 * x2 - weights.b) / weights.w2;

            ctx.moveTo(mapX(x1), mapY(y1));
            ctx.lineTo(mapX(x2), mapY(y2));
            ctx.stroke();
            ctx.setLineDash([]);
        }

    }, [points, weights]);

    return (
        <div className="flex-1 flex flex-col p-4 md:p-8 max-w-screen-xl mx-auto w-full">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white flex items-center">
                    <Scissors className="w-8 h-8 mr-3 text-amber-500" />
                    Decision Boundary
                </h1>
                <p className="text-slate-400 mt-2">
                    Logistic Regression fitting process. Watch the separating hyperplane move and tilt as gradient descent
                    adjusts the weights to separate the two point classes.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 glass-panel p-6 rounded-2xl flex flex-col">
                    <h3 className="text-lg font-semibold text-white mb-6">Controls</h3>

                    <div className="space-y-6">
                        <div className="flex space-x-4 pt-2">
                            <button
                                onClick={() => setIsPlaying(!isPlaying)}
                                className="flex-1 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg flex items-center justify-center transition-colors shadow-[0_0_10px_rgba(245,158,11,0.3)]"
                            >
                                <Play className="w-4 h-4 mr-2" />
                                {isPlaying ? 'Pause' : 'Train'}
                            </button>
                            <button
                                onClick={generateData}
                                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg flex items-center justify-center transition-colors border border-slate-600"
                                title="Regenerate Data & Reset"
                            >
                                <Shuffle className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700 mt-6">
                            <div className="text-xs text-slate-400 mb-1">Weight 1 (X)</div>
                            <div className="text-lg font-mono text-white mb-3">{weights.w1.toFixed(3)}</div>

                            <div className="text-xs text-slate-400 mb-1">Weight 2 (Y)</div>
                            <div className="text-lg font-mono text-white mb-3">{weights.w2.toFixed(3)}</div>

                            <div className="text-xs text-slate-400 mb-1">Bias</div>
                            <div className="text-lg font-mono text-white">{weights.b.toFixed(3)}</div>
                        </div>

                        <div>
                            <div className="flex justify-between mb-2 mt-4">
                                <label className="text-sm font-medium text-slate-300">Learning Rate</label>
                                <span className="text-amber-400 font-mono text-sm">{lr.toFixed(3)}</span>
                            </div>
                            <input
                                type="range"
                                min="0.01" max="0.5" step="0.01"
                                className="w-full accent-amber-500"
                                value={lr}
                                onChange={(e) => setLr(Number(e.target.value))}
                            />
                        </div>

                    </div>
                </div>

                <div className="lg:col-span-2 glass-panel p-6 rounded-2xl flex items-center justify-center min-h-[500px] relative overflow-hidden">
                    <canvas
                        ref={canvasRef}
                        width={700}
                        height={500}
                        className="w-full max-w-full rounded-lg bg-slate-950"
                    />
                </div>
            </div>
        </div>
    );
}
