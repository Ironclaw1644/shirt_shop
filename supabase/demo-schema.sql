-- Georgia Print Hub — demo_gaph schema (DEMO_MODE deployments)
-- ─────────────────────────────────────────────────────────────────────────────
-- Structural clone of gaph (supabase/migrations/0002 + 0003) with two
-- deliberate differences:
--
--   1. NO auth.users linkage. The demo admin is a synthetic identity
--      ("00000000-0000-0000-0000-00000000demo") that never exists in
--      auth.users, so profiles.id — and every column that points at it —
--      is TEXT instead of uuid REFERENCES auth.users(id). No signup trigger.
--
--   2. Permissive RLS. Every table gets `for all using (true) with check
--      (true)`: demo visitors are anonymous (anon key) but act as admin.
--      The demo schema holds only throwaway data reset nightly by
--      /api/demo/reset, so open policies are the point, not a bug.
--
-- Run once against the shared Supabase project:
--   psql "$DATABASE_URL" -f supabase/demo-schema.sql
-- Storage buckets are shared with prod (gaph-* buckets already exist).
-- ─────────────────────────────────────────────────────────────────────────────

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

create schema if not exists demo_gaph;

-- ── enums ────────────────────────────────────────────────────────────────────
do $$ begin
  create type demo_gaph.price_status as enum ('confirmed', 'placeholder', 'quote');
exception when duplicate_object then null; end $$;

do $$ begin
  create type demo_gaph.product_status as enum ('draft', 'active', 'archived');
exception when duplicate_object then null; end $$;

