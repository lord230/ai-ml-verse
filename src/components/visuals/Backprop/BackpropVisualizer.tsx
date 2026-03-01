"use client";

import React, { useState, useEffect } from 'react';
import ControlPanel from './ControlPanel';
import NetworkCanvas from './NetworkCanvas';
import LossGraph from './LossGraph';
import StepExplorer from './StepExplorer';
import { useMathEngine, WeightMap } from './useMathEngine';

export type ExplainerMode = 'eli10' | 'advanced';

const INITIAL_WEIGHTS: WeightMap = {
    'i1-h1': 0.5, 'i2-h1': 0.3, 'i3-h1': -0.2,
    'i1-h2': -0.4, 'i2-h2': 0.8, 'i3-h2': 0.1,
    'h1-o1': 0.6, 'h2-o1': -0.5
};

export default function BackpropVisualizer() {
    // ---- UI State ----
    const [mode, setMode] = useState<ExplainerMode>('eli10');
    const [isPlaying, setIsPlaying] = useState(false);
    const [speed, setSpeed] = useState(1);
    const [learningRate, setLearningRate] = useState(0.1);

    // ---- Network State ----
    const [inputs, setInputs] = useState([1.0, 0.5, -0.2]);
    const [target, setTarget] = useState(0.8);
    const [weights, setWeights] = useState<WeightMap>(INITIAL_WEIGHTS);

    // ---- Training & Steps State ----
    const [epoch, setEpoch] = useState(0);
    const [lossHistory, setLossHistory] = useState<{ epoch: number, loss: number }[]>([]);
    const [currentStep, setCurrentStep] = useState(0); // 0 = Idle, 1-7 stages

    // Compute the pure mathematical reality *before* rendering
    const math = useMathEngine(inputs, target, weights);

    // Animation / Auto-Play Loop
    useEffect(() => {
        if (!isPlaying) return;

        const duration = 2000 / speed; // Base tick per step

        const timer = setTimeout(() => {
            handleNextStep();
        }, duration);

        return () => clearTimeout(timer);
    }, [isPlaying, currentStep, speed, math]);

    const handleNextStep = () => {
        if (currentStep < 7) {
            // Check if we are at Step 6 and moving to 7: we need to actually apply the weights!
            if (currentStep === 6) {
                applyWeights();
            }
            setCurrentStep(prev => prev + 1);
        } else {
            // We are at step 7, looping back to step 1
            setEpoch(prev => prev + 1);
            setLossHistory(prev => [...prev, { epoch: epoch + 1, loss: math.loss }]);
            setCurrentStep(1);
        }
    };

    const handlePrevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const applyWeights = () => {
        setWeights(prev => ({
            'i1-h1': Math.max(-10, Math.min(10, prev['i1-h1'] - learningRate * math.grad_i1_h1)),
            'i2-h1': Math.max(-10, Math.min(10, prev['i2-h1'] - learningRate * math.grad_i2_h1)),
            'i3-h1': Math.max(-10, Math.min(10, prev['i3-h1'] - learningRate * math.grad_i3_h1)),
            'i1-h2': Math.max(-10, Math.min(10, prev['i1-h2'] - learningRate * math.grad_i1_h2)),
            'i2-h2': Math.max(-10, Math.min(10, prev['i2-h2'] - learningRate * math.grad_i2_h2)),
            'i3-h2': Math.max(-10, Math.min(10, prev['i3-h2'] - learningRate * math.grad_i3_h2)),
            'h1-o1': Math.max(-10, Math.min(10, prev['h1-o1'] - learningRate * math.grad_h1_o1)),
            'h2-o1': Math.max(-10, Math.min(10, prev['h2-o1'] - learningRate * math.grad_h2_o1)),
        }));
    };

    const handlePlayPause = () => setIsPlaying(!isPlaying);
    const handleReset = () => {
        setIsPlaying(false);
        setEpoch(0);
        setLossHistory([]);
        setCurrentStep(0);
        setWeights(INITIAL_WEIGHTS);
    };

    // If inputs change, reset derivation step immediately based on Master Prompt constraints
    useEffect(() => {
        if (currentStep > 0) {
            setCurrentStep(1);
            setIsPlaying(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [inputs, target]);

    // Keyboard controls for rapid stepping
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if typing inside input fields
            if (document.activeElement?.tagName === 'INPUT') return;

            if (e.key === 'ArrowRight') {
                handleNextStep();
            } else if (e.key === 'ArrowLeft') {
                handlePrevStep();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentStep, epoch, math.loss]); // capture necessary states used in navigation closures

    // If learning rate changes, recompute but step stays (engine hook handles math automatically)

    return (
        <div className="flex flex-col gap-6 w-full min-h-[700px]">
            {/* Top Section: Visualization & Math Explorer */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-auto lg:h-[800px]">
                {/* Left Side: Neural Graph Context (Minimal) */}
                <div className="flex-1 glass-panel rounded-2xl overflow-hidden relative border border-slate-700/50 h-[500px] lg:h-full">
                    <NetworkCanvas
                        inputs={inputs}
                        target={target}
                        currentStep={currentStep}
                        math={math}
                        speed={speed}
                    />
                </div>

                {/* Right Side: Math Explorer Board */}
                <div className="min-h-[600px] lg:h-full">
                    <StepExplorer
                        mode={mode}
                        currentStep={currentStep}
                        math={math}
                        learningRate={learningRate}
                        inputs={inputs}
                    />
                </div>
            </div>

            {/* Bottom Section: Controls & Mini-Graph */}
            <div className="w-full">
                <ControlPanel
                    mode={mode}
                    setMode={setMode}
                    isPlaying={isPlaying}
                    handlePlayPause={handlePlayPause}
                    currentStep={currentStep}
                    handleNext={handleNextStep}
                    handlePrev={handlePrevStep}
                    speed={speed}
                    setSpeed={setSpeed}
                    learningRate={learningRate}
                    setLearningRate={setLearningRate}
                    handleReset={handleReset}
                    inputs={inputs}
                    setInputs={setInputs}
                    target={target}
                    setTarget={setTarget}
                    lossHistory={lossHistory}
                />
            </div>
        </div>
    );
}
