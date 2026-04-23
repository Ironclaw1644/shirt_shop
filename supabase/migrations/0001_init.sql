-- Georgia Print Hub — core schema
-- Run with `supabase db push` after `supabase link`.

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ────────────────────────────────────────────────────────────────────────────
-- Enums
-- ────────────────────────────────────────────────────────────────────────────
do $$ begin
  create type price_status as enum ('confirmed', 'placeholder', 'quote');
exception when duplicate_object then null; end $$;

do $$ begin
  create type product_status as enum ('draft', 'active', 'archived');
exception when duplicate_object then null; end $$;

do $$ begin
  create type order_status as enum (
    'received', 'in_proof', 'approved', 'in_production', 'shipped', 'delivered', 'cancelled'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type proof_status as enum ('pending', 'approved', 'changes_requested');
exception when duplicate_object then null; end $$;

do $$ begin
  create type quote_status as enum ('new', 'in_progress', 'quoted', 'accepted', 'closed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type user_role as enum ('customer', 'staff', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type media_source as enum ('upload', 'generated');
exception when duplicate_object then null; end $$;

-- ────────────────────────────────────────────────────────────────────────────
-- Profiles (extends auth.users)
-- ────────────────────────────────────────────────────────────────────────────
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  company text,
  phone text,
  role user_role not null default 'customer',
  tags text[] default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ────────────────────────────────────────────────────────────────────────────
-- Addresses
-- ────────────────────────────────────────────────────────────────────────────
create table if not exists addresses (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade,
  label text,
  full_name text,
  company text,
  line1 text not null,
  line2 text,
  city text not null,
  region text not null,
  postal_code text not null,
  country text not null default 'US',
  phone text,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

-- ────────────────────────────────────────────────────────────────────────────
-- Categories
-- ────────────────────────────────────────────────────────────────────────────
create table if not exists categories (
  id uuid primary key default uuid_generate_v4(),
  slug text not null unique,
  name text not null,
  parent_id uuid references categories(id) on delete set null,
  hero_image_url text,
  intro text,
  seo_meta jsonb default '{}'::jsonb,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists idx_categories_parent on categories(parent_id);

-- ────────────────────────────────────────────────────────────────────────────
-- Products
-- ────────────────────────────────────────────────────────────────────────────
create table if not exists products (
  id uuid primary key default uuid_generate_v4(),
  slug text not null unique,
  category_id uuid references categories(id) on delete set null,
  subcategory_id uuid references categories(id) on delete set null,
  brand text,
  title text not null,
  short_description text,
  description text,
  images text[] default '{}',
  base_price_cents integer,
  price_status price_status not null default 'placeholder',
  min_qty integer not null default 1,
  lead_time_days integer not null default 5,
  decoration_methods text[] default '{}',
  placement_zones jsonb default '[]'::jsonb,
  options jsonb default '{}'::jsonb,
  badges text[] default '{}',
  status product_status not null default 'active',
  seo_meta jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_products_category on products(category_id);
create index if not exists idx_products_subcategory on products(subcategory_id);
create index if not exists idx_products_status on products(status);

create table if not exists product_variants (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references products(id) on delete cascade,
  sku text not null,
  options jsonb not null default '{}'::jsonb,
  price_cents integer,
  inventory_tracked boolean not null default false,
  stock_qty integer not null default 0,
  created_at timestamptz not null default now(),
  unique (product_id, sku)
);

create table if not exists price_tiers (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references products(id) on delete cascade,
  min_qty integer not null,
  max_qty integer,
  unit_price_cents integer not null
);
create index if not exists idx_price_tiers_product on price_tiers(product_id);

-- ────────────────────────────────────────────────────────────────────────────
-- Design templates + customer designs
-- ────────────────────────────────────────────────────────────────────────────
create table if not exists design_templates (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid references products(id) on delete set null,
  name text not null,
  preview_url text,
  design_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists customer_designs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  name text,
  design_json jsonb not null default '{}'::jsonb,
  preview_url text,
  source_file_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ────────────────────────────────────────────────────────────────────────────
-- Orders
-- ────────────────────────────────────────────────────────────────────────────
create table if not exists orders (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete set null,
  email text not null,
  status order_status not null default 'received',
  subtotal_cents integer not null,
  tax_cents integer not null default 0,
  shipping_cents integer not null default 0,
  discount_cents integer not null default 0,
  total_cents integer not null,
  stripe_payment_intent text,
  stripe_checkout_session text,
  shipping_address jsonb,
  billing_address jsonb,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_orders_user on orders(user_id);
create index if not exists idx_orders_email on orders(email);
create index if not exists idx_orders_status on orders(status);

create table if not exists order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  variant_id uuid references product_variants(id) on delete set null,
  title_snapshot text not null,
  quantity integer not null,
  unit_price_cents integer not null,
  decoration jsonb,
  design_id uuid references customer_designs(id) on delete set null,
  artwork_file_urls text[] default '{}',
  proof_url text,
  proof_status proof_status default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists proofs (
  id uuid primary key default uuid_generate_v4(),
  order_item_id uuid not null references order_items(id) on delete cascade,
  url text not null,
  version integer not null default 1,
  status proof_status not null default 'pending',
  customer_comments text,
  created_at timestamptz not null default now()
);

create table if not exists order_messages (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references orders(id) on delete cascade,
  author_role user_role not null default 'customer',
  author_id uuid references profiles(id) on delete set null,
  body text not null,
  attachments jsonb default '[]'::jsonb,
  created_at timestamptz not null default now()
);

-- ────────────────────────────────────────────────────────────────────────────
-- Quote requests
-- ────────────────────────────────────────────────────────────────────────────
create table if not exists quote_requests (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete set null,
  email text not null,
  full_name text,
  company text,
  phone text,
  product_refs jsonb default '[]'::jsonb,
  est_quantity integer,
  in_hands_date date,
  decoration text,
  files text[] default '{}',
  message text,
  status quote_status not null default 'new',
  admin_reply text,
  quoted_price_cents integer,
  stripe_payment_link text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_quotes_status on quote_requests(status);

-- ────────────────────────────────────────────────────────────────────────────
-- Newsletter
-- ────────────────────────────────────────────────────────────────────────────
create table if not exists newsletter_subscribers (
  id uuid primary key default uuid_generate_v4(),
  email text not null unique,
  full_name text,
  tags text[] default '{}',
  subscribed_at timestamptz,
  unsubscribed_at timestamptz,
  resend_contact_id text,
  confirm_token text,
  confirmed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists newsletter_campaigns (
  id uuid primary key default uuid_generate_v4(),
  subject text not null,
  preview_text text,
  body_html text not null,
  segment text,
  status text not null default 'draft',
  sent_at timestamptz,
  resend_broadcast_id text,
  stats jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- ────────────────────────────────────────────────────────────────────────────
-- Site activity + audit
-- ────────────────────────────────────────────────────────────────────────────
create table if not exists site_activity (
  id bigserial primary key,
  event_type text not null,
  path text,
  user_id uuid references profiles(id) on delete set null,
  session_id text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists idx_site_activity_created on site_activity(created_at desc);
create index if not exists idx_site_activity_event on site_activity(event_type);

create table if not exists audit_log (
  id uuid primary key default uuid_generate_v4(),
  admin_user_id uuid references profiles(id) on delete set null,
  action text not null,
  entity_type text,
  entity_id text,
  before jsonb,
  after jsonb,
  created_at timestamptz not null default now()
);

-- ────────────────────────────────────────────────────────────────────────────
-- Media + settings
-- ────────────────────────────────────────────────────────────────────────────
create table if not exists media_assets (
  id uuid primary key default uuid_generate_v4(),
  url text not null,
  alt text,
  source media_source not null default 'upload',
  prompt text,
  created_by uuid references profiles(id) on delete set null,
  tags text[] default '{}',
  width int,
  height int,
  mime text,
  created_at timestamptz not null default now()
);

create table if not exists settings (
  id boolean primary key default true check (id), -- singleton
  business jsonb not null default '{}'::jsonb,
  shipping jsonb not null default '{}'::jsonb,
  tax jsonb not null default '{}'::jsonb,
  flags jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
insert into settings (id) values (true) on conflict (id) do nothing;

-- ────────────────────────────────────────────────────────────────────────────
-- RLS
-- ────────────────────────────────────────────────────────────────────────────
alter table profiles enable row level security;
alter table addresses enable row level security;
alter table categories enable row level security;
alter table products enable row level security;
alter table product_variants enable row level security;
alter table price_tiers enable row level security;
alter table design_templates enable row level security;
alter table customer_designs enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table proofs enable row level security;
alter table order_messages enable row level security;
alter table quote_requests enable row level security;
alter table newsletter_subscribers enable row level security;
alter table newsletter_campaigns enable row level security;
alter table site_activity enable row level security;
alter table audit_log enable row level security;
alter table media_assets enable row level security;
alter table settings enable row level security;

-- Helper: is_admin()
create or replace function is_admin() returns boolean
language sql stable as $$
  select exists(
    select 1 from profiles
    where id = auth.uid() and role in ('admin','staff')
  );
$$;

-- Profiles
drop policy if exists profiles_self on profiles;
create policy profiles_self on profiles for select using (auth.uid() = id);
drop policy if exists profiles_self_update on profiles;
create policy profiles_self_update on profiles for update using (auth.uid() = id);
drop policy if exists profiles_admin_all on profiles;
create policy profiles_admin_all on profiles for all using (is_admin()) with check (is_admin());

-- Addresses
drop policy if exists addresses_owner on addresses;
create policy addresses_owner on addresses for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists addresses_admin on addresses;
create policy addresses_admin on addresses for all using (is_admin()) with check (is_admin());

-- Public catalog reads
drop policy if exists categories_public_read on categories;
create policy categories_public_read on categories for select using (true);
drop policy if exists products_public_read on products;
create policy products_public_read on products for select using (status = 'active' or is_admin());
drop policy if exists variants_public_read on product_variants;
create policy variants_public_read on product_variants for select using (true);
drop policy if exists tiers_public_read on price_tiers;
create policy tiers_public_read on price_tiers for select using (true);
drop policy if exists templates_public_read on design_templates;
create policy templates_public_read on design_templates for select using (true);

-- Admin-only writes on catalog
drop policy if exists categories_admin_write on categories;
create policy categories_admin_write on categories for all using (is_admin()) with check (is_admin());
drop policy if exists products_admin_write on products;
create policy products_admin_write on products for all using (is_admin()) with check (is_admin());
drop policy if exists variants_admin_write on product_variants;
create policy variants_admin_write on product_variants for all using (is_admin()) with check (is_admin());
drop policy if exists tiers_admin_write on price_tiers;
create policy tiers_admin_write on price_tiers for all using (is_admin()) with check (is_admin());
drop policy if exists templates_admin_write on design_templates;
create policy templates_admin_write on design_templates for all using (is_admin()) with check (is_admin());

-- Customer designs: per-user
drop policy if exists customer_designs_owner on customer_designs;
create policy customer_designs_owner on customer_designs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists customer_designs_admin on customer_designs;
create policy customer_designs_admin on customer_designs for all using (is_admin()) with check (is_admin());

-- Orders: customer reads/writes own via email or user_id; admins full
drop policy if exists orders_owner_read on orders;
create policy orders_owner_read on orders for select using (auth.uid() = user_id);
drop policy if exists orders_admin_all on orders;
create policy orders_admin_all on orders for all using (is_admin()) with check (is_admin());
drop policy if exists orders_insert_authenticated on orders;
create policy orders_insert_authenticated on orders for insert to authenticated with check (auth.uid() = user_id or user_id is null);

drop policy if exists items_owner_read on order_items;
create policy items_owner_read on order_items for select using (
  exists(select 1 from orders o where o.id = order_items.order_id and o.user_id = auth.uid())
);
drop policy if exists items_admin_all on order_items;
create policy items_admin_all on order_items for all using (is_admin()) with check (is_admin());

drop policy if exists proofs_owner_read on proofs;
create policy proofs_owner_read on proofs for select using (
  exists(
    select 1
    from order_items oi
    join orders o on o.id = oi.order_id
    where oi.id = proofs.order_item_id and o.user_id = auth.uid()
  )
);
drop policy if exists proofs_admin_all on proofs;
create policy proofs_admin_all on proofs for all using (is_admin()) with check (is_admin());

drop policy if exists order_messages_owner on order_messages;
create policy order_messages_owner on order_messages for select using (
  exists(select 1 from orders o where o.id = order_messages.order_id and o.user_id = auth.uid())
);
drop policy if exists order_messages_admin on order_messages;
create policy order_messages_admin on order_messages for all using (is_admin()) with check (is_admin());

-- Quotes: customers see their own, admins see all
drop policy if exists quotes_owner_read on quote_requests;
create policy quotes_owner_read on quote_requests for select using (auth.uid() = user_id or email = auth.email());
drop policy if exists quotes_public_insert on quote_requests;
create policy quotes_public_insert on quote_requests for insert with check (true);
drop policy if exists quotes_admin_all on quote_requests;
create policy quotes_admin_all on quote_requests for all using (is_admin()) with check (is_admin());

-- Newsletter: admin manages, public can insert via double opt-in trigger via service role
drop policy if exists newsletter_admin_all on newsletter_subscribers;
create policy newsletter_admin_all on newsletter_subscribers for all using (is_admin()) with check (is_admin());
drop policy if exists newsletter_campaigns_admin on newsletter_campaigns;
create policy newsletter_campaigns_admin on newsletter_campaigns for all using (is_admin()) with check (is_admin());

-- Activity + audit: admin-only reads
drop policy if exists activity_admin_read on site_activity;
create policy activity_admin_read on site_activity for select using (is_admin());
drop policy if exists activity_anon_insert on site_activity;
create policy activity_anon_insert on site_activity for insert with check (true);

drop policy if exists audit_admin_read on audit_log;
create policy audit_admin_read on audit_log for select using (is_admin());

-- Media + settings admin-only
drop policy if exists media_admin_all on media_assets;
create policy media_admin_all on media_assets for all using (is_admin()) with check (is_admin());
drop policy if exists media_public_read on media_assets;
create policy media_public_read on media_assets for select using (true);

drop policy if exists settings_admin_all on settings;
create policy settings_admin_all on settings for all using (is_admin()) with check (is_admin());
drop policy if exists settings_public_read on settings;
create policy settings_public_read on settings for select using (true);

-- ────────────────────────────────────────────────────────────────────────────
-- Trigger: keep profiles.email in sync with auth.users
-- ────────────────────────────────────────────────────────────────────────────
create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ────────────────────────────────────────────────────────────────────────────
-- Storage buckets (create via SQL; adjust policies in Supabase dashboard)
-- ────────────────────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values
  ('artwork', 'artwork', false),
  ('proofs', 'proofs', false),
  ('generated', 'generated', true),
  ('product-images', 'product-images', true)
on conflict (id) do nothing;
