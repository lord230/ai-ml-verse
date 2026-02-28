'use client';

import Link from 'next/link';
import { GoogleLoginButton } from '@/components/GoogleLoginButton';
import { BrainCircuit } from 'lucide-react';

export default function SignupPage() {



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
                    <div>
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
