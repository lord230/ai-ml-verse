"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Scissors } from 'lucide-react';
import { DataPoint, DatasetType, generateDataset } from '@/components/visuals/DecisionBoundary/DatasetGenerator';
import { MLModel, ModelType, LogisticRegression, LinearSVM, KNearestNeighbors, NeuralNetworkMLP } from '@/components/visuals/DecisionBoundary/Models';
import { CanvasVisualizer } from '@/components/visuals/DecisionBoundary/CanvasVisualizer';
import { ControlPanel } from '@/components/visuals/DecisionBoundary/ControlPanel';
import { StatsAndMath } from '@/components/visuals/DecisionBoundary/StatsAndMath';

export default function DecisionBoundaryVisual() {
    // ---- State ----
    const [points, setPoints] = useState<DataPoint[]>([]);

    // Hyperparams
    const [dataset, setDataset] = useState<DatasetType>('moons');
    const [modelType, setModelType] = useState<ModelType>('logistic');
    const [lr, setLr] = useState(0.1);
    const [reg, setReg] = useState(0.001);
    const [noise, setNoise] = useState(0.2);
    const [brushClass, setBrushClass] = useState<number>(0);

    // Training state
    const [isTraining, setIsTraining] = useState(false);
    const [epoch, setEpoch] = useState(0);
    const [loss, setLoss] = useState(0);

    // Force re-renders for canvas without full react diffing
    const [renderSignal, setRenderSignal] = useState(0);

    // Persist model instance across renders
    const modelRef = useRef<MLModel>(new LogisticRegression());

    // ---- Handlers ----
    const getModelInstance = (type: ModelType): MLModel => {
        switch (type) {
            case 'logistic': return new LogisticRegression();
            case 'svm': return new LinearSVM();
            case 'knn': return new KNearestNeighbors();
            case 'mlp': return new NeuralNetworkMLP();
            default: return new LogisticRegression();
        }
    };

    const handleGenerateData = useCallback(() => {
        const pts = generateDataset(dataset, 200, noise);
        setPoints(pts);

        // Reset model on new data
        modelRef.current.reset();
        setEpoch(0);
        setLoss(0);
        setIsTraining(false);
        setRenderSignal(s => s + 1);
    }, [dataset, noise]);

    // Update Model Instance
    useEffect(() => {
        modelRef.current = getModelInstance(modelType);
        setEpoch(0);
        setLoss(0);
        setIsTraining(false);
        setRenderSignal(s => s + 1);

        // Auto-run KNN once
        if (modelType === 'knn' && points.length > 0) {
            const res = modelRef.current.trainStep(points, lr, reg);
            setLoss(res.loss);
            setRenderSignal(s => s + 1);
        }
    }, [modelType, points, lr, reg]); // Depend on points changes (for KNN custom drawing)

    // Initial load
    useEffect(() => {
        handleGenerateData();
    }, [handleGenerateData]);

    const handleAddPoint = (x: number, y: number, label: number) => {
        if (dataset !== 'custom') return;
        setPoints(prev => [...prev, { x, y, label }]);
        // Re-calculate KNN passively
        if (modelType === 'knn') setRenderSignal(s => s + 1);
    };

    const resetModel = () => {
        modelRef.current.reset();
        setEpoch(0);
        setLoss(0);
        setIsTraining(false);
        setRenderSignal(s => s + 1);
    };

    // ---- Training Loop ----
    useEffect(() => {
        let animationFrameId: number;

        const trainLoop = () => {
            if (isTraining && modelRef.current.type !== 'knn') {
                const result = modelRef.current.trainStep(points, lr, reg);

                setLoss(result.loss);
                setEpoch(prev => prev + 1);
                setRenderSignal(s => s + 1);
            }
            animationFrameId = requestAnimationFrame(trainLoop);
        };

        if (isTraining) {
            animationFrameId = requestAnimationFrame(trainLoop);
        }

        return () => cancelAnimationFrame(animationFrameId);
    }, [isTraining, points, lr, reg]);

    return (
        <div className="flex-1 flex flex-col p-4 md:p-8 max-w-[1600px] mx-auto w-full">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white flex items-center">
                    <Scissors className="w-8 h-8 mr-3 text-emerald-500" />
                    Interactive Decision Boundary Explorer
                </h1>
                <p className="text-slate-400 mt-2 max-w-4xl">
                    Watch in real-time as different ML models warp the decision space to separate classes through Gradient Descent.
                    Experiment with Logistic Regression's linear constraints or a Neural Network's hyper-dimensional folding.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Visualizer (Center Canvas) */}
                <div className="lg:col-span-6 xl:col-span-7 h-[600px]">
                    <CanvasVisualizer
                        points={points}
                        model={modelRef.current}
                        renderSignal={renderSignal}
                        isTraining={isTraining}
                        onAddPoint={handleAddPoint}
                        brushClass={brushClass}
                    />
                </div>

                {/* Right/Side Panels */}
                <div className="lg:col-span-6 xl:col-span-5 flex flex-col gap-6">
                    <ControlPanel
                        dataset={dataset} setDataset={setDataset}
                        modelType={modelType} setModelType={setModelType}
                        isTraining={isTraining} setIsTraining={setIsTraining}
                        resetModel={resetModel} generateData={handleGenerateData}
                        lr={lr} setLr={setLr} reg={reg} setReg={setReg} noise={noise} setNoise={setNoise}
                        brushClass={brushClass} setBrushClass={setBrushClass}
                    />

                    <StatsAndMath
                        modelType={modelType}
                        loss={loss}
                        epoch={epoch}
                    />
                </div>

            </div>
        </div>
    );
}
