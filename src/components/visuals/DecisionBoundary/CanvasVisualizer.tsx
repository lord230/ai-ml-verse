"use client";

import React, { useEffect, useRef } from 'react';
import { DataPoint } from './DatasetGenerator';
import { MLModel } from './Models';

interface CanvasVisualizerProps {
    points: DataPoint[];
    model: MLModel;
    renderSignal: number; // Increment to force a redraw
    isTraining: boolean;
    onAddPoint: (x: number, y: number, label: number) => void;
    brushClass: number; // 0 or 1 for click-to-add
}

export function CanvasVisualizer({ points, model, renderSignal, isTraining, onAddPoint, brushClass }: CanvasVisualizerProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Map domain [-5, 5] to canvas size
    const domainSize = 10;
    const mapX = (x: number, width: number) => (x + 5) * (width / domainSize);
    const mapY = (y: number, height: number) => height - ((y + 5) * (height / domainSize));

    // Inverse map for clicks
    const inverseMapX = (cx: number, width: number) => (cx / (width / domainSize)) - 5;
    const inverseMapY = (cy: number, height: number) => ((height - cy) / (height / domainSize)) - 5;

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;

        // Ensure canvas draws at full crisp resolution (handle retina displays if needed)
        ctx.clearRect(0, 0, width, height);

        // --- DRAW DECISION BOUNDARY HEATMAP ---
        const step = 0.25; // Heatmap resolution (lower is crisper but slower)
        ctx.globalAlpha = 0.8;
        for (let x = -5; x <= 5; x += step) {
            for (let y = -5; y <= 5; y += step) {
                const pred = model.predict(x, y);
                // Class 1: Indigo #4f46e5 (rgb 79, 70, 229)
                // Class 0: Amber #f59e0b (rgb 245, 158, 11)

                // Color interpolation based on probability
                const r = Math.round(pred * 79 + (1 - pred) * 245);
                const g = Math.round(pred * 70 + (1 - pred) * 158);
                const b = Math.round(pred * 229 + (1 - pred) * 11);

                // Opacity based on confidence (closer to 0.5 is more transparent)
                const confidence = Math.abs(pred - 0.5) * 2;
                const alpha = 0.1 + (confidence * 0.3);

                ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;

                // Need to draw the rect slightly larger to prevent grid lines
                const x1 = mapX(x, width);
                const y1 = mapY(y + step, height); // Top left corner of cell
                const w = (width / domainSize) * step + 1;
                const h = (height / domainSize) * step + 1;

                ctx.fillRect(x1, y1, w, h);
            }
        }
        ctx.globalAlpha = 1.0;

        // --- DRAW AXES ---
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(51, 65, 85, 0.4)'; // slate-700
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.moveTo(0, mapY(0, height)); ctx.lineTo(width, mapY(0, height));
        ctx.moveTo(mapX(0, width), 0); ctx.lineTo(mapX(0, width), height);
        ctx.stroke();
        ctx.setLineDash([]);

        // --- DRAW DATA POINTS ---
        points.forEach(p => {
            const cx = mapX(p.x, width);
            const cy = mapY(p.y, height);

            ctx.beginPath();
            // Indigo for Class 1, Amber for Class 0
            ctx.fillStyle = p.label === 1 ? '#818cf8' : '#fbbf24';
            ctx.strokeStyle = '#020617'; // slate-950
            ctx.lineWidth = 1.5;

            ctx.arc(cx, cy, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Highlight strongly misclassified points if it's a trained model
            const pred = model.predict(p.x, p.y);
            const isWrong = (pred > 0.5 ? 1 : 0) !== p.label;
            const errorMagnitude = Math.abs(pred - p.label);

            if (isWrong && errorMagnitude > 0.3 && model.type !== 'knn') {
                ctx.beginPath();
                ctx.strokeStyle = '#ef4444'; // Red ring for errors
                ctx.lineWidth = 2;
                ctx.arc(cx, cy, 10, 0, Math.PI * 2);
                ctx.stroke();
            }
        });

    }, [points, model, renderSignal]);

    const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!canvasRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();

        // Calculate raw x, y within the canvas element taking scaling into account
        const scaleX = canvasRef.current.width / rect.width;
        const scaleY = canvasRef.current.height / rect.height;

        const clickX = (e.clientX - rect.left) * scaleX;
        const clickY = (e.clientY - rect.top) * scaleY;

        const mathX = inverseMapX(clickX, canvasRef.current.width);
        const mathY = inverseMapY(clickY, canvasRef.current.height);

        onAddPoint(mathX, mathY, brushClass);
    };

    return (
        <div className="relative w-full h-full min-h-[500px] flex items-center justify-center bg-slate-950/50 rounded-xl overflow-hidden shadow-inner border border-slate-800/80">
            <canvas
                ref={canvasRef}
                width={800}
                height={600}
                onClick={handleCanvasClick}
                className="w-full h-full max-h-[600px] object-contain cursor-crosshair"
                style={{ imageRendering: 'pixelated' }}
            />
            {points.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <p className="text-slate-500 font-mono text-sm bg-slate-900/80 px-4 py-2 rounded-lg border border-slate-700/50 backdrop-blur-sm">
                        Click to add points, or generate a dataset
                    </p>
                </div>
            )}
            {isTraining && (
                <div className="absolute top-4 right-4 pointer-events-none flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                    <span className="text-emerald-400 font-mono text-xs uppercase tracking-widest font-bold">Training Active</span>
                </div>
            )}
        </div>
    );
}
