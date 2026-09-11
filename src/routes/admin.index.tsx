import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { KeyRound, Package, Receipt, TrendingUp } from "lucide-react";

import { adminStats } from "@/lib/admin.functions";
import { formatPrice } from "@/lib/catalog";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const fetchStats = useServerFn(adminStats);
  const stats = useQuery({ queryKey: ["admin-stats"], queryFn: () => fetchStats({}) });

  const cards = [
    {
      label: "Revenue (paid orders)",
      value: stats.data ? formatPrice(stats.data.revenue) : "—",
      icon: TrendingUp,
    },
    { label: "Orders", value: stats.data?.orderCount ?? "—", icon: Receipt },
    { label: "Products listed", value: stats.data?.productCount ?? "—", icon: Package },
    { label: "Codes in stock", value: stats.data?.availableKeys ?? "—", icon: KeyRound },
  ];

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-lg border border-border bg-card p-5 shadow-card">
            <card.icon className="size-5 text-primary" aria-hidden />
            <p className="mt-3 text-xs uppercase tracking-wide text-muted-foreground">{card.label}</p>
            <p className="mt-1 font-display text-2xl font-semibold">{card.value}</p>
          </div>
        ))}
      </div>

      {stats.data && (
        <p className="mt-6 text-sm text-muted-foreground">
          {stats.data.paidCount} of {stats.data.orderCount} orders are paid and delivered.
        </p>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <QuickLink to="/admin/products" title="Update pricing" body="Change prices and stock status." />
        <QuickLink to="/admin/orders" title="Review orders" body="Confirm, refund or cancel orders." />
        <QuickLink to="/admin/inventory" title="Add codes" body="Load new keys for any product." />
      </div>
    </div>
  );
}

function QuickLink({
  to,
  title,
  body,
}: {
  to: "/admin/products" | "/admin/orders" | "/admin/inventory";
  title: string;
  body: string;
}) {
  return (
    <Link
      to={to}
      className="rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary"
    >
      <p className="font-display text-base font-semibold">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
    </Link>
  );
}
