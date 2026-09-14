import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { adminListProducts, adminUpdateProduct } from "@/lib/admin.functions";
import { formatPrice, STOCK_LABEL } from "@/lib/catalog";

export const Route = createFileRoute("/admin/products")({
  component: AdminProducts,
});

type StockStatus = "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK" | "PREORDER";

function AdminProducts() {
  const fetchProducts = useServerFn(adminListProducts);
  const update = useServerFn(adminUpdateProduct);
  const queryClient = useQueryClient();

  const products = useQuery({ queryKey: ["admin-products"], queryFn: () => fetchProducts({}) });
  const [draft, setDraft] = React.useState<
    Record<string, { price: string; salePrice: string; stockStatus: StockStatus }>
  >({});

  const save = useMutation({
    mutationFn: (input: {
      productId: string;
      price: number;
      salePrice: number | null;
      stockStatus: StockStatus;
    }) => update({ data: input }),
    onSuccess: () => {
      toast.success("Product updated.");
      void queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      void queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "Couldn't save the product."),
  });

  if (products.isPending) {
    return <p className="text-sm text-muted-foreground">Loading products…</p>;
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Change the price, sale price and availability of any product. Changes are live immediately.
      </p>

      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Sale price</th>
              <th className="px-4 py-3">Availability</th>
              <th className="px-4 py-3">Codes</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {(products.data?.products ?? []).map((product) => {
              const row = draft[product.id] ?? {
                price: String(product.price),
                salePrice: product.sale_price === null ? "" : String(product.sale_price),
                stockStatus: product.stock_status as StockStatus,
              };
              const patch = (next: Partial<typeof row>) =>
                setDraft((current) => ({ ...current, [product.id]: { ...row, ...next } }));

              return (
                <tr key={product.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-medium">{product.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatPrice(product.sale_price ?? product.price, product.currency)} live
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <Input
                      value={row.price}
                      inputMode="decimal"
                      onChange={(event) => patch({ price: event.target.value })}
                      className="h-9 w-24 bg-background"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Input
                      value={row.salePrice}
                      inputMode="decimal"
                      placeholder="none"
                      onChange={(event) => patch({ salePrice: event.target.value })}
                      className="h-9 w-24 bg-background"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Select
                      value={row.stockStatus}
                      onValueChange={(value) => patch({ stockStatus: value as StockStatus })}
                    >
                      <SelectTrigger className="h-9 w-36 bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(Object.keys(STOCK_LABEL) as StockStatus[]).map((status) => (
                          <SelectItem key={status} value={status}>
                            {STOCK_LABEL[status]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {product.availableKeys} left · {product.deliveredKeys} sold
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={save.isPending}
                      onClick={() =>
                        save.mutate({
                          productId: product.id,
                          price: Number(row.price) || 0,
                          salePrice:
                            row.salePrice.trim() === "" ? null : Number(row.salePrice) || 0,
                          stockStatus: row.stockStatus,
                        })
                      }
                    >
                      {save.isPending && (
                        <Loader2 className="mr-2 size-3.5 animate-spin" aria-hidden />
                      )}
                      Save
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
