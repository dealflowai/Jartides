-- Blog Posts — admin-authored articles shown on the public /blog page.
--
-- Posts are fully editable from the new "/admin/blog" manager. The public site
-- only ever sees rows where `published = true` (enforced by RLS below); drafts
-- are visible to admins via the service-role API.
--
-- Cover images reuse the existing public `product-images` storage bucket, so no
-- new bucket is required.

create table if not exists blog_posts (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  slug text unique not null,
  excerpt text not null default '',
  content text not null default '',
  cover_image text,
  author text not null default 'Jartides Team',
  meta_title text,
  meta_description text,
  published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Fast lookups for the public listing (newest published first).
create index if not exists blog_posts_published_idx
  on blog_posts (published, published_at desc);

-- Keep updated_at fresh on every edit (function defined in the base schema).
drop trigger if exists blog_posts_updated_at on blog_posts;
create trigger blog_posts_updated_at before update on blog_posts
  for each row execute function update_updated_at();

-- Row Level Security: public reads published posts; admins manage everything.
alter table blog_posts enable row level security;

drop policy if exists "Public read published posts" on blog_posts;
create policy "Public read published posts" on blog_posts
  for select using (published = true);

drop policy if exists "Admin manage posts" on blog_posts;
create policy "Admin manage posts" on blog_posts
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );
