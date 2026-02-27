"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Activity, RefreshCw } from 'lucide-react';
import { Chart as ReactChart } from 'react-chartjs-2';
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip as ChartTooltip, ScatterController, LineController
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, ChartTooltip, ScatterController, LineController);

type Point = { x: number; y: number };

export default function OverfittingDemo() {
    const [dataPoints, setDataPoints] = useState<Point[]>([]);
    const [degree, setDegree] = useState<number>(3); // 1 to 15
    const [noiseLevel] = useState<number>(1.5); // New state for noise level

    // Generate noisy sine wave
    const generateData = useCallback(() => {
        const pts: Point[] = [];
        for (let i = 0; i < 20; i++) {
            const x = (Math.random() * 2 - 1) * Math.PI; // -PI to PI
            const noise = (Math.random() - 0.5) * noiseLevel;
            const y = Math.sin(x) + noise;
            pts.push({ x, y });
        }
        pts.sort((a, b) => a.x - b.x);
        setDataPoints(pts);
    }, [noiseLevel]); // Dependency on noiseLevel

    useEffect(() => {
        const t = setTimeout(() => generateData(), 0);
        return () => clearTimeout(t);
    }, [generateData]);

    // Fit polynomial roughly
    // We'll use a very simple least-squares approximation by solving normal equations
    // using gaussian elimination for the demo.
    const solveNormalEquations = (points: Point[], deg: number) => {
        const n = points.length;
        const m = deg + 1;

        // Matrix X^T * X and Vector X^T * Y
        const A: number[][] = Array.from({ length: m }, () => Array(m).fill(0));
        const B: number[] = Array.from({ length: m }, () => 0);

        for (let i = 0; i < m; i++) {
            for (let j = 0; j < m; j++) {
                let sum = 0;
                for (let k = 0; k < n; k++) {
                    sum += Math.pow(points[k].x, i + j);
                }
                A[i][j] = sum;
            }
            let sum = 0;
            for (let k = 0; k < n; k++) {
                sum += points[k].y * Math.pow(points[k].x, i);
            }
            B[i] = sum;
        }

        // Gauss-Jordan elimination with simple pivoting
        for (let i = 0; i < m; i++) {
            let maxRow = i;
            for (let k = i + 1; k < m; k++) {
                if (Math.abs(A[k][i]) > Math.abs(A[maxRow][i])) maxRow = k;
            }
            if (maxRow !== i) {
                for (let k = i; k < m; k++) {
                    const temp = A[i][k]; A[i][k] = A[maxRow][k]; A[maxRow][k] = temp;
                }
                const temp = B[i]; B[i] = B[maxRow]; B[maxRow] = temp;
            }

            let pivot = A[i][i];
            if (Math.abs(pivot) < 1e-10) pivot = 1e-10; // Avoid division by zero
            for (let k = i; k < m; k++) A[i][k] /= pivot;
            B[i] /= pivot;

            for (let k = 0; k < m; k++) {
                if (k !== i) {
                    const factor = A[k][i];
                    for (let j = i; j < m; j++) A[k][j] -= factor * A[i][j];
                    B[k] -= factor * B[i];
                }
            }
        }

        return B; // These are the coefficients [c0, c1, c2 ... ]
    };

    // Generate curve points
    const curvePoints = React.useMemo(() => {
        if (dataPoints.length === 0) return [];

        // Attempt fitting
        // For high degrees, normal equations are numerically unstable in JS floats.
        // We limit degree to 8 to avoid explosions, though the UI can say "High Complexity"
        let solveDeg = degree;
        if (solveDeg > 12) solveDeg = 12; // cap computational blowup

        const coeffs = solveNormalEquations(dataPoints, solveDeg);
        const linePts: Point[] = [];

        for (let x = 0; x <= 10.5; x += 0.1) {
            let y = 0;
            for (let i = 0; i <= solveDeg; i++) {
                y += coeffs[i] * Math.pow(x, i);
            }
            // Cap absurd y values for rendering
            if (y > 10) y = 10;
            if (y < -10) y = -10;
            linePts.push({ x, y });
        }
        return linePts;
    }, [dataPoints, degree]);

    const chartData = {
        datasets: [
            {
                type: 'scatter' as const,
                label: 'Noisy Training Data',
                data: dataPoints,
                backgroundColor: '#4f46e5',
                pointRadius: 6,
                pointHoverRadius: 8
            },
            {
                type: 'line' as const,
                label: `Polynomial Fit(Degree ${degree})`,
                data: curvePoints,
                borderColor: '#14b8a6', // teal-500
                borderWidth: 3,
                pointRadius: 0,
                fill: false,
                tension: 0.3
            },
            {
                type: 'line' as const,
                label: `True Underlying Function(Sine)`,
                data: Array.from({ length: 105 }, (_, i) => ({ x: i * 0.1, y: Math.sin(i * 0.1) })),
                borderColor: '#fbbf24', // amber-400
                borderWidth: 2,
                borderDash: [5, 5],
                pointRadius: 0,
                fill: false,
                tension: 0.3
            }
        ]
    };

    return (
        <div className="flex-1 flex flex-col p-4 md:p-8 max-w-screen-xl mx-auto w-full">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white flex items-center">
                    <Activity className="w-8 h-8 mr-3 text-indigo-500" />
                    Overfitting & Bias-Variance
                </h1>
                <p className="text-slate-400 mt-2">
                    Adjust the model complexity (polynomial degree) to see how it fits the points. Low degree creates
                    high bias (underfitting). High degree creates high variance (overfitting the noise).
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 glass-panel p-6 rounded-2xl flex flex-col">
                    <h3 className="text-lg font-semibold text-white mb-6">Controls</h3>

                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between mb-2 mt-4">
                                <label className="text-sm font-medium text-slate-300">Polynomial Degree</label>
                                <span className="text-indigo-400 font-mono text-sm">{degree}</span>
                            </div>
                            <input
                                type="range"
                                min="1" max="15" step="1"
                                className="w-full accent-indigo-500"
                                value={degree}
                                onChange={(e) => setDegree(Number(e.target.value))}
                            />
                            <p className="text-xs text-slate-500 mt-3">
                                {degree === 1 && "Degree 1 is a simple line. It underfits the curve (High Bias)."}
                                {degree > 1 && degree <= 5 && "Degree 3-5 captures the curve well. Good balance."}
                                {degree > 5 && degree <= 10 && "Degree > 5 starts bending awkwardly to hit noise."}
                                {degree > 10 && "Degree > 10 overfits wildly. It memorizes noise (High Variance)."}
                            </p>
                        </div>

                        <div className="pt-4 border-t border-slate-700">
                            <button
                                onClick={generateData}
                                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg flex items-center justify-center transition-colors border border-slate-600 shadow-sm"
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Generate New Noisy Data
                            </button>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 glass-panel p-6 rounded-2xl flex items-center justify-center min-h-[500px]">
                    <div className="w-full h-[500px]">
                        <ReactChart
                            type="scatter"
                            data={chartData}
                            options={{
                                maintainAspectRatio: false,
                                scales: {
                                    x: { type: 'linear', position: 'bottom', min: 0, max: 10, grid: { color: '#334155' }, ticks: { color: '#94a3b8' } },
                                    y: { min: -3, max: 3, grid: { color: '#334155' }, ticks: { color: '#94a3b8' } }
                                },
                                plugins: { legend: { labels: { color: '#cbd5e1' } } },
                                animation: { duration: 0 } // disable animation for snappy slider updates
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
