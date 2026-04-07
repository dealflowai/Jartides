-- Add 'fulfillment' role for users who can only manage orders
-- This role gives restricted admin access to the orders page only

-- Update the check constraint on profiles.role to allow the new role
alter table profiles drop constraint if exists profiles_role_check;
alter table profiles add constraint profiles_role_check
  check (role in ('customer', 'admin', 'fulfillment'));

-- Allow fulfillment users to read orders and order_items (via RLS)
create policy "Fulfillment read orders" on orders for select
  using (exists (select 1 from profiles where id = auth.uid() and role = 'fulfillment'));

create policy "Fulfillment update orders" on orders for update
  using (exists (select 1 from profiles where id = auth.uid() and role = 'fulfillment'));

create policy "Fulfillment read order_items" on order_items for select
  using (exists (
    select 1 from profiles where id = auth.uid() and role = 'fulfillment'
  ));
