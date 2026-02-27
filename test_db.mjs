import { createClient } from '@supabase/supabase-js';

// Setup connection based on .env variables
const supabaseUrl = 'https://hsulqrmlcqayhauobzav.supabase.co';
const supabaseKey = 'sb_publishable_-mYQmuZRtU6O_bq0ETWyGg_Z5bF_5cb';
const supabase = createClient(supabaseUrl, supabaseKey);

async function runTest() {
    console.log("🚀 Starting database insertion test...");

    const testEmail = `test_user_${Date.now()}@gmail.com`;
    const testPassword = "test_password_123!";

    console.log(`✉️ 1. Attempting to sign up with: ${testEmail}`);

    // 1. Sign up the user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
    });

    if (authError) {
        console.error("❌ Auth Error:", authError.message);
        return;
    }
    console.log("✅ 1. Auth SignUp Successful! User ID:", authData.user?.id);

    // 2. Insert into the public users table
    console.log(`💾 2. Proceeding to insert user into public.users table...`);

    if (authData.user) {
        const { error: dbError } = await supabase
            .from('users')
            .insert([
                {
                    id: authData.user.id,
                    email: authData.user.email,
                    created_at: new Date().toISOString(),
                }
            ]);

        if (dbError) {
            console.error("❌ Database Insert Error:", dbError.message);
        } else {
            console.log("✅ 2. Database Insert Successful! The row was added to public.users!");

            // Let's quickly query it to prove it
            const { data: fetchUser, error: fetchErr } = await supabase
                .from('users')
                .select('*')
                .eq('id', authData.user.id)
                .single();

            if (!fetchErr && fetchUser) {
                console.log("\n🎉 Verified! Here is the record from the database:");
                console.log(fetchUser);
            }
        }
    }
}

runTest();
