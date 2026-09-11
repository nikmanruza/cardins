import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Copy, Eye, KeyRound, Loader2, LogOut, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { artFor, formatPrice } from "@/lib/catalog";
import { listMyOrders, revealKeys } from "@/lib/orders.functions";
import { claimAdminSeat, getMyAccess } from "@/lib/admin.functions";
import { useAuth } from "@/lib/use-auth";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "Your Library & Orders — NexusKeys" },
      {
        name: "description",
        content: "See your NexusKeys orders, reveal delivered codes and manage your account.",
      },
      { property: "og:title", content: "Your Library — NexusKeys" },
      { property: "og:description", content: "Orders and delivered codes in one place." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AccountPage,
});

const STATUS_TONE: Record<string, string> = {
  paid: "bg-success/15 text-success",
  pending: "bg-warning/15 text-warning",
  failed: "bg-destructive/15 text-destructive",
  refunded: "bg-secondary text-secondary-foreground",
  cancelled: "bg-secondary text-secondary-foreground",
};

function AccountPage() {
  const { user, loading, signOut } = useAuth();
  const queryClient = useQueryClient();
  const fetchOrders = useServerFn(listMyOrders);
  const fetchAccess = useServerFn(getMyAccess);
  const reveal = useServerFn(revealKeys);
  const claim = useServerFn(claimAdminSeat);

  const orders = useQuery({
    queryKey: ["my-orders", user?.id],
    enabled: Boolean(user),
    queryFn: () => fetchOrders({}),
  });

  const access = useQuery({
    queryKey: ["my-access", user?.id],
    enabled: Boolean(user),
    queryFn: () => fetchAccess({}),
  });

  const [revealed, setRevealed] = React.useState<
    Record<string, { code: string; id: string }[] | undefined>
  >({});

  const revealMutation = useMutation({
    mutationFn: (orderItemId: string) => reveal({ data: { orderItemId } }),
    onSuccess: (result, orderItemId) => {
      setRevealed((current) => ({ ...current, [orderItemId]: result.keys }));
      if (result.keys.length === 0) toast.info("No codes are attached to this item yet.");
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "Couldn't show your codes."),
  });

  const claimMutation = useMutation({
    mutationFn: () => claim({}),
    onSuccess: () => {
      toast.success("You now manage this store.");
      void queryClient.invalidateQueries({ queryKey: ["my-access"] });
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "Couldn't assign the admin seat."),
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
        <h1 className="font-display text-2xl font-semibold">Sign in to your library</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your orders and delivered codes are kept safely in your account.
        </p>
        <Button asChild size="lg" className="mt-6">
          <Link to="/auth" search={{ next: "/account" }}>
            Sign in or create an account
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Your library</h1>
          <p className="mt-2 text-sm text-muted-foreground">Signed in as {user.email}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild variant="secondary">
            <Link to="/wishlist">Wishlist</Link>
          </Button>
          {access.data?.isAdmin && (
            <Button asChild>
              <Link to="/admin">
                <ShieldCheck className="mr-2 size-4" aria-hidden /> Store admin
              </Link>
            </Button>
          )}
          <Button variant="ghost" onClick={() => void signOut()}>
            <LogOut className="mr-2 size-4" aria-hidden /> Sign out
          </Button>
        </div>
      </div>

      {access.data && !access.data.isAdmin && !access.data.adminExists && (
        <div className="mt-6 rounded-lg border border-border bg-card p-5">
          <h2 className="font-display text-base font-semibold">Claim the store admin seat</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            No administrator exists yet. As the store owner you can take that role now.
          </p>
          <Button className="mt-4" disabled={claimMutation.isPending} onClick={() => claimMutation.mutate()}>
            {claimMutation.isPending && <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />}
            Become the administrator
          </Button>
        </div>
      )}

      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold">Orders</h2>

        {orders.isPending && (
          <p className="mt-4 text-sm text-muted-foreground">Loading your orders…</p>
        )}

        {orders.data?.length === 0 && (
          <div className="mt-4 rounded-lg border border-dashed border-border p-8 text-center">
            <KeyRound className="mx-auto size-8 text-muted-foreground" aria-hidden />
            <p className="mt-3 text-sm text-muted-foreground">
              You haven't bought anything yet. Your codes will appear here instantly after checkout.
            </p>
            <Button asChild className="mt-5">
              <Link to="/shop">Browse products</Link>
            </Button>
          </div>
        )}

        <div className="mt-4 space-y-4">
          {(orders.data ?? []).map((order) => (
            <article key={order.id} className="rounded-lg border border-border bg-card p-5 shadow-card">
              <header className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-display text-base font-semibold">{order.reference}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={STATUS_TONE[order.status] ?? "bg-secondary"}>{order.status}</Badge>
                  <span className="font-display text-base font-semibold">
                    {formatPrice(order.total, order.currency)}
                  </span>
                </div>
              </header>

              <ul className="mt-4 space-y-4">
                {order.items.map((item) => (
                  <li key={item.id} className="flex flex-wrap items-center gap-4 border-t border-border pt-4">
                    <img
                      src={artFor(item.imageKey)}
                      alt={item.productName}
                      className="size-14 rounded-md object-cover"
                      loading="lazy"
                    />
                    <div className="min-w-40 flex-1">
                      <p className="text-sm font-medium">{item.productName}</p>
                      <p className="text-xs text-muted-foreground">
                        Qty {item.quantity} · {formatPrice(item.unitPrice, item.currency)} each ·{" "}
                        {item.deliveredCount} code{item.deliveredCount === 1 ? "" : "s"} delivered
                      </p>
                    </div>
                    {order.status === "paid" && item.deliveredCount > 0 && (
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={revealMutation.isPending}
                        onClick={() => revealMutation.mutate(item.id)}
                      >
                        <Eye className="mr-2 size-4" aria-hidden /> Show codes
                      </Button>
                    )}

                    {revealed[item.id] && (
                      <ul className="w-full space-y-2">
                        {revealed[item.id]!.map((key) => (
                          <li
                            key={key.id}
                            className="flex items-center justify-between gap-3 rounded-md bg-secondary px-3 py-2"
                          >
                            <code className="font-mono text-sm">{key.code}</code>
                            <button
                              type="button"
                              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                              onClick={() => {
                                void navigator.clipboard.writeText(key.code);
                                toast.success("Code copied.");
                              }}
                            >
                              <Copy className="size-3.5" aria-hidden /> Copy
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
