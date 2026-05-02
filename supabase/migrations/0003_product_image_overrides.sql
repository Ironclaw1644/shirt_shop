-- Add per-product image-source / external-URL columns so the catalog can host
-- a mix of AI-generated images (existing pattern), supplier-hot-linked images
-- (new for the blank-supplier import), and manager overrides (file upload or
-- pasted URL).
--
-- Defaults preserve the existing behavior: every existing row gets
-- image_source='ai', image_url=null, original_image_url=null, supplier_url=null.
-- The render path falls back to the legacy /images/generated/<slug>.webp path
-- when image_url is null, so no existing product breaks.

set local search_path = gaph, public;

do $$ begin
  create type gaph.image_source as enum (
    'ai',              -- generated via Gemini, served from /images/generated/<slug>.webp
    'supplier-cdn',    -- hot-linked from a supplier CDN (e.g. res.cloudinary.com)
    'manager-upload',  -- uploaded by the manager via the admin tool
    'manager-url'      -- pasted URL by the manager via the admin tool
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type gaph.image_status as enum (
    'ok',                -- image loads
    'review-required'    -- supplier URL failed health check; needs manager attention
  );
exception when duplicate_object then null; end $$;

alter table gaph.products
  add column if not exists image_source gaph.image_source not null default 'ai',
  add column if not exists image_url    text,
  add column if not exists original_image_url text,
  add column if not exists supplier_url text,
  add column if not exists image_status gaph.image_status not null default 'ok',
  add column if not exists image_status_checked_at timestamptz;

create index if not exists products_image_source_idx
  on gaph.products(image_source)
  where image_source = 'supplier-cdn';

create index if not exists products_image_status_idx
  on gaph.products(image_status)
  where image_status = 'review-required';
