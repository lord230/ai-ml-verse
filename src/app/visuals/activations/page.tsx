'use client';

import React, { useState } from 'react';
import { Settings2, Zap } from 'lucide-react';
import { ACTIVATIONS, getActivation, ActivationFunction } from '@/lib/math/activations';
import { ActivationCard } from '@/components/visuals/Activations/ActivationCard';
import { ActivationModal } from '@/components/visuals/Activations/ActivationModal';

export default function ActivationsPage() {
    const [selectedActivationId, setSelectedActivationId] = useState<string | null>(null);

    const selectedActivation = selectedActivationId
        ? getActivation(selectedActivationId) || null
        : null;

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 p-6 md:p-12 selection:bg-purple-500/30 selection:text-purple-200">

            {/* Header */}
            <header className="max-w-7xl mx-auto mb-16">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.15)]">
                        <Zap className="w-5 h-5 text-purple-400" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black font-sans bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400">
                        Activation Functions
                    </h1>
                </div>

                <p className="text-lg text-slate-400 max-w-3xl leading-relaxed">
                    Interactive laboratory to explore how neural networks transform data.
                    Activation functions introduce non-linearity, allowing deep learning models to learn complex patterns.
                    Select any function below to experiment visually and mathematically.
                </p>
                <div className="mt-8 flex gap-4 text-sm font-mono text-slate-500 items-center">
                    <Settings2 className="w-4 h-4" />
                    <span>Hover to preview • Click to experiment</span>
                </div>
            </header>

            {/* Grid Map */}
            <main className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {ACTIVATIONS.map((act) => (
                        <ActivationCard
                            key={act.id}
                            activation={act}
                            onClick={() => setSelectedActivationId(act.id)}
                        />
                    ))}
                </div>
            </main>

            {/* Modal Overlay */}
            {selectedActivation && (
                <ActivationModal
                    activation={selectedActivation}
                    onClose={() => setSelectedActivationId(null)}
                />
            )}

        </div>
    );
}
