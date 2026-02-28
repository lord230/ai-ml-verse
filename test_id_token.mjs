import { createClient } from '@supabase/supabase-js';
const supabase = createClient('https://example.supabase.co', 'example');
console.log(typeof supabase.auth.signInWithIdToken);
