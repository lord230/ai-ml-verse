import { DataPoint } from './DatasetGenerator';

export type ModelType = 'logistic' | 'svm' | 'knn' | 'mlp';

export interface MLModel {
    type: ModelType;
    trainStep: (points: DataPoint[], lr: number, reg: number) => { loss: number };
    predict: (x: number, y: number) => number; // Returns probability 0 to 1
    reset: () => void;
}

// Helper math
const sigmoid = (z: number) => 1 / (1 + Math.exp(-z));

export class LogisticRegression implements MLModel {
    type: ModelType = 'logistic';
    w1: number = (Math.random() - 0.5) * 2;
    w2: number = (Math.random() - 0.5) * 2;
    b: number = (Math.random() - 0.5) * 2;

    reset() {
        this.w1 = (Math.random() - 0.5) * 2;
        this.w2 = (Math.random() - 0.5) * 2;
        this.b = (Math.random() - 0.5) * 2;
    }

    trainStep(points: DataPoint[], lr: number, reg: number) {
        if (points.length === 0) return { loss: 0 };
        let dw1 = 0, dw2 = 0, db = 0;
        let totalLoss = 0;

        points.forEach(p => {
            const z = this.w1 * p.x + this.w2 * p.y + this.b;
            const pred = sigmoid(z);
            const err = pred - p.label;

            dw1 += err * p.x;
            dw2 += err * p.y;
            db += err;

            // Binary Cross Entropy Loss
            const epsilon = 1e-15;
            const safePred = Math.max(epsilon, Math.min(1 - epsilon, pred));
            totalLoss += -(p.label * Math.log(safePred) + (1 - p.label) * Math.log(1 - safePred));
        });

        // L2 Regularization
        dw1 += reg * this.w1;
        dw2 += reg * this.w2;
        totalLoss += 0.5 * reg * (this.w1 * this.w1 + this.w2 * this.w2);

        this.w1 -= lr * (dw1 / points.length);
        this.w2 -= lr * (dw2 / points.length);
        this.b -= lr * (db / points.length);

        return { loss: totalLoss / points.length };
    }

    predict(x: number, y: number) {
        return sigmoid(this.w1 * x + this.w2 * y + this.b);
    }
}

export class LinearSVM implements MLModel {
    type: ModelType = 'svm';
    w1: number = (Math.random() - 0.5) * 2;
    w2: number = (Math.random() - 0.5) * 2;
    b: number = (Math.random() - 0.5) * 2;

    reset() {
        this.w1 = (Math.random() - 0.5) * 2;
        this.w2 = (Math.random() - 0.5) * 2;
        this.b = (Math.random() - 0.5) * 2;
    }

    trainStep(points: DataPoint[], lr: number, reg: number) {
        if (points.length === 0) return { loss: 0 };
        let dw1 = 0, dw2 = 0, db = 0;
        let totalLoss = 0;

        points.forEach(p => {
            // SVM labels should be -1 and 1
            const y = p.label === 0 ? -1 : 1;
            const margin = y * (this.w1 * p.x + this.w2 * p.y + this.b);

            if (margin < 1) {
                dw1 += -y * p.x;
                dw2 += -y * p.y;
                db += -y;
                totalLoss += 1 - margin;
            }
        });

        // Adjust for dataset size and apply L2 norm regularization
        dw1 = (dw1 / points.length) + reg * this.w1;
        dw2 = (dw2 / points.length) + reg * this.w2;
        db = db / points.length;

        this.w1 -= lr * dw1;
        this.w2 -= lr * dw2;
        this.b -= lr * db;

        return { loss: totalLoss / points.length };
    }

    predict(x: number, y: number) {
        // Return mapped to 0-1 for heatmap rendering compatibility
        const z = this.w1 * x + this.w2 * y + this.b;
        return sigmoid(z * 2); // Sharpened sigmoid to mimic boundary
    }
}

export class KNearestNeighbors implements MLModel {
    type: ModelType = 'knn';
    k: number = 5;
    storedData: DataPoint[] = [];

    reset() {
        this.storedData = [];
    }

    // KNN doesn't "train", it stores. Loss is approximated by training error.
    trainStep(points: DataPoint[], lr: number, reg: number) {
        this.storedData = [...points];

        // Approximate loss by testing on itself
        if (points.length === 0) return { loss: 0 };
        let errs = 0;
        for (let i = 0; i < Math.min(50, points.length); i++) {
            const p = points[i];
            const pred = this.predict(p.x, p.y);
            if ((pred > 0.5 ? 1 : 0) !== p.label) errs++;
        }
        return { loss: errs / Math.min(50, points.length) };
    }

