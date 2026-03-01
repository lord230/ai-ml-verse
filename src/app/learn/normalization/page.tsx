"use client";

import React, { useState } from 'react';
import NormalizationVisualizer from '@/components/visuals/Normalization/NormalizationVisualizer';

export default function NormalizationPage() {
    return (
        <main className="min-h-screen bg-slate-950 p-6 overscroll-none">
            <div className="max-w-[1600px] mx-auto space-y-6">

                {/* Header */}
                <div className="flex items-center justify-between glass-panel p-6 rounded-2xl border-slate-700/50">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-cyan-500 bg-clip-text text-transparent">
                            3D Normalization Explorer
                        </h1>
                        <p className="text-slate-400 mt-2">
                            Geometric intuition for Batch, Layer, Instance, and Group Normalization.
                        </p>
                    </div>
                </div>

                {/* Main 3D Interactive Component */}
                <NormalizationVisualizer />

            </div>
        </main>
    );
}
