export type PrecisionMode = 'FP32' | 'FP16' | 'BF16' | 'FP8' | 'FP4';
export type InterconnectType = 'PCIe' | 'NVLink' | 'Infiniband';

export interface MLModelConfig {
    paramsMillions: number;
    datasetSize: number;
    batchSize: number;
    epochs: number;
}

export interface TrainingStrategy {
    precision: PrecisionMode;
    enableLoRA: boolean;
    loraRank: number;
    loraPercent: number; // 0 to 1
    enableQAT: boolean;
    qatBits: 4 | 8;
    enableCheckpointing: boolean;
    enableDDP: boolean;
    numGPUs: number;
    interconnect: InterconnectType;
}

export const GPUs = [
    { id: 't4', name: 'NVIDIA T4', vramGB: 16, hourlyCost: 0.35, baseThroughput: 150000 },
    { id: 'rtx3090', name: 'RTX 3090', vramGB: 24, hourlyCost: 0.50, baseThroughput: 300000 },
    { id: 'v100', name: 'NVIDIA V100', vramGB: 32, hourlyCost: 1.5, baseThroughput: 350000 },
    { id: 'rtx4090', name: 'RTX 4090', vramGB: 24, hourlyCost: 0.8, baseThroughput: 550000 },
    { id: 'rtx5090', name: 'RTX 5090', vramGB: 32, hourlyCost: 1.2, baseThroughput: 750000 },
    { id: 'a100', name: 'NVIDIA A100 (80GB)', vramGB: 80, hourlyCost: 3.0, baseThroughput: 800000 }
];

export interface SimulatorResult {
    vramPerGPU: number;
    isOOM: boolean;
    totalTimeHours: number;
    cost: number;
    costSavingsFP32: number | null;
    efficiencyPercent: number;
    memoryBreakdown: { label: string; value: number }[];
    timeBreakdown: { label: string; value: number }[];
}

