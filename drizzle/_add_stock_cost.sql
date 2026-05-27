-- Add stock + cost to products. Apply once in Supabase SQL Editor.
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS cost numeric(12, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS stock_min integer DEFAULT 5;

-- stock column already exists from initial schema (it was nullable).
-- Default any null stocks to 0 so the panel doesn't blow up on math.
UPDATE public.products SET stock = 0 WHERE stock IS NULL;
