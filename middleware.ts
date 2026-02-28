import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

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

    // Catch invalid /transformer paths and redirect to prevent access
    if (pathname.startsWith('/transformer')) {
        const homeUrl = request.nextUrl.clone();
        homeUrl.pathname = '/';
        homeUrl.search = '';
        return NextResponse.redirect(homeUrl);
    }

    // Check for the Firebase session cookie set by our /api/auth/verify route
    const sessionCookie = request.cookies.get('firebase-session')?.value;

    // Check if the current path is public
    const isPublic =
        PUBLIC_PATHS.includes(pathname) ||
        pathname.startsWith('/auth/');

    const isAuthenticated = !!sessionCookie;

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

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match everything EXCEPT:
         *  - _next/static (static files)
         *  - _next/image (image optimization)
         *  - favicon.ico
         *  - api routes (our auth verify route needs to be accessible without cookie)
         */
        '/((?!_next/static|_next/image|favicon.ico|api/|sitemap.xml|robots.txt).*)',
    ],
};
