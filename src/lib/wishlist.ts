import { queryOptions } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

export type WishlistEntry = {
  id: string;
  productId: string;
  name: string;
  slug: string;
  imageKey: string;
  price: number;
  salePrice: number | null;
  currency: string;
  stockStatus: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK" | "PREORDER";
};

export const wishlistQuery = (userId: string | undefined) =>
  queryOptions({
    queryKey: ["wishlist", userId ?? "anonymous"],
    enabled: Boolean(userId),
    queryFn: async (): Promise<WishlistEntry[]> => {
      const { data, error } = await supabase
        .from("wishlist_items")
        .select(
          "id, product_id, products(name, slug, image_key, price, sale_price, currency, stock_status)",
        )
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);

      return (data ?? [])
        .filter((row) => row.products !== null)
        .map((row) => ({
          id: row.id,
          productId: row.product_id,
          name: row.products!.name,
          slug: row.products!.slug,
          imageKey: row.products!.image_key,
          price: Number(row.products!.price),
          salePrice: row.products!.sale_price === null ? null : Number(row.products!.sale_price),
          currency: row.products!.currency,
          stockStatus: row.products!.stock_status,
        }));
    },
  });

export async function addToWishlist(userId: string, productId: string) {
  const { error } = await supabase
    .from("wishlist_items")
    .insert({ user_id: userId, product_id: productId });
  if (error && !error.message.includes("duplicate")) throw new Error(error.message);
}

export async function removeFromWishlist(id: string) {
  const { error } = await supabase.from("wishlist_items").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
