import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { adminAddInventory, adminListInventory, adminListProducts } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/inventory")({
  component: AdminInventory,
});

const TONE: Record<string, string> = {
  available: "bg-success/15 text-success",
  delivered: "bg-primary-soft text-primary",
  allocated: "bg-warning/15 text-warning",
  void: "bg-destructive/15 text-destructive",
};

function AdminInventory() {
  const fetchProducts = useServerFn(adminListProducts);
  const fetchInventory = useServerFn(adminListInventory);
  const addInventory = useServerFn(adminAddInventory);
  const queryClient = useQueryClient();

  const [productId, setProductId] = React.useState<string>("");
  const [codes, setCodes] = React.useState("");

  const products = useQuery({ queryKey: ["admin-products"], queryFn: () => fetchProducts({}) });
  const inventory = useQuery({
    queryKey: ["admin-inventory", productId],
    queryFn: () => fetchInventory({ data: productId ? { productId } : {} }),
  });

  const add = useMutation({
    mutationFn: () => addInventory({ data: { productId, codes } }),
    onSuccess: (result) => {
      toast.success(`${result.added} code${result.added === 1 ? "" : "s"} added.`);
      setCodes("");
      void queryClient.invalidateQueries({ queryKey: ["admin-inventory"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "Couldn't add those codes."),
  });

  return (
    <div className="grid gap-8 lg:grid-cols-[340px_1fr]">
      <div className="h-fit rounded-lg border border-border bg-card p-5 shadow-card">
        <h2 className="font-display text-lg font-semibold">Add codes</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          One code per line. They are stored securely and released automatically when an order is paid.
        </p>

        <div className="mt-4 space-y-2">
          <Label>Product</Label>
          <Select value={productId} onValueChange={setProductId}>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Choose a product" />
            </SelectTrigger>
            <SelectContent>
              {(products.data?.products ?? []).map((product) => (
                <SelectItem key={product.id} value={product.id}>
                  {product.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="mt-4 space-y-2">
          <Label htmlFor="codes">Codes</Label>
          <Textarea
            id="codes"
            rows={7}
            value={codes}
            onChange={(event) => setCodes(event.target.value)}
            placeholder={"XXXX-XXXX-XXXX\nYYYY-YYYY-YYYY"}
            className="bg-background font-mono text-sm"
          />
        </div>

        <Button
          className="mt-4 w-full"
          disabled={!productId || codes.trim().length < 4 || add.isPending}
          onClick={() => add.mutate()}
        >
          {add.isPending && <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />}
          Add to inventory
        </Button>
      </div>

      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-lg font-semibold">Stored codes</h2>
          {productId && (
            <Button variant="ghost" size="sm" onClick={() => setProductId("")}>
              Show all products
            </Button>
          )}
        </div>

        <div className="mt-3 overflow-x-auto rounded-lg border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Delivered</th>
              </tr>
            </thead>
            <tbody>
              {(inventory.data ?? []).map((item) => (
                <tr key={item.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">{item.productName}</td>
                  <td className="px-4 py-3 font-mono text-xs">{item.masked}</td>
                  <td className="px-4 py-3">
                    <Badge className={TONE[item.status] ?? "bg-secondary text-secondary-foreground"}>
                      {item.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {item.deliveredAt ? new Date(item.deliveredAt).toLocaleDateString() : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {inventory.data?.length === 0 && (
          <p className="mt-3 text-sm text-muted-foreground">No codes stored for this selection yet.</p>
        )}
      </div>
    </div>
  );
}
