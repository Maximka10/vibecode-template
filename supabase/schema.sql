-- ============================================================
-- VIBECODE STUDIO — Supabase Schema
-- ============================================================

create table if not exists profiles (
  id uuid primary key,
  email text,
  name text,
  phone text,
  telegram text,
  role text default 'client' check (role in ('admin','client')),
  created_at timestamptz default now()
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  -- template
  template_id text,
  template_name text,
  -- client info
  client_name text,
  client_phone text,
  client_telegram text,
  client_email text,
  -- project info
  business_type text,
  selected_services jsonb,
  budget int,
  notes text,
  -- customization snapshot
  selected_options jsonb,
  primary_color text,
  bg_color text,
  total_price int,
  -- workflow
  status text default 'new' check (status in (
    'new','contacted','in_progress','waiting_client','completed','cancelled'
  )),
  -- project lifecycle
  project_url text,
  admin_url text,
  domain text,
  launch_date date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  order_id uuid references orders(id),
  rating int check (rating between 1 and 5),
  text text,
  is_approved bool default false,
  created_at timestamptz default now()
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id),
  sender_id uuid references profiles(id),
  text text,
  is_read bool default false,
  created_at timestamptz default now()
);

-- ============================================================
-- Functions
-- ============================================================

create or replace function public.is_admin() returns boolean as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin');
$$ language sql security definer stable;

create or replace function public.handle_new_user() returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- RLS
-- ============================================================

alter table profiles enable row level security;
alter table orders enable row level security;
alter table reviews enable row level security;
alter table messages enable row level security;

-- Profiles
create policy "profiles_select_own" on profiles for select using (auth.uid() = id);
create policy "profiles_select_admin" on profiles for select using (public.is_admin());
create policy "profiles_update_own" on profiles for update using (auth.uid() = id);

-- Orders
create policy "orders_select_own" on orders for select using (auth.uid() = user_id);
create policy "orders_select_admin" on orders for select using (public.is_admin());
create policy "orders_update_admin" on orders for update using (public.is_admin());

-- Reviews
create policy "reviews_select_own" on reviews for select using (auth.uid() = user_id);
create policy "reviews_select_admin" on reviews for select using (public.is_admin());
create policy "reviews_insert_own" on reviews for insert with check (auth.uid() = user_id);
create policy "reviews_update_admin" on reviews for update using (public.is_admin());

-- Messages
create policy "messages_select_own" on messages for select using (
  exists (select 1 from orders where orders.id = messages.order_id and orders.user_id = auth.uid())
);
create policy "messages_select_admin" on messages for select using (public.is_admin());
create policy "messages_insert_own" on messages for insert with check (
  auth.uid() = sender_id and
  exists (select 1 from orders where orders.id = messages.order_id and orders.user_id = auth.uid())
);
create policy "messages_insert_admin" on messages for insert with check (
  auth.uid() = sender_id and public.is_admin()
);
create policy "messages_update_admin" on messages for update using (public.is_admin());

-- ============================================================
-- Realtime
-- ============================================================
alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table orders;
