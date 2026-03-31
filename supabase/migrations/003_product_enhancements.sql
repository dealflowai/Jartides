-- ============================================================
-- Product Enhancements Migration
-- Adds: SEO fields, weight/dimensions, SKU, video URL,
--        sort order, related products, and product tags
-- ============================================================

-- 1. Add new columns to products table
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS sku text,
  ADD COLUMN IF NOT EXISTS meta_title text,
  ADD COLUMN IF NOT EXISTS meta_description text,
  ADD COLUMN IF NOT EXISTS video_url text,
  ADD COLUMN IF NOT EXISTS weight_grams numeric,
  ADD COLUMN IF NOT EXISTS length_cm numeric,
  ADD COLUMN IF NOT EXISTS width_cm numeric,
  ADD COLUMN IF NOT EXISTS height_cm numeric,
  ADD COLUMN IF NOT EXISTS sort_order integer DEFAULT 0;

-- Unique SKU constraint (allow nulls)
CREATE UNIQUE INDEX IF NOT EXISTS products_sku_unique ON products (sku) WHERE sku IS NOT NULL;

-- Index for sort ordering
CREATE INDEX IF NOT EXISTS products_sort_order_idx ON products (sort_order, created_at DESC);

-- 2. Related products (many-to-many self-join)
CREATE TABLE IF NOT EXISTS related_products (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  related_product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(product_id, related_product_id),
  CHECK (product_id != related_product_id)
);

-- RLS for related_products
ALTER TABLE related_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view related products"
  ON related_products FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage related products"
  ON related_products FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 3. Product tags
CREATE TABLE IF NOT EXISTS product_tags (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS product_tag_links (
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES product_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, tag_id)
);

-- RLS for tags
ALTER TABLE product_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_tag_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view tags"
  ON product_tags FOR SELECT USING (true);

CREATE POLICY "Admins can manage tags"
  ON product_tags FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Public can view tag links"
  ON product_tag_links FOR SELECT USING (true);

CREATE POLICY "Admins can manage tag links"
  ON product_tag_links FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE INDEX IF NOT EXISTS product_tag_links_product_idx ON product_tag_links (product_id);
CREATE INDEX IF NOT EXISTS product_tag_links_tag_idx ON product_tag_links (tag_id);
