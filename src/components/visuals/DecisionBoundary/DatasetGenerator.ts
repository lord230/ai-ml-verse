export type DataPoint = {
    x: number;
    y: number;
    label: number;
};

export type DatasetType = 'linear' | 'moons' | 'circles' | 'xor' | 'custom';

// Helper to add Gaussian noise
function addNoise(val: number, noise: number) {
    if (noise === 0) return val;
    // Box-Muller transform for normally distributed noise
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return val + (z * noise);
}

// 1. Linearly Separable
function generateLinear(numPoints: number, noise: number): DataPoint[] {
    const points: DataPoint[] = [];
    for (let i = 0; i < numPoints / 2; i++) {
        // Class 0: roughly around x=-2, y=-2
        points.push({
            x: addNoise(-2 + (Math.random() - 0.5) * 3, noise),
            y: addNoise(-2 + (Math.random() - 0.5) * 3, noise),
            label: 0
        });
        // Class 1: roughly around x=2, y=2
        points.push({
            x: addNoise(2 + (Math.random() - 0.5) * 3, noise),
            y: addNoise(2 + (Math.random() - 0.5) * 3, noise),
            label: 1
        });
    }
    return points;
}

// 2. Two Moons
function generateMoons(numPoints: number, noise: number): DataPoint[] {
    const points: DataPoint[] = [];
    const n = Math.floor(numPoints / 2);

    for (let i = 0; i < n; i++) {
        // Moon 1 (Class 0): Upper half circle
        const angle1 = Math.random() * Math.PI;
        points.push({
            x: addNoise(Math.cos(angle1) * 2 - 0.5, noise),
            y: addNoise(Math.sin(angle1) * 2 + 0.5, noise),
            label: 0
        });

        // Moon 2 (Class 1): Lower half circle, shifted
        const angle2 = Math.random() * Math.PI;
        points.push({
            x: addNoise(Math.cos(angle2) * 2 + 1.5, noise),
            y: addNoise(-Math.sin(angle2) * 2 - 0.5, noise),
            label: 1
        });
    }
    return points;
}

// 3. Concentric Circles
function generateCircles(numPoints: number, noise: number): DataPoint[] {
    const points: DataPoint[] = [];
    const n = Math.floor(numPoints / 2);

    for (let i = 0; i < n; i++) {
        // Inner circle (Class 0)
        const radius0 = Math.random() * 1.5;
        const angle0 = Math.random() * 2 * Math.PI;
        points.push({
            x: addNoise(radius0 * Math.cos(angle0), noise),
            y: addNoise(radius0 * Math.sin(angle0), noise),
            label: 0
        });

        // Outer circle (Class 1)
        const radius1 = 2.5 + Math.random() * 1.5;
        const angle1 = Math.random() * 2 * Math.PI;
        points.push({
            x: addNoise(radius1 * Math.cos(angle1), noise),
            y: addNoise(radius1 * Math.sin(angle1), noise),
            label: 1
        });
    }
    return points;
}

// 4. XOR Pattern
function generateXOR(numPoints: number, noise: number): DataPoint[] {
    const points: DataPoint[] = [];
    const n = Math.floor(numPoints / 4);

    // Centers of the 4 quadrants
    const centers = [
        { cx: -2.5, cy: -2.5, label: 0 }, // Bottom-Left
        { cx: 2.5, cy: 2.5, label: 0 },   // Top-Right
        { cx: -2.5, cy: 2.5, label: 1 },  // Top-Left
        { cx: 2.5, cy: -2.5, label: 1 }   // Bottom-Right
    ];

    centers.forEach(({ cx, cy, label }) => {
        for (let i = 0; i < n; i++) {
            points.push({
                x: addNoise(cx + (Math.random() - 0.5) * 2, noise),
                y: addNoise(cy + (Math.random() - 0.5) * 2, noise),
                label
            });
        }
    });

    return points;
}

export function generateDataset(type: DatasetType, numPoints: number = 200, noise: number = 0.2): DataPoint[] {
    switch (type) {
        case 'linear': return generateLinear(numPoints, noise);
        case 'moons': return generateMoons(numPoints, noise);
        case 'circles': return generateCircles(numPoints, noise);
        case 'xor': return generateXOR(numPoints, noise);
        case 'custom': return []; // Handled by clicking
        default: return generateLinear(numPoints, noise);
    }
}
