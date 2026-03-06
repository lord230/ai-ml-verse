export type ActivationParam = {
    id: string;
    name: string;
    symbol: string;
    min: number;
    max: number;
    default: number;
    step: number;
};

export type ActivationFunction = {
    id: string;
    name: string;
    shortDesc: string;
    advancedDesc: string;
    outputRange: string;
    formula: string;
    derivativeFormula: string;
    fn: (x: number, params?: Record<string, number>) => number;
    derivativeFn: (x: number, params?: Record<string, number>) => number;
    params?: ActivationParam[];
    isVectorized?: boolean; // For softmax
};

export const ACTIVATIONS: ActivationFunction[] = [
    {
        id: 'relu',
        name: 'ReLU',
        shortDesc: 'Fast and widely used in deep learning networks.',
        advancedDesc: 'Rectified Linear Unit (ReLU) turns negative values into zero, allowing the network to easily learn non-linear patterns without the vanishing gradient problem for positive values.',
        outputRange: '[0, ∞)',
        formula: 'f(x) = \\max(0, x)',
        derivativeFormula: 'f\'(x) = \\begin{cases} 1 & \\text{if } x > 0 \\\\ 0 & \\text{otherwise} \\end{cases}',
        fn: (x) => Math.max(0, x),
        derivativeFn: (x) => x > 0 ? 1 : 0
    },
    {
        id: 'leaky_relu',
        name: 'Leaky ReLU',
        shortDesc: 'Prevents dying neurons by allowing small negative slopes.',
        advancedDesc: 'Unlike standard ReLU, Leaky ReLU allows a small, positive gradient when the unit is not active. This helps mitigate the "dying ReLU" problem.',
        outputRange: '(-∞, ∞)',
        formula: 'f(x) = \\begin{cases} x & \\text{if } x > 0 \\\\ \\alpha x & \\text{if } x \\le 0 \\end{cases}',
        derivativeFormula: 'f\'(x) = \\begin{cases} 1 & \\text{if } x > 0 \\\\ \\alpha & \\text{if } x \\le 0 \\end{cases}',
        fn: (x, params) => x > 0 ? x : x * (params?.alpha ?? 0.1),
        derivativeFn: (x, params) => x > 0 ? 1 : (params?.alpha ?? 0.1),
        params: [
            { id: 'alpha', name: 'Slope', symbol: 'α', min: 0.01, max: 0.5, default: 0.1, step: 0.01 }
        ]
    },
    {
        id: 'prelu',
        name: 'Parametric ReLU',
        shortDesc: 'Learnable slope for negative inputs.',
        advancedDesc: 'Parametric ReLU is similar to Leaky ReLU, but instead of a fixed alpha, the slope for negative values is treated as a learnable parameter during training.',
        outputRange: '(-∞, ∞)',
        formula: 'f(x) = \\begin{cases} x & \\text{if } x > 0 \\\\ ax & \\text{if } x \\le 0 \\end{cases}',
        derivativeFormula: 'f\'(x) = \\begin{cases} 1 & \\text{if } x > 0 \\\\ a & \\text{if } x \\le 0 \\end{cases}',
        fn: (x, params) => x > 0 ? x : x * (params?.a ?? 0.25),
        derivativeFn: (x, params) => x > 0 ? 1 : (params?.a ?? 0.25),
        params: [
            { id: 'a', name: 'Learned Parameter', symbol: 'a', min: -1, max: 1, default: 0.25, step: 0.05 }
        ]
    },
    {
        id: 'sigmoid',
        name: 'Sigmoid',
        shortDesc: 'Outputs values between 0 and 1, commonly used in binary classification.',
        advancedDesc: 'The Sigmoid function maps real numbers to a bounded (0, 1) range, making it ideal for probabilities. However, it suffers from vanishing gradients for extreme values.',
        outputRange: '(0, 1)',
        formula: 'f(x) = \\frac{1}{1 + e^{-x}}',
        derivativeFormula: 'f\'(x) = f(x)(1 - f(x))',
        fn: (x) => 1 / (1 + Math.exp(-x)),
        derivativeFn: (x) => {
            const sig = 1 / (1 + Math.exp(-x));
            return sig * (1 - sig);
        }
    },
    {
        id: 'tanh',
        name: 'Tanh',
        shortDesc: 'Outputs values between −1 and 1 and is zero-centered.',
        advancedDesc: 'Hyperbolic Tangent is mathematically shifted Sigmoid. Being zero-centered helps gradients flow better during backpropagation compared to standard Sigmoid.',
        outputRange: '(-1, 1)',
        formula: 'f(x) = \\tanh(x) = \\frac{e^x - e^{-x}}{e^x + e^{-x}}',
        derivativeFormula: 'f\'(x) = 1 - \\tanh^2(x)',
        fn: (x) => Math.tanh(x),
        derivativeFn: (x) => 1 - Math.pow(Math.tanh(x), 2)
    },
    {
        id: 'selu',
        name: 'SELU',
        shortDesc: 'Self-normalizing activation used in deep networks.',
        advancedDesc: 'Scaled Exponential Linear Unit (SELU) induces self-normalizing properties, meaning activations tend to stick to a mean of 0 and variance of 1 across layers.',
        outputRange: '(-λα, ∞)',
        formula: 'f(x) = \\lambda \\begin{cases} x & \\text{if } x > 0 \\\\ \\alpha(e^x - 1) & \\text{if } x \\le 0 \\end{cases}',
        derivativeFormula: 'f\'(x) = \\lambda \\begin{cases} 1 & \\text{if } x > 0 \\\\ \\alpha e^x & \\text{if } x \\le 0 \\end{cases}',
        fn: (x) => {
            const lambda = 1.0507;
            const alpha = 1.67326;
            return x > 0 ? lambda * x : lambda * alpha * (Math.exp(x) - 1);
        },
        derivativeFn: (x) => {
            const lambda = 1.0507;
            const alpha = 1.67326;
            return x > 0 ? lambda : lambda * alpha * Math.exp(x);
        }
    },
    {
        id: 'binary_step',
        name: 'Binary Step',
        shortDesc: 'Outputs either 0 or 1 depending on threshold.',
        advancedDesc: 'The simplest activation function. Used historically in early perceptrons. It cannot be used with gradient descent since its derivative is 0 everywhere (except threshold).',
        outputRange: '{0, 1}',
        formula: 'f(x) = \\begin{cases} 1 & \\text{if } x \\ge \\theta \\\\ 0 & \\text{otherwise} \\end{cases}',
        derivativeFormula: 'f\'(x) = 0 \\quad (\\text{undefined at } \\theta)',
        fn: (x, params) => x >= (params?.threshold ?? 0) ? 1 : 0,
        derivativeFn: () => 0,
        params: [
            { id: 'threshold', name: 'Threshold', symbol: 'θ', min: -5, max: 5, default: 0, step: 0.5 }
        ]
    },
    {
        id: 'linear',
        name: 'Linear',
        shortDesc: 'Identity activation often used in regression output layers.',
        advancedDesc: 'A linear function returns the input as-is. In hidden layers, this collapses the network into a single linear transformation, defeating the purpose of depth.',
        outputRange: '(-∞, ∞)',
        formula: 'f(x) = cx',
        derivativeFormula: 'f\'(x) = c',
        fn: (x, params) => (params?.c ?? 1) * x,
        derivativeFn: (x, params) => (params?.c ?? 1),
        params: [
            { id: 'c', name: 'Coefficient', symbol: 'c', min: -3, max: 3, default: 1, step: 0.1 }
        ]
    },
    {
        id: 'softmax',
        name: 'Softmax',
        shortDesc: 'Converts outputs into probabilities for multi-class classification.',
        advancedDesc: 'Used in the final layer for multi-class problems. It converts raw logits into a probability distribution summing to 1. (Interactive graph visualizes pseudo-1D behavior).',
        outputRange: '(0, 1)',
        formula: '\\text{Softmax}(x_i) = \\frac{e^{x_i}}{\\sum_{j} e^{x_j}}',
        derivativeFormula: '\\frac{\\partial S_i}{\\partial x_j} = S_i(\\delta_{ij} - S_j)',
        fn: (x) => {
            // Simplified for 1D graph visualization to show exponential shape relative to a baseline
            return Math.exp(x) / (Math.exp(x) + Math.exp(0) + Math.exp(-2)); // dummy normalization
        },
        derivativeFn: (x) => {
            const s = Math.exp(x) / (Math.exp(x) + Math.exp(0) + Math.exp(-2));
            return s * (1 - s);
        },
        isVectorized: true
    }
];

export function getActivation(id: string): ActivationFunction | undefined {
    return ACTIVATIONS.find(a => a.id === id);
}
