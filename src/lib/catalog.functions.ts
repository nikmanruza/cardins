import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

const PRODUCT_COLUMNS =
  "id, name, slug, category_id, product_type, short_description, description, price, sale_price, currency, platform, game, region, delivery_method, stock_status, image_key, tags, rating, review_count, is_featured, is_bestseller, is_new, redemption_instructions, terms, seo_title, seo_description";

const CATEGORY_COLUMNS =
  "id, name, slug, description, icon, image_key, sort_order, seo_title, seo_description";

function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
          headers.delete("Authorization");
        }
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });
}

export type CatalogCategory = {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  image_key: string;
  sort_order: number;
  seo_title: string | null;
  seo_description: string | null;
};

export type CatalogProduct = {
  id: string;
  name: string;
  slug: string;
  category_id: string;
  product_type: "GAME_ACCOUNT" | "GAME_CARD" | "GIFT_CARD" | "DIGITAL_PRODUCT";
  short_description: string;
  description: string;
  price: number;
  sale_price: number | null;
  currency: string;
  platform: string | null;
  game: string | null;
  region: string | null;
  delivery_method: string;
  stock_status: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK" | "PREORDER";
  image_key: string;
  tags: string[];
  rating: number;
  review_count: number;
  is_featured: boolean;
  is_bestseller: boolean;
  is_new: boolean;
  redemption_instructions: string | null;
  terms: string | null;
  seo_title: string | null;
  seo_description: string | null;
};

export const listCategories = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await publicClient()
    .from("categories")
    .select(CATEGORY_COLUMNS)
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as CatalogCategory[];
});

export const listProducts = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await publicClient()
    .from("products")
    .select(PRODUCT_COLUMNS)
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => ({
    ...row,
    price: Number(row.price),
    sale_price: row.sale_price === null ? null : Number(row.sale_price),
    rating: Number(row.rating),
  })) as CatalogProduct[];
});

export const getProductBySlug = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: string }) => ({ slug: String(data.slug) }))
  .handler(async ({ data }) => {
    const { data: row, error } = await publicClient()
      .from("products")
      .select(PRODUCT_COLUMNS)
      .eq("slug", data.slug)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) return null;
    return {
      ...row,
      price: Number(row.price),
      sale_price: row.sale_price === null ? null : Number(row.sale_price),
      rating: Number(row.rating),
    } as CatalogProduct;
  });
