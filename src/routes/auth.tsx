import * as React from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Loader2, Lock, Shield, Zap } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>) => ({
    next: typeof search["next"] === "string" ? (search["next"] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign In or Create an Account — CardinsPro" },
      {
        name: "description",
        content:
          "Sign in to CardinsPro to track your orders, reveal delivered codes and manage your wishlist.",
      },
      { property: "og:title", content: "Sign In — CardinsPro" },
      { property: "og:description", content: "Access your orders and delivered codes." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function safePath(value: string | undefined) {
  if (!value) return "/account";
  if (!value.startsWith("/") || value.startsWith("//")) return "/account";
  return value;
}

function AuthPage() {
  const { next } = Route.useSearch();
  const navigate = useNavigate();
  const { session, loading } = useAuth();
  const [email, setEmail] = React.useState("streamvanced2@gmail.com");
  const [password, setPassword] = React.useState("30043225");
  const [busy, setBusy] = React.useState(false);

  const destination = safePath(next);

  React.useEffect(() => {
    if (!loading && session) {
      void navigate({ to: destination, replace: true });
    }
  }, [loading, session, destination, navigate]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success("Signed in.");
      void navigate({ to: destination, replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="admin-auth-backdrop">
      <div className="admin-auth-grid" aria-hidden="true">
        <span className="admin-auth-grid-node admin-auth-grid-node-one" />
        <span className="admin-auth-grid-node admin-auth-grid-node-two" />
        <span className="admin-auth-grid-node admin-auth-grid-node-three" />
        <span className="admin-auth-grid-node admin-auth-grid-node-four" />
      </div>

      <div className="admin-auth-wrap">
        <div className="admin-auth-card">
          <div className="admin-auth-logo">
            <span className="grid size-10 place-items-center rounded-md bg-primary-soft text-primary">
              <Shield className="size-5" aria-hidden />
            </span>
          </div>

          <div className="admin-auth-heading">
            <span className="admin-auth-kicker">CardinsPro Admin</span>
            <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight">
              Sign in to Admin
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Store control access
            </p>
          </div>

          <form onSubmit={submit} className="admin-auth-form space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="h-11 bg-background"
                placeholder="streamvanced2@gmail.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                minLength={6}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="h-11 bg-background"
                placeholder="••••••••"
              />
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={busy}>
              {busy && <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />}
              Sign in
            </Button>
          </form>

          <div className="admin-auth-footer">
            <p className="mt-4 inline-flex items-center gap-2 text-xs text-muted-foreground">
              <Lock className="size-3.5" aria-hidden /> Your details are protected and never shared.
            </p>

            <p className="mt-6 text-center text-xs text-muted-foreground">
              By continuing you agree to our{" "}
              <Link to="/terms" className="underline">
                terms
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className="underline">
                privacy policy
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
