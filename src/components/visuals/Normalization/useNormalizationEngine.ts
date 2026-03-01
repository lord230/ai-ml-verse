import { useState, useEffect, useMemo } from 'react';

export type NormalizationType = 'batch' | 'layer' | 'instance' | 'group';

export interface NormStats {
    means: number[];
    variances: number[];
    dimsUsed: string;
}

// Helper to generate deterministic random numbers
function sfc32(a: number, b: number, c: number, d: number) {
    return function () {
        a |= 0; b |= 0; c |= 0; d |= 0;
        var t = (a + b | 0) + d | 0;
        d = d + 1 | 0;
        a = b ^ b >>> 9;
        b = c + (c << 3) | 0;
        c = c << 21 | c >>> 11;
        c = c + t | 0;
        return (t >>> 0) / 4294967296;
    }
}

export function useNormalizationEngine(
    batchSize: number,
    channels: number,
    features: number,
    normType: NormalizationType,
    groupSize: number
) {
    // 1. Generate Raw Data Tensor [B, C, F]
    // We memoize so it doesn't regenerate violently on every render unless dimensions change.
    const rawTensor = useMemo(() => {
        const getRand = sfc32(1, 2, 3, 4); // Fixed seed for stable visualization
        const t = [];
        for (let b = 0; b < batchSize; b++) {
            const batch = [];
            for (let c = 0; c < channels; c++) {
                const feat = [];
                // Give different channels distinct baseline activations offset
                const channelBias = (c - channels / 2) * 1.5;
                for (let f = 0; f < features; f++) {
                    const noise = (getRand() * 4) - 2; // -2 to 2 noise
                    feat.push(channelBias + noise);
                }
                batch.push(feat);
            }
            t.push(batch);
        }
        return t;
    }, [batchSize, channels, features]);

    // 2. Compute Normalization
    // Returns [Normalized Tensor] and [Stats]
    const { normalizedTensor, stats } = useMemo(() => {
        const epsilon = 1e-5;
        const outTensor = JSON.parse(JSON.stringify(rawTensor)); // Deep copy structure
        const stats: NormStats = { means: [], variances: [], dimsUsed: '' };

        if (normType === 'batch') {
            // BatchNorm: Mean across (Batch, Features) for each Channel
            stats.dimsUsed = "(N, L) -> Normalize per Channel (C)";
            for (let c = 0; c < channels; c++) {
                let sum = 0;
                const count = batchSize * features;

                for (let b = 0; b < batchSize; b++) {
                    for (let f = 0; f < features; f++) {
                        sum += rawTensor[b][c][f];
                    }
                }
                const mean = sum / count;
                stats.means.push(mean);

                let varSum = 0;
                for (let b = 0; b < batchSize; b++) {
                    for (let f = 0; f < features; f++) {
                        varSum += Math.pow(rawTensor[b][c][f] - mean, 2);
                    }
                }
                const variance = varSum / count;
                stats.variances.push(variance);

                for (let b = 0; b < batchSize; b++) {
                    for (let f = 0; f < features; f++) {
                        outTensor[b][c][f] = (rawTensor[b][c][f] - mean) / Math.sqrt(variance + epsilon);
                    }
                }
            }
        }
        else if (normType === 'layer') {
            // LayerNorm: Mean across (Channels, Features) for each Batch element
            stats.dimsUsed = "(C, L) -> Normalize per Sample (N)";
            for (let b = 0; b < batchSize; b++) {
                let sum = 0;
                const count = channels * features;

                for (let c = 0; c < channels; c++) {
                    for (let f = 0; f < features; f++) {
                        sum += rawTensor[b][c][f];
                    }
                }
                const mean = sum / count;
                stats.means.push(mean);

                let varSum = 0;
                for (let c = 0; c < channels; c++) {
                    for (let f = 0; f < features; f++) {
                        varSum += Math.pow(rawTensor[b][c][f] - mean, 2);
                    }
                }
                const variance = varSum / count;
                stats.variances.push(variance);

                for (let c = 0; c < channels; c++) {
                    for (let f = 0; f < features; f++) {
                        outTensor[b][c][f] = (rawTensor[b][c][f] - mean) / Math.sqrt(variance + epsilon);
                    }
                }
            }
        }
        else if (normType === 'instance') {
            // InstanceNorm: Mean across (Features) for each Batch & each Channel
            stats.dimsUsed = "(L) -> Normalize per Sample/Channel (N,C)";
            for (let b = 0; b < batchSize; b++) {
                for (let c = 0; c < channels; c++) {
                    let sum = 0;
                    const count = features;

                    for (let f = 0; f < features; f++) {
                        sum += rawTensor[b][c][f];
                    }
                    const mean = sum / count;
                    stats.means.push(mean);

                    let varSum = 0;
                    for (let f = 0; f < features; f++) {
                        varSum += Math.pow(rawTensor[b][c][f] - mean, 2);
                    }
                    const variance = varSum / count;
                    stats.variances.push(variance);

                    for (let f = 0; f < features; f++) {
                        outTensor[b][c][f] = (rawTensor[b][c][f] - mean) / Math.sqrt(variance + epsilon);
                    }
                }
            }
        }
        else if (normType === 'group') {
            // GroupNorm: Divides Channels into Groups. Mean across (Features, Group Size)
            stats.dimsUsed = "(G, L) -> Normalize per Channel Group";
            const actualGroupSize = Math.max(1, Math.min(channels, groupSize));
            const numGroups = Math.ceil(channels / actualGroupSize);

            for (let b = 0; b < batchSize; b++) {
                for (let g = 0; g < numGroups; g++) {
                    const startC = g * actualGroupSize;
                    const endC = Math.min(startC + actualGroupSize, channels);

                    let sum = 0;
                    const count = (endC - startC) * features;

                    for (let c = startC; c < endC; c++) {
                        for (let f = 0; f < features; f++) {
                            sum += rawTensor[b][c][f];
                        }
                    }
                    const mean = sum / count;
                    stats.means.push(mean);

                    let varSum = 0;
                    for (let c = startC; c < endC; c++) {
                        for (let f = 0; f < features; f++) {
                            varSum += Math.pow(rawTensor[b][c][f] - mean, 2);
                        }
                    }
                    const variance = varSum / count;
                    stats.variances.push(variance);

                    for (let c = startC; c < endC; c++) {
                        for (let f = 0; f < features; f++) {
                            outTensor[b][c][f] = (rawTensor[b][c][f] - mean) / Math.sqrt(variance + epsilon);
                        }
                    }
                }
            }
        }

        return { normalizedTensor: outTensor, stats };
    }, [rawTensor, normType, batchSize, channels, features, groupSize]);

    return { rawTensor, normalizedTensor, stats };
}
