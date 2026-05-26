-- Apply this AFTER `npm run db:push`.
-- Run in Supabase Dashboard → SQL Editor → New query → paste → Run.
--
-- 1) Link public.profiles.id to auth.users.id (Supabase-managed)
-- 2) Auto-create a profile row whenever someone signs up
-- 3) Allow the postgres role to read auth.users for the trigger

-- (1) FK profiles.id → auth.users.id
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_id_fkey
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- (2) Trigger function: auto-create profile on new auth user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'phone'
  );
  RETURN NEW;
END;
$$;

-- (3) Trigger: fire after every auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
