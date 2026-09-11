import * as React from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Loader2, Lock, Zap } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/lib/use-auth";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>) => ({
    next: typeof search["next"] === "string" ? (search["next"] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign In or Create an Account — NexusKeys" },
      {
        name: "description",
        content:
          "Sign in to NexusKeys to track your orders, reveal delivered codes and manage your wishlist.",
      },
      { property: "og:title", content: "Sign In — NexusKeys" },
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
  const [mode, setMode] = React.useState<"signin" | "signup">("signin");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
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
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}${destination}` },
        });
        if (error) throw error;
        if (!data.session) {
          toast.success("Check your inbox to confirm your email address, then sign in.");
          setMode("signin");
          return;
        }
        toast.success("Account created. Welcome to NexusKeys.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Signed in.");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setBusy(true);
    try {
      window.sessionStorage.setItem("nexus-auth-next", destination);
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        toast.error("Google sign-in didn't complete. Try again or use your email.");
        return;
      }
      if (result.redirected) return;
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md px-4 py-16">
      <div className="rounded-xl border border-border bg-card p-6 shadow-card">
        <span className="grid size-10 place-items-center rounded-md bg-primary-soft text-primary">
          <Zap className="size-5" aria-hidden />
        </span>
        <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight">
          {mode === "signin" ? "Sign in to NexusKeys" : "Create your account"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {mode === "signin"
            ? "Track your orders and reveal delivered codes."
            : "Save products, check out faster and keep every code in one place."}
        </p>

        <Button
          type="button"
          variant="secondary"
          size="lg"
          className="mt-6 w-full"
          disabled={busy}
          onClick={google}
        >
          Continue with Google
        </Button>

        <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          or use email
          <span className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={submit} className="space-y-4">
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
              placeholder="you@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
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
            {mode === "signin" ? "Sign in" : "Create account"}
          </Button>
        </form>

        <p className="mt-5 text-sm text-muted-foreground">
          {mode === "signin" ? "New to NexusKeys?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            {mode === "signin" ? "Create an account" : "Sign in instead"}
          </button>
        </p>
        <p className="mt-4 inline-flex items-center gap-2 text-xs text-muted-foreground">
          <Lock className="size-3.5" aria-hidden /> Your details are protected and never shared.
        </p>
      </div>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        By continuing you agree to our <Link to="/terms" className="underline">terms</Link> and{" "}
        <Link to="/privacy" className="underline">privacy policy</Link>.
      </p>
    </div>
  );
}