    predict(x: number, y: number) {
        if (this.storedData.length === 0) return 0.5;

        // Calculate distances
        const distances = this.storedData.map(p => ({
            d: (p.x - x) ** 2 + (p.y - y) ** 2,
            label: p.label
        }));

        distances.sort((a, b) => a.d - b.d);

        let sum = 0;
        const actualK = Math.min(this.k, distances.length);
        for (let i = 0; i < actualK; i++) {
            sum += distances[i].label;
        }

        // Return ratio of class 1 as probability
        return sum / actualK;
    }
}

// 2-Layer Multi-Layer Perceptron (Pure JS)
export class NeuralNetworkMLP implements MLModel {
    type: ModelType = 'mlp';

    // Architecture: 2 Input -> 8 Hidden -> 1 Output
    // W1: [8 x 2] Matrix, B1: [8] Vector
    w1: number[][] = [];
    b1: number[] = [];

    // W2: [1 x 8] Matrix, B2: [1] Vector
    w2: number[] = [];
    b2: number = 0;

    constructor() {
        this.reset();
    }

    reset() {
        // Random initialization (He init)
        this.w1 = Array(8).fill(0).map(() => [(Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2]);
        this.b1 = Array(8).fill(0.1);
        this.w2 = Array(8).fill(0).map(() => (Math.random() - 0.5) * 2);
        this.b2 = 0.1;
    }

    // ReLU activation
    relu(x: number) { return Math.max(0, x); }
    reluDeriv(x: number) { return x > 0 ? 1 : 0; }

    trainStep(points: DataPoint[], lr: number, reg: number) {
        if (points.length === 0) return { loss: 0 };
        let totalLoss = 0;

        // Gradients accumulation
        let dW1 = Array(8).fill(0).map(() => [0, 0]);
        let dB1 = Array(8).fill(0);
        let dW2 = Array(8).fill(0);
        let dB2 = 0;

        points.forEach(p => {
            // --- FORWARD PASS ---
            const inputs = [p.x, p.y];

            // Hidden layer
            const z1 = Array(8).fill(0);
            const a1 = Array(8).fill(0);
            for (let i = 0; i < 8; i++) {
                z1[i] = inputs[0] * this.w1[i][0] + inputs[1] * this.w1[i][1] + this.b1[i];
                a1[i] = this.relu(z1[i]);
            }

            // Output layer
            let z2 = this.b2;
            for (let i = 0; i < 8; i++) {
                z2 += a1[i] * this.w2[i];
            }
            const pred = sigmoid(z2);

            // Loss calculation (BCE)
            const epsilon = 1e-15;
            const safePred = Math.max(epsilon, Math.min(1 - epsilon, pred));
            totalLoss += -(p.label * Math.log(safePred) + (1 - p.label) * Math.log(1 - safePred));

            // --- BACKWARD PASS ---
            // Gradient of output layer w.r.t loss (dZ2)
            const dZ2 = pred - p.label; // Because d(BCE)/dZ * d(Sigmoid)/dZ simplifies to (pred - y)

            dB2 += dZ2;
            for (let i = 0; i < 8; i++) {
                dW2[i] += dZ2 * a1[i];
            }

            // Gradient of hidden layer (dZ1)
            for (let i = 0; i < 8; i++) {
                const dA1 = dZ2 * this.w2[i];
                const dZ1_i = dA1 * this.reluDeriv(z1[i]);

                dB1[i] += dZ1_i;
                dW1[i][0] += dZ1_i * inputs[0];
                dW1[i][1] += dZ1_i * inputs[1];
            }
        });

        // Average gradients and apply updates
        const m = points.length;
        this.b2 -= lr * (dB2 / m);
        for (let i = 0; i < 8; i++) {
            // Apply L2 regularization to weights
            this.w2[i] -= lr * ((dW2[i] / m) + reg * this.w2[i]);
            this.b1[i] -= lr * (dB1[i] / m);
            this.w1[i][0] -= lr * ((dW1[i][0] / m) + reg * this.w1[i][0]);
            this.w1[i][1] -= lr * ((dW1[i][1] / m) + reg * this.w1[i][1]);
        }

        return { loss: totalLoss / m };
    }

    predict(x: number, y: number) {
        // Forward pass only
        let z2 = this.b2;
        for (let i = 0; i < 8; i++) {
            const z1 = x * this.w1[i][0] + y * this.w1[i][1] + this.b1[i];
            z2 += this.relu(z1) * this.w2[i];
        }
        return sigmoid(z2);
    }
}