export function simulateTraining(
    config: MLModelConfig,
    strategy: TrainingStrategy,
    gpu: typeof GPUs[0]
): SimulatorResult {
    const { paramsMillions, datasetSize, batchSize, epochs } = config;

    // 1) PRECISION MEMORY
    const bytesPerParamMap: Record<PrecisionMode, number> = {
        FP32: 4, FP16: 2, BF16: 2, FP8: 1, FP4: 0.5
    };
    const trainMultipliersMap: Record<PrecisionMode, number> = {
        FP32: 3, FP16: 2, BF16: 2, FP8: 1.5, FP4: 1.25
    };

    const precisionBytes = bytesPerParamMap[strategy.precision];
    const trainMultiplier = trainMultipliersMap[strategy.precision];

    // Base Weights Memory
    // weights_memory = params * 1e6 * precision_bytes
    let weightsMemoryBytes = paramsMillions * 1e6 * precisionBytes;

    // 3) QAT
    if (strategy.enableQAT) {
        if (strategy.qatBits === 8) {
            weightsMemoryBytes *= 0.5; // 8-bit → 50% reduction
        } else if (strategy.qatBits === 4) {
            weightsMemoryBytes *= 0.25; // 4-bit → 75% reduction
        }
    }

    // base_model_memory = weights_memory * multiplier
    // we apply multiplier to the raw memory to account for optimizer states
    // although QAT reduces ONLY weights.
    // We can calculate optimizer stat memory = (weights_memory_original * (multiplier - 1))
    const originalWeightsMemoryBytes = paramsMillions * 1e6 * precisionBytes;
    let optimizerMemoryBytes = originalWeightsMemoryBytes * (trainMultiplier - 1);

    let baseModelMemory = weightsMemoryBytes + optimizerMemoryBytes;

    // Activations rough estimate (batch dependent)
    // Let's assume roughly batchSize * params * 1e6 * 0.05 per GPU
    let activationMemoryBytes = batchSize * paramsMillions * 1e6 * 0.05 * 4; // FP32 activations assumption scaled

    // 2) LORA
    let loraMemoryBytes = 0;
    if (strategy.enableLoRA) {
        // freeze original weights (no optimizer states for frozen layers)
        optimizerMemoryBytes *= (1 - strategy.loraPercent);

        // lora_memory = (params * adapted_percent) * (2 * r) * 4 bytes
        // (We treat 4 bytes here as an approximation for LoRA scaling per prompt)
        loraMemoryBytes = (paramsMillions * 1e6 * strategy.loraPercent) * (2 * strategy.loraRank) * 4;

        // final_memory = (base_model_memory * (1 - adapted_percent)) + lora_memory
        // Wait, prompt specific formulas:
        const baseMemoryOriginalFormula = originalWeightsMemoryBytes * trainMultiplier;
        baseModelMemory = (baseMemoryOriginalFormula * (1 - strategy.loraPercent)) + loraMemoryBytes;

        // applying QAT to the unfrozen part if needed, but going with prompt's strictly literal formulas
    } else {
        baseModelMemory = weightsMemoryBytes + optimizerMemoryBytes;
    }

    // 4) GRADIENT CHECKPOINTING
    let checkpointOverhead = 1.0;
    if (strategy.enableCheckpointing) {
        activationMemoryBytes *= 0.7; // ~30% reduction
        checkpointOverhead = 1.2;     // Time overhead
    }

    const numGPUsSafe = strategy.enableDDP ? strategy.numGPUs : 1;
    const vramTotalBytes = baseModelMemory + (activationMemoryBytes / numGPUsSafe);
    const vramTotalGB = vramTotalBytes / (1024 ** 3);

    const isOOM = vramTotalGB > gpu.vramGB;

    // 5) DDP
    const effectiveBatchSize = strategy.enableDDP ? (batchSize * numGPUsSafe) : batchSize;
    const stepsPerEpoch = datasetSize / effectiveBatchSize;

    let efficiency = 1.0;
    if (strategy.enableDDP && strategy.numGPUs > 1) {
        if (strategy.interconnect === 'PCIe') {
            efficiency = 0.75 + (0.05 * Math.log(strategy.numGPUs));
        } else if (strategy.interconnect === 'NVLink') {
            efficiency = 0.85 + (0.04 * Math.log(strategy.numGPUs));
        } else if (strategy.interconnect === 'Infiniband') {
            efficiency = 0.90 + (0.03 * Math.log(strategy.numGPUs));
        }
    }
    efficiency = Math.max(0.1, Math.min(efficiency, 0.98));

    // 6) TIME ESTIMATION
    const totalSteps = stepsPerEpoch * epochs;

    const speedMultipliersMap: Record<PrecisionMode, number> = {
        FP32: 1, FP16: 1.8, BF16: 1.7, FP8: 2.5, FP4: 3
    };
    const precisionMulti = speedMultipliersMap[strategy.precision];

    // Base throughput is abstract steps * MParams scaled. Let's make it realistic:
    // gpu_base_throughput = Abstract value / MParams
    const throughputPerGPU = gpu.baseThroughput / paramsMillions;

    /*
     total_time =
       total_steps /
       (gpu_base_throughput *
        precision_multiplier *
        num_gpus *
        efficiency)
    */

    let totalTimeHours = totalSteps / (throughputPerGPU * precisionMulti * numGPUsSafe * efficiency);
    totalTimeHours *= checkpointOverhead; // Applies gradient checkpoint overhead

    // 7) COST
    const cost = totalTimeHours * gpu.hourlyCost * numGPUsSafe;

    // Baseline FP32 cost
    const fp32TotalTime = totalSteps / (throughputPerGPU * 1 * numGPUsSafe * efficiency) * checkpointOverhead;
    const fp32Cost = fp32TotalTime * gpu.hourlyCost * numGPUsSafe;
    const costSavingsFP32 = strategy.precision !== 'FP32' ? (fp32Cost - cost) : null;

    return {
        vramPerGPU: vramTotalGB,
        isOOM,
        totalTimeHours,
        cost,
        costSavingsFP32,
        efficiencyPercent: efficiency * 100,
        memoryBreakdown: [
            { label: 'Weights', value: weightsMemoryBytes / (1024 ** 3) },
            { label: 'Optimizer States', value: optimizerMemoryBytes / (1024 ** 3) },
            { label: 'Activations', value: (activationMemoryBytes / numGPUsSafe) / (1024 ** 3) },
            { label: 'LoRA Storage', value: loraMemoryBytes / (1024 ** 3) }
        ].filter(i => i.value > 0),
        timeBreakdown: [
            { label: 'Compute Time', value: totalTimeHours / checkpointOverhead },
            { label: 'Checkpoint Overhd', value: totalTimeHours - (totalTimeHours / checkpointOverhead) }
        ].filter(i => i.value > 0)
    };
}
