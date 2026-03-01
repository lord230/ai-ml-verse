import React from 'react';
import { Network } from 'lucide-react';
import BackpropVisualizer from '@/components/visuals/Backprop/BackpropVisualizer';

export const metadata = {
    title: 'Backpropagation Visualizer | AI ML Verse',
    description: 'Learn how neural networks update their weights using interactive backpropagation visualizations.',
};

export default function BackpropagationPage() {
    return (
        <div className="flex-1 flex flex-col p-4 md:p-8 max-w-[1600px] mx-auto w-full">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white flex items-center">
                    <Network className="w-8 h-8 mr-3 text-violet-500" />
                    Interactive Backpropagation
                </h1>
                <p className="text-slate-400 mt-2 max-w-4xl">
                    Understand how neural networks learn from their mistakes. Watch the errors flow backwards
                    and adjust the connections to improve future predictions.
                </p>
            </div>

            {/* Main Visualizer Container */}
            <BackpropVisualizer />
        </div>
    );
}
