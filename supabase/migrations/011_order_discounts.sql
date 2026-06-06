-- Track discount-code usage on orders.
--
-- Two problems this fixes:
--   1. orders had no record of which discount code (if any) was applied, nor
--      the dollar amount discounted — so the saved order total never reflected
--      the discount the customer saw at checkout.
--   2. discount_codes.used_count was never incremented, so the admin "Uses"
--      column was stuck at 0 no matter how many people redeemed a code.
--
-- Safe to re-run: every statement is idempotent.

-- ===== Order columns =====================================================

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS discount_code   text,
  ADD COLUMN IF NOT EXISTS discount_amount numeric(10,2);

-- Backfill, then lock discount_amount down so order math can always treat it as
-- a number and never has to guard against NULL. Existing rows default to 0.
UPDATE orders SET discount_amount = 0 WHERE discount_amount IS NULL;

ALTER TABLE orders
  ALTER COLUMN discount_amount SET DEFAULT 0,
  ALTER COLUMN discount_amount SET NOT NULL;

-- A stored discount can never be negative.
ALTER TABLE orders
  DROP CONSTRAINT IF EXISTS orders_discount_amount_nonneg;
ALTER TABLE orders
  ADD CONSTRAINT orders_discount_amount_nonneg CHECK (discount_amount >= 0);

-- The admin discounts dashboard sums discount_amount across every order that
-- used a code (… WHERE discount_code IS NOT NULL). A partial index keeps that
-- aggregation fast and stays small, since most orders carry no code.
CREATE INDEX IF NOT EXISTS idx_orders_discount_code
  ON orders (discount_code)
  WHERE discount_code IS NOT NULL;

-- ===== Atomic redemption counter ========================================

-- Bump a code's redemption counter in a single SQL statement so concurrent
-- checkouts can't clobber each other's increments (a read-modify-write from the
-- app would race). Codes are stored uppercase, but we match case-insensitively
-- to be safe.
--
-- SECURITY DEFINER lets the server increment past row-level security. The empty
-- search_path is the important part: without it, a SECURITY DEFINER function can
-- be hijacked by a caller-controlled search_path, so we pin it and fully
-- schema-qualify the table. Built-ins (upper/btrim) still resolve via pg_catalog.
CREATE OR REPLACE FUNCTION increment_discount_usage(p_code text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF p_code IS NULL OR btrim(p_code) = '' THEN
    RETURN;
  END IF;

  UPDATE public.discount_codes
  SET used_count = used_count + 1
  WHERE upper(code) = upper(p_code);
END;
$$;
