import { Link } from "@tanstack/react-router";
import { Calendar, Gamepad2, ShoppingCart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { WishlistButton } from "@/components/store/wishlist-button";
import { useCart } from "@/lib/cart";
import { artFor, formatPrice, priceOf, STOCK_LABEL } from "@/lib/catalog";
import { useCurrency } from "@/lib/currency";
import type { CatalogProduct } from "@/lib/catalog.functions";
import { cn } from "@/lib/utils";

export function ProductCard({ product }: { product: CatalogProduct }) {
  const { add, openCart } = useCart();
  const { currency, convertPrice } = useCurrency();
  const price = priceOf(product);
  const onSale = product.sale_price !== null;
  const soldOut = product.stock_status === "OUT_OF_STOCK";
  const isPreOrder = product.stock_status === "PREORDER";
  const usesImage = artFor(product.image_key);

  const displayDate = new Date().toLocaleDateString("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-card transition-transform duration-300 ease-[var(--ease-out-soft)] hover:-translate-y-1 hover:shadow-[0_18px_50px_rgba(129,90,255,0.16)] motion-reduce:transform-none">
      <Link
        to="/product/$slug"
        params={{ slug: product.slug }}
        className="relative block aspect-[4/3] overflow-hidden bg-surface"
      >
        <img
          src={usesImage}
          alt={product.name}
          loading="lazy"
          width={800}
          height={800}
          className="size-full object-cover transition-transform duration-500 ease-[var(--ease-out-soft)] group-hover:scale-[1.05] motion-reduce:transform-none"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          {product.is_bestseller && (
            <span className="rounded-full bg-gradient-to-r from-violet-700 to-purple-700 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white shadow-sm">
              Most Wanted
            </span>
          )}
          {isPreOrder && (
            <span className="rounded-full bg-gradient-to-r from-indigo-700 to-violet-600 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white shadow-sm">
              Pre-Order
            </span>
          )}
          {!product.is_bestseller && !isPreOrder && product.is_new && (
            <span className="rounded-full bg-primary px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary-foreground">
              New
            </span>
          )}
        </div>

        <div className="absolute right-3 top-3">
          <WishlistButton productId={product.id} variant="icon" />
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-white/90">
            <Gamepad2 className="size-4 text-violet-200" aria-hidden />
            <span>{product.platform ?? product.game ?? "Digital"}</span>
          </div>

          <h3 className="mt-3 line-clamp-2 font-display text-lg font-semibold leading-snug text-white">
            <Link to="/product/$slug" params={{ slug: product.slug }}>
              {product.name}
            </Link>
          </h3>

          <div className="mt-3 flex items-center gap-2 text-xs text-white/80">
            <Calendar className="size-3.5" aria-hidden />
            <span>{displayDate}</span>
          </div>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <div className="mt-0 flex items-center justify-between gap-4">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            From
          </span>
          <span className="font-display text-lg font-bold text-primary">
            {formatPrice(convertPrice(price, product.currency, currency), currency)}
          </span>
        </div>

        <div className="mt-2 flex items-center justify-between gap-2">
          <span className={cn("text-xs text-muted-foreground", soldOut && "text-destructive")}>
            {STOCK_LABEL[product.stock_status]}
          </span>
          <Button
            className="h-10 rounded-md px-4 py-2 text-sm font-semibold"
            variant={isPreOrder ? "default" : "secondary"}
            disabled={soldOut}
            onClick={() => {
              const convertedPrice = convertPrice(price, product.currency, currency);
              add({
                productId: product.id,
                slug: product.slug,
                name: product.name,
                imageKey: product.image_key,
                unitPrice: convertedPrice,
                currency,
              });
              openCart();
            }}
          >
            <ShoppingCart className="mr-2 size-4" aria-hidden />
            {isPreOrder ? "Pre-order" : soldOut ? "Sold out" : "Add"}
          </Button>
        </div>

        {onSale && (
          <p className="mt-2 text-xs text-muted-foreground line-through">
            {formatPrice(product.price, product.currency)}
          </p>
        )}
      </div>
    </article>
  );
}
