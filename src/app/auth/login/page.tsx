'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { GoogleLoginButton } from '@/components/GoogleLoginButton';
import { BrainCircuit, AlertTriangle } from 'lucide-react';

// Inner component uses useSearchParams, must be inside <Suspense>
function LoginForm() {
    const searchParams = useSearchParams();
    const redirectTo = searchParams.get('redirectTo') ?? '/dashboard';
    const wasRedirected = searchParams.get('redirected') === 'true';

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
                <div>
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
