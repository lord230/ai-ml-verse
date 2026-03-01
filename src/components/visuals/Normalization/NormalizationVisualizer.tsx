"use client";

import React, { useState, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Text } from '@react-three/drei';
import TensorBox from './TensorBox';
import ControlPanel from './ControlPanel';
import MathPanel from './MathPanel';
import DistributionGraph from './DistributionGraph';
import { NormalizationType, useNormalizationEngine } from './useNormalizationEngine';

export type ExplainerMode = 'beginner' | 'advanced';

export default function NormalizationVisualizer() {
    const [normType, setNormType] = useState<NormalizationType>('batch');
    const [mode, setMode] = useState<ExplainerMode>('beginner');
    const [isNormalized, setIsNormalized] = useState(false);

    // Tensor Dimensions
    const [batchSize, setBatchSize] = useState(4);
    const [channels, setChannels] = useState(4);
    const [features, setFeatures] = useState(6);
    const [groupSize, setGroupSize] = useState(2); // For GroupNorm

    // Math Engine
    const { rawTensor, normalizedTensor, stats } = useNormalizationEngine(
        batchSize, channels, features, normType, groupSize
    );

    const activeTensor = isNormalized ? normalizedTensor : rawTensor;

    return (
        <div className="flex flex-col lg:flex-row gap-6 w-full min-h-[800px]">

            {/* Left Column: 3D Scene */}
            <div className="flex-1 lg:w-2/3 glass-panel rounded-2xl relative border border-slate-700/50 overflow-hidden min-h-[600px] flex flex-col">
                <div className="absolute top-4 left-4 z-10 pointer-events-none">
                    <h2 className="text-xl font-bold text-white drop-shadow-md">
                        {isNormalized ? `${normType.toUpperCase()} NORMALIZED` : "RAW TENSOR"}
                    </h2>
                    <p className="text-sm text-slate-300 drop-shadow-sm mt-1 max-w-sm">
                        Rotate the block (click & drag) to view across Batch (Z), Channels (Y), and Features (X).
                    </p>
                </div>

                <div className="flex-1 w-full h-full cursor-grab active:cursor-grabbing">
                    <Canvas camera={{ position: [features * 1.5, channels * 1.5, batchSize * 2.5], fov: 45 }}>
                        <ambientLight intensity={0.6} />
                        <pointLight position={[10, 10, 10]} intensity={1.5} />
                        <OrbitControls makeDefault minDistance={5} maxDistance={50} />

                        <TensorBox
                            tensor={activeTensor}
                            batchSize={batchSize}
                            channels={channels}
                            features={features}
                            normType={normType}
                            isNormalized={isNormalized}
                            stats={stats}
                            groupSize={groupSize}
                        />

                        {/* Axis Labels pointing outwards */}
                        <group position={[features / 2 + 1, -channels / 2 - 1, -batchSize / 2 - 1]}>
                            <Text color="#ef4444" fontSize={0.6} position={[features / 2, 0, 0]}>Features (X)</Text>
                            <Text color="#22c55e" fontSize={0.6} position={[0, channels / 2, 0]}>Channels (Y)</Text>
                            <Text color="#3b82f6" fontSize={0.6} position={[0, 0, batchSize / 2]}>Batch (Z)</Text>
                        </group>
                    </Canvas>
                </div>
            </div>

            {/* Right Column: Controls & Math */}
            <div className="w-full lg:w-1/3 flex flex-col gap-6 overflow-y-auto pr-2 pb-12">
                <ControlPanel
                    normType={normType} setNormType={setNormType}
                    mode={mode} setMode={setMode}
                    isNormalized={isNormalized} setIsNormalized={setIsNormalized}
                    batchSize={batchSize} setBatchSize={setBatchSize}
                    channels={channels} setChannels={setChannels}
                    features={features} setFeatures={setFeatures}
                    groupSize={groupSize} setGroupSize={setGroupSize}
                />

                <DistributionGraph tensor={activeTensor} isNormalized={isNormalized} />

                {mode === 'advanced' ? (
                    <MathPanel normType={normType} stats={stats} isNormalized={isNormalized} />
                ) : (
                    <div className="bg-slate-900/40 rounded-xl p-5 border border-slate-700/50 mt-6 relative overflow-hidden backdrop-blur-md">
                        <h4 className="text-sm font-semibold text-slate-300 mb-2 border-b border-slate-700/50 pb-2">Simple Intuition</h4>
                        <div className="text-sm text-slate-400 leading-relaxed font-medium space-y-2">
                            {normType === 'batch' && <p><span className="text-blue-400 font-bold">Batch Normalization</span> looks at one single Feature/Channel at a time, but averages it across <em>every single example</em> in your Batch. It ensures that specific feature is balanced across your dataset slice.</p>}
                            {normType === 'layer' && <p><span className="text-teal-400 font-bold">Layer Normalization</span> looks at just <em>one single example</em> at a time, and averages ALL of its features and channels together. It ignores the rest of the batch completely.</p>}
                            {normType === 'instance' && <p><span className="text-fuchsia-400 font-bold">Instance Normalization</span> is the most specific: it takes just <em>one example</em>, grabs just <em>one channel</em> from it, and averages only its spatial features. Often used in Image Style Transfer.</p>}
                            {normType === 'group' && <p><span className="text-amber-400 font-bold">Group Normalization</span> splits your channels into smaller chunks limit the averaging. It's a compromise between Layer and Instance norm, and survives tiny batch sizes unlike BatchNorm.</p>}
                        </div>
                    </div>
                )}
            </div>

        </div>
    );
}
