'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { BrainCircuit, UserPlus } from 'lucide-react';

export default function SignupPage() {
    const router = useRouter();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSignup = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);

        if (password !== confirm) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);
        const supabase = createClient();
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name: name
                }
            }
        });

        if (error) {
            setError(error.message);
            setLoading(false);
            return;
        }

        // Store the name in session storage for the initial welcome message on dashboard
        if (typeof window !== 'undefined') {
            sessionStorage.setItem('userName', name);
            // Optionally clear any old time away to ensure it's treated as a fresh login
            sessionStorage.removeItem('timeAwayMs');
        }

        // Since email verification is removed, redirect directly to dashboard
        router.push('/dashboard');
        router.refresh();
    };



    return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/30 via-slate-950 to-slate-950 pointer-events-none" />

            <div className="relative z-10 w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 text-indigo-400 mb-4">
                        <BrainCircuit className="w-8 h-8" />
                        <span className="text-2xl font-black text-white tracking-tight">AI ML Verse</span>
                    </div>
                    <h1 className="text-3xl font-bold text-white">Create an account</h1>
                    <p className="text-slate-400 mt-2 text-sm">Start exploring ML simulations today</p>
                </div>

                <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-700/60 rounded-2xl p-8 shadow-2xl">
                    <form onSubmit={handleSignup} className="space-y-5">
                        <div>
                            <label className="text-sm font-semibold text-slate-300 block mb-2">Name</label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Your Name"
                                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-colors"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-semibold text-slate-300 block mb-2">Email address</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-colors"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-semibold text-slate-300 block mb-2">Password</label>
                            <input
                                type="password"
                                required
                                minLength={8}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Min. 8 characters"
                                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-colors"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-semibold text-slate-300 block mb-2">Confirm password</label>
                            <input
                                type="password"
                                required
                                value={confirm}
                                onChange={(e) => setConfirm(e.target.value)}
                                placeholder="Repeat your password"
                                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-colors"
                            />
                        </div>

                        {error && (
                            <div className="text-rose-400 text-sm bg-rose-500/10 border border-rose-500/30 rounded-xl px-4 py-3">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors shadow-[0_0_20px_rgba(79,70,229,0.3)]"
                        >
                            {loading ? (
                                <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <UserPlus className="w-4 h-4" />
                                    Create Account
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 flex items-center justify-between text-sm text-slate-400">
                        <span className="w-1/5 border-b border-slate-700/60 lg:w-1/4"></span>
                        <span className="text-xs uppercase">or</span>
                        <span className="w-1/5 border-b border-slate-700/60 lg:w-1/4"></span>
                    </div>

                    <button
                        onClick={() => {
                            window.location.href = '/api/auth/google';
                        }}
                        type="button"
                        className="mt-6 w-full flex items-center justify-center gap-3 py-3 px-6 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl border border-slate-700 transition-colors"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Continue with Google
                    </button>

                    <p className="mt-6 text-center text-sm text-slate-400">
                        Already have an account?{' '}
                        <Link href="/auth/login" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
