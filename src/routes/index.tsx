import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import {
  Zap,
  ShieldCheck,
  BadgeCheck,
  Headphones,
  ArrowRight,
  Gamepad2,
  CreditCard,
  Gift,
  Package,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { ProductCard } from "@/components/store/product-card";
import { categoriesQuery, productsQuery } from "@/lib/catalog";
import heroImage from "@/assets/hero-marketplace.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CardinsPro — Digital Gaming Marketplace" },
      {
        name: "description",
        content:
          "Shop digital gaming products, game cards, gift cards and approved game accounts with fast digital delivery and secure checkout.",
      },
      { property: "og:title", content: "CardinsPro — Digital Gaming Marketplace" },
      {
        property: "og:description",
        content:
          "Game cards, gift cards and digital gaming products with fast delivery and secure checkout.",
      },
    ],
  }),
  // Visiting the store on an "admin." subdomain lands straight on the admin area.
  beforeLoad: () => {
    if (typeof window !== "undefined" && window.location.hostname.startsWith("admin.")) {
      throw redirect({ to: "/admin" });
    }
  },
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(productsQuery());
    context.queryClient.ensureQueryData(categoriesQuery());
  },
  component: HomePage,
});

const TRUST = [
  {
    icon: Zap,
    title: "Fast digital delivery",
    copy: "Codes are released once payment is confirmed.",
  },
  { icon: ShieldCheck, title: "Secure checkout", copy: "Payments are verified on our servers." },
  {
    icon: BadgeCheck,
    title: "Verified products",
    copy: "Every listing states platform and region.",
  },
  {
    icon: Headphones,
    title: "Customer support",
    copy: "Help with redemption and order questions.",
  },
];

const CATEGORY_ICONS: Record<string, typeof Gamepad2> = {
  "game-accounts": Gamepad2,
  "game-cards": CreditCard,
  "gift-cards": Gift,
  "digital-products": Package,
};

const FAQ = [
  {
    q: "How fast is delivery?",
    a: "Game cards, gift cards and most digital products are delivered as soon as payment is confirmed. Account products are handed over manually, normally within 24 hours.",
  },
  {
    q: "Are products region locked?",
    a: "Many codes only work in one region. The region is shown on every product page before you buy.",
  },
  {
    q: "What happens if a code does not work?",
    a: "Contact support with your order number and we will check the code and resolve the issue.",
  },
  {
    q: "Do you sell account credentials publicly?",
    a: "No. Account details are never shown before purchase and are only shared with the buyer after payment is confirmed.",
  },
];

