-- Run this SQL in your Supabase SQL Editor to create the users table

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  -- Note: Do not store passwords in this public table. 
  -- Supabase auth.users already handles secure password hashing and authentication securely.
  -- This table is for public profile data and relations.
  last_login_time TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policies so users can only view and update their own data
CREATE POLICY "Users can view their own profile."
  ON public.users FOR SELECT
  USING ( auth.uid() = id );

CREATE POLICY "Users can insert their own profile."
  ON public.users FOR INSERT
  WITH CHECK ( auth.uid() = id );

CREATE POLICY "Users can update own profile."
  ON public.users FOR UPDATE
  USING ( auth.uid() = id );

-- Create a trigger to automatically create a user profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger as $$
BEGIN
  INSERT INTO public.users (id, email, name, last_login_time)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'name', now());
  RETURN new;
END;
$$ language plpgsql security definer;

-- Trigger the function every time a user is created
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
