-- Allow orders.status = 'awaiting_payment' for the manual PayPal F&F flow.
-- The original CHECK constraint only permitted the six legacy statuses, so
-- inserting an order with the new value fails with a constraint violation.

ALTER TABLE orders
  DROP CONSTRAINT IF EXISTS orders_status_check;

ALTER TABLE orders
  ADD CONSTRAINT orders_status_check
  CHECK (status IN (
    'pending',
    'awaiting_payment',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
    'refunded'
  ));
