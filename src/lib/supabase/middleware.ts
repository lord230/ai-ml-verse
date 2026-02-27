import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Creates a Supabase client inside middleware that can read and write cookies
 * on the NextRequest/NextResponse pair. This is required to keep the session
 * alive (token refresh) on every request.
 */
export async function updateSession(request: NextRequest) {
    // Start with a plain pass-through response.
    let supabaseResponse = NextResponse.next({ request });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    // Write cookies on both the request (so downstream Server Components
                    // see the refreshed token) and the response (so the browser stores it).
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    supabaseResponse = NextResponse.next({ request });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // IMPORTANT: Do NOT run any code between createServerClient and getUser()
    // because that would break session refresh.
    const {
        data: { user },
    } = await supabase.auth.getUser();

    return { supabaseResponse, user };
}
