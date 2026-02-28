'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/firebase/config';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { GoogleLoginButton } from '@/components/GoogleLoginButton';
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

        try {
            setLoading(true);
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);

            // Update profile with name
            await updateProfile(userCredential.user, {
                displayName: name
            });

            const idToken = await userCredential.user.getIdToken();

            // Sync with backend to create user record in Supabase
            const res = await fetch('/api/auth/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token: idToken }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Registration failed on server');
            }
        } catch (error) {
            console.error(error);
            const err = error as any;
            setError(err.message || "Failed to sign up.");
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

                    <div className="mt-6">
                        <GoogleLoginButton text="Sign up with Google" redirectTo="/dashboard" />
                    </div>

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
