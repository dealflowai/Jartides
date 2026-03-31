-- ===== Product Variants =====
create table product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade not null,
  sku text,
  size text not null,
  price numeric(10,2) not null,
  original_price numeric(10,2),
  stock_quantity int default 100,
  low_stock_threshold int default 10,
  images text[] default '{}',
  sort_order int default 0,
  active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS
alter table product_variants enable row level security;

create policy "Public read active variants" on product_variants
  for select using (active = true);

create policy "Admin manage variants" on product_variants for all
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- Stock decrement for variants
create or replace function decrement_variant_stock(p_variant_id uuid, p_quantity int)
returns void as $$
  update product_variants
  set stock_quantity = greatest(stock_quantity - p_quantity, 0)
  where id = p_variant_id;
$$ language sql security definer;

-- Add variant tracking to order_items
alter table order_items
  add column if not exists variant_id uuid references product_variants(id) on delete set null,
  add column if not exists variant_size text;

-- Add compliance columns to orders
alter table orders
  add column if not exists research_disclaimer_accepted boolean default false,
  add column if not exists age_verified boolean default false,
  add column if not exists terms_accepted boolean default false;
