import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
    try {
        const supabase = await createClient();

        // Ensure NEXT_PUBLIC_SITE_URL is defined, fallback to origin if missing
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;

        // Initiate the OAuth flow
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                // The URL Supabase will redirect to after successful Google auth
                redirectTo: `${siteUrl}/auth/callback`,
            },
        });

        if (error) {
            console.error('Error initiating Google OAuth:', error.message);
            return NextResponse.json({ error: 'Failed to initiate OAuth' }, { status: 500 });
        }

        if (data.url) {
            // Redirect the user to the Google OAuth consent screen
            return NextResponse.redirect(data.url);
        }

        return NextResponse.json({ error: 'No redirect URL returned' }, { status: 500 });
    } catch (error) {
        console.error('Unexpected error in Google OAuth route:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
