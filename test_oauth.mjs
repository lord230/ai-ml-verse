import { createClient } from '@supabase/supabase-js';


const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://example.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'example';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    const { data } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: 'http://localhost:3000/auth/callback'
        }
    });

    console.log("data.url:", data.url);
    if (!data.url) return;

    try {
        const res = await fetch(data.url, { redirect: 'manual' });
        console.log("status:", res.status);
        console.log("location:", res.headers.get('location'));
        console.log("set-cookie:", res.headers.get('set-cookie'));
    } catch (e) {
        console.error(e);
    }
}
run();
