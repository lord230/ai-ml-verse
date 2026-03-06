"use client";

import React from 'react';
import { BookOpen, Activity } from 'lucide-react';
import { ModelType } from './Models';
import 'katex/dist/katex.min.css';
import { BlockMath } from 'react-katex';

interface StatsAndMathProps {
    modelType: ModelType;
    loss: number;
    epoch: number;
}

export function StatsAndMath({ modelType, loss, epoch }: StatsAndMathProps) {
    return (
        <div className="glass-panel p-6 rounded-2xl flex flex-col space-y-8 w-full">
            <div>
                <h3 className="text-lg font-bold text-white flex items-center mb-4">
                    <Activity className="w-5 h-5 mr-2 text-emerald-400" />
                    Live Metrics
                </h3>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-900/80 border border-slate-700 p-4 rounded-xl flex flex-col">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Epoch</span>
                        <span className="text-2xl font-mono text-white">{epoch}</span>
                    </div>
                    <div className="bg-slate-900/80 border border-slate-700 p-4 rounded-xl flex flex-col">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Loss</span>
                        <span className="text-2xl font-mono text-amber-400">{loss.toFixed(4)}</span>
                    </div>
                </div>
            </div>

            <hr className="border-slate-800" />

            <div>
                <h3 className="text-lg font-bold text-white flex items-center mb-4">
                    <BookOpen className="w-5 h-5 mr-2 text-sky-400" />
                    Math Explorer
                </h3>

                <div className="text-sm text-slate-300 leading-relaxed bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                    {modelType === 'logistic' && (
                        <div>
                            <h4 className="font-bold text-white mb-2">Logistic Regression</h4>
                            <p className="mb-3">
                                Models the probability of a point belonging to class 1 using a linear combination of features passed through a Sigmoid activation function.
                            </p>
                            <div className="bg-slate-950 p-2 rounded-lg text-sky-300 overflow-x-auto border border-slate-800 shadow-inner">
                                <BlockMath math="z = w_1x_1 + w_2x_2 + b" />
                                <BlockMath math="P(y=1|x) = \frac{1}{1 + e^{-z}}" />
                            </div>
                            <p className="mt-3 text-xs text-slate-400">
                                This algorithm mathematically can only draw a straight straight line through the 2D plane. It fails on non-linear datasets (like Moons or Circles).
                            </p>
                        </div>
                    )}

                    {modelType === 'svm' && (
                        <div>
                            <h4 className="font-bold text-white mb-2">Linear SVM</h4>
                            <p className="mb-3">
                                Support Vector Machines seek the "maximum margin" hyperplane that separates the classes. This demo uses Hinge Loss.
                            </p>
                            <div className="bg-slate-950 p-2 rounded-lg text-sky-300 overflow-x-auto border border-slate-800 shadow-inner relative">
                                <BlockMath math="\text{Loss} = \max(0, 1 - y_i(w \cdot x_i + b))" />
                                <div className="absolute top-2 right-2 text-[10px] text-slate-500 font-mono">{`// y_i \\in \\{-1, 1\\}`}</div>
                            </div>
                        </div>
                    )}

                    {modelType === 'knn' && (
                        <div>
                            <h4 className="font-bold text-white mb-2">K-Nearest Neighbors</h4>
                            <p className="mb-3">
                                A non-parametric method. KNN doesn't learn mathematical weights. It remembers all points and votes based on Euclidean distance.
                            </p>
                            <div className="bg-slate-950 p-2 rounded-lg text-sky-300 overflow-x-auto border border-slate-800 shadow-inner">
                                <BlockMath math="d = \sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}" />
                                <BlockMath math="\hat{y} = \text{mode}(k \text{ closest neighbors})" />
                            </div>
                            <p className="mt-3 text-xs text-slate-400">
                                This creates highly complex, perfectly-fitted (sometimes overfitted) boundaries without optimization.
                            </p>
                        </div>
                    )}

                    {modelType === 'mlp' && (
                        <div>
                            <h4 className="font-bold text-white mb-2">Multi-Layer Perceptron</h4>
                            <p className="mb-3">
                                A 2-Layer Neural Network (8 hidden neurons) acting as a universal function approximator, capable of drawing highly non-linear, curved boundaries.
                            </p>
                            <div className="bg-slate-950 p-2 rounded-lg text-sky-300 overflow-x-auto border border-slate-800 shadow-inner">
                                <BlockMath math="\text{Hidden} = \text{ReLU}(W_1X + b_1)" />
                                <BlockMath math="\text{Output} = \text{Sigmoid}(W_2\text{Hidden} + b_2)" />
                            </div>
                            <p className="mt-3 text-xs text-slate-400">
                                Watch how the boundary warps and bends over epochs to encapsulate the yellow class inside the circles dataset!
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
