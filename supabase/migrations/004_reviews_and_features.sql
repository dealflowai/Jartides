-- ============================================================
-- Reviews & Ratings + Low Stock Alerts
-- ============================================================

-- Product reviews
CREATE TABLE IF NOT EXISTS product_reviews (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title text,
  body text,
  verified_purchase boolean DEFAULT false,
  approved boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS reviews_product_idx ON product_reviews (product_id);
CREATE INDEX IF NOT EXISTS reviews_approved_idx ON product_reviews (product_id, approved) WHERE approved = true;

ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view approved reviews"
  ON product_reviews FOR SELECT
  USING (approved = true);

CREATE POLICY "Users can insert own reviews"
  ON product_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all reviews"
  ON product_reviews FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Add average rating cache to products for performance
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS avg_rating numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS review_count integer DEFAULT 0;
