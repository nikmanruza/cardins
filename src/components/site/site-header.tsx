import * as React from "react";
import { Link } from "@tanstack/react-router";
import { Menu, Search, ShoppingBag, Heart, UserRound, Zap, X, ChevronDown } from "lucide-react";

import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/use-auth";
import { useTheme } from "@/lib/theme";
import { useCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "Shop", to: "/shop" as const },
  { label: "Game Accounts", to: "/category/$slug" as const, params: { slug: "game-accounts" } },
  { label: "Game Cards", to: "/category/$slug" as const, params: { slug: "game-cards" } },
  { label: "Gift Cards", to: "/category/$slug" as const, params: { slug: "gift-cards" } },
  { label: "Support", to: "/support" as const },
];

export function AnnouncementBar() {
  return (
    <div className="border-b border-border bg-surface">
      <p className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-4 py-2 text-center text-xs text-muted-foreground">
        <Zap className="size-3.5 text-primary" aria-hidden />
        Fast digital delivery · Secure checkout · Customer support
      </p>
    </div>
  );
}

export function SiteHeader() {
  const [scrolled, setScrolled] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const { currency, setCurrency } = useCurrency();
  const { count, openCart } = useCart();
  const { session } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "site-header sticky top-0 z-40 border-b transition-[height,background-color,border-color] duration-200",
        scrolled
          ? "site-header-scrolled h-14 border-border backdrop-blur-md"
          : "site-header-plain h-16 border-transparent",
      )}
    >
      <div className="site-header-inner mx-auto flex h-full max-w-7xl items-center gap-4 px-4">
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger
            className="-ml-1 inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground md:hidden"
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </SheetTrigger>
          <SheetContent side="left" className="w-[85vw] max-w-sm bg-surface p-0">
            <SheetTitle className="border-b border-border px-5 py-4 font-display text-base">
              Browse
            </SheetTitle>
            <nav className="flex flex-col p-2">
              {NAV.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  params={item.params as never}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-md px-3 py-3 text-sm text-foreground transition-colors hover:bg-secondary"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>

        <Link to="/" className="brand-lockup flex items-center gap-2 pr-8">
          <span className="grid size-8 place-items-center rounded-md bg-primary-soft text-primary">
            <Zap className="size-4" aria-hidden />
          </span>
          <span className="font-display text-base font-semibold tracking-tight text-foreground">CardinsPro</span>
        </Link>

        <nav className="hidden flex-1 items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              params={item.params as never}
              activeProps={{ className: "text-foreground" }}
              className="nav-link rounded-md px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={() => setSearchOpen((open) => !open)}
            aria-label="Search products"
            className="inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            {searchOpen ? <X className="size-5" /> : <Search className="size-5" />}
          </button>
          <Link
            to="/wishlist"
            aria-label="Wishlist"
            className="hidden size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground sm:inline-flex"
          >
            <Heart className="size-5" />
          </Link>
          <button
            type="button"
            onClick={openCart}
            aria-label={`Cart, ${count} item${count === 1 ? "" : "s"}`}
            className="relative inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <ShoppingBag className="size-5" />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                {count}
              </span>
            )}
          </button>

          <label className={cn(
            "currency-select relative flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-semibold shadow-sm",
            isDark ? "currency-select-dark" : "currency-select-light",
          )}>
            <span className="sr-only">Select currency</span>
            <select
              value={currency}
              onChange={(event) => setCurrency(event.target.value as "USD" | "KSH" | "UGX" | "EUR" | "TZS")}
              className="currency-control appearance-none bg-transparent pr-5 text-sm font-medium outline-none"
              aria-label="Currency"
            >
              <option value="USD">USD</option>
              <option value="KSH">KSH</option>
              <option value="UGX">UGX</option>
              <option value="EUR">EUR</option>
              <option value="TZS">TZS</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 size-3.5" aria-hidden />
          </label>

          <ThemeToggle />
          <Link
            to={session ? "/account" : "/auth"}
            aria-label={session ? "Your account" : "Sign in"}
            className="hidden size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground sm:inline-flex"
          >
            <UserRound className="size-5" />
          </Link>
        </div>
      </div>

      {searchOpen && (
        <div className="border-b border-border bg-surface">
          <form
            className="mx-auto max-w-7xl px-4 py-3"
            onSubmit={(event) => {
              event.preventDefault();
              const value = new FormData(event.currentTarget).get("q");
              setSearchOpen(false);
              window.location.assign(`/shop?q=${encodeURIComponent(String(value ?? ""))}`);
            }}
          >
            <Input
              name="q"
              autoFocus
              placeholder="Search game cards, gift cards, accounts…"
              className="h-11 bg-background"
            />
          </form>
        </div>
      )}
    </header>
  );
}
