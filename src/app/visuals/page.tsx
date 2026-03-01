import Link from 'next/link';
import { Presentation, TrendingDown, Scissors, Activity, Network, BoxSelect } from 'lucide-react';

export default function VisualsHub() {
    const visuals = [
        {
            title: 'Gradient Descent',
            desc: 'Interactive simulator of the core optimization algorithm. Adjust learning rates to see convergence or divergence.',
            href: '/visuals/gradient-descent',
            icon: TrendingDown,
            color: 'text-rose-400',
            bg: 'bg-rose-500/20'
        },
        {
            title: 'Decision Boundary',
            desc: 'Watch how an algorithm finds the separating hyperplane for 2D classification data point clouds.',
            href: '/visuals/decision-boundary',
            icon: Scissors,
            color: 'text-amber-400',
            bg: 'bg-amber-500/20'
        },
        {
            title: 'Overfitting Demo',
            desc: 'Understand the bias-variance tradeoff by tuning model complexity on noisy regression targets.',
            href: '/visuals/overfitting-demo',
            icon: Activity,
            color: 'text-indigo-400',
            bg: 'bg-indigo-500/20'
        },
        {
            title: 'Backpropagation Flow',
            desc: 'Interactive step-by-step math and intuition behind how neural networks learn from their mistakes.',
            href: '/visuals/backprop',
            icon: Network,
            color: 'text-violet-400',
            bg: 'bg-violet-500/20'
        },
        {
            title: '3D Normalization',
            desc: 'Geometric intuition for Batch, Layer, Instance, and Group Normalization using interactive 3D tensors.',
            href: '/learn/normalization',
            icon: BoxSelect,
            color: 'text-cyan-400',
            bg: 'bg-cyan-500/20'
        }
    ];

    return (
        <div className="flex-1 flex flex-col p-4 md:p-8 max-w-screen-xl mx-auto w-full">
            <div className="mb-12">
                <h1 className="text-3xl font-bold text-white flex items-center">
                    <Presentation className="w-8 h-8 mr-3 text-amber-500" />
                    ML Visual Playground
                </h1>
                <p className="text-slate-400 mt-2 max-w-2xl">
                    Develop an intuitive, geometric understanding of the mechanics behind modern machine learning.
                    These interactive components simulate mathematical behaviors directly in the browser.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {visuals.map(v => (
                    <Link key={v.href} href={v.href} className="glass-panel group rounded-2xl p-8 transition-all duration-300 hover:-translate-y-2 hover:border-slate-500 hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)]">
                        <div className={`w-14 h-14 rounded-xl ${v.bg} flex items-center justify-center mb-6 transition-transform group-hover:scale-110`}>
                            <v.icon className={`w-7 h-7 ${v.color}`} />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">{v.title}</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">{v.desc}</p>
                    </Link>
                ))}
            </div>
        </div>
    );
}
