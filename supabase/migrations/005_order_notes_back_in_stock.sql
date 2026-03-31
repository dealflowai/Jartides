-- Order notes (internal admin notes)
CREATE TABLE IF NOT EXISTS order_notes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  author_name text NOT NULL,
  body text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS order_notes_order_idx ON order_notes (order_id);

ALTER TABLE order_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage order notes"
  ON order_notes FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Back-in-stock notifications
CREATE TABLE IF NOT EXISTS back_in_stock_requests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  email text NOT NULL,
  product_name text NOT NULL,
  notified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(product_id, email)
);

CREATE INDEX IF NOT EXISTS back_in_stock_product_idx ON back_in_stock_requests (product_id, notified);

ALTER TABLE back_in_stock_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can insert back-in-stock requests"
  ON back_in_stock_requests FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view back-in-stock requests"
  ON back_in_stock_requests FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
