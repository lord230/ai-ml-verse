"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { TrendingDown, Play, RefreshCw, Info, Settings2, Activity, Layers } from 'lucide-react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

// Synthetic Dataset for Linear Regression: y = 2x + 1
const DATA_X = [-2, -1, 0, 1, 2];
const DATA_Y = [-3, -1, 1, 3, 5];
const M = DATA_X.length;

function computeCost(t0: number, t1: number) {
    let sum = 0;
    for (let i = 0; i < M; i++) {
        const h = t0 + t1 * DATA_X[i];
        sum += (h - DATA_Y[i]) ** 2;
    }
    return sum / (2 * M);
}

function computeGradient(t0: number, t1: number) {
    let dt0 = 0;
    let dt1 = 0;
    for (let i = 0; i < M; i++) {
        const h = t0 + t1 * DATA_X[i];
        const error = h - DATA_Y[i];
        dt0 += error;
        dt1 += error * DATA_X[i];
    }
    return { dt0: dt0 / M, dt1: dt1 / M };
}

export default function GradientDescentExplorer() {
    // Canvas Refs
    const canvas3DRef = useRef<HTMLCanvasElement>(null);
    const canvasContourRef = useRef<HTMLCanvasElement>(null);

    // Hyperparameters
    const [lr, setLr] = useState(0.05);
    const [initT0, setInitT0] = useState(-4);
    const [initT1, setInitT1] = useState(-4);

    // State
    const [history, setHistory] = useState<{ t0: number, t1: number, cost: number }[]>(() => {
        return [{ t0: -4, t1: -4, cost: computeCost(-4, -4) }];
    });
    const [isPlaying, setIsPlaying] = useState(false);

    // 3D Camera/View State
    const [viewAngle, setViewAngle] = useState({ yaw: Math.PI / 4, pitch: Math.PI / 6 });
    const [isDragging, setIsDragging] = useState(false);
    const lastMouse = useRef({ x: 0, y: 0 });

    // Contour pre-rendered grid (optimization)
    const contourGrid = useMemo(() => {
        const grid = [];
        for (let i = 0; i < 50; i++) {
            const row = [];
            for (let j = 0; j < 50; j++) {
                // map 0..50 to -5..5
                const t0 = (j / 49) * 10 - 5;
                const t1 = (i / 49) * 10 - 5; // y-axis is usually flipped in canvas but we'll map carefully
                row.push(computeCost(t0, t1));
            }
            grid.push(row);
        }
        return grid;
    }, []);

    // Initialize or Reset
    const resetSimulation = useCallback(() => {
        const cost = computeCost(initT0, initT1);
        setHistory([{ t0: initT0, t1: initT1, cost }]);
        setIsPlaying(false);
    }, [initT0, initT1]);

    // Gradient Descent Animation Loop
    useEffect(() => {
        let animationFrameId: number;
        let lastTime = 0;

        const render = (time: number) => {
            if (time - lastTime > 100 && isPlaying) {
                lastTime = time;
                setHistory(prev => {
                    if (prev.length === 0) return prev;
                    const current = prev[prev.length - 1];
                    const { dt0, dt1 } = computeGradient(current.t0, current.t1);

                    const newT0 = current.t0 - lr * dt0;
                    const newT1 = current.t1 - lr * dt1;
                    const newCost = computeCost(newT0, newT1);

                    // Stop if diverged or converged
                    const dist = Math.sqrt(dt0 * dt0 + dt1 * dt1);
                    if (dist < 0.005 || prev.length > 500 || newCost > 1000 || isNaN(newCost)) {
                        setIsPlaying(false);
                        return prev;
                    }

                    return [...prev, { t0: newT0, t1: newT1, cost: newCost }];
                });
            }
            if (isPlaying) {
                animationFrameId = requestAnimationFrame(render);
            }
        };

        if (isPlaying) {
            animationFrameId = requestAnimationFrame(render);
        }
        return () => cancelAnimationFrame(animationFrameId);
    }, [isPlaying, lr]);

    // Render 3D Surface
    useEffect(() => {
        const canvas = canvas3DRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;
        ctx.clearRect(0, 0, width, height);

        // Project 3D to 2D
        const project = (x: number, y: number, z: number) => {
            const scale = width / 18; // fits [-5, 5]
            const sx = x * scale;
            const sy = (y / 2.5) * scale; // Squash height heavily so we don't block the screen
            const sz = z * scale;

            // Yaw
            const x1 = sx * Math.cos(viewAngle.yaw) - sz * Math.sin(viewAngle.yaw);
            const z1 = sx * Math.sin(viewAngle.yaw) + sz * Math.cos(viewAngle.yaw);

            // Pitch
            const y2 = sy * Math.cos(viewAngle.pitch) - z1 * Math.sin(viewAngle.pitch);
            const z2 = sy * Math.sin(viewAngle.pitch) + z1 * Math.cos(viewAngle.pitch);

            return {
                px: width / 2 + x1,
                py: height / 2 - y2 + 100, // shift down
                depth: z2
            };
        };

        type Polygon = {
            points: { px: number, py: number }[],
            depth: number,
            avgY: number
        };
        const polygons: Polygon[] = [];
        const range = 5;
        const step = 0.5;

        for (let t0 = -range; t0 < range; t0 += step) {
            for (let t1 = -range; t1 < range; t1 += step) {
                const y1 = computeCost(t0, t1);
                const y2 = computeCost(t0 + step, t1);
                const y3 = computeCost(t0 + step, t1 + step);
                const y4 = computeCost(t0, t1 + step);

                // Cap max Y for drawing to prevent massive polygon stretching at edges
                const capY = (val: number) => Math.min(val, 40);

                const p1 = project(t0, capY(y1), t1);
                const p2 = project(t0 + step, capY(y2), t1);
                const p3 = project(t0 + step, capY(y3), t1 + step);
                const p4 = project(t0, capY(y4), t1 + step);

                polygons.push({
                    points: [p1, p2, p3, p4],
                    depth: (p1.depth + p2.depth + p3.depth + p4.depth) / 4,
                    avgY: (y1 + y2 + y3 + y4) / 4
                });
            }
        }

        // Painter's algorithm
        polygons.sort((a, b) => b.depth - a.depth);

        const maxY = 40; // Max visual height mapped to colors

        polygons.forEach(poly => {
            ctx.beginPath();
            ctx.moveTo(poly.points[0].px, poly.points[0].py);
            ctx.lineTo(poly.points[1].px, poly.points[1].py);
            ctx.lineTo(poly.points[2].px, poly.points[2].py);
            ctx.lineTo(poly.points[3].px, poly.points[3].py);
            ctx.closePath();

            const normalized = Math.max(0, Math.min(1, poly.avgY / maxY));

            // Slate to Rose to Amber gradient based on height
            const r = Math.floor(15 + normalized * (240 - 15));
            const g = Math.floor(23 + normalized * (150 - 23));
            const b = Math.floor(42 + normalized * (20 - 42));

            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.9)`;
            ctx.fill();

            ctx.strokeStyle = `rgba(255, 255, 255, 0.05)`;
            ctx.stroke();
        });

        // Axes (roughly projected around [0,0,0])
        const ptT0 = project(5, Math.min(computeCost(5, 0), 40), 0);
        const ptT1 = project(0, Math.min(computeCost(0, 5), 40), 5);

        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(project(-5, 0, 0).px, project(-5, 0, 0).py);
        ctx.lineTo(project(5, 0, 0).px, project(5, 0, 0).py);
        ctx.moveTo(project(0, 0, -5).px, project(0, 0, -5).py);
        ctx.lineTo(project(0, 0, 5).px, project(0, 0, 5).py);
        ctx.stroke();

        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.font = '12px Courier';
        ctx.fillText('θ₀', ptT0.px + 5, ptT0.py);
        ctx.fillText('θ₁', ptT1.px + 5, ptT1.py);

        // Path
        if (history.length > 0) {
            ctx.beginPath();
            ctx.strokeStyle = '#38bdf8'; // sky blue
            ctx.lineWidth = 3;

            history.forEach((h, i) => {
                const p = project(h.t0, Math.min(h.cost, 40) + 0.5, h.t1);
                if (i === 0) ctx.moveTo(p.px, p.py);
                else ctx.lineTo(p.px, p.py);
            });
            ctx.stroke();

            // Current sphere
            history.forEach((h, i) => {
                const p = project(h.t0, Math.min(h.cost, 40) + 0.5, h.t1);
                const isLast = i === history.length - 1;

                ctx.beginPath();
                ctx.arc(p.px, p.py, isLast ? 6 : 2, 0, Math.PI * 2);
                ctx.fillStyle = isLast ? '#fbbf24' : '#0ea5e9';
                ctx.fill();

                if (isLast) {
                    ctx.shadowBlur = 10;
                    ctx.shadowColor = '#fbbf24';
                    ctx.fill();
                    ctx.shadowBlur = 0;
                    ctx.strokeStyle = '#fff';
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            });
        }
    }, [history, viewAngle]);

    // Render 2D Contour Map
    useEffect(() => {
        const canvas = canvasContourRef.current;
        if (!canvas || contourGrid.length === 0) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const w = canvas.width;
        const h = canvas.height;
        ctx.clearRect(0, 0, w, h);

        const cellW = w / 50;
        const cellH = h / 50;
        const maxY = 40;

        // Draw heat grid
        for (let i = 0; i < 50; i++) {
            for (let j = 0; j < 50; j++) {
                const val = contourGrid[i][j];
                const normalized = Math.max(0, Math.min(1, val / maxY));
                const r = Math.floor(15 + normalized * (240 - 15));
                const g = Math.floor(23 + normalized * (150 - 23));
                const b = Math.floor(42 + normalized * (20 - 42));

                ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
                // i maps to t1 (y-axis inverted), j maps to t0 (x-axis)
                // canvas top is 0, so T1=5 is at top (i=0 -> canvasY=0, T1=5. if i=0, i maps to t1=-5 normally. Let's flip mapping).
                ctx.fillRect(j * cellW, i * cellH, cellW, cellH);
            }
        }

        // Add axes crosshair
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.beginPath();
        ctx.moveTo(0, h / 2); ctx.lineTo(w, h / 2);
        ctx.moveTo(w / 2, 0); ctx.lineTo(w / 2, h);
        ctx.stroke();

        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.font = '10px Courier';
        ctx.fillText('θ₀', w - 15, h / 2 - 5);
        ctx.fillText('θ₁', w / 2 + 5, 10);
        ctx.fillText('(1, 2) Min', w / 2 + (1 / 5) * (w / 2) + 5, h / 2 - (2 / 5) * (h / 2) - 5);

        // Draw optimal point at (1, 2)
        const optX = ((1 + 5) / 10) * w;
        const optY = ((5 - 2) / 10) * h; // flip y
        ctx.beginPath();
        ctx.arc(optX, optY, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#10b981'; // emerald
        ctx.fill();

        // Draw trajectory
        if (history.length > 0) {
            ctx.beginPath();
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 2;
            history.forEach((p, i) => {
                const cx = ((p.t0 + 5) / 10) * w;
                const cy = ((5 - p.t1) / 10) * h; // flip y
                if (i === 0) ctx.moveTo(cx, cy);
                else ctx.lineTo(cx, cy);
            });
            ctx.stroke();

            // Current point
            history.forEach((p, i) => {
                const isLast = i === history.length - 1;
                const cx = ((p.t0 + 5) / 10) * w;
                const cy = ((5 - p.t1) / 10) * h;

                ctx.beginPath();
                ctx.arc(cx, cy, isLast ? 5 : 1, 0, Math.PI * 2);
                ctx.fillStyle = isLast ? '#fbbf24' : '#fff';
                ctx.fill();
            });
        }
    }, [contourGrid, history]);

    // 3D Canvas Interaction
    const handlePointerDown = (clientX: number, clientY: number) => {
        setIsDragging(true);
        lastMouse.current = { x: clientX, y: clientY };
    };

    const handlePointerMove = (clientX: number, clientY: number) => {
        if (!isDragging) return;
        const dx = clientX - lastMouse.current.x;
        const dy = clientY - lastMouse.current.y;
        lastMouse.current = { x: clientX, y: clientY };

        setViewAngle(prev => ({
            yaw: prev.yaw - dx * 0.01,
            pitch: Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, prev.pitch + dy * 0.01))
        }));
    };

    const handlePointerUp = () => setIsDragging(false);

    // Chart Data Preparation
    const costChartData = useMemo(() => {
        return {
            labels: history.map((_, i) => i.toString()),
            datasets: [{
                label: 'Cost (MSE)',
                data: history.map(h => h.cost),
                borderColor: '#e11d48',
                backgroundColor: 'rgba(225, 29, 72, 0.2)',
                borderWidth: 2,
                pointRadius: 0,
                fill: true,
                tension: 0.1
            }]
        };
    }, [history]);

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 0 },
        scales: {
            x: {
                grid: { color: 'rgba(255,255,255,0.05)' },
                ticks: { color: 'rgba(255,255,255,0.5)' }
            },
            y: {
                grid: { color: 'rgba(255,255,255,0.05)' },
                ticks: { color: 'rgba(255,255,255,0.5)' }
            }
        },
        plugins: {
            legend: { labels: { color: 'rgba(255,255,255,0.8)' } }
        }
    };

    const currentPos = history.length > 0 ? history[history.length - 1] : { t0: 0, t1: 0, cost: 0 };
    const isDiverged = currentPos.cost > 1000 || isNaN(currentPos.cost);

    return (
        <div className="min-h-screen bg-[#0f172a] p-4 md:p-8">
            <div className="max-w-screen-2xl mx-auto w-full">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold text-white flex items-center mb-2">
                        <TrendingDown className="w-8 h-8 mr-3 text-rose-500" />
                        Gradient Descent 3D Explorer
                    </h1>
                    <p className="text-slate-400 max-w-3xl">
                        Optimize a Linear Regression model $<span className="font-mono">h(x) = θ₀ + θ₁x</span>$ on a synthetic dataset.
                        Watch how the parameters $θ₀$ and $θ₁$ slide down the 3D Mean Squared Error (MSE) cost surface to find the global minimum.
                    </p>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">

                    {/* Left Column: Theory & Controls */}
                    <div className="xl:col-span-3 space-y-6">

                        {/* Status/Control Card */}
                        <div className="glass-panel p-6 rounded-2xl border border-slate-700 bg-slate-900/80 shadow-xl">
                            <h3 className="text-lg font-bold text-white mb-5 flex items-center">
                                <Settings2 className="w-5 h-5 mr-2 text-indigo-400" /> Model Hyperparameters
                            </h3>

                            <div className="space-y-6">
                                <div>
                                    <div className="flex justify-between mb-1">
                                        <label className="text-sm font-semibold text-slate-300">Initial Bias (θ₀)</label>
                                        <span className="text-slate-400 font-mono text-sm">{initT0.toFixed(2)}</span>
                                    </div>
                                    <input
                                        type="range" min="-5" max="5" step="0.5"
                                        className="w-full accent-indigo-500"
                                        value={initT0}
                                        onChange={(e) => {
                                            const val = parseFloat(e.target.value);
                                            setInitT0(val);
                                            setHistory([{ t0: val, t1: initT1, cost: computeCost(val, initT1) }]);
                                        }}
                                        disabled={isPlaying}
                                    />
                                </div>
                                <div>
                                    <div className="flex justify-between mb-1">
                                        <label className="text-sm font-semibold text-slate-300">Initial Weight (θ₁)</label>
                                        <span className="text-slate-400 font-mono text-sm">{initT1.toFixed(2)}</span>
                                    </div>
                                    <input
                                        type="range" min="-5" max="5" step="0.5"
                                        className="w-full accent-indigo-500"
                                        value={initT1}
                                        onChange={(e) => {
                                            const val = parseFloat(e.target.value);
                                            setInitT1(val);
                                            setHistory([{ t0: initT0, t1: val, cost: computeCost(initT0, val) }]);
                                        }}
                                        disabled={isPlaying}
                                    />
                                </div>
                                <div className="border-t border-slate-700 pt-6">
                                    <div className="flex justify-between mb-1">
                                        <label className="text-sm font-semibold text-slate-300">Learning Rate (α)</label>
                                        <span className="text-rose-400 font-mono text-sm">{lr.toFixed(3)}</span>
                                    </div>
                                    <input
                                        type="range" min="0.005" max="0.1" step="0.005"
                                        className="w-full accent-rose-500"
                                        value={lr}
                                        onChange={(e) => setLr(parseFloat(e.target.value))}
                                    />
                                </div>

                                <div className="flex space-x-3 pt-4 border-t border-slate-800">
                                    <button
                                        onClick={() => setIsPlaying(!isPlaying)}
                                        className={`flex-1 py-3 px-4 ${isPlaying ? 'bg-amber-600 hover:bg-amber-500' : 'bg-rose-600 hover:bg-rose-500'} text-white font-bold rounded-xl flex items-center justify-center transition-all shadow-lg`}
                                    >
                                        <Play className="w-4 h-4 mr-2" /> {isPlaying ? 'Pause' : 'Start Descent'}
                                    </button>
                                    <button
                                        onClick={resetSimulation}
                                        className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl flex items-center justify-center transition-colors border border-slate-600 shadow-lg"
                                        title="Reset"
                                    >
                                        <RefreshCw className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Real-time Metrics Card */}
                        <div className="glass-panel p-5 rounded-2xl border border-slate-700 bg-slate-900/50">
                            <h3 className="text-sm font-bold text-slate-400 mb-3 uppercase tracking-wider">Live Metrics</h3>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                                    <div className="text-xs text-slate-500 mb-1">Current Loss (MSE)</div>
                                    <div className="text-xl font-mono text-white">{(currentPos.cost).toFixed(4)}</div>
                                </div>
                                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                                    <div className="text-xs text-slate-500 mb-1">Epochs (Steps)</div>
                                    <div className="text-xl font-mono text-white">{history.length - 1}</div>
                                </div>
                            </div>

                            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex justify-between items-center mb-2">
                                <span className="text-slate-400 text-sm">Bias (θ₀)</span>
                                <span className="font-mono text-indigo-300">{(currentPos.t0).toFixed(4)}</span>
                            </div>
                            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex justify-between items-center">
                                <span className="text-slate-400 text-sm">Weight (θ₁)</span>
                                <span className="font-mono text-indigo-300">{(currentPos.t1).toFixed(4)}</span>
                            </div>

                            {isDiverged && (
                                <div className="mt-4 text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                                    <strong>Explosion Detected!</strong> The learning rate is too high, causing the parameters to diverge. Lower $α$ and reset.
                                </div>
                            )}
                        </div>

                        {/* Theory Box */}
                        <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/30">
                            <h3 className="text-sm font-bold text-emerald-400 mb-3 flex items-center"><Info className="w-4 h-4 mr-2" /> Understanding the Math</h3>
                            <p className="text-xs text-slate-400 leading-relaxed mb-3">
                                Gradient Descent is an iterative optimization algorithm used to minimize the cost function by moving in the direction of steepest descent as defined by the negative of the gradient.
                            </p>
                            <div className="bg-slate-950 p-3 rounded-lg text-xs font-mono text-slate-300 border border-slate-800">
                                θ := θ - α * ∇J(θ)
                            </div>
                            <ul className="text-xs text-slate-400 mt-3 space-y-2 list-disc pl-4">
                                <li><strong>α (Learning Rate)</strong> controls the step size.</li>
                                <li>The <strong>Cost Surface</strong> represents MSE for all possible combinations of weights.</li>
                                <li>Linear regression MSE is strictly convex, guaranteeing a global minimum.</li>
                            </ul>
                        </div>

                    </div>

                    {/* Right Column: Visualizations */}
                    <div className="xl:col-span-9 flex flex-col gap-6">

                        {/* Top: 3D Visualization */}
                        <div
                            className="w-full h-[450px] glass-panel rounded-2xl border border-slate-700 bg-slate-900 relative overflow-hidden cursor-grab active:cursor-grabbing"
                            onMouseDown={(e) => handlePointerDown(e.clientX, e.clientY)}
                            onMouseMove={(e) => handlePointerMove(e.clientX, e.clientY)}
                            onMouseUp={handlePointerUp}
                            onMouseLeave={handlePointerUp}
                        >
                            <canvas
                                ref={canvas3DRef}
                                width={1200}
                                height={600}
                                className="w-full h-full object-contain pointer-events-none"
                            />

                            <div className="absolute top-4 left-4 flex gap-3">
                                <div className="bg-slate-900/80 backdrop-blur border border-slate-700 px-3 py-1.5 rounded-lg flex items-center text-xs font-semibold text-slate-300 shadow-xl">
                                    <Layers className="w-3.5 h-3.5 mr-1.5 text-indigo-400" /> 3D Cost Surface
                                </div>
                                <div className="bg-slate-900/80 backdrop-blur border border-slate-700 px-3 py-1.5 rounded-lg flex items-center text-xs text-slate-400 shadow-xl hidden md:flex">
                                    {Math.round(viewAngle.yaw * 180 / Math.PI)}° Yaw / {Math.round(viewAngle.pitch * 180 / Math.PI)}° Pitch
                                </div>
                            </div>
                        </div>

                        {/* Bottom: 2D Contour & Chart */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[300px]">

                            {/* 2D Contour Map */}
                            <div className="glass-panel p-4 rounded-2xl border border-slate-700 bg-slate-900/80 relative flex flex-col h-full">
                                <h4 className="text-sm font-bold text-white mb-2 ml-1">2D Contour Projection</h4>
                                <div className="flex-1 relative border border-slate-800 rounded-xl overflow-hidden shadow-inner bg-slate-950">
                                    <canvas
                                        ref={canvasContourRef}
                                        width={400}
                                        height={400}
                                        className="w-full h-full object-contain"
                                    />
                                    <div className="absolute bottom-2 right-2 flex flex-col text-[10px] text-slate-500 bg-slate-950/80 p-1 rounded font-mono">
                                        Top: θ₁ = 5 <br />
                                        Bottom: θ₁ = -5 <br />
                                        Left: θ₀ = -5 <br />
                                        Right: θ₀ = 5
                                    </div>
                                </div>
                            </div>

                            {/* Line Chart */}
                            <div className="glass-panel p-4 rounded-2xl border border-slate-700 bg-slate-900/80 flex flex-col h-full">
                                <h4 className="text-sm font-bold text-white mb-2 ml-1 flex items-center">
                                    <Activity className="w-4 h-4 mr-2 text-rose-500" />
                                    Loss Curve (Convergence)
                                </h4>
                                <div className="flex-1 min-h-0 relative">
                                    <Line options={chartOptions} data={costChartData} />
                                </div>
                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
