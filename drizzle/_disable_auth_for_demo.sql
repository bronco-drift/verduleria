-- Removes auth + RLS for the no-login demo phase.
-- Apply in Supabase Dashboard → SQL Editor → New query → paste → Run.
--
-- What this does:
-- 1) Drops the FK profiles.id → auth.users.id (so we can insert demo
--    profiles without an auth user)
-- 2) Drops the auto-profile trigger (no signups happen anymore)
-- 3) Disables RLS on every table (no auth context exists)

-- (1) Drop the FK that ties profiles to Supabase auth
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- (2) Drop the signup trigger + function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- (3) Disable RLS on every domain table
ALTER TABLE public.stores DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliveries DISABLE ROW LEVEL SECURITY;
