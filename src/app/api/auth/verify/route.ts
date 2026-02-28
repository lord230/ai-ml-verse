import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
    try {
        const { token } = await request.json();

        if (!token) {
            return NextResponse.json({ error: 'No token provided' }, { status: 400 });
        }

        // 1. Verify the Firebase ID token
        const decodedToken = await adminAuth.verifyIdToken(token);

        // 2. Set secure HTTP-only cookie for session management
        // We cannot use createSessionCookie because it requires a full Service Account.
        // Instead, we store the idToken and rely on the client's onIdTokenChanged to refresh it.
        const cookieStore = await cookies();
        cookieStore.set('firebase-session', token, {
            maxAge: 60 * 60 * 24 * 5, // 5 days
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            sameSite: 'lax',
        });

        return NextResponse.json({ success: true, uid: decodedToken.uid });

    } catch (error: any) {
        console.error('Verification error:', error);
        return NextResponse.json({ error: error.message || 'Invalid token or server error' }, { status: 401 });
    }
}
