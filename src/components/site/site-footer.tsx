import { Link } from "@tanstack/react-router";
import { Zap } from "lucide-react";

const COLUMNS = [
  {
    title: "Store",
    links: [
      { label: "All products", to: "/shop" as const },
      { label: "Game accounts", to: "/category/$slug" as const, params: { slug: "game-accounts" } },
      { label: "Game cards", to: "/category/$slug" as const, params: { slug: "game-cards" } },
      { label: "Gift cards", to: "/category/$slug" as const, params: { slug: "gift-cards" } },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Support centre", to: "/support" as const },
      { label: "Contact", to: "/contact" as const },
      { label: "Delivery & redemption", to: "/support" as const },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", to: "/about" as const },
      { label: "Terms", to: "/terms" as const },
      { label: "Privacy", to: "/privacy" as const },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-surface">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-md bg-primary-soft text-primary">
              <Zap className="size-4" aria-hidden />
            </span>
            <span className="font-display text-base font-semibold">CardinsPro</span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
            A digital gaming marketplace for game cards, gift cards and approved digital products,
            with delivery after payment is confirmed.
          </p>
        </div>
        {COLUMNS.map((column) => (
          <div key={column.title}>
            <h2 className="text-sm font-semibold text-foreground">{column.title}</h2>
            <ul className="mt-4 space-y-3">
              {column.links.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    params={(link as { params?: unknown }).params as never}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border">
        <p className="mx-auto max-w-7xl px-4 py-6 text-xs text-muted-foreground">
          © {new Date().getFullYear()} CardinsPro. Products are sold only where publisher and
          platform terms permit.
        </p>
      </div>
    </footer>
  );
}
