'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { BrainCircuit, Cpu, Database, Presentation, GraduationCap, LogOut, ArrowRight } from 'lucide-react';

const TOOLS = [
    { href: '/tools/model-cost-calculator', label: 'Model Cost Simulator', description: 'Estimate VRAM, training time, and GPU costs.', icon: Cpu, color: 'indigo' },
    { href: '/tools/dataset-explorer', label: 'Dataset Explorer', description: 'Analyze CSV files for correlations and statistics.', icon: Database, color: 'teal' },
    { href: '/visuals', label: 'ML Visual Playground', description: 'Interactive gradient descent and decision boundary visualizations.', icon: Presentation, color: 'rose' },
    { href: '/learn/cnn-roadmap', label: 'Mastering CNNs', description: 'Step-by-step roadmap from Calculus to Vision Transformers.', icon: GraduationCap, color: 'emerald' },
    { href: '/learn/transformers', label: 'Mastering Transformers', description: 'Build a Transformer from scratch with interactive visualizations.', icon: BrainCircuit, color: 'purple' },
    { href: '/architecture-playground', label: 'Architecture Playground', description: 'Compare parameter counts across MLP, CNN, Transformer architectures.', icon: Cpu, color: 'amber' },
];

const colorMap: Record<string, string> = {
    indigo: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30 hover:border-indigo-500/60',
    teal: 'bg-teal-500/20 text-teal-400 border-teal-500/30 hover:border-teal-500/60',
    rose: 'bg-rose-500/20 text-rose-400 border-rose-500/30 hover:border-rose-500/60',
    emerald: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:border-emerald-500/60',
    purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30 hover:border-purple-500/60',
    amber: 'bg-amber-500/20 text-amber-400 border-amber-500/30 hover:border-amber-500/60',
};

export default function DashboardPage() {
    const { user, signOut } = useAuth();
    const router = useRouter();
    const [welcomeMessage, setWelcomeMessage] = useState('Welcome back!');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedName = sessionStorage.getItem('userName');
            const storedTimeAwayMs = sessionStorage.getItem('timeAwayMs');

            let displayName = user?.email?.split('@')[0] || '';
            // First check user metadata (from signup)
            if (user?.user_metadata?.name) {
                displayName = user.user_metadata.name;
            }
            // Then check session storage (from login)
            if (storedName) {
                displayName = storedName;
            }

            if (storedTimeAwayMs) {
                const timeAwaySec = Number(storedTimeAwayMs) / 1000;
                let messageOptions = [`Welcome back, ${displayName}! 👋`];

                if (timeAwaySec < 3600) {
                    // Less than an hour
                    messageOptions = [
                        `you couldn't stay away for long! 😂`,
                        `back so soon? We love the dedication! 🔥`,
                        `just checking in? Let's go! 🚀`
                    ];
                } else if (timeAwaySec < 86400) {
                    // Less than a day
                    messageOptions = [
                        `good to see you again today! 🚀`,
                        `ready for another session? 🧠`,
                        `hope you had a good break! Let's dive in. 💻`
                    ];
                } else if (timeAwaySec < 604800) {
                    // Less than a week
                    messageOptions = [
                        `it's been a few days! Let's get back to work. ⚡`,
                        `missed you around here! 🌟`,
                        `time to brush up on those ML skills! 📚`
                    ];
                } else {
                    // More than a week
                    messageOptions = [
                        `long time no see! Ready to catch up? 🕰️`,
                        `where have you been?! Welcome back to the matrix. 🕶️`,
                        `the models missed you! Let's train something new. 🤖`
                    ];
                }

                // Pick a random message from the applicable category
                const randomMsg = messageOptions[Math.floor(Math.random() * messageOptions.length)];
                setWelcomeMessage(`Welcome ${displayName}, ${randomMsg}`);
            } else {
                // Initial login or missing time data
                setWelcomeMessage(displayName ? `Welcome ${displayName}! 👋` : 'Welcome back! 👋');
            }
        }
    }, [user]);

    const handleSignOut = async () => {
        await signOut();
        router.push('/');
        router.refresh();
    };

    return (
        <div className="min-h-screen bg-[#0f172a]">
            {/* Top bar */}
            <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
                <div className="max-w-6xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-indigo-400">
                        <BrainCircuit className="w-6 h-6" />
                        <span className="font-black text-white">AI ML Verse</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-slate-400 hidden sm:block">{user?.email}</span>
                        <button
                            onClick={handleSignOut}
                            className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-800"
                        >
                            <LogOut className="w-4 h-4" />
                            Sign out
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 md:px-8 py-12">
                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2">
                        {welcomeMessage}
                    </h1>
                    <p className="text-slate-400">Here are all your available tools and learning modules.</p>
                </div>

                {/* Tool grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {TOOLS.map(({ href, label, description, icon: Icon, color }) => (
                        <Link
                            key={href}
                            href={href}
                            className={`group glass-panel rounded-2xl p-6 border bg-slate-900 transition-all duration-300 hover:-translate-y-1 ${colorMap[color]}`}
                        >
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${colorMap[color].split(' ').slice(0, 2).join(' ')} group-hover:scale-110 transition-transform`}>
                                <Icon className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">{label}</h3>
                            <p className="text-slate-400 text-sm leading-relaxed mb-4">{description}</p>
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 group-hover:text-slate-300 transition-colors">
                                Open <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                            </span>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
