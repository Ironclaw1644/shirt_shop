/**
 * Typed subset of the Supabase schema used across the app.
 * Regenerate via `supabase gen types typescript --project-id <id>` once linked.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "customer" | "staff" | "admin";
export type PriceStatus = "confirmed" | "placeholder" | "quote";
export type ProductStatus = "draft" | "active" | "archived";
export type OrderStatus =
  | "received"
  | "in_proof"
  | "approved"
  | "in_production"
  | "shipped"
  | "delivered"
  | "cancelled";
export type ProofStatus = "pending" | "approved" | "changes_requested";
export type QuoteStatus = "new" | "in_progress" | "quoted" | "accepted" | "closed";

export type Database = {
  public: {
    Tables: {
      profiles: RowTable<{
        id: string;
        email: string;
        full_name: string | null;
        company: string | null;
        phone: string | null;
        role: UserRole;
        tags: string[];
        created_at: string;
        updated_at: string;
      }>;
      addresses: RowTable<{
        id: string;
        user_id: string | null;
        label: string | null;
        full_name: string | null;
        company: string | null;
        line1: string;
        line2: string | null;
        city: string;
        region: string;
        postal_code: string;
        country: string;
        phone: string | null;
        is_default: boolean;
        created_at: string;
      }>;
      categories: RowTable<{
        id: string;
        slug: string;
        name: string;
        parent_id: string | null;
        hero_image_url: string | null;
        intro: string | null;
        seo_meta: Json;
        sort_order: number;
        created_at: string;
      }>;
      products: RowTable<{
        id: string;
        slug: string;
        category_id: string | null;
        subcategory_id: string | null;
        brand: string | null;
        title: string;
        short_description: string | null;
        description: string | null;
        images: string[];
        base_price_cents: number | null;
        price_status: PriceStatus;
        min_qty: number;
        lead_time_days: number;
        decoration_methods: string[];
        placement_zones: Json;
        options: Json;
        badges: string[];
        status: ProductStatus;
        seo_meta: Json;
        created_at: string;
        updated_at: string;
      }>;
      product_variants: RowTable<{
        id: string;
        product_id: string;
        sku: string;
        options: Json;
        price_cents: number | null;
        inventory_tracked: boolean;
        stock_qty: number;
        created_at: string;
      }>;
      price_tiers: RowTable<{
        id: string;
        product_id: string;
        min_qty: number;
        max_qty: number | null;
        unit_price_cents: number;
      }>;
      design_templates: RowTable<{
        id: string;
        product_id: string | null;
        name: string;
        preview_url: string | null;
        design_json: Json;
        created_at: string;
      }>;
      customer_designs: RowTable<{
        id: string;
        user_id: string | null;
        product_id: string | null;
        name: string | null;
        design_json: Json;
        preview_url: string | null;
        source_file_url: string | null;
        created_at: string;
        updated_at: string;
      }>;
      orders: RowTable<{
        id: string;
        user_id: string | null;
        email: string;
        status: OrderStatus;
        subtotal_cents: number;
        tax_cents: number;
        shipping_cents: number;
        discount_cents: number;
        total_cents: number;
        stripe_payment_intent: string | null;
        stripe_checkout_session: string | null;
        shipping_address: Json | null;
        billing_address: Json | null;
        notes: string | null;
        created_at: string;
        updated_at: string;
      }>;
      order_items: RowTable<{
        id: string;
        order_id: string;
        product_id: string | null;
        variant_id: string | null;
        title_snapshot: string;
        quantity: number;
        unit_price_cents: number;
        decoration: Json | null;
        design_id: string | null;
        artwork_file_urls: string[];
        proof_url: string | null;
        proof_status: ProofStatus | null;
        created_at: string;
      }>;
      proofs: RowTable<{
        id: string;
        order_item_id: string;
        url: string;
        version: number;
        status: ProofStatus;
        customer_comments: string | null;
        created_at: string;
      }>;
      order_messages: RowTable<{
        id: string;
        order_id: string;
        author_role: UserRole;
        author_id: string | null;
        body: string;
        attachments: Json;
        created_at: string;
      }>;
      quote_requests: RowTable<{
        id: string;
        user_id: string | null;
        email: string;
        full_name: string | null;
        company: string | null;
        phone: string | null;
        product_refs: Json;
        est_quantity: number | null;
        in_hands_date: string | null;
        decoration: string | null;
        files: string[];
        message: string | null;
        status: QuoteStatus;
        admin_reply: string | null;
        quoted_price_cents: number | null;
        stripe_payment_link: string | null;
        created_at: string;
        updated_at: string;
      }>;
      newsletter_subscribers: RowTable<{
        id: string;
        email: string;
        full_name: string | null;
        tags: string[];
        subscribed_at: string | null;
        unsubscribed_at: string | null;
        resend_contact_id: string | null;
        confirm_token: string | null;
        confirmed_at: string | null;
        created_at: string;
      }>;
      newsletter_campaigns: RowTable<{
        id: string;
        subject: string;
        preview_text: string | null;
        body_html: string;
        segment: string | null;
        status: string;
        sent_at: string | null;
        resend_broadcast_id: string | null;
        stats: Json;
        created_at: string;
      }>;
      site_activity: RowTable<{
        id: number;
        event_type: string;
        path: string | null;
        user_id: string | null;
        session_id: string | null;
        metadata: Json;
        created_at: string;
      }>;
      audit_log: RowTable<{
        id: string;
        admin_user_id: string | null;
        action: string;
        entity_type: string | null;
        entity_id: string | null;
        before: Json | null;
        after: Json | null;
        created_at: string;
      }>;
      media_assets: RowTable<{
        id: string;
        url: string;
        alt: string | null;
        source: "upload" | "generated";
        prompt: string | null;
        created_by: string | null;
        tags: string[];
        width: number | null;
        height: number | null;
        mime: string | null;
        created_at: string;
      }>;
      settings: RowTable<{
        id: boolean;
        business: Json;
        shipping: Json;
        tax: Json;
        flags: Json;
        updated_at: string;
      }>;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

type RowTable<Row> = {
  Row: Row;
  Insert: Partial<Row>;
  Update: Partial<Row>;
  Relationships: [];
};
