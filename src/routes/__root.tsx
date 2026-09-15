import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  redirect,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { CartProvider } from "@/lib/cart";
import { CurrencyProvider } from "@/lib/currency";
import { ThemeProvider, themeBootstrapScript } from "@/lib/theme";
import { AuthProvider } from "@/lib/use-auth";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { CartDrawer } from "@/components/store/cart-drawer";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  beforeLoad: () => {
    if (typeof window !== "undefined" && window.location.hostname.startsWith("admin.")) {
      throw redirect({ to: "/admin" });
    }
  },
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "CardinsPro — Digital Game Keys, Cards & Accounts" },
      {
        name: "description",
        content:
          "Buy game cards, gift cards and game accounts with instant digital delivery and secure checkout.",
      },
      { property: "og:title", content: "CardinsPro — Digital Game Keys & Gift Cards" },
      {
        property: "og:description",
        content: "Instant delivery of game cards, gift cards and game accounts.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700&display=swap",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="font-sans antialiased">
        <script dangerouslySetInnerHTML={{ __html: themeBootstrapScript }} />
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const playedKey = "cardinspro_first_load_chime_played";
    if (window.localStorage.getItem(playedKey) === "1") return undefined;

    const AudioCtor =
      window.AudioContext ??
      (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtor) {
      window.localStorage.setItem(playedKey, "1");
      return undefined;
    }

    const context = new AudioCtor();
    const now = context.currentTime + 0.04;
    const master = context.createGain();
    master.gain.setValueAtTime(0, now);
    master.gain.setTargetAtTime(0.026, now, 0.12);
    master.gain.setTargetAtTime(0.0001, now + 0.18, 0.22);
    master.connect(context.destination);

    const chimeA = context.createOscillator();
    chimeA.type = "sine";
    chimeA.frequency.setValueAtTime(660, now);
    chimeA.frequency.setTargetAtTime(990, now + 0.14, 0.04);
    chimeA.connect(master);

    const chimeB = context.createOscillator();
    chimeB.type = "triangle";
    chimeB.frequency.setValueAtTime(1320, now);
    chimeB.frequency.setTargetAtTime(1760, now + 0.2, 0.04);
    chimeB.connect(master);

    chimeA.start(now);
    chimeB.start(now);
    chimeA.stop(now + 0.24);
    chimeB.stop(now + 0.25);

    window.localStorage.setItem(playedKey, "1");

    return () => {
      try {
        void context.close();
      } catch {
        // no-op for browsers that block closing an already-closed audio context
      }
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <CurrencyProvider>
            <CartProvider>
              <div className="flex min-h-screen flex-col bg-background">
                <SiteHeader />
                <main className="flex-1">
                  {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
                  <Outlet />
                </main>
                <SiteFooter />
                <CartDrawer />
                <Toaster />
              </div>
            </CartProvider>
          </CurrencyProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
