-- Row Level Security policies for verduleria.
-- Apply AFTER 0000_common_stranger.sql and _supabase_auth.sql.
--
-- Strategy:
-- - PUBLIC reads for catalog (stores, categories, products)
-- - OWN-ROW reads/writes for customer data (profiles, carts, orders)
-- - ADMIN reads/writes happen server-side via service_role (bypasses RLS)

-- ============================================================================
-- Enable RLS on all tables (default deny)
-- ============================================================================
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- Public catalog reads
-- ============================================================================
CREATE POLICY "public_read_stores" ON public.stores
  FOR SELECT USING (is_active = true);

CREATE POLICY "public_read_categories" ON public.categories
  FOR SELECT USING (true);

CREATE POLICY "public_read_products" ON public.products
  FOR SELECT USING (is_active = true);

-- ============================================================================
-- Own profile
-- ============================================================================
CREATE POLICY "own_profile_select" ON public.profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "own_profile_update" ON public.profiles
  FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- ============================================================================
-- Own cart
-- ============================================================================
CREATE POLICY "own_cart_all" ON public.carts
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "own_cart_items_all" ON public.cart_items
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.carts
      WHERE carts.id = cart_items.cart_id
      AND carts.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.carts
      WHERE carts.id = cart_items.cart_id
      AND carts.user_id = auth.uid()
    )
  );

-- ============================================================================
-- Own orders (customer side)
-- ============================================================================
CREATE POLICY "own_orders_select" ON public.orders
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "own_orders_insert" ON public.orders
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "own_order_items_select" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "own_order_items_insert" ON public.order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "own_status_history_select" ON public.order_status_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_status_history.order_id
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "own_deliveries_select" ON public.deliveries
  FOR SELECT USING (
    driver_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = deliveries.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- ============================================================================
-- Own store memberships (read-only from client)
-- ============================================================================
CREATE POLICY "own_memberships_select" ON public.store_members
  FOR SELECT USING (user_id = auth.uid());

-- ============================================================================
-- Admin operations (managing products, orders, deliveries, members) happen
-- server-side via service_role and bypass RLS. No policies for INSERT/UPDATE
-- on those tables from the anon/authenticated roles.
-- ============================================================================
