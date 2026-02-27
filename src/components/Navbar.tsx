"use client";

import Link from 'next/link';
import { Cpu, Database, Presentation, Info, LogIn, UserPlus, LogOut, LayoutDashboard, Lock } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'next/navigation';

export default function Navbar() {
    const { user, signOut } = useAuth();
    const router = useRouter();

    const handleSignOut = async () => {
        await signOut();
        router.push('/');
        router.refresh();
    };

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-md">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <Link href="/" className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/50 flex items-center justify-center">
                            <Cpu className="w-5 h-5 text-indigo-400" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-white">AI ML Verse</span>
                    </Link>
                </div>

                <div className="hidden md:flex items-center space-x-8">
                    <Link href={user ? "/tools/model-cost-calculator" : "/auth/login"} className="flex items-center space-x-2 text-sm font-medium text-slate-300 hover:text-white transition-colors">
                        <Cpu className="w-4 h-4" />
                        <span>Model Simulator</span>
                        {!user && <Lock className="w-3 h-3 text-slate-500 ml-1" />}
                    </Link>
                    <Link href={user ? "/tools/dataset-explorer" : "/auth/login"} className="flex items-center space-x-2 text-sm font-medium text-slate-300 hover:text-white transition-colors">
                        <Database className="w-4 h-4" />
                        <span>Dataset Explorer</span>
                        {!user && <Lock className="w-3 h-3 text-slate-500 ml-1" />}
                    </Link>
                    <Link href={user ? "/visuals" : "/auth/login"} className="flex items-center space-x-2 text-sm font-medium text-slate-300 hover:text-white transition-colors">
                        <Presentation className="w-4 h-4" />
                        <span>Visual Concepts</span>
                        {!user && <Lock className="w-3 h-3 text-slate-500 ml-1" />}
                    </Link>
                    <Link href={user ? "/architecture-playground" : "/auth/login"} className="flex items-center space-x-2 text-sm font-medium text-slate-300 hover:text-white transition-colors">
                        <Cpu className="w-4 h-4" />
                        <span>Architecture</span>
                        {!user && <Lock className="w-3 h-3 text-slate-500 ml-1" />}
                    </Link>
                </div>

                <div className="flex items-center space-x-4">
                    <a href="https://github.com" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white transition-colors">
                        <Info className="w-5 h-5" />
                    </a>

                    <div className="h-4 w-px bg-slate-700 hidden sm:block"></div>

                    {user ? (
                        <div className="flex items-center flex-wrap gap-2">
                            <Link
                                href="/dashboard"
                                className="flex items-center space-x-1 sm:space-x-2 px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-semibold text-white bg-indigo-600/20 border border-indigo-500/30 rounded-lg hover:bg-indigo-600/30 transition-colors"
                            >
                                <LayoutDashboard className="w-4 h-4 text-indigo-400" />
                                <span className="hidden sm:inline">Dashboard</span>
                            </Link>
                            <button
                                onClick={handleSignOut}
                                className="flex items-center space-x-1 sm:space-x-2 px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-semibold text-slate-300 bg-slate-800/50 border border-slate-700 rounded-lg hover:text-white hover:bg-slate-700 transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                <span className="hidden sm:inline">Sign Out</span>
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center space-x-3">
                            <Link
                                href="/auth/login"
                                className="hidden sm:flex items-center space-x-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
                            >
                                <LogIn className="w-4 h-4" />
                                <span>Log In</span>
                            </Link>
                            <Link
                                href="/auth/signup"
                                className="flex items-center space-x-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors shadow-[0_0_15px_rgba(79,70,229,0.3)]"
                            >
                                <UserPlus className="w-4 h-4" />
                                <span>Sign Up</span>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