do $$ begin
  create type demo_gaph.order_status as enum (
    'received', 'in_proof', 'approved', 'in_production', 'shipped', 'delivered', 'cancelled'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type demo_gaph.proof_status as enum ('pending', 'approved', 'changes_requested');
exception when duplicate_object then null; end $$;

do $$ begin
  create type demo_gaph.quote_status as enum ('new', 'in_progress', 'quoted', 'accepted', 'closed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type demo_gaph.user_role as enum ('customer', 'staff', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type demo_gaph.media_source as enum ('upload', 'generated');
exception when duplicate_object then null; end $$;

do $$ begin
  create type demo_gaph.image_source as enum ('ai', 'supplier-cdn', 'manager-upload', 'manager-url');
exception when duplicate_object then null; end $$;

do $$ begin
  create type demo_gaph.image_status as enum ('ok', 'review-required');
exception when duplicate_object then null; end $$;

-- ── profiles (TEXT id — no auth.users FK, demo identity never hits auth) ────
create table if not exists demo_gaph.profiles (
  id text primary key,
  email text not null unique,
  full_name text,
  company text,
  phone text,
  role demo_gaph.user_role not null default 'customer',
  tags text[] default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── addresses ────────────────────────────────────────────────────────────────
create table if not exists demo_gaph.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id text references demo_gaph.profiles(id) on delete cascade,
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

-- ── categories ───────────────────────────────────────────────────────────────
create table if not exists demo_gaph.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  parent_id uuid references demo_gaph.categories(id) on delete set null,
  hero_image_url text,
  intro text,
  seo_meta jsonb default '{}'::jsonb,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists idx_demo_categories_parent on demo_gaph.categories(parent_id);

-- ── products (incl. 0003 image-override columns) ─────────────────────────────
create table if not exists demo_gaph.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  category_id uuid references demo_gaph.categories(id) on delete set null,
  subcategory_id uuid references demo_gaph.categories(id) on delete set null,
  brand text,
  title text not null,
  short_description text,
  description text,
  images text[] default '{}',
  base_price_cents integer,
  price_status demo_gaph.price_status not null default 'placeholder',
  min_qty integer not null default 1,
  lead_time_days integer not null default 5,
  decoration_methods text[] default '{}',
  placement_zones jsonb default '[]'::jsonb,
  options jsonb default '{}'::jsonb,
  badges text[] default '{}',
  status demo_gaph.product_status not null default 'active',
  seo_meta jsonb default '{}'::jsonb,
  image_source demo_gaph.image_source not null default 'ai',
  image_url text,
  original_image_url text,
  supplier_url text,
  image_status demo_gaph.image_status not null default 'ok',
  image_status_checked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_demo_products_category on demo_gaph.products(category_id);
create index if not exists idx_demo_products_status on demo_gaph.products(status);

create table if not exists demo_gaph.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references demo_gaph.products(id) on delete cascade,
  sku text not null,
  options jsonb not null default '{}'::jsonb,
  price_cents integer,
  inventory_tracked boolean not null default false,
  stock_qty integer not null default 0,
  created_at timestamptz not null default now(),
  unique (product_id, sku)
);

create table if not exists demo_gaph.price_tiers (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references demo_gaph.products(id) on delete cascade,
  min_qty integer not null,
  max_qty integer,
  unit_price_cents integer not null
);
create index if not exists idx_demo_price_tiers_product on demo_gaph.price_tiers(product_id);

-- ── designs ──────────────────────────────────────────────────────────────────
create table if not exists demo_gaph.design_templates (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references demo_gaph.products(id) on delete set null,
  name text not null,
  preview_url text,
  design_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists demo_gaph.customer_designs (
  id uuid primary key default gen_random_uuid(),
  user_id text references demo_gaph.profiles(id) on delete cascade,
  product_id uuid references demo_gaph.products(id) on delete set null,
  name text,
  design_json jsonb not null default '{}'::jsonb,
  preview_url text,
  source_file_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── orders ───────────────────────────────────────────────────────────────────
create table if not exists demo_gaph.orders (
  id uuid primary key default gen_random_uuid(),
  user_id text references demo_gaph.profiles(id) on delete set null,
  email text not null,
  status demo_gaph.order_status not null default 'received',
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
create index if not exists idx_demo_orders_status on demo_gaph.orders(status);

create table if not exists demo_gaph.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references demo_gaph.orders(id) on delete cascade,
  product_id uuid references demo_gaph.products(id) on delete set null,
  variant_id uuid references demo_gaph.product_variants(id) on delete set null,
  title_snapshot text not null,
  quantity integer not null,
  unit_price_cents integer not null,
  decoration jsonb,
  design_id uuid references demo_gaph.customer_designs(id) on delete set null,
  artwork_file_urls text[] default '{}',
  proof_url text,
  proof_status demo_gaph.proof_status default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists demo_gaph.proofs (
  id uuid primary key default gen_random_uuid(),
  order_item_id uuid not null references demo_gaph.order_items(id) on delete cascade,
  url text not null,
  version integer not null default 1,
  status demo_gaph.proof_status not null default 'pending',
  customer_comments text,
  created_at timestamptz not null default now()
);

create table if not exists demo_gaph.order_messages (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references demo_gaph.orders(id) on delete cascade,
  author_role demo_gaph.user_role not null default 'customer',
  author_id text references demo_gaph.profiles(id) on delete set null,
  body text not null,
  attachments jsonb default '[]'::jsonb,
  created_at timestamptz not null default now()
);

-- ── quotes ───────────────────────────────────────────────────────────────────
create table if not exists demo_gaph.quote_requests (
  id uuid primary key default gen_random_uuid(),
  user_id text references demo_gaph.profiles(id) on delete set null,
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
  status demo_gaph.quote_status not null default 'new',
  admin_reply text,
  quoted_price_cents integer,
  stripe_payment_link text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── newsletter ───────────────────────────────────────────────────────────────
create table if not exists demo_gaph.newsletter_subscribers (
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

create table if not exists demo_gaph.newsletter_campaigns (
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

-- ── activity + audit ─────────────────────────────────────────────────────────
create table if not exists demo_gaph.site_activity (
  id bigserial primary key,
  event_type text not null,
  path text,
  user_id text references demo_gaph.profiles(id) on delete set null,
  session_id text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists idx_demo_site_activity_created on demo_gaph.site_activity(created_at desc);

create table if not exists demo_gaph.audit_log (
  id uuid primary key default gen_random_uuid(),
  admin_user_id text references demo_gaph.profiles(id) on delete set null,
  action text not null,
  entity_type text,
  entity_id text,
  before jsonb,
  after jsonb,
  created_at timestamptz not null default now()
);

-- ── media + settings ─────────────────────────────────────────────────────────
create table if not exists demo_gaph.media_assets (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  alt text,
  source demo_gaph.media_source not null default 'upload',
  prompt text,
  created_by text references demo_gaph.profiles(id) on delete set null,
  tags text[] default '{}',
  width int,
  height int,
  mime text,
  created_at timestamptz not null default now()
);

create table if not exists demo_gaph.settings (
  id boolean primary key default true check (id),
  business jsonb not null default '{}'::jsonb,
  shipping jsonb not null default '{}'::jsonb,
  tax jsonb not null default '{}'::jsonb,
  flags jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
insert into demo_gaph.settings (id) values (true) on conflict (id) do nothing;

-- ── grants ───────────────────────────────────────────────────────────────────
grant usage on schema demo_gaph to anon, authenticated, service_role;
grant all on all tables in schema demo_gaph to anon, authenticated, service_role;
grant all on all sequences in schema demo_gaph to anon, authenticated, service_role;
grant all on all functions in schema demo_gaph to anon, authenticated, service_role;
alter default privileges in schema demo_gaph grant all on tables to anon, authenticated, service_role;
alter default privileges in schema demo_gaph grant all on sequences to anon, authenticated, service_role;
alter default privileges in schema demo_gaph grant all on functions to anon, authenticated, service_role;

-- ── RLS: enabled everywhere, permissive everywhere (throwaway demo data) ─────
do $$
declare
  t text;
begin
  for t in
    select tablename from pg_tables where schemaname = 'demo_gaph'
  loop
    execute format('alter table demo_gaph.%I enable row level security', t);
    execute format('drop policy if exists demo_open on demo_gaph.%I', t);
    execute format(
      'create policy demo_open on demo_gaph.%I for all using (true) with check (true)', t
    );
  end loop;
end $$;