function HomePage() {
  const { data: products } = useSuspenseQuery(productsQuery());
  const { data: categories } = useSuspenseQuery(categoriesQuery());
  const howItWorksRefs = useRef<Array<HTMLLIElement | null>>([]);

  const featured = products.filter((product) => product.is_featured).slice(0, 4);
  const bestsellers = products.filter((product) => product.is_bestseller).slice(0, 4);
  const offers = products.filter((product) => product.sale_price !== null).slice(0, 4);

  useEffect(() => {
    const steps = howItWorksRefs.current.filter(Boolean) as HTMLLIElement[];

    if (!steps.length) return undefined;

    if (!("IntersectionObserver" in window)) {
      steps.forEach((step) => step.classList.add("visible"));
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 },
    );

    steps.forEach((step) => observer.observe(step));

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const revealTargets = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));

    if (!revealTargets.length) return undefined;

    if (!("IntersectionObserver" in window)) {
      revealTargets.forEach((target) => target.classList.add("visible"));
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -50px 0px" },
    );

    revealTargets.forEach((target) => observer.observe(target));

    return () => observer.disconnect();
  }, []);

  return (
    <div>
      <section className="hero-section relative overflow-hidden border-b border-border">
        <img
          src={heroImage}
          alt=""
          aria-hidden
          width={1600}
          height={1008}
          className="hero-image absolute inset-0 size-full object-cover"
        />
        <div className="hero-gradient absolute inset-0" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:py-32">
          <div data-reveal className="hero-content">
            <h1 className="hero-title max-w-3xl font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
              <span className="hero-title-main">Game More.</span>
              <span className="hero-title-accent"> Spend Less.</span>
            </h1>
            <p className="hero-subtitle mt-5 max-w-3xl text-base leading-relaxed">
              Exclusive releases, classic titles, and hidden gems at sharp local prices
            </p>

            <div className="hero-search mt-8">
              <span className="hero-search-icon" aria-hidden="true">
                <svg
                  viewBox="0 0 24 24"
                  className="size-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="m21 21-4.2-4.2" />
                  <circle cx="11" cy="11" r="6" />
                </svg>
              </span>
              <span className="hero-search-text">Search games, gift cards, Fortnite...</span>
            </div>

            <div className="hero-actions mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="hero-action-primary">
                <Link to="/shop">
                  <span className="hero-action-icon" aria-hidden="true">
                    <svg
                      viewBox="0 0 24 24"
                      className="size-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M4 7h7v7H4z" />
                      <path d="M13 7h7v7h-7z" />
                      <path d="M4 16h7v4H4z" />
                      <path d="M13 16h7v4h-7z" />
                    </svg>
                  </span>
                  Shop Top-ups
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary" className="hero-action-secondary">
                <Link to="/category/$slug" params={{ slug: "game-cards" }}>
                  <span className="hero-action-icon" aria-hidden="true">
                    <svg
                      viewBox="0 0 24 24"
                      className="size-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M3 6h7l3 4h8a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H3z" />
                    </svg>
                  </span>
                  Browse Games
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary" className="hero-action-secondary">
                <Link to="/shop">
                  <span className="hero-action-icon" aria-hidden="true">
                    <svg
                      viewBox="0 0 24 24"
                      className="size-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M3 7h4l2-3 3 5 2-2h6a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H3z" />
                    </svg>
                  </span>
                  Track Order
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-surface">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
          {TRUST.map((item) => (
            <div key={item.title} className="flex gap-3">
              <item.icon className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
              <div>
                <h2 className="text-sm font-semibold">{item.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{item.copy}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            How it works
          </h2>
          <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            3 simple steps
          </span>
        </div>

        <ol className="how-it-steps mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              step: "01",
              title: "Choose your product",
              copy: "Check the platform, region and delivery method on the product page.",
            },
            {
              step: "02",
              title: "Pay securely",
              copy: "Checkout is verified server-side before anything is released.",
            },
            {
              step: "03",
              title: "Receive and redeem",
              copy: "Your code or handover details arrive in your account and by email.",
            },
          ].map((item, index) => (
            <li
              key={item.step}
              ref={(node) => {
                howItWorksRefs.current[index] = node;
              }}
              className="how-it-step rounded-xl border border-border bg-card p-5 shadow-card transition-all duration-700 ease-out sm:p-6"
            >
              <span className="font-display text-sm font-bold text-primary">{item.step}</span>
              <h3 className="mt-3 font-display text-base font-semibold leading-snug sm:text-lg">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.copy}</p>
            </li>
          ))}
        </ol>
      </section>

      <Section title="Featured products" href="/shop">
        <Grid>
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </Grid>
      </Section>

      <section className="mx-auto max-w-7xl px-4 py-8">
        <h2 className="font-display text-2xl font-semibold tracking-tight">Shop by category</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => {
            const Icon = CATEGORY_ICONS[category.slug] ?? Package;
            return (
              <Link
                key={category.id}
                to="/category/$slug"
                params={{ slug: category.slug }}
                className="group rounded-lg border border-border bg-card p-5 shadow-card transition-colors hover:border-primary/50"
              >
                <Icon className="size-5 text-primary" aria-hidden />
                <h3 className="mt-4 font-display text-base font-semibold">{category.name}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                  {category.description}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm text-primary">
                  Browse <ArrowRight className="size-3.5" aria-hidden />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <Section title="Best sellers" href="/shop">
        <Grid>
          {bestsellers.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </Grid>
      </Section>

      {offers.length > 0 && (
        <Section title="Special offers" href="/shop">
          <Grid>
            {offers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </Grid>
        </Section>
      )}

      <section className="mx-auto max-w-3xl px-4 py-16">
        <h2 className="font-display text-2xl font-semibold tracking-tight">
          Frequently asked questions
        </h2>
        <Accordion type="single" collapsible className="mt-6">
          {FAQ.map((item) => (
            <AccordionItem key={item.q} value={item.q}>
              <AccordionTrigger className="text-left text-sm">{item.q}</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <section className="mx-auto mt-12 max-w-7xl px-4">
        <div className="rounded-xl border border-border bg-card p-8 sm:p-10">
          <div className="grid gap-6 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="font-display text-2xl font-semibold tracking-tight">
                New drops and offers in your inbox
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Occasional emails about new products and price drops. Unsubscribe any time.
              </p>
            </div>
            <form
              className="flex flex-col gap-3 sm:flex-row"
              onSubmit={(event) => event.preventDefault()}
            >
              <Input
                type="email"
                required
                placeholder="you@example.com"
                aria-label="Email address"
                className="h-11 bg-background"
              />
              <Button type="submit" size="lg">
                Notify me
              </Button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}

function Section({
  title,
  href,
  children,
}: {
  title: string;
  href: "/shop";
  children: React.ReactNode;
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex items-end justify-between gap-4">
        <h2 className="font-display text-2xl font-semibold tracking-tight">{title}</h2>
        <Link to={href} className="text-sm text-primary hover:underline">
          View all
        </Link>
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{children}</div>;
}
