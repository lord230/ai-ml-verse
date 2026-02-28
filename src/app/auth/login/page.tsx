'use client';

import { Suspense, useState, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/firebase/config';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { GoogleLoginButton } from '@/components/GoogleLoginButton';
import { BrainCircuit, LogIn, AlertTriangle } from 'lucide-react';

// Inner component uses useSearchParams, must be inside <Suspense>
function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectTo = searchParams.get('redirectTo') ?? '/dashboard';
    const wasRedirected = searchParams.get('redirected') === 'true';

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const idToken = await userCredential.user.getIdToken();

            // Sync with backend to create session
            const res = await fetch('/api/auth/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token: idToken }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Authentication failed on server');
            }

            // Note: timeAway tracking is simplified for Firebase migration
            if (typeof window !== 'undefined') {
                sessionStorage.setItem('userName', userCredential.user.displayName || 'User');
                sessionStorage.removeItem('timeAwayMs');
            }
        } catch (error) {
            console.error(error);
            const err = error as any;
            if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found') {
                setError("Account not found or invalid password. Please sign up if you don't have an account.");
            } else {
                setError(err.message || "Failed to log in.");
            }
            setLoading(false);
            return;
        }

        router.push(redirectTo);
        router.refresh();
    };

    return (
        <div className="relative z-10 w-full max-w-md">
            {/* Logo */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 text-indigo-400 mb-4">
                    <BrainCircuit className="w-8 h-8" />
                    <span className="text-2xl font-black text-white tracking-tight">AI ML Verse</span>
                </div>
                <h1 className="text-3xl font-bold text-white">Welcome back</h1>
                <p className="text-slate-400 mt-2 text-sm">Sign in to your account to continue</p>
            </div>

            {/* Redirect warning */}
            {wasRedirected && (
                <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-xl p-4 mb-6 text-sm">
                    <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                    <span>You must be logged in to access that page. Please sign in to continue.</span>
                </div>
            )}

            {/* Card */}
            <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-700/60 rounded-2xl p-8 shadow-2xl">
                <form onSubmit={handleLogin} className="space-y-5">
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
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
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
                                <LogIn className="w-4 h-4" />
                                Sign In
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
                    <GoogleLoginButton redirectTo={redirectTo} />
                </div>

                <p className="mt-6 text-center text-sm text-slate-400">
                    Don&apos;t have an account?{' '}
                    <Link href="/auth/signup" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
                        Create one
                    </Link>
                </p>
            </div>
        </div>
    );
}

function LoginFallback() {
    return (
        <div className="relative z-10 w-full max-w-md">
            <div className="bg-slate-900/80 border border-slate-700/60 rounded-2xl p-8 shadow-2xl flex items-center justify-center min-h-[400px]">
                <span className="w-8 h-8 border-[3px] border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/30 via-slate-950 to-slate-950 pointer-events-none" />
            <Suspense fallback={<LoginFallback />}>
                <LoginForm />
            </Suspense>
        </div>
    );
}
