import React from 'react';
import { MathEngineState } from './useMathEngine';

interface Props {
    inputs: number[];
    target: number;
    currentStep: number;
    math: MathEngineState;
    speed: number;
}

// Fixed dimensions for SVG canvas
const WIDTH = 600;
const HEIGHT = 800;

export default function NetworkCanvas({ inputs, target, currentStep, math, speed }: Props) {
    // Determine coordinates for nodes
    const inputNodes = [
        { id: 'i1', x: 100, y: 150, value: inputs[0] },
        { id: 'i2', x: 100, y: 400, value: inputs[1] },
        { id: 'i3', x: 100, y: 650, value: inputs[2] },
    ];

    const hiddenNodes = [
        { id: 'h1', x: 300, y: 250, z: math.h1_z, a: math.h1_a },
        { id: 'h2', x: 300, y: 550, z: math.h2_z, a: math.h2_a },
    ];

    const outputNode = { id: 'o1', x: 500, y: 400, z: math.o1_z, a: math.o1_a };

    // Function to draw connections between layers
    const renderConnections = (layerA: any[], layerB: any[], layerPrefixA: string, layerPrefixB: string) => {
        return layerA.map((nodeA) =>
            layerB.map((nodeB) => {
                const connId = `${nodeA.id}-${nodeB.id}`;
                const weight = math.weights[connId];

                // Visual Highlight Logic
                let strokeColor = weight >= 0 ? 'rgba(52, 211, 153, 0.2)' : 'rgba(244, 63, 94, 0.2)';
                let strokeWidth = Math.min(10, Math.max(2, Math.abs(weight) * 3)); // Minimal thickness

                let isForwardAnimating = false;
                let isBackwardAnimating = false;
                let isWeightUpdating = false;

                // Step 1: i -> h
                if (currentStep === 1 && layerPrefixA === 'i') {
                    strokeColor = 'rgba(59, 130, 246, 0.7)'; // Blue Forward
                    strokeWidth += 2;
                    isForwardAnimating = true;
                }
                // Step 2: h -> o
                if (currentStep === 2 && layerPrefixA === 'h') {
                    strokeColor = 'rgba(59, 130, 246, 0.7)';
                    strokeWidth += 2;
                    isForwardAnimating = true;
                }
                // Step 4: Backprop Output Gradients
                if (currentStep === 4 && layerPrefixA === 'h') {
                    strokeColor = 'rgba(249, 115, 22, 0.8)'; // Orange Backwards
                    strokeWidth += 2;
                    isBackwardAnimating = true;
                }
                // Step 5: Backprop Hidden Gradients
                if (currentStep === 5 && layerPrefixA === 'i') {
                    strokeColor = 'rgba(249, 115, 22, 0.8)';
                    strokeWidth += 2;
                    isBackwardAnimating = true;
                }
                // Step 6: Update Weights
                if (currentStep === 6) {
                    strokeColor = 'rgba(34, 197, 94, 0.8)'; // Green Updates
                    strokeWidth += 4;
                    isWeightUpdating = true;
                }

                return (
                    <g key={connId}>
                        <line
                            x1={nodeA.x} y1={nodeA.y}
                            x2={nodeB.x} y2={nodeB.y}
                            stroke={strokeColor}
                            strokeWidth={strokeWidth}
                            className="transition-all duration-700"
                        />

                        {isForwardAnimating && (
                            <circle r="6" fill="#60a5fa" className="animate-pulse shadow-[0_0_10px_#60a5fa]">
                                <animateMotion
                                    path={`M ${nodeA.x},${nodeA.y} L ${nodeB.x},${nodeB.y}`}
                                    dur={`${1.5 / speed}s`}
                                    repeatCount="indefinite"
                                />
                            </circle>
                        )}

                        {isBackwardAnimating && (
                            <circle r="6" fill="#f97316" className="animate-pulse shadow-[0_0_10px_#f97316]">
                                <animateMotion
                                    path={`M ${nodeB.x},${nodeB.y} L ${nodeA.x},${nodeA.y}`}
                                    dur={`${1.5 / speed}s`}
                                    repeatCount="indefinite"
                                />
                            </circle>
                        )}

                        {/* Minimal Weight Ticker - Just the number, on the line */}
                        {(() => {
                            const dy = nodeB.y - nodeA.y;
                            let t = 0.5;
                            if (dy > 50) t = 0.35; else if (dy < -50) t = 0.65;
                            const labelX = nodeA.x + (nodeB.x - nodeA.x) * t;
                            const labelY = nodeA.y + dy * t;

                            return (
                                <g transform={`translate(${labelX}, ${labelY})`}>
                                    <rect x="-24" y="-12" width="48" height="24" fill="#0f172a" rx="4" stroke={isWeightUpdating ? "#22c55e" : "#334155"} className="transition-colors duration-500" />
                                    <text y="4" fill={isWeightUpdating ? "#4ade80" : "#94a3b8"} fontSize="12" textAnchor="middle" className="font-mono transition-colors duration-500">
                                        {weight.toFixed(2)}
                                    </text>
                                </g>
                            )
                        })()}
                    </g>
                );
            })
        );
    };

    return (
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full h-full object-contain p-4">

            <defs>
                <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                    <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
            </defs>

            {/* Render Links */}
            {renderConnections(inputNodes, hiddenNodes, 'i', 'h')}
            {renderConnections(hiddenNodes, [outputNode], 'h', 'o')}

            {/* Render Input Nodes */}
            {inputNodes.map(node => (
                <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
                    <circle r="30" fill="#0f172a" stroke="#3b82f6" strokeWidth="2" />
                    <text textAnchor="middle" y="-40" fill="#64748b" fontSize="14" fontWeight="bold">Input</text>
                    <text textAnchor="middle" y="6" fill="#e2e8f0" fontSize="16" className="font-mono">{node.value.toFixed(1)}</text>
                </g>
            ))}

            {/* Render Hidden Nodes */}
            {hiddenNodes.map(node => {
                const isActiveStep = currentStep >= 1;
                return (
                    <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
                        <circle r="35" fill="#0f172a" stroke={isActiveStep && currentStep <= 2 ? "#3b82f6" : (currentStep >= 5 ? "#f97316" : "#475569")} strokeWidth="3" className="transition-all duration-700" />
                        <text textAnchor="middle" y="-45" fill="#64748b" fontSize="14" fontWeight="bold">Hidden</text>
                        {isActiveStep ? (
                            <>
                                <text textAnchor="middle" y="-2" fill="#94a3b8" fontSize="11" className="font-mono">z={node.z.toFixed(2)}</text>
                                <text textAnchor="middle" y="14" fill="#e2e8f0" fontSize="15" className="font-mono font-bold">a={node.a.toFixed(3)}</text>
                            </>
                        ) : (
                            <text textAnchor="middle" y="6" fill="#334155" fontSize="20">?</text>
                        )}
                    </g>
                )
            })}

            {/* Render Output Node */}
            <g transform={`translate(${outputNode.x}, ${outputNode.y})`}>
                <circle r="40" fill="#0f172a" stroke={currentStep === 2 ? "#3b82f6" : (currentStep >= 3 && currentStep <= 4 ? "#f97316" : "#475569")} strokeWidth="3" className="transition-all duration-700" />
                <text textAnchor="middle" y="-50" fill="#64748b" fontSize="14" fontWeight="bold">Output</text>

                {currentStep >= 2 ? (
                    <>
                        <text textAnchor="middle" y="-5" fill="#94a3b8" fontSize="11" className="font-mono">z={outputNode.z.toFixed(2)}</text>
                        <text textAnchor="middle" y="15" fill="#e2e8f0" fontSize="15" className="font-mono font-bold">y={outputNode.a.toFixed(3)}</text>
                    </>
                ) : (
                    <text textAnchor="middle" y="6" fill="#334155" fontSize="20">?</text>
                )}

                {/* Constant Target Label */}
                <g transform="translate(0, -90)">
                    <rect x="-35" y="-15" width="70" height="24" fill="#064e3b" rx="4" />
                    <text y="2" fill="#34d399" fontSize="12" textAnchor="middle" className="font-mono font-bold">T={target.toFixed(2)}</text>
                </g>

                {/* Minimal Error Display when Step >= 3 */}
                {currentStep >= 3 && (
                    <g transform="translate(0, 65)" className="animate-fade-in">
                        <line x1="0" y1="-25" x2="0" y2="0" stroke={Math.abs(math.error) > 0.4 ? '#ef4444' : '#f59e0b'} strokeWidth="2" strokeDasharray="4,4" />
                        <rect x="-45" y="0" width="90" height="40" fill="#450a0a" rx="6" stroke={Math.abs(math.error) > 0.4 ? '#ef4444' : '#f59e0b'} strokeWidth="2" />
                        <text y="15" fill="#fca5a5" fontSize="12" textAnchor="middle" className="font-bold">Loss</text>
                        <text y="30" fill="#fecaca" fontSize="12" textAnchor="middle" className="font-mono">{math.loss.toFixed(4)}</text>
                    </g>
                )}
            </g>

        </svg>
    );
}
