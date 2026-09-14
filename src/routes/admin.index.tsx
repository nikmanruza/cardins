import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  BarChart3,
  Box,
  ChevronRight,
  CreditCard,
  KeyRound,
  Package,
  Receipt,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

import { adminStats } from "@/lib/admin.functions";
import { formatPrice } from "@/lib/catalog";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const fetchStats = useServerFn(adminStats);
  const stats = useQuery({ queryKey: ["admin-stats"], queryFn: () => fetchStats({}) });

  const completion = stats.data
    ? Math.min(
        100,
        Math.max(14, Math.round((stats.data.paidCount / Math.max(stats.data.orderCount, 1)) * 100)),
      )
    : 0;

  const cards = [
    {
      label: "Revenue",
      value: stats.data ? formatPrice(stats.data.revenue) : "—",
      icon: TrendingUp,
      detail: "Paid orders",
    },
    { label: "Orders", value: stats.data?.orderCount ?? "—", icon: Receipt, detail: "All orders" },
    {
      label: "Products",
      value: stats.data?.productCount ?? "—",
      icon: Package,
      detail: "Listed products",
    },
    {
      label: "Codes in stock",
      value: stats.data?.availableKeys ?? "—",
      icon: KeyRound,
      detail: "Inventory",
    },
  ];

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <article
            key={card.label}
            className="rounded-2xl border border-border/70 bg-card/60 p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_30px_90px_rgba(112,76,255,0.08)] backdrop-blur"
          >
            <div className="flex items-center justify-between">
              <card.icon className="size-5 text-primary" aria-hidden />
              <span className="rounded-full border border-border px-2 py-1 text-[10px] uppercase tracking-wide text-muted-foreground">
                {card.detail}
              </span>
            </div>
            <p className="mt-4 text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
              {card.label}
            </p>
            <p className="mt-1 font-display text-3xl font-semibold tracking-tight text-foreground">
              {card.value}
            </p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                Business pulse
              </p>
              <h2 className="mt-2 font-display text-2xl font-semibold">Store operations</h2>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
              <span className="size-2 rounded-full bg-emerald-400" />
              Systems online
            </span>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-border bg-background/50 p-4">
              <div className="flex items-center gap-2">
                <Activity className="size-4 text-primary" aria-hidden />
                <span className="text-xs uppercase tracking-wide text-muted-foreground">
                  Orders
                </span>
              </div>
              <p className="mt-3 font-display text-2xl font-semibold">
                {stats.data?.orderCount ?? "—"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">Live store demand</p>
            </div>
            <div className="rounded-xl border border-border bg-background/50 p-4">
              <div className="flex items-center gap-2">
                <Box className="size-4 text-primary" aria-hidden />
                <span className="text-xs uppercase tracking-wide text-muted-foreground">
                  Catalog
                </span>
              </div>
              <p className="mt-3 font-display text-2xl font-semibold">
                {stats.data?.productCount ?? "—"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">Managed SKUs</p>
            </div>
            <div className="rounded-xl border border-border bg-background/50 p-4">
              <div className="flex items-center gap-2">
                <KeyRound className="size-4 text-primary" aria-hidden />
                <span className="text-xs uppercase tracking-wide text-muted-foreground">
                  Codes
                </span>
              </div>
              <p className="mt-3 font-display text-2xl font-semibold">
                {stats.data?.availableKeys ?? "—"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">Ready inventory</p>
            </div>
          </div>

          {stats.data && (
            <div className="mt-6 rounded-xl border border-dashed border-border p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Fulfillment completion
                </span>
                <span className="font-display text-sm font-semibold text-primary">
                  {completion}%
                </span>
              </div>
              <div className="mt-3 h-2 rounded-full bg-secondary">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-primary to-violet-500"
                  style={{
                    width: `${completion}%`,
                  }}
                />
              </div>
            </div>
          )}
        </article>

        <article className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                Command center
              </p>
              <h2 className="mt-2 font-display text-2xl font-semibold">Launch actions</h2>
            </div>
            <BarChart3 className="size-5 text-primary" aria-hidden />
          </div>
          <div className="mt-8 space-y-3">
            <QuickLink to="/admin/products" title="Update pricing" body="Price, sale price and stock." />
            <QuickLink to="/admin/orders" title="Review orders" body="Confirm, refund or cancel." />
            <QuickLink to="/admin/inventory" title="Add inventory" body="Load new digital keys." />
            <QuickLink to="/admin/catalog" title="Manage catalog" body="Create or edit products." />
          </div>
        </article>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card/50 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">Today</span>
            <TrendingUp className="size-4 text-primary" aria-hidden />
          </div>
          <p className="mt-4 font-display text-2xl font-semibold">
            {stats.data ? formatPrice(stats.data.revenue) : "—"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Gross paid revenue</p>
        </div>
        <div className="rounded-xl border border-border bg-card/50 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">Security</span>
            <ShieldCheck className="size-4 text-primary" aria-hidden />
          </div>
          <p className="mt-4 font-display text-2xl font-semibold">Online</p>
          <p className="mt-1 text-xs text-muted-foreground">Admin access active</p>
        </div>
        <div className="rounded-xl border border-border bg-card/50 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">Payments</span>
            <CreditCard className="size-4 text-primary" aria-hidden />
          </div>
          <p className="mt-4 font-display text-2xl font-semibold">Live</p>
          <p className="mt-1 text-xs text-muted-foreground">Provider sync</p>
        </div>
        <div className="rounded-xl border border-border bg-card/50 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">Delivery</span>
            <Package className="size-4 text-primary" aria-hidden />
          </div>
          <p className="mt-4 font-display text-2xl font-semibold">
            {stats.data?.availableKeys ?? "—"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Available keys</p>
        </div>
      </section>
    </div>
  );
}

function QuickLink({
  to,
  title,
  body,
}: {
  to: "/admin" | "/admin/catalog" | "/admin/products" | "/admin/orders" | "/admin/inventory";
  title: string;
  body: string;
}) {
  return (
    <Link
      to={to}
      className="flex items-center justify-between rounded-xl border border-border bg-background/50 px-4 py-3 transition-colors hover:border-primary hover:bg-primary/5"
    >
      <span>
        <span className="block font-display text-sm font-semibold text-foreground">{title}</span>
        <span className="mt-1 block text-xs text-muted-foreground">{body}</span>
      </span>
      <ChevronRight className="size-4 text-muted-foreground" aria-hidden />
    </Link>
  );
}
