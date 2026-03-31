-- =============================================
-- JARTIDES DATABASE SCHEMA
-- Run this in Supabase SQL Editor
-- =============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ===== Categories =====
create table categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  sort_order int default 0,
  created_at timestamptz default now()
);

insert into categories (name, slug, sort_order) values
  ('Peptides', 'peptides', 1),
  ('Blends', 'blends', 2),
  ('Nasal Sprays', 'sprays', 3),
  ('Supplies', 'supplies', 4);

-- ===== Products =====
create table products (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  description text not null default '',
  research_description text,
  category_id uuid references categories(id) on delete set null,
  price numeric(10,2) not null,
  original_price numeric(10,2),
  badge text,
  size text not null default '',
  purity text,
  images text[] default '{}',
  featured boolean default false,
  active boolean default true,
  stock_quantity int default 100,
  low_stock_threshold int default 10,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ===== COA Documents =====
create table coa_documents (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid references products(id) on delete cascade,
  purity_percentage numeric(5,2) not null,
  batch_number text not null,
  pdf_url text,
  test_date date,
  created_at timestamptz default now()
);

-- ===== Profiles =====
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  phone text,
  role text default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz default now()
);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ===== Addresses =====
create table addresses (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  full_name text not null,
  line1 text not null,
  line2 text,
  city text not null,
  province_state text not null,
  postal_code text not null,
  country text not null default 'CA',
  is_default boolean default false,
  created_at timestamptz default now()
);

-- ===== Orders =====
create table orders (
  id uuid primary key default uuid_generate_v4(),
  order_number text unique not null,
  user_id uuid references auth.users(id) on delete set null,
  guest_email text,
  status text default 'pending' check (status in ('pending','processing','shipped','delivered','cancelled','refunded')),
  subtotal numeric(10,2) not null,
  shipping_cost numeric(10,2) default 0,
  tax numeric(10,2) default 0,
  total numeric(10,2) not null,
  currency text default 'CAD',
  shipping_name text,
  shipping_line1 text,
  shipping_line2 text,
  shipping_city text,
  shipping_province text,
  shipping_postal text,
  shipping_country text,
  tracking_number text,
  shipping_label_url text,
  shippo_shipment_id text,
  shippo_rate_id text,
  tracking_url_provider text,
  carrier text,
  payment_method text,
  stripe_payment_intent_id text,
  paypal_order_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ===== Order Items =====
create table order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  product_name text not null,
  quantity int not null default 1,
  unit_price numeric(10,2) not null,
  purchase_type text default 'one-time' check (purchase_type in ('one-time', 'subscription'))
);

-- ===== Subscriptions (Coming Soon) =====
create table subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  status text default 'inactive' check (status in ('active','paused','cancelled','inactive')),
  plan_name text,
  stripe_subscription_id text,
  stripe_price_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ===== Site Settings =====
create table site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz default now()
);

insert into site_settings (key, value) values
  ('hero_heading', '"PREMIUM CANADIAN RESEARCH PEPTIDES"'),
  ('hero_subheading', '"99%+ purity, third-party tested, same-day processing. Trusted by researchers worldwide."'),
  ('ticker_items', '["WE SHIP WORLDWIDE \u2022 Same-Day Processing \u2022 99%+ Purity Guaranteed \u2022 Third-Party Tested \u2022 COAs Available"]'),
  ('featured_product_count', '6'),
  ('social_tiktok', '"https://tiktok.com/@jartides"'),
  ('social_instagram', '"https://instagram.com/jartides"');

-- ===== Updated At Trigger =====
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger products_updated_at before update on products
  for each row execute function update_updated_at();

create trigger orders_updated_at before update on orders
  for each row execute function update_updated_at();

create trigger subscriptions_updated_at before update on subscriptions
  for each row execute function update_updated_at();

-- ===== Row Level Security =====

