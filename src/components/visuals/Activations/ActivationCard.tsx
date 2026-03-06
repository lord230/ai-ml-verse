'use client';

import React, { useState, useEffect } from 'react';
import { ActivationFunction } from '@/lib/math/activations';
import { InteractiveGraph } from './InteractiveGraph';

interface ActivationCardProps {
    activation: ActivationFunction;
    onClick: () => void;
}

export const ActivationCard: React.FC<ActivationCardProps> = ({ activation, onClick }) => {
    const [sweepX, setSweepX] = useState(-5);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        let animationFrameId: number;
        let lastTime = performance.now();
        let direction = 1;

        const animate = (time: number) => {
            if (isHovered) {
                const deltaTime = time - lastTime;
                lastTime = time;

                setSweepX(prev => {
                    let nextX = prev + (deltaTime * 0.005) * direction;
                    if (nextX >= 5) {
                        direction = -1;
                        nextX = 5;
                    } else if (nextX <= -5) {
                        direction = 1;
                        nextX = -5;
                    }
                    return nextX;
                });
            } else {
                setSweepX((prev) => prev * 0.9); // Return to center 0
                lastTime = time;
            }
            animationFrameId = requestAnimationFrame(animate);
        };

        animationFrameId = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrameId);
    }, [isHovered]);

    return (
        <button
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="group relative flex flex-col items-start p-5 bg-slate-900/50 border border-slate-700 hover:border-purple-500/50 rounded-2xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-purple-500/20 text-left w-full h-full overflow-hidden"
        >
            <div className="flex w-full justify-between items-start mb-4">
                <h3 className="text-xl font-bold font-mono text-slate-100 group-hover:text-purple-400 transition-colors">
                    {activation.name}
                </h3>
                <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-1 rounded-md border border-slate-700">
                    {activation.outputRange}
                </span>
            </div>

            <p className="text-sm text-slate-400 mb-6 flex-grow">
                {activation.shortDesc}
            </p>

            {/* Mini Graph Container */}
            <div className="w-full h-32 bg-slate-950 rounded-xl overflow-hidden border border-slate-800 relative shadow-inner">
                {/* Sweep glow effect */}
                <div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/10 to-transparent transition-opacity duration-500"
                    style={{
                        opacity: isHovered ? 1 : 0,
                        transform: `translateX(${(sweepX + 5) * 10 - 50}%)`
                    }}
                />
                <InteractiveGraph
                    fn={activation.fn}
                    domain={[-5, 5]}
                    range={[-2, 2]}
                    animatedValueX={isHovered ? sweepX : undefined}
                    hideAxes={false}
                    className="opacity-70 group-hover:opacity-100 transition-opacity"
                />
            </div>
        </button>
    );
};
