import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Heart, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { artFor, formatPrice, STOCK_LABEL } from "@/lib/catalog";
import { useCart } from "@/lib/cart";
import { removeFromWishlist, wishlistQuery } from "@/lib/wishlist";
import { useAuth } from "@/lib/use-auth";

export const Route = createFileRoute("/wishlist")({
  head: () => ({
    meta: [
      { title: "Your Wishlist — CardinsPro" },
      {
        name: "description",
        content: "Save game cards, gift cards and accounts to buy later, synced to your account.",
      },
      { property: "og:title", content: "Your Wishlist — CardinsPro" },
      { property: "og:description", content: "Products you saved for later on CardinsPro." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: WishlistPage,
});

function WishlistPage() {
  const { user, loading } = useAuth();
  const queryClient = useQueryClient();
  const { add } = useCart();
  const wishlist = useQuery(wishlistQuery(user?.id));

  const remove = useMutation({
    mutationFn: (id: string) => removeFromWishlist(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "Couldn't remove that item."),
  });

  if (loading) {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" aria-hidden />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <Heart className="mx-auto size-9 text-muted-foreground" aria-hidden />
        <h1 className="mt-4 font-display text-2xl font-semibold">Sign in to save products</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your wishlist follows your account across every device.
        </p>
        <Button asChild size="lg" className="mt-6">
          <Link to="/auth" search={{ next: "/wishlist" }}>
            Sign in or create an account
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="font-display text-3xl font-semibold tracking-tight">Your wishlist</h1>
      <p className="mt-2 text-sm text-muted-foreground">Products you saved for later.</p>

      {wishlist.isPending && <p className="mt-6 text-sm text-muted-foreground">Loading…</p>}

      {wishlist.data?.length === 0 && (
        <div className="mt-6 rounded-lg border border-dashed border-border p-10 text-center">
          <Heart className="mx-auto size-8 text-muted-foreground" aria-hidden />
          <p className="mt-3 text-sm text-muted-foreground">
            Nothing saved yet. Tap the heart on any product to keep it here.
          </p>
          <Button asChild className="mt-5">
            <Link to="/shop">Browse products</Link>
          </Button>
        </div>
      )}

      <ul className="mt-6 space-y-3">
        {(wishlist.data ?? []).map((item) => {
          const price = item.salePrice ?? item.price;
          return (
            <li
              key={item.id}
              className="flex flex-wrap items-center gap-4 rounded-lg border border-border bg-card p-4 shadow-card"
            >
              <img
                src={artFor(item.imageKey)}
                alt={item.name}
                className="size-16 rounded-md object-cover"
                loading="lazy"
              />
              <div className="min-w-40 flex-1">
                <Link
                  to="/product/$slug"
                  params={{ slug: item.slug }}
                  className="font-medium hover:text-primary"
                >
                  {item.name}
                </Link>
                <p className="text-xs text-muted-foreground">{STOCK_LABEL[item.stockStatus]}</p>
              </div>
              <span className="font-display text-base font-semibold">
                {formatPrice(price, item.currency)}
              </span>
              <Button
                size="sm"
                disabled={item.stockStatus === "OUT_OF_STOCK"}
                onClick={() => {
                  add({
                    productId: item.productId,
                    name: item.name,
                    slug: item.slug,
                    imageKey: item.imageKey,
                    unitPrice: price,
                    currency: item.currency,
                  });
                  toast.success(`${item.name} added to your cart.`);
                }}
              >
                Add to cart
              </Button>
              <Button
                size="sm"
                variant="ghost"
                aria-label={`Remove ${item.name} from wishlist`}
                onClick={() => remove.mutate(item.id)}
              >
                <Trash2 className="size-4" aria-hidden />
              </Button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