-- Categories: public read, admin write
alter table categories enable row level security;
create policy "Public read categories" on categories for select using (true);
create policy "Admin manage categories" on categories for all
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- Products: public read active, admin all
alter table products enable row level security;
create policy "Public read active products" on products for select using (active = true);
create policy "Admin manage products" on products for all
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- COA: public read, admin write
alter table coa_documents enable row level security;
create policy "Public read COAs" on coa_documents for select using (true);
create policy "Admin manage COAs" on coa_documents for all
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- Profiles: user reads own, admin reads all
alter table profiles enable row level security;
create policy "Users read own profile" on profiles for select
  using (id = auth.uid());
create policy "Users update own profile" on profiles for update
  using (id = auth.uid());
create policy "Admin read all profiles" on profiles for select
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- Addresses: user manages own
alter table addresses enable row level security;
create policy "Users manage own addresses" on addresses for all
  using (user_id = auth.uid());
create policy "Admin read all addresses" on addresses for select
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- Orders: user reads own, admin all
alter table orders enable row level security;
create policy "Users read own orders" on orders for select
  using (user_id = auth.uid());
create policy "Admin manage orders" on orders for all
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- Order items: user reads own, admin all
alter table order_items enable row level security;
create policy "Users read own order items" on order_items for select
  using (exists (select 1 from orders where orders.id = order_items.order_id and orders.user_id = auth.uid()));
create policy "Admin manage order items" on order_items for all
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- Subscriptions: user manages own
alter table subscriptions enable row level security;
create policy "Users manage own subscriptions" on subscriptions for all
  using (user_id = auth.uid());
create policy "Admin manage subscriptions" on subscriptions for all
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- Site settings: public read, admin write
alter table site_settings enable row level security;
create policy "Public read settings" on site_settings for select using (true);
create policy "Admin manage settings" on site_settings for all
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- ===== Seed Products =====
-- Get category IDs for seeding
do $$
declare
  cat_peptides uuid;
  cat_blends uuid;
  cat_sprays uuid;
  cat_supplies uuid;
