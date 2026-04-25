import "server-only";
import sharp from "sharp";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils/slug";

const BUCKET = "gaph-generated";
const MAX_BYTES = 8 * 1024 * 1024; // 8MB
const IMAGE_MIMES = new Set(["image/png", "image/jpeg", "image/jpg", "image/webp"]);

/**
 * Upload a product image to Supabase Storage.
 * - Re-encodes raster images to WebP at max-1600w for consistency + smaller bytes.
 * - Stores under `products/<slug>/<timestamp>-<filename>.webp`.
 * - Returns the public URL.
 */
export async function uploadProductImage({
  file,
  slug,
}: {
  file: File;
  slug?: string | null;
}): Promise<{ url: string }> {
  if (file.size > MAX_BYTES) {
    throw new Error(`File too large (max ${Math.round(MAX_BYTES / 1024 / 1024)}MB)`);
  }
  if (!IMAGE_MIMES.has(file.type)) {
    throw new Error(`Unsupported file type "${file.type}". Use PNG, JPG, or WEBP.`);
  }

  const inputBuf = Buffer.from(await file.arrayBuffer());

  // sharp resize + WebP encode
  const webp = await sharp(inputBuf)
    .rotate() // honor EXIF orientation
    .resize({ width: 1600, withoutEnlargement: true })
    .webp({ quality: 86 })
    .toBuffer();

  const baseName = (file.name.replace(/\.[^.]+$/, "") || "image").slice(0, 40);
  const filePath = `products/${slug ?? "new"}/${Date.now()}-${slugify(baseName)}.webp`;

  const service = getSupabaseServiceRoleClient();
  const { error: upErr } = await service.storage
    .from(BUCKET)
    .upload(filePath, webp, { contentType: "image/webp", upsert: true });
  if (upErr) throw new Error(`Upload failed: ${upErr.message}`);

  const { data } = service.storage.from(BUCKET).getPublicUrl(filePath);
  return { url: data.publicUrl };
}
