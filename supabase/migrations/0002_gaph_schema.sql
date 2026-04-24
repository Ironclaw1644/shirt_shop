-- Georgia Print Hub — gaph schema
-- Isolates this app from other tenants sharing the WalkPerro Supabase project.

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

create schema if not exists gaph;
set local search_path = gaph, public;

-- ────────────────────────────────────────────────────────────────────────────
-- Enums (all in gaph schema)
-- ────────────────────────────────────────────────────────────────────────────
do $$ begin
  create type gaph.price_status as enum ('confirmed', 'placeholder', 'quote');
exception when duplicate_object then null; end $$;

do $$ begin
  create type gaph.product_status as enum ('draft', 'active', 'archived');
exception when duplicate_object then null; end $$;

do $$ begin
  create type gaph.order_status as enum (
    'received', 'in_proof', 'approved', 'in_production', 'shipped', 'delivered', 'cancelled'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type gaph.proof_status as enum ('pending', 'approved', 'changes_requested');
exception when duplicate_object then null; end $$;

do $$ begin
  create type gaph.quote_status as enum ('new', 'in_progress', 'quoted', 'accepted', 'closed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type gaph.user_role as enum ('customer', 'staff', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type gaph.media_source as enum ('upload', 'generated');
exception when duplicate_object then null; end $$;

-- ────────────────────────────────────────────────────────────────────────────
-- Profiles (extends auth.users)
-- ────────────────────────────────────────────────────────────────────────────
create table if not exists gaph.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  company text,
  phone text,
  role gaph.user_role not null default 'customer',
  tags text[] default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ────────────────────────────────────────────────────────────────────────────
-- Addresses
-- ────────────────────────────────────────────────────────────────────────────
create table if not exists gaph.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references gaph.profiles(id) on delete cascade,
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
create table if not exists gaph.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  parent_id uuid references gaph.categories(id) on delete set null,
  hero_image_url text,
  intro text,
  seo_meta jsonb default '{}'::jsonb,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists idx_categories_parent on gaph.categories(parent_id);

-- ────────────────────────────────────────────────────────────────────────────
-- Products
-- ────────────────────────────────────────────────────────────────────────────
create table if not exists gaph.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  category_id uuid references gaph.categories(id) on delete set null,
  subcategory_id uuid references gaph.categories(id) on delete set null,
  brand text,
  title text not null,
  short_description text,
  description text,
  images text[] default '{}',
  base_price_cents integer,
  price_status gaph.price_status not null default 'placeholder',
  min_qty integer not null default 1,
  lead_time_days integer not null default 5,
  decoration_methods text[] default '{}',
  placement_zones jsonb default '[]'::jsonb,
  options jsonb default '{}'::jsonb,
  badges text[] default '{}',
  status gaph.product_status not null default 'active',
  seo_meta jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_products_category on gaph.products(category_id);
create index if not exists idx_products_subcategory on gaph.products(subcategory_id);
create index if not exists idx_products_status on gaph.products(status);

create table if not exists gaph.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references gaph.products(id) on delete cascade,
  sku text not null,
  options jsonb not null default '{}'::jsonb,
  price_cents integer,
  inventory_tracked boolean not null default false,
  stock_qty integer not null default 0,
  created_at timestamptz not null default now(),
  unique (product_id, sku)
);

create table if not exists gaph.price_tiers (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references gaph.products(id) on delete cascade,
  min_qty integer not null,
  max_qty integer,
  unit_price_cents integer not null
);
create index if not exists idx_price_tiers_product on gaph.price_tiers(product_id);

-- ────────────────────────────────────────────────────────────────────────────
-- Design templates + customer designs
-- ────────────────────────────────────────────────────────────────────────────
create table if not exists gaph.design_templates (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references gaph.products(id) on delete set null,
  name text not null,
  preview_url text,
  design_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists gaph.customer_designs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references gaph.profiles(id) on delete cascade,
  product_id uuid references gaph.products(id) on delete set null,
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
create table if not exists gaph.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references gaph.profiles(id) on delete set null,
  email text not null,
  status gaph.order_status not null default 'received',
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
create index if not exists idx_orders_user on gaph.orders(user_id);
create index if not exists idx_orders_email on gaph.orders(email);
create index if not exists idx_orders_status on gaph.orders(status);

create table if not exists gaph.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references gaph.orders(id) on delete cascade,
  product_id uuid references gaph.products(id) on delete set null,
  variant_id uuid references gaph.product_variants(id) on delete set null,
  title_snapshot text not null,
  quantity integer not null,
  unit_price_cents integer not null,
  decoration jsonb,
  design_id uuid references gaph.customer_designs(id) on delete set null,
  artwork_file_urls text[] default '{}',
  proof_url text,
  proof_status gaph.proof_status default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists gaph.proofs (
  id uuid primary key default gen_random_uuid(),
  order_item_id uuid not null references gaph.order_items(id) on delete cascade,
  url text not null,
  version integer not null default 1,
  status gaph.proof_status not null default 'pending',
  customer_comments text,
  created_at timestamptz not null default now()
);

create table if not exists gaph.order_messages (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references gaph.orders(id) on delete cascade,
  author_role gaph.user_role not null default 'customer',
  author_id uuid references gaph.profiles(id) on delete set null,
  body text not null,
  attachments jsonb default '[]'::jsonb,
  created_at timestamptz not null default now()
);

-- ────────────────────────────────────────────────────────────────────────────
-- Quote requests
-- ────────────────────────────────────────────────────────────────────────────
create table if not exists gaph.quote_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references gaph.profiles(id) on delete set null,
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
  status gaph.quote_status not null default 'new',
  admin_reply text,
  quoted_price_cents integer,
  stripe_payment_link text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_quotes_status on gaph.quote_requests(status);

-- ────────────────────────────────────────────────────────────────────────────
-- Newsletter
-- ────────────────────────────────────────────────────────────────────────────
create table if not exists gaph.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
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

create table if not exists gaph.newsletter_campaigns (
  id uuid primary key default gen_random_uuid(),
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
create table if not exists gaph.site_activity (
  id bigserial primary key,
  event_type text not null,
  path text,
  user_id uuid references gaph.profiles(id) on delete set null,
  session_id text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists idx_site_activity_created on gaph.site_activity(created_at desc);
create index if not exists idx_site_activity_event on gaph.site_activity(event_type);

create table if not exists gaph.audit_log (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid references gaph.profiles(id) on delete set null,
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
create table if not exists gaph.media_assets (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  alt text,
  source gaph.media_source not null default 'upload',
  prompt text,
  created_by uuid references gaph.profiles(id) on delete set null,
  tags text[] default '{}',
  width int,
  height int,
  mime text,
  created_at timestamptz not null default now()
);

create table if not exists gaph.settings (
  id boolean primary key default true check (id),
  business jsonb not null default '{}'::jsonb,
  shipping jsonb not null default '{}'::jsonb,
  tax jsonb not null default '{}'::jsonb,
  flags jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
insert into gaph.settings (id) values (true) on conflict (id) do nothing;

-- ────────────────────────────────────────────────────────────────────────────
-- Grants — anon/authenticated can reach the schema (RLS still governs rows)
-- ────────────────────────────────────────────────────────────────────────────
grant usage on schema gaph to anon, authenticated, service_role;
grant all on all tables in schema gaph to anon, authenticated, service_role;
grant all on all sequences in schema gaph to anon, authenticated, service_role;
grant all on all functions in schema gaph to anon, authenticated, service_role;
alter default privileges in schema gaph grant all on tables to anon, authenticated, service_role;
alter default privileges in schema gaph grant all on sequences to anon, authenticated, service_role;
alter default privileges in schema gaph grant all on functions to anon, authenticated, service_role;

-- ────────────────────────────────────────────────────────────────────────────
-- RLS
-- ────────────────────────────────────────────────────────────────────────────
alter table gaph.profiles enable row level security;
alter table gaph.addresses enable row level security;
alter table gaph.categories enable row level security;
alter table gaph.products enable row level security;
alter table gaph.product_variants enable row level security;
alter table gaph.price_tiers enable row level security;
alter table gaph.design_templates enable row level security;
alter table gaph.customer_designs enable row level security;
alter table gaph.orders enable row level security;
alter table gaph.order_items enable row level security;
alter table gaph.proofs enable row level security;
alter table gaph.order_messages enable row level security;
alter table gaph.quote_requests enable row level security;
alter table gaph.newsletter_subscribers enable row level security;
alter table gaph.newsletter_campaigns enable row level security;
alter table gaph.site_activity enable row level security;
alter table gaph.audit_log enable row level security;
alter table gaph.media_assets enable row level security;
alter table gaph.settings enable row level security;

-- Helper: gaph.is_admin() — fully schema-qualified so PostgREST + triggers
-- resolve it regardless of caller search_path.
create or replace function gaph.is_admin() returns boolean
language sql stable
set search_path = gaph, public
as $$
  select exists(
    select 1 from gaph.profiles
    where id = auth.uid() and role in ('admin','staff')
  );
$$;

-- Profiles
drop policy if exists profiles_self on gaph.profiles;
create policy profiles_self on gaph.profiles for select using (auth.uid() = id);
drop policy if exists profiles_self_update on gaph.profiles;
create policy profiles_self_update on gaph.profiles for update using (auth.uid() = id);
drop policy if exists profiles_admin_all on gaph.profiles;
create policy profiles_admin_all on gaph.profiles for all using (gaph.is_admin()) with check (gaph.is_admin());

-- Addresses
drop policy if exists addresses_owner on gaph.addresses;
create policy addresses_owner on gaph.addresses for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists addresses_admin on gaph.addresses;
create policy addresses_admin on gaph.addresses for all using (gaph.is_admin()) with check (gaph.is_admin());

-- Public catalog reads
drop policy if exists categories_public_read on gaph.categories;
create policy categories_public_read on gaph.categories for select using (true);
drop policy if exists products_public_read on gaph.products;
create policy products_public_read on gaph.products for select using (status = 'active' or gaph.is_admin());
drop policy if exists variants_public_read on gaph.product_variants;
create policy variants_public_read on gaph.product_variants for select using (true);
drop policy if exists tiers_public_read on gaph.price_tiers;
create policy tiers_public_read on gaph.price_tiers for select using (true);
drop policy if exists templates_public_read on gaph.design_templates;
create policy templates_public_read on gaph.design_templates for select using (true);

-- Admin-only writes on catalog
drop policy if exists categories_admin_write on gaph.categories;
create policy categories_admin_write on gaph.categories for all using (gaph.is_admin()) with check (gaph.is_admin());
drop policy if exists products_admin_write on gaph.products;
create policy products_admin_write on gaph.products for all using (gaph.is_admin()) with check (gaph.is_admin());
drop policy if exists variants_admin_write on gaph.product_variants;
create policy variants_admin_write on gaph.product_variants for all using (gaph.is_admin()) with check (gaph.is_admin());
drop policy if exists tiers_admin_write on gaph.price_tiers;
create policy tiers_admin_write on gaph.price_tiers for all using (gaph.is_admin()) with check (gaph.is_admin());
drop policy if exists templates_admin_write on gaph.design_templates;
create policy templates_admin_write on gaph.design_templates for all using (gaph.is_admin()) with check (gaph.is_admin());

-- Customer designs
drop policy if exists customer_designs_owner on gaph.customer_designs;
create policy customer_designs_owner on gaph.customer_designs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists customer_designs_admin on gaph.customer_designs;
create policy customer_designs_admin on gaph.customer_designs for all using (gaph.is_admin()) with check (gaph.is_admin());

-- Orders
drop policy if exists orders_owner_read on gaph.orders;
create policy orders_owner_read on gaph.orders for select using (auth.uid() = user_id);
drop policy if exists orders_admin_all on gaph.orders;
create policy orders_admin_all on gaph.orders for all using (gaph.is_admin()) with check (gaph.is_admin());
drop policy if exists orders_insert_authenticated on gaph.orders;
create policy orders_insert_authenticated on gaph.orders for insert to authenticated with check (auth.uid() = user_id or user_id is null);

drop policy if exists items_owner_read on gaph.order_items;
create policy items_owner_read on gaph.order_items for select using (
  exists(select 1 from gaph.orders o where o.id = order_items.order_id and o.user_id = auth.uid())
);
drop policy if exists items_admin_all on gaph.order_items;
create policy items_admin_all on gaph.order_items for all using (gaph.is_admin()) with check (gaph.is_admin());

drop policy if exists proofs_owner_read on gaph.proofs;
create policy proofs_owner_read on gaph.proofs for select using (
  exists(
    select 1
    from gaph.order_items oi
    join gaph.orders o on o.id = oi.order_id
    where oi.id = proofs.order_item_id and o.user_id = auth.uid()
  )
);
drop policy if exists proofs_admin_all on gaph.proofs;
create policy proofs_admin_all on gaph.proofs for all using (gaph.is_admin()) with check (gaph.is_admin());

drop policy if exists order_messages_owner on gaph.order_messages;
create policy order_messages_owner on gaph.order_messages for select using (
  exists(select 1 from gaph.orders o where o.id = order_messages.order_id and o.user_id = auth.uid())
);
drop policy if exists order_messages_admin on gaph.order_messages;
create policy order_messages_admin on gaph.order_messages for all using (gaph.is_admin()) with check (gaph.is_admin());

-- Quotes
drop policy if exists quotes_owner_read on gaph.quote_requests;
create policy quotes_owner_read on gaph.quote_requests for select using (auth.uid() = user_id or email = auth.email());
drop policy if exists quotes_public_insert on gaph.quote_requests;
create policy quotes_public_insert on gaph.quote_requests for insert with check (true);
drop policy if exists quotes_admin_all on gaph.quote_requests;
create policy quotes_admin_all on gaph.quote_requests for all using (gaph.is_admin()) with check (gaph.is_admin());

-- Newsletter
drop policy if exists newsletter_admin_all on gaph.newsletter_subscribers;
create policy newsletter_admin_all on gaph.newsletter_subscribers for all using (gaph.is_admin()) with check (gaph.is_admin());
drop policy if exists newsletter_campaigns_admin on gaph.newsletter_campaigns;
create policy newsletter_campaigns_admin on gaph.newsletter_campaigns for all using (gaph.is_admin()) with check (gaph.is_admin());

-- Activity + audit
drop policy if exists activity_admin_read on gaph.site_activity;
create policy activity_admin_read on gaph.site_activity for select using (gaph.is_admin());
drop policy if exists activity_anon_insert on gaph.site_activity;
create policy activity_anon_insert on gaph.site_activity for insert with check (true);

drop policy if exists audit_admin_read on gaph.audit_log;
create policy audit_admin_read on gaph.audit_log for select using (gaph.is_admin());

-- Media + settings
drop policy if exists media_admin_all on gaph.media_assets;
create policy media_admin_all on gaph.media_assets for all using (gaph.is_admin()) with check (gaph.is_admin());
drop policy if exists media_public_read on gaph.media_assets;
create policy media_public_read on gaph.media_assets for select using (true);

drop policy if exists settings_admin_all on gaph.settings;
create policy settings_admin_all on gaph.settings for all using (gaph.is_admin()) with check (gaph.is_admin());
drop policy if exists settings_public_read on gaph.settings;
create policy settings_public_read on gaph.settings for select using (true);

-- ────────────────────────────────────────────────────────────────────────────
-- Trigger: keep gaph.profiles.email in sync with auth.users
-- Uses its own trigger name so it coexists with sibling tenants.
-- ────────────────────────────────────────────────────────────────────────────
create or replace function gaph.handle_new_user() returns trigger
language plpgsql security definer
set search_path = gaph, public
as $$
begin
  insert into gaph.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists gaph_on_auth_user_created on auth.users;
create trigger gaph_on_auth_user_created
  after insert on auth.users
  for each row execute function gaph.handle_new_user();

-- ────────────────────────────────────────────────────────────────────────────
-- Storage buckets — namespaced with gaph- prefix to avoid collisions
-- ────────────────────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values
  ('gaph-artwork', 'gaph-artwork', false),
  ('gaph-proofs', 'gaph-proofs', false),
  ('gaph-generated', 'gaph-generated', true),
  ('gaph-product-images', 'gaph-product-images', true)
on conflict (id) do nothing;
