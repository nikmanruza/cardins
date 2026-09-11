import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Loader2, ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getMyAccess } from "@/lib/admin.functions";
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
  { label: "Products", to: "/admin/products" as const },
  { label: "Orders", to: "/admin/orders" as const },
  { label: "Inventory", to: "/admin/inventory" as const },
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
    return (
      <Gate
        title="You don't have store access"
        body="Ask an administrator to grant you access, or claim the seat from your account page if no admin exists yet."
      >
        <Button asChild variant="secondary">
          <Link to="/account">Back to my account</Link>
        </Button>
      </Gate>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="font-display text-3xl font-semibold tracking-tight">Store admin</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Signed in as {access.data.email ?? user.email}
      </p>

      <nav className="mt-6 flex flex-wrap gap-1 border-b border-border pb-2">
        {TABS.map((tab) => (
          <Link
            key={tab.to}
            to={tab.to}
            activeOptions={{ exact: tab.to === "/admin" }}
            activeProps={{ className: "bg-secondary text-foreground" }}
            className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
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
