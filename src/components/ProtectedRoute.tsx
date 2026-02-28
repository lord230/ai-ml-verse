"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // Client-side fallback: redirect if no session after loading completes.
        // This prevents content flash in case the middleware layer is bypassed.
        if (!loading && !user) {
            router.replace(`/auth/login?redirectTo=${encodeURIComponent(pathname)}&redirected=true`);
        }
    }, [user, loading, router, pathname]);

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
