import React, { useMemo, useState } from 'react';

interface InteractiveGraphProps {
    fn: (x: number) => number;
    derivativeFn?: (x: number) => number;
    showDerivative?: boolean;
    compareFn?: (x: number) => number | null; // Secondary function for comparison
    domain?: [number, number];   // [minX, maxX]
    range?: [number, number];    // [minY, maxY]
    width?: number | string;
    height?: number | string;
    animatedValueX?: number | null;     // for the sweeping dot
    className?: string;
    hideAxes?: boolean;
    onHoverPoint?: (x: number, y: number, deriv: number | null, compareY: number | null) => void;
}

export const InteractiveGraph: React.FC<InteractiveGraphProps> = ({
    fn,
    derivativeFn,
    showDerivative = false,
    compareFn,
    domain = [-5, 5],
    range = [-2, 2],
    width = '100%',
    height = '100%',
    animatedValueX = null,
    className = "",
    hideAxes = false,
    onHoverPoint
}) => {
    // Generate SVG path for the function
    const numPoints = 100;
    const [mousePos, setMousePos] = useState<{ x: number, y: number } | null>(null);

    const scaleX = (x: number) => {
        const span = domain[1] - domain[0];
        return ((x - domain[0]) / span) * 100; // Percentage 0-100
    };

    const scaleY = (y: number) => {
        const span = range[1] - range[0];
        // SVG Y goes top to bottom, so invert
        return ((range[1] - y) / span) * 100; // Percentage 0-100
    };

    const generatePath = (calcFn: (vx: number) => number) => {
        const step = (domain[1] - domain[0]) / numPoints;
        let path = "";
        for (let i = 0; i <= numPoints; i++) {
            const x = domain[0] + i * step;
            // clamp Y to prevent wild infinity drawing
            let y = calcFn(x);
            if (!Number.isFinite(y)) y = Math.sign(y) * range[1] * 2;
            y = Math.min(Math.max(y, range[0] - 2), range[1] + 2); // add a bit of bleed

            const sx = scaleX(x);
            const sy = scaleY(y);

            if (i === 0) path += `M ${sx} ${sy} `;
            else path += `L ${sx} ${sy} `;
        }
        return path;
    };

    const pathData = useMemo(() => generatePath(fn), [fn, domain, range]);
    const derivPathData = useMemo(() => showDerivative && derivativeFn ? generatePath(derivativeFn) : "", [showDerivative, derivativeFn, domain, range]);
    const comparePathData = useMemo(() => compareFn ? generatePath((x) => compareFn(x) ?? NaN) : "", [compareFn, domain, range]);

    // Plot dot
    let dotX = null;
    let dotY = null;
    let derivDotY = null;
    let compareDotY = null;

    if (animatedValueX !== null) {
        let y = fn(animatedValueX);
        if (!Number.isFinite(y)) y = 0;
        y = Math.min(Math.max(y, range[0] - 2), range[1] + 2);
        dotX = scaleX(animatedValueX);
        dotY = scaleY(y);

        if (showDerivative && derivativeFn) {
            let dy = derivativeFn(animatedValueX);
            if (!Number.isFinite(dy)) dy = 0;
            dy = Math.min(Math.max(dy, range[0] - 2), range[1] + 2);
            derivDotY = scaleY(dy);
        }

        if (compareFn) {
            let cy = compareFn(animatedValueX);
            if (cy !== null) {
                if (!Number.isFinite(cy)) cy = 0;
                cy = Math.min(Math.max(cy, range[0] - 2), range[1] + 2);
                compareDotY = scaleY(cy);
            }
        }
    }

    const xAxisY = scaleY(0);
    const yAxisX = scaleX(0);

    return (
        <div className={`relative w-full h-full ${className}`}>
            <svg
                width={width}
                height={height}
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                className="overflow-visible"
            >
                {/* Background Grid Pattern */}
                <defs>
                    <pattern id="smallGrid" width="4" height="4" patternUnits="userSpaceOnUse">
                        <path d="M 4 0 L 0 0 0 4" fill="none" className="stroke-slate-800/40 stroke-[0.2]" />
                    </pattern>
                    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                        <rect width="20" height="20" fill="url(#smallGrid)" />
                        <path d="M 20 0 L 0 0 0 20" fill="none" className="stroke-slate-700/40 stroke-[0.4]" />
                    </pattern>
                </defs>
                <rect width="100" height="100" fill="url(#grid)" className="pointer-events-none" />

                {/* Axes */}
                {!hideAxes && (
                    <>
                        {/* Major ticks rendering - simplified */}
                        <line x1="0" y1={xAxisY} x2="100" y2={xAxisY} className="stroke-slate-600 stroke-[0.6] z-10" />
                        <line x1={yAxisX} y1="0" x2={yAxisX} y2="100" className="stroke-slate-600 stroke-[0.6] z-10" />
                    </>
                )}

                {/* Compare Path */}
                {compareFn && (
                    <path
                        d={comparePathData}
                        fill="none"
                        className="stroke-amber-500/60 stroke-[2]"
                        vectorEffect="non-scaling-stroke"
                        strokeDasharray="4, 4"
                    />
                )}

                {/* Derivative Path */}
                {showDerivative && derivativeFn && (
                    <path
                        d={derivPathData}
                        fill="none"
                        className="stroke-cyan-500/70 stroke-[1.5]"
                        vectorEffect="non-scaling-stroke"
                        strokeDasharray="2, 4"
                        style={{ filter: 'drop-shadow(0 0 2px rgba(34, 211, 238, 0.4))' }}
                    />
                )}

                {/* Main Path */}
                <path
                    d={pathData}
                    fill="none"
                    className="stroke-purple-400 stroke-[3]"
                    vectorEffect="non-scaling-stroke"
                    style={{ filter: 'drop-shadow(0 0 8px rgba(168, 85, 247, 0.6))' }}
                />

                {/* Sweeping Dot Indicator & Guides */}
                {dotX !== null && dotY !== null && (
                    <>
                        {/* Projection to X/Y axes */}
                        {!hideAxes && (
                            <>
                                <line x1={dotX} y1={0} x2={dotX} y2={100} className="stroke-slate-500/30 stroke-[0.5] stroke-dasharray-2" vectorEffect="non-scaling-stroke" />
                                <line x1={0} y1={dotY} x2={100} y2={dotY} className="stroke-slate-500/30 stroke-[0.5] stroke-dasharray-2" vectorEffect="non-scaling-stroke" />
                            </>
                        )}

                        {/* Compare Dot */}
                        {compareDotY !== null && (
                            <circle cx={dotX} cy={compareDotY} r="3" className="fill-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
                        )}

                        {/* Derivative Dot */}
                        {showDerivative && derivDotY !== null && (
                            <circle cx={dotX} cy={derivDotY} r="2.5" className="fill-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                        )}

                        {/* Main Dot */}
                        <circle cx={dotX} cy={dotY} r="3" className="fill-white" />
                        <circle cx={dotX} cy={dotY} r="6" className="fill-purple-500/40 animate-pulse" />
                        <circle cx={dotX} cy={dotY} r="10" className="fill-purple-500/20" />
                    </>
                )}
            </svg>
        </div>
    );
};
