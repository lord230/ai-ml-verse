import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

/**
 * Routes that are publicly accessible without authentication.
 * Everything else requires a real signed-in user.
 */
const PUBLIC_PATHS = [
    '/',             // landing page
    '/auth/login',
    '/auth/signup',
];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Always refresh the session (keeps auth cookies up-to-date).
    const { supabaseResponse, user } = await updateSession(request);

    // Check if the current path is public
    const isPublic =
        PUBLIC_PATHS.includes(pathname) ||
        pathname.startsWith('/auth/');

    // A real signed-in user must have gone through login/signup (has email or phone).
    // This excludes anonymous sessions and the "publishable key" auto-session
    // that Supabase creates for new projects.
    const isAuthenticated = !!user && !!(user.email || user.phone);

    // If not public and not authenticated → redirect to login
    if (!isPublic && !isAuthenticated) {
        const loginUrl = request.nextUrl.clone();
        loginUrl.pathname = '/auth/login';
        loginUrl.searchParams.set('redirectTo', pathname);
        loginUrl.searchParams.set('redirected', 'true');
        return NextResponse.redirect(loginUrl);
    }

    // If already logged in and on an auth page → bounce to dashboard
    if (pathname.startsWith('/auth/') && isAuthenticated) {
        const dashboardUrl = request.nextUrl.clone();
        dashboardUrl.pathname = '/dashboard';
        dashboardUrl.search = '';
        return NextResponse.redirect(dashboardUrl);
    }

    return supabaseResponse;
}

export const config = {
    matcher: [
        /*
         * Match everything EXCEPT:
         *  - _next/static (static files)
         *  - _next/image (image optimization)
         *  - favicon.ico
         *  - api routes (if any)
         */
        '/((?!_next/static|_next/image|favicon.ico|api/).*)',
    ],
};
