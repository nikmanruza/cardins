import { Link } from "@tanstack/react-router";
import { Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { WishlistButton } from "@/components/store/wishlist-button";
import { useCart } from "@/lib/cart";
import { artFor, formatPrice, priceOf, STOCK_LABEL } from "@/lib/catalog";
import type { CatalogProduct } from "@/lib/catalog.functions";
import { cn } from "@/lib/utils";

export function ProductCard({ product }: { product: CatalogProduct }) {
  const { add, openCart } = useCart();
  const price = priceOf(product);
  const onSale = product.sale_price !== null;
  const soldOut = product.stock_status === "OUT_OF_STOCK";

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-lg border border-border bg-card shadow-card transition-transform duration-200 ease-[var(--ease-out-soft)] hover:-translate-y-0.5 motion-reduce:transform-none">
      <Link
        to="/product/$slug"
        params={{ slug: product.slug }}
        className="relative block aspect-square overflow-hidden bg-surface"
      >
        <img
          src={artFor(product.image_key)}
          alt={product.name}
          loading="lazy"
          width={800}
          height={800}
          className="size-full object-cover transition-transform duration-300 ease-[var(--ease-out-soft)] group-hover:scale-[1.03] motion-reduce:transform-none"
        />
        <div className="absolute left-3 top-3 flex gap-1.5">
          {product.is_new && (
            <span className="rounded-sm bg-primary px-2 py-0.5 text-[11px] font-semibold text-primary-foreground">
              New
            </span>
          )}
          {onSale && (
            <span className="rounded-sm bg-success px-2 py-0.5 text-[11px] font-semibold text-success-foreground">
              Sale
            </span>
          )}
        </div>
      </Link>
      <div className="absolute right-3 top-3">
        <WishlistButton productId={product.id} variant="icon" />
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs text-muted-foreground">
          {[product.platform, product.region].filter(Boolean).join(" · ")}
        </p>
        <h3 className="mt-1 line-clamp-2 font-display text-sm font-semibold leading-snug">
          <Link to="/product/$slug" params={{ slug: product.slug }}>
            {product.name}
          </Link>
        </h3>
        <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
          <Star className="size-3.5 fill-warning text-warning" aria-hidden />
          {product.rating.toFixed(1)}
          <span>({product.review_count})</span>
          <span
            className={cn(
              "ml-auto",
              soldOut ? "text-destructive" : product.stock_status === "LOW_STOCK" ? "text-warning" : "text-success",
            )}
          >
            {STOCK_LABEL[product.stock_status]}
          </span>
        </div>

        <div className="mt-4 flex items-end justify-between gap-2">
          <div>
            <p className="font-display text-lg font-semibold tracking-tight">
              {formatPrice(price, product.currency)}
            </p>
            {onSale && (
              <p className="text-xs text-muted-foreground line-through">
                {formatPrice(product.price, product.currency)}
              </p>
            )}
          </div>
          <Button
            size="sm"
            disabled={soldOut}
            onClick={() => {
              add({
                productId: product.id,
                slug: product.slug,
                name: product.name,
                imageKey: product.image_key,
                unitPrice: price,
                currency: product.currency,
              });
              openCart();
            }}
          >
            {soldOut ? "Sold out" : "Add to cart"}
          </Button>
        </div>
      </div>
    </article>
  );
}
