'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // Client-side fallback: redirect if no session after loading completes.
        // The middleware handles the primary redirect; this prevents content flash
        // in case the middleware layer is bypassed (e.g., direct API manipulation).
        if (!loading && !user) {
            router.replace('/auth/login?redirectTo=/dashboard&redirected=true');
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <span className="w-10 h-10 border-[3px] border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                    <p className="text-slate-500 text-sm">Verifying session…</p>
                </div>
            </div>
        );
    }

    if (!user) {
        // Will be redirected by the useEffect above. Return null to avoid flash.
        return null;
    }

    return <>{children}</>;
}
