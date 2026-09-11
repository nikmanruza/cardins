import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { artFor, formatPrice } from "@/lib/catalog";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Cart — NexusKeys" },
      { name: "description", content: "Review the digital gaming products in your cart before checkout." },
      { property: "og:title", content: "Your Cart — NexusKeys" },
      { property: "og:description", content: "Review your cart before secure checkout." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { lines, subtotal, setQuantity, remove, clear } = useCart();

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="font-display text-2xl font-semibold">Your cart is empty</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Browse the catalog and add a product to get started.
        </p>
        <Button asChild className="mt-6">
          <Link to="/shop">Browse products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="font-display text-3xl font-semibold tracking-tight">Your cart</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
        <ul className="divide-y divide-border rounded-lg border border-border bg-card">
          {lines.map((line) => (
            <li key={line.productId} className="flex gap-4 p-4">
              <img
                src={artFor(line.imageKey)}
                alt={line.name}
                loading="lazy"
                width={96}
                height={96}
                className="size-20 shrink-0 rounded-md object-cover"
              />
              <div className="min-w-0 flex-1">
                <Link
                  to="/product/$slug"
                  params={{ slug: line.slug }}
                  className="font-medium hover:text-primary"
                >
                  {line.name}
                </Link>
                <p className="mt-1 text-sm text-muted-foreground">
                  {formatPrice(line.unitPrice, line.currency)} each
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="icon"
                    aria-label={`Decrease quantity of ${line.name}`}
                    onClick={() => setQuantity(line.productId, line.quantity - 1)}
                  >
                    <Minus className="size-4" />
                  </Button>
                  <span className="w-8 text-center text-sm">{line.quantity}</span>
                  <Button
                    variant="secondary"
                    size="icon"
                    aria-label={`Increase quantity of ${line.name}`}
                    onClick={() => setQuantity(line.productId, line.quantity + 1)}
                  >
                    <Plus className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Remove ${line.name}`}
                    onClick={() => remove(line.productId)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
              <div className="text-right font-medium">
                {formatPrice(line.unitPrice * line.quantity, line.currency)}
              </div>
            </li>
          ))}
        </ul>

        <aside className="h-fit rounded-lg border border-border bg-card p-5">
          <h2 className="font-display text-lg font-semibold">Order summary</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd>{formatPrice(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Delivery</dt>
              <dd>Digital — free</dd>
            </div>
          </dl>
          <div className="mt-4 flex justify-between border-t border-border pt-4 font-display text-base font-semibold">
            <span>Total</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <Button asChild size="lg" className="mt-5 w-full">
            <Link to="/checkout">Proceed to checkout</Link>
          </Button>
          <Button variant="ghost" className="mt-2 w-full" onClick={clear}>
            Clear cart
          </Button>
        </aside>
      </div>
    </div>
  );
}