begin
  select id into cat_peptides from categories where slug = 'peptides';
  select id into cat_blends from categories where slug = 'blends';
  select id into cat_sprays from categories where slug = 'sprays';
  select id into cat_supplies from categories where slug = 'supplies';

  insert into products (name, slug, description, category_id, price, original_price, badge, size, purity, featured, stock_quantity) values
    ('BPC-157', 'bpc-157', 'High-purity BPC-157 peptide for advanced tissue regeneration research. Body Protection Compound-157 is a pentadecapeptide consisting of 15 amino acids, derived from human gastric juice.', cat_peptides, 44.99, 54.99, 'Best Seller', '5mg', '99.3%', true, 100),
    ('CJC-1295 No DAC', 'cjc-1295-no-dac', 'Research-grade CJC-1295 without DAC for growth hormone releasing hormone studies. A modified form of GHRH (1-29) with improved stability.', cat_peptides, 49.99, 59.99, null, '5mg', '99.1%', true, 100),
    ('Ipamorelin', 'ipamorelin', 'Premium Ipamorelin peptide for growth hormone secretagogue research. A selective GH secretagogue and ghrelin receptor agonist.', cat_peptides, 42.99, 52.99, 'Popular', '5mg', '99.5%', true, 100),
    ('GHK-Cu', 'ghk-cu', 'Laboratory-grade GHK-Cu copper peptide complex for tissue remodeling studies. A naturally occurring tripeptide with a high affinity for copper(II).', cat_peptides, 47.99, 57.99, null, '5mg', '99.4%', false, 100),
    ('TB-500', 'tb-500', 'Research-grade Thymosin Beta-4 fragment for cellular migration and repair studies. A synthetic fraction of thymosin beta-4 protein.', cat_peptides, 49.99, 59.99, null, '5mg', '99.2%', false, 100),
    ('Semaglutide', 'semaglutide', 'High-purity Semaglutide for GLP-1 receptor agonist research. A modified GLP-1 analogue with enhanced stability and extended half-life.', cat_peptides, 99.99, 129.99, 'Hot', '3mg', '99.6%', true, 100),
    ('Tirzepatide', 'tirzepatide', 'Premium Tirzepatide for dual GIP/GLP-1 receptor agonist studies. A novel dual glucose-dependent insulinotropic polypeptide.', cat_peptides, 109.99, 139.99, 'New', '5mg', '99.3%', true, 100),
    ('CJC-1295 + Ipamorelin Blend', 'cjc-ipamorelin-blend', 'Synergistic research blend combining CJC-1295 and Ipamorelin for enhanced growth hormone studies. Pre-mixed for laboratory convenience.', cat_blends, 74.99, 89.99, 'Best Value', '10mg', '99.1%', true, 100),
    ('BPC-157 + TB-500 Blend', 'bpc-tb500-blend', 'Combined research blend of BPC-157 and TB-500 for comprehensive tissue regeneration studies. Optimized ratio for synergistic research applications.', cat_blends, 79.99, 99.99, 'Popular', '10mg', '99.2%', false, 100),
    ('PT-141 Nasal Spray', 'pt-141-nasal-spray', 'Research-grade Bremelanotide (PT-141) in nasal spray format for melanocortin receptor studies. Pre-formulated for consistent dosing in research.', cat_sprays, 59.99, 74.99, null, '10ml', '99.0%', false, 100),
    ('BPC-157 Nasal Spray', 'bpc-157-nasal-spray', 'BPC-157 in convenient nasal spray delivery format for alternative administration route research. Pre-mixed and ready for laboratory use.', cat_sprays, 54.99, 69.99, 'New', '10ml', '99.3%', false, 100),
    ('Bacteriostatic Water', 'bacteriostatic-water', 'USP-grade bacteriostatic water for reconstitution of lyophilized peptides. Contains 0.9% benzyl alcohol as a bacteriostatic preservative.', cat_supplies, 14.99, null, null, '30ml', null, false, 200),
    ('Insulin Syringes (10pk)', 'insulin-syringes-10pk', 'Precision insulin syringes for accurate peptide measurement in laboratory settings. 29-gauge needle for minimal sample loss.', cat_supplies, 11.99, null, null, '1ml/29G', null, false, 200),
    ('Mixing Kit', 'mixing-kit', 'Complete peptide reconstitution kit including bacteriostatic water, syringes, and alcohol swabs. Everything needed for proper peptide preparation.', cat_supplies, 24.99, 29.99, null, 'Complete', null, false, 150);

  -- Seed COA documents
  insert into coa_documents (product_id, purity_percentage, batch_number, test_date)
  select p.id,
    case p.slug
      when 'bpc-157' then 99.3
      when 'cjc-1295-no-dac' then 99.1
      when 'ipamorelin' then 99.5
      when 'ghk-cu' then 99.4
      when 'tb-500' then 99.2
      when 'semaglutide' then 99.6
      when 'tirzepatide' then 99.3
      when 'cjc-ipamorelin-blend' then 99.1
      when 'bpc-tb500-blend' then 99.2
      when 'pt-141-nasal-spray' then 99.0
      when 'bpc-157-nasal-spray' then 99.3
      else 99.0
    end,
    'JRT-2026-' || upper(replace(left(p.slug, 8), '-', '')),
    '2026-01-15'
  from products p
  where p.category_id != cat_supplies;
end $$;

-- ===== Stock Decrement Function =====
create or replace function decrement_stock(p_product_id uuid, p_quantity int)
returns void as $$
  update products set stock_quantity = greatest(stock_quantity - p_quantity, 0) where id = p_product_id;
$$ language sql security definer;

-- ===== Discount Codes =====
CREATE TABLE discount_codes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('percentage', 'fixed')),
  value NUMERIC(10,2) NOT NULL,
  min_order_amount NUMERIC(10,2) DEFAULT 0,
  max_uses INT,
  used_count INT DEFAULT 0,
  active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE discount_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read active codes" ON discount_codes FOR SELECT USING (active = true);
CREATE POLICY "Admin manage codes" ON discount_codes FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- ===== Storage Buckets =====
-- Run these in Supabase Dashboard > Storage:
-- 1. Create bucket "product-images" (public)
-- 2. Create bucket "coa-pdfs" (public)
