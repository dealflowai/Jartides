-- ===== Audit Logs =====
-- Tracks admin actions for accountability and debugging.

create table if not exists audit_logs (
  id uuid primary key default uuid_generate_v4(),
  admin_id uuid not null references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  details jsonb,
  created_at timestamptz default now()
);

-- Index for querying by time (most common: "show me recent actions")
create index if not exists idx_audit_logs_created_at on audit_logs(created_at desc);

-- Index for filtering by entity (e.g. "who changed this product?")
create index if not exists idx_audit_logs_entity on audit_logs(entity_type, entity_id);

-- Index for filtering by admin
create index if not exists idx_audit_logs_admin on audit_logs(admin_id);

-- RLS: only admins can read audit logs, service role can insert
alter table audit_logs enable row level security;

create policy "Admins can view audit logs"
  on audit_logs for select
  using (
    exists (
      select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- Service role inserts bypass RLS, so no insert policy needed.
