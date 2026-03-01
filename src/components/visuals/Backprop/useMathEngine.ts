import { useMemo } from 'react';

export type WeightMap = { [key: string]: number };

export interface MathEngineState {
    weights: WeightMap;
    // Forward Pass - Hidden
    h1_z: number;
    h1_a: number;
    h2_z: number;
    h2_a: number;

    // Forward Pass - Output
    o1_z: number;
    o1_a: number;

    // Loss Calculation
    error: number;
    loss: number;

    // Backprop - Output Gradients
    dL_dOut: number;
    dL_dz_out: number; // For linear output, this is same as dL_dOut
    grad_h1_o1: number;
    grad_h2_o1: number;

    // Backprop - Hidden Gradients
    sig_deriv_h1: number;
    dL_dz_h1: number;
    grad_i1_h1: number;
    grad_i2_h1: number;
    grad_i3_h1: number;

    sig_deriv_h2: number;
    dL_dz_h2: number;
    grad_i1_h2: number;
    grad_i2_h2: number;
    grad_i3_h2: number;
}

export function useMathEngine(inputs: number[], target: number, weights: WeightMap): MathEngineState {
    return useMemo(() => {
        const sigmoid = (z: number) => 1 / (1 + Math.exp(-z));

        // 1. Forward Pass - Hidden
        const h1_z = (inputs[0] * weights['i1-h1']) + (inputs[1] * weights['i2-h1']) + (inputs[2] * weights['i3-h1']);
        const h2_z = (inputs[0] * weights['i1-h2']) + (inputs[1] * weights['i2-h2']) + (inputs[2] * weights['i3-h2']);

        const h1_a = sigmoid(h1_z);
        const h2_a = sigmoid(h2_z);

        // 2. Forward Pass - Output (Linear)
        const o1_z = (h1_a * weights['h1-o1']) + (h2_a * weights['h2-o1']);
        const o1_a = o1_z;

        // 3. Loss Calculation
        const error = target - o1_a;
        const loss = Math.pow(error, 2);

        // 4. Backprop - Output Gradients
        // MSE = (Pred - Target)^2. dL/dPred = 2(Pred - Target)
        // Note: Earlier we used `2 * (o1_a - target)` or simplified `-error`.
        // Let's use exact derivative:
        const dL_dOut = 2 * (o1_a - target);
        const dL_dz_out = dL_dOut; // Linear derivative

        const grad_h1_o1 = dL_dz_out * h1_a;
        const grad_h2_o1 = dL_dz_out * h2_a;

        // 5. Backprop - Hidden Gradients
        // Sigmoid derivative = a * (1 - a). We use a tiny max(0.01) leak to prevent total death if stuck.
        const sig_deriv_h1_raw = h1_a * (1 - h1_a);
        const sig_deriv_h1 = Math.max(0.01, sig_deriv_h1_raw);
        const dL_dz_h1 = dL_dz_out * weights['h1-o1'] * sig_deriv_h1;

        const sig_deriv_h2_raw = h2_a * (1 - h2_a);
        const sig_deriv_h2 = Math.max(0.01, sig_deriv_h2_raw);
        const dL_dz_h2 = dL_dz_out * weights['h2-o1'] * sig_deriv_h2;

        const grad_i1_h1 = dL_dz_h1 * inputs[0];
        const grad_i2_h1 = dL_dz_h1 * inputs[1];
        const grad_i3_h1 = dL_dz_h1 * inputs[2];

        const grad_i1_h2 = dL_dz_h2 * inputs[0];
        const grad_i2_h2 = dL_dz_h2 * inputs[1];
        const grad_i3_h2 = dL_dz_h2 * inputs[2];

        return {
            weights,
            h1_z, h1_a, h2_z, h2_a,
            o1_z, o1_a,
            error, loss,
            dL_dOut, dL_dz_out,
            grad_h1_o1, grad_h2_o1,
            sig_deriv_h1, dL_dz_h1,
            grad_i1_h1, grad_i2_h1, grad_i3_h1,
            sig_deriv_h2, dL_dz_h2,
            grad_i1_h2, grad_i2_h2, grad_i3_h2
        };
    }, [inputs, target, weights]);
}
