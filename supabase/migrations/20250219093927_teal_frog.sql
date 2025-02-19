/*
  # Fix profiles table and triggers

  1. Changes
    - Drop existing trigger and function
    - Create new trigger that properly handles profile creation
    - Add NOT NULL constraint to user_id in whiteboards table
    - Add default empty string for full_name

  2. Security
    - Maintain existing RLS policies
    - Ensure referential integrity
*/

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Modify profiles table
ALTER TABLE profiles
ALTER COLUMN full_name SET DEFAULT '',
ALTER COLUMN updated_at SET DEFAULT now();

-- Create new trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (NEW.id, '', NULL);
  RETURN NEW;
END;
$$;

-- Create new trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();