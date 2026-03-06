'use client';

import React, { useState, useEffect } from 'react';

interface NNEffectDemoProps {
    fn: (x: number) => number;
}

export const NNEffectDemo: React.FC<NNEffectDemoProps> = ({ fn }) => {
    const [input, setInput] = useState(0);

    // Auto-sweep input for visual demo
    useEffect(() => {
        let animationFrame: number;
        let lastTime = performance.now();
        let currentInput = -2;
        let direction = 1;

        const animate = (time: number) => {
            const dt = time - lastTime;
            lastTime = time;

            currentInput += (dt * 0.0015) * direction;

            if (currentInput > 2) {
                currentInput = 2;
                direction = -1;
            } else if (currentInput < -2) {
                currentInput = -2;
                direction = 1;
            }

            setInput(currentInput);
            animationFrame = requestAnimationFrame(animate);
        };

        animationFrame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrame);
    }, []);

    const output = fn(input);
    const isValidOutput = Number.isFinite(output);

    return (
        <div className="flex flex-col items-center justify-center p-6 bg-slate-900/60 rounded-3xl border border-slate-700/60 shadow-inner">
            <h4 className="text-sm font-semibold text-slate-300 mb-8 uppercase tracking-widest flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                Neuron Flow Pipeline
            </h4>

            <div className="flex items-center justify-center gap-2 md:gap-4 w-full max-w-sm">

                {/* Input Node */}
                <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-slate-900 border-2 border-slate-600 flex items-center justify-center shadow-lg relative group overflow-hidden">
                        {/* Glow based on input intensity */}
                        <div
                            className="absolute inset-0 rounded-full transition-opacity duration-75"
                            style={{
                                backgroundColor: input > 0 ? 'rgba(56, 189, 248, 0.5)' : 'rgba(244, 63, 94, 0.5)',
                                opacity: Math.min(Math.abs(input) / 2, 1)
                            }}
                        />
                        <span className="font-mono text-slate-100 z-10 text-sm font-bold tracking-tight">
                            {input.toFixed(2)}
                        </span>
                    </div>
                </div>

                {/* Arrow & Function Block */}
                <div className="flex-1 flex flex-col justify-center items-center relative">
                    {/* Animated signal line */}
                    <div className="h-[2px] w-full bg-slate-700/80 rounded relative overflow-hidden">
                        <div
                            className="absolute top-0 bottom-0 w-8 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
                            style={{
                                animation: 'pulse-slide 2s linear infinite'
                            }}
                        />
                    </div>

                    {/* Function Gate */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-800 border-2 border-purple-500/50 px-3 py-1.5 rounded-lg shadow-[0_0_15px_rgba(168,85,247,0.3)] z-10">
                        <span className="text-xs font-mono text-purple-300 font-bold">f(x)</span>
                    </div>
                </div>

                {/* Output Node */}
                <div className="flex flex-col items-center gap-3">
                    <div className="w-20 h-20 rounded-full bg-slate-900 border-2 border-purple-500 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.4)] relative overflow-hidden group">
                        {/* Fill level based on output magnitude for visual feedback */}
                        {isValidOutput && (
                            <div
                                className="absolute bottom-0 w-full bg-gradient-to-t from-purple-500 to-transparent transition-all duration-75"
                                style={{
                                    height: `${Math.min(Math.max((output + 2) / 4 * 100, 0), 100)}%`,
                                    opacity: 0.6
                                }}
                            />
                        )}
                        <span className="font-mono text-white z-10 text-base font-black drop-shadow-md">
                            {isValidOutput ? output.toFixed(2) : "NaN"}
                        </span>
                    </div>
                </div>

            </div>

            <style jsx>{`
                @keyframes pulse-slide {
                    0% { transform: translateX(-100%); opacity: 0; }
                    50% { opacity: 1; }
                    100% { transform: translateX(400%); opacity: 0; }
                }
            `}</style>
        </div>
    );
};
