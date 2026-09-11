import { queryOptions } from "@tanstack/react-query";
import { listCategories, listProducts, getProductBySlug } from "./catalog.functions";
import type { CatalogProduct } from "./catalog.functions";

import artPlaystation from "@/assets/art-playstation.jpg";
import artXbox from "@/assets/art-xbox.jpg";
import artNintendo from "@/assets/art-nintendo.jpg";
import artSteam from "@/assets/art-steam.jpg";
import artGiftcard from "@/assets/art-giftcard.jpg";
import artAccount from "@/assets/art-account.jpg";
import artDigital from "@/assets/art-digital.jpg";

export const categoriesQuery = () =>
  queryOptions({ queryKey: ["categories"], queryFn: () => listCategories() });

export const productsQuery = () =>
  queryOptions({ queryKey: ["products"], queryFn: () => listProducts() });

export const productQuery = (slug: string) =>
  queryOptions({
    queryKey: ["product", slug],
    queryFn: () => getProductBySlug({ data: { slug } }),
  });

const ART: Record<string, string> = {
  playstation: artPlaystation,
  xbox: artXbox,
  nintendo: artNintendo,
  steam: artSteam,
  giftcard: artGiftcard,
  account: artAccount,
  digital: artDigital,
};

export function artFor(imageKey: string) {
  return ART[imageKey] ?? artDigital;
}

export function priceOf(product: Pick<CatalogProduct, "price" | "sale_price">) {
  return product.sale_price ?? product.price;
}

export function formatPrice(value: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(value);
}

export const STOCK_LABEL: Record<CatalogProduct["stock_status"], string> = {
  IN_STOCK: "In stock",
  LOW_STOCK: "Low stock",
  OUT_OF_STOCK: "Out of stock",
  PREORDER: "Pre-order",
};

export const TYPE_LABEL: Record<CatalogProduct["product_type"], string> = {
  GAME_ACCOUNT: "Game account",
  GAME_CARD: "Game card",
  GIFT_CARD: "Gift card",
  DIGITAL_PRODUCT: "Digital product",
};
