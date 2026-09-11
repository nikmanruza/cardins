import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, Loader2, Lock } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/catalog";
import { createOrder, payOrder } from "@/lib/orders.functions";
import { useAuth } from "@/lib/use-auth";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Secure Checkout — NexusKeys" },
      {
        name: "description",
        content: "Complete your order for digital gaming products with secure, server-verified checkout.",
      },
      { property: "og:title", content: "Secure Checkout — NexusKeys" },
      { property: "og:description", content: "Secure checkout for digital gaming products." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { lines, subtotal, clear } = useCart();
  const { user, loading } = useAuth();
  const create = useServerFn(createOrder);
  const pay = useServerFn(payOrder);

  const [email, setEmail] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [placed, setPlaced] = React.useState<{
    email: string;
    reference: string;
    delivered: number;
  } | null>(null);

  React.useEffect(() => {
    if (user?.email) setEmail((current) => current || user.email!);
  }, [user]);

  const placeOrder = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      const order = await create({
        data: { items: lines.map((line) => ({ productId: line.productId, quantity: line.quantity })), email },
      });
      const result = await pay({ data: { orderId: order.orderId } });
      setPlaced({ email, reference: result.reference, delivered: result.delivered });
      clear();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "We couldn't complete your order.");
    } finally {
      setBusy(false);
    }
  };

  if (placed) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <CheckCircle2 className="mx-auto size-10 text-success" aria-hidden />
        <h1 className="mt-4 font-display text-2xl font-semibold">Order confirmed</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Order reference <span className="text-foreground">{placed.reference}</span>. A copy is on its
          way to {placed.email}.{" "}
          {placed.delivered > 0
            ? `${placed.delivered} code${placed.delivered === 1 ? "" : "s"} are ready in your library.`
            : "Your codes will appear in your library as soon as they are released."}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Button asChild>
            <Link to="/account">View my codes</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link to="/shop">Continue shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="font-display text-2xl font-semibold">Nothing to check out</h1>
        <p className="mt-2 text-sm text-muted-foreground">Add a product to your cart first.</p>
        <Button asChild className="mt-6">
          <Link to="/shop">Browse products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="font-display text-3xl font-semibold tracking-tight">Checkout</h1>
      <p className="mt-2 inline-flex items-center gap-2 text-sm text-muted-foreground">
        <Lock className="size-4" aria-hidden /> Your order is verified on our servers before delivery.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
        {!loading && !user ? (
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="font-display text-lg font-semibold">Sign in to finish</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              We keep every code you buy in your personal library, so an account is needed before
              payment. Your cart is saved.
            </p>
            <Button asChild size="lg" className="mt-5">
              <Link to="/auth" search={{ next: "/checkout" }}>
                Sign in or create an account
              </Link>
            </Button>
          </div>
        ) : (
          <form onSubmit={placeOrder} className="rounded-lg border border-border bg-card p-6">
            <h2 className="font-display text-lg font-semibold">Delivery details</h2>
            <div className="mt-4 space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="h-11 bg-background"
              />
              <p className="text-xs text-muted-foreground">
                Digital products are delivered to this address and to your library.
              </p>
            </div>
            <Button type="submit" size="lg" className="mt-6 w-full" disabled={busy || loading}>
              {busy && <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />}
              Pay {formatPrice(subtotal)}
            </Button>
            <p className="mt-3 text-xs text-muted-foreground">
              Card payments are being connected. For now the order is created and your codes are
              released immediately so you can test the full flow.
            </p>
          </form>
        )}

        <aside className="h-fit rounded-lg border border-border bg-card p-5">
          <h2 className="font-display text-lg font-semibold">Order summary</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {lines.map((line) => (
              <li key={line.productId} className="flex justify-between gap-3">
                <span className="text-muted-foreground">
                  {line.name} × {line.quantity}
                </span>
                <span>{formatPrice(line.unitPrice * line.quantity, line.currency)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between border-t border-border pt-4 font-display text-base font-semibold">
            <span>Total</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
