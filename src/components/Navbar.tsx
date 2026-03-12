"use client";

import Link from 'next/link';
import { Cpu, Database, Presentation, Info, LogIn, UserPlus, LogOut, LayoutDashboard, Lock, User as UserIcon, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'next/navigation';

export default function Navbar() {
    const { user, signOut } = useAuth();
    const router = useRouter();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

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
                    <Link href="/about" className="text-slate-400 hover:text-cyan-400 transition-colors" title="About">
                        <Info className="w-5 h-5" />
                    </Link>

                    <div className="h-4 w-px bg-slate-700 hidden sm:block"></div>

                    {user ? (
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="flex items-center space-x-2 p-1 pl-2 pr-3 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 rounded-full transition-colors"
                            >
                                {user.photoURL ? (
                                    /* eslint-disable-next-line @next/next/no-img-element */
                                    <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-full border border-slate-600 object-cover" />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/50 flex items-center justify-center">
                                        <UserIcon className="w-4 h-4 text-indigo-400" />
                                    </div>
                                )}
                                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isProfileOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-xl py-2 overflow-hidden transform origin-top-right transition-all">
                                    <div className="px-4 py-2 border-b border-slate-700/50 mb-2">
                                        <p className="text-sm font-medium text-white truncate">{user.displayName || 'User'}</p>
                                        <p className="text-xs text-slate-400 truncate">{user.email}</p>
                                    </div>
                                    <Link
                                        href="/dashboard"
                                        onClick={() => setIsProfileOpen(false)}
                                        className="flex items-center space-x-2 px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors"
                                    >
                                        <LayoutDashboard className="w-4 h-4 text-indigo-400" />
                                        <span>Dashboard</span>
                                    </Link>
                                    <button
                                        onClick={() => {
                                            setIsProfileOpen(false);
                                            handleSignOut();
                                        }}
                                        className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors text-left"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        <span>Sign Out</span>
                                    </button>
                                </div>
                            )}
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
