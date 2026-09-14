import { Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useCart } from "@/lib/cart";
import { useCurrency } from "@/lib/currency";
import { artFor, formatPrice } from "@/lib/catalog";

export function CartDrawer() {
  const { lines, isOpen, closeCart, setQuantity, remove, subtotal } = useCart();
  const { currency, convertPrice } = useCurrency();

  return (
    <Sheet open={isOpen} onOpenChange={(open) => (open ? undefined : closeCart())}>
      <SheetContent side="right" className="flex w-[92vw] max-w-md flex-col bg-surface p-0">
        <SheetTitle className="border-b border-border px-5 py-4 font-display text-base">
          Your cart
        </SheetTitle>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <p className="font-display text-sm font-semibold">Your cart is empty</p>
            <p className="text-sm text-muted-foreground">
              Browse game cards, gift cards and digital products to get started.
            </p>
            <Button asChild variant="secondary" onClick={closeCart}>
              <Link to="/shop">Browse products</Link>
            </Button>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-border overflow-y-auto">
              {lines.map((line) => (
                <li key={line.productId} className="flex gap-3 p-4">
                  <img
                    src={artFor(line.imageKey)}
                    alt={line.name}
                    loading="lazy"
                    width={800}
                    height={800}
                    className="size-16 shrink-0 rounded-md object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{line.name}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {formatPrice(convertPrice(line.unitPrice, line.currency, currency), currency)}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex items-center rounded-md border border-border">
                        <button
                          type="button"
                          aria-label={`Decrease quantity of ${line.name}`}
                          onClick={() => setQuantity(line.productId, line.quantity - 1)}
                          className="grid size-8 place-items-center text-muted-foreground hover:text-foreground"
                        >
                          <Minus className="size-3.5" />
                        </button>
                        <span className="w-8 text-center text-sm">{line.quantity}</span>
                        <button
                          type="button"
                          aria-label={`Increase quantity of ${line.name}`}
                          onClick={() => setQuantity(line.productId, line.quantity + 1)}
                          className="grid size-8 place-items-center text-muted-foreground hover:text-foreground"
                        >
                          <Plus className="size-3.5" />
                        </button>
                      </div>
                      <button
                        type="button"
                        aria-label={`Remove ${line.name}`}
                        onClick={() => remove(line.productId)}
                        className="grid size-8 place-items-center rounded-md text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="border-t border-border p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Subtotal</span>
                <span className="font-display text-lg font-semibold">
                  {formatPrice(convertPrice(subtotal, "USD", currency), currency)}
                </span>
              </div>
              <div className="mt-4 grid gap-2">
                <Button asChild onClick={closeCart}>
                  <Link to="/cart">Review cart</Link>
                </Button>
                <Button asChild variant="secondary" onClick={closeCart}>
                  <Link to="/shop">Keep shopping</Link>
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
