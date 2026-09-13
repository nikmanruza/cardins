import * as React from "react";
import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { KeyRound, Loader2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getMyAccess, unlockAdminWithCode } from "@/lib/admin.functions";
import { useAuth } from "@/lib/use-auth";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Store Admin — NexusKeys" },
      { name: "description", content: "Manage products, orders, inventory codes and activity." },
      { property: "og:title", content: "Store Admin — NexusKeys" },
      { property: "og:description", content: "Internal store management for NexusKeys." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLayout,
});

const TABS = [
  { label: "Dashboard", to: "/admin" as const },
  { label: "Catalog editor", to: "/admin/catalog" as const },
  { label: "Products", to: "/admin/products" as const },
  { label: "Orders", to: "/admin/orders" as const },
  { label: "Inventory", to: "/admin/inventory" as const },
  { label: "Messages", to: "/admin/messages" as const },
  { label: "Activity", to: "/admin/activity" as const },
];

function AdminLayout() {
  const { user, loading } = useAuth();
  const fetchAccess = useServerFn(getMyAccess);
  const access = useQuery({
    queryKey: ["my-access", user?.id],
    enabled: Boolean(user),
    queryFn: () => fetchAccess({}),
  });

  if (loading || (user && access.isPending)) {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" aria-hidden />
      </div>
    );
  }

  if (!user) {
    return (
      <Gate title="Sign in to continue" body="Store management is only available to signed-in staff.">
        <Button asChild>
          <Link to="/auth" search={{ next: "/admin" }}>
            Sign in
          </Link>
        </Button>
      </Gate>
    );
  }

  if (!access.data?.isAdmin) {
    return <UnlockAdmin />;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:py-10">
      <h1 className="font-display text-2xl font-semibold sm:text-3xl tracking-tight">Store admin</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Signed in as {access.data.email ?? user.email}
      </p>

      <nav className="mt-6 -mx-4 flex gap-1 overflow-x-auto border-b border-border px-4 pb-2 sm:mx-0 sm:flex-wrap sm:px-0">
        {TABS.map((tab) => (
          <Link
            key={tab.to}
            to={tab.to}
            activeOptions={{ exact: tab.to === "/admin" }}
            activeProps={{ className: "bg-secondary text-foreground" }}
            className="shrink-0 whitespace-nowrap rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      <div className="mt-8">
        <Outlet />
      </div>
    </div>
  );
}

function Gate({
  title,
  body,
  children,
}: {
  title: string;
  body: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <ShieldAlert className="mx-auto size-9 text-muted-foreground" aria-hidden />
      <h1 className="mt-4 font-display text-2xl font-semibold">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
      <div className="mt-6 flex justify-center">{children}</div>
    </div>
  );
}

function UnlockAdmin() {
  const queryClient = useQueryClient();
  const unlock = useServerFn(unlockAdminWithCode);
  const [code, setCode] = React.useState("");

  const submit = useMutation({
    mutationFn: () => unlock({ data: { code } }),
    onSuccess: () => {
      toast.success("Admin access unlocked.");
      setCode("");
      void queryClient.invalidateQueries({ queryKey: ["my-access"] });
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "Couldn't unlock admin access."),
  });

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:py-24">
      <div className="rounded-lg border border-border bg-card p-6 text-center">
        <KeyRound className="mx-auto size-8 text-primary" aria-hidden />
        <h1 className="mt-4 font-display text-xl font-semibold sm:text-2xl">Admin access code</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter the store access code to turn this account into an administrator.
        </p>
        <form
          className="mt-6 space-y-3 text-left"
          onSubmit={(event) => {
            event.preventDefault();
            submit.mutate();
          }}
        >
          <Label htmlFor="admin-code">Access code</Label>
          <Input
            id="admin-code"
            type="password"
            autoComplete="off"
            inputMode="numeric"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="••••••••"
            className="h-11 bg-background"
            required
          />
          <Button type="submit" size="lg" className="w-full" disabled={submit.isPending}>
            {submit.isPending && <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />}
            Unlock admin
          </Button>
        </form>
        <Button asChild variant="ghost" className="mt-3 w-full">
          <Link to="/account">Back to my account</Link>
        </Button>
      </div>
    </div>
  );
}
