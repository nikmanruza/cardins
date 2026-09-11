import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";

import { adminListAudit } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/activity")({
  component: AdminActivity,
});

const LABEL: Record<string, string> = {
  "order.paid": "Order paid and codes delivered",
  "order.status_changed": "Order status changed",
  "product.updated": "Product updated",
  "inventory.added": "Inventory codes added",
  "key.revealed": "Customer revealed codes",
  "role.admin_claimed": "Admin seat claimed",
};

function AdminActivity() {
  const fetchAudit = useServerFn(adminListAudit);
  const audit = useQuery({ queryKey: ["admin-audit"], queryFn: () => fetchAudit({}) });

  if (audit.isPending) return <p className="text-sm text-muted-foreground">Loading activity…</p>;

  if (audit.data?.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        Nothing has happened in the store yet.
      </p>
    );
  }

  return (
    <ol className="space-y-2">
      {(audit.data ?? []).map((entry) => (
        <li
          key={entry.id}
          className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3 text-sm"
        >
          <div>
            <p className="font-medium">{LABEL[entry.action] ?? entry.action}</p>
            <p className="text-xs text-muted-foreground">
              {entry.entity} · {entry.entity_id?.slice(0, 8) ?? "—"}
            </p>
          </div>
          <time className="text-xs text-muted-foreground">
            {new Date(entry.created_at).toLocaleString()}
          </time>
        </li>
      ))}
    </ol>
  );
}
