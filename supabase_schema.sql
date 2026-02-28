-- Run this SQL in your Supabase SQL Editor to create the users table
-- NOTE: since we've migrated to Firebase Auth, we no longer reference auth.users

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firebase_uid TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT,
  last_login_time TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Note: Since authentication is not handled by Supabase Auth, `auth.uid()` 
-- will not work out of the box for RLS if accessed from the client.
-- 
-- In this architecture, we strongly recommend accessing the database 
-- exclusively from secure backend API routes (Next.js server) using 
-- the service_role key, bypassing RLS entirely.

-- If you must use client-side Supabase queries, you would need to implement 
-- a custom JWT verification flow with Supabase using your Firebase tokens, 
-- which overrides the standard `auth.uid()`.
