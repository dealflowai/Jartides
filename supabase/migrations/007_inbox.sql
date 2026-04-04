-- ===== Inbox Messages =====
-- Stores contact form submissions and admin replies.

create table if not exists inbox_messages (
  id uuid primary key default uuid_generate_v4(),
  thread_id uuid not null,
  direction text not null check (direction in ('inbound', 'outbound')),
  sender_name text not null,
  sender_email text not null,
  subject text not null,
  category text,
  body text not null,
  is_read boolean default false,
  created_at timestamptz default now()
);

create index if not exists idx_inbox_thread on inbox_messages(thread_id, created_at);
create index if not exists idx_inbox_created on inbox_messages(created_at desc);
create index if not exists idx_inbox_unread on inbox_messages(is_read) where is_read = false;

alter table inbox_messages enable row level security;

create policy "Admins can manage inbox"
  on inbox_messages for all
  using (
    exists (
      select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );
