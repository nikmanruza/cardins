import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { adminListOrders, adminSetOrderStatus } from "@/lib/admin.functions";
import type { OrderStatus } from "@/lib/orders.functions";
import { formatPrice } from "@/lib/catalog";

export const Route = createFileRoute("/admin/orders")({
  component: AdminOrders,
});

const STATUSES: OrderStatus[] = ["pending", "paid", "failed", "refunded", "cancelled"];

const TONE: Record<string, string> = {
  paid: "bg-success/15 text-success",
  pending: "bg-warning/15 text-warning",
  failed: "bg-destructive/15 text-destructive",
};

function AdminOrders() {
  const fetchOrders = useServerFn(adminListOrders);
  const setStatus = useServerFn(adminSetOrderStatus);
  const queryClient = useQueryClient();

  const orders = useQuery({ queryKey: ["admin-orders"], queryFn: () => fetchOrders({}) });

  const change = useMutation({
    mutationFn: (input: { orderId: string; status: OrderStatus }) => setStatus({ data: input }),
    onSuccess: () => {
      toast.success("Order updated.");
      void queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "Couldn't update the order."),
  });

  if (orders.isPending) return <p className="text-sm text-muted-foreground">Loading orders…</p>;

  if (orders.data?.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        No orders yet. They appear here the moment a customer checks out.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {(orders.data ?? []).map((order) => (
        <article key={order.id} className="rounded-lg border border-border bg-card p-5 shadow-card">
          <header className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-display text-base font-semibold">{order.reference}</p>
              <p className="text-xs text-muted-foreground">
                {order.email} · {new Date(order.created_at).toLocaleString()}
                {order.payment_reference ? ` · ${order.payment_reference}` : ""}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge className={TONE[order.status] ?? "bg-secondary text-secondary-foreground"}>
                {order.status}
              </Badge>
              <span className="font-display text-base font-semibold">
                {formatPrice(order.total, order.currency)}
              </span>
              <Select
                value={order.status}
                onValueChange={(value) =>
                  change.mutate({ orderId: order.id, status: value as OrderStatus })
                }
              >
                <SelectTrigger className="h-9 w-36 bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </header>

          <ul className="mt-4 space-y-1 border-t border-border pt-3 text-sm text-muted-foreground">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between gap-3">
                <span>
                  {item.name} × {item.quantity}
                </span>
                <span>{formatPrice(item.unitPrice * item.quantity, order.currency)}</span>
              </li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  );
}
