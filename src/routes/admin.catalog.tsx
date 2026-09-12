import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  adminCreateProduct,
  adminDeleteProduct,
  adminGetProduct,
  adminListCategories,
  adminListProducts,
  adminSaveCategory,
  adminSaveProduct,
  type ProductDraft,
} from "@/lib/admin.functions";
import { artFor, formatPrice, STOCK_LABEL, TYPE_LABEL } from "@/lib/catalog";

export const Route = createFileRoute("/admin/catalog")({
  component: AdminCatalog,
});

const IMAGE_KEYS = ["playstation", "xbox", "nintendo", "steam", "giftcard", "account", "digital"];
const TYPES = ["GAME_ACCOUNT", "GAME_CARD", "GIFT_CARD", "DIGITAL_PRODUCT"] as const;
const STOCKS = ["IN_STOCK", "LOW_STOCK", "OUT_OF_STOCK", "PREORDER"] as const;

const emptyDraft: ProductDraft = {
  name: "",
  slug: "",
  categoryId: "",
  productType: "DIGITAL_PRODUCT",
  shortDescription: "",
  description: "",
  price: 0,
  salePrice: null,
  currency: "USD",
  platform: "",
  game: "",
  region: "",
  deliveryMethod: "Instant digital delivery",
  stockStatus: "IN_STOCK",
  imageKey: "digital",
  redemptionInstructions: "",
  terms: "",
  isFeatured: false,
  isBestseller: false,
  isNew: false,
};

function AdminCatalog() {
  const queryClient = useQueryClient();
  const fetchProducts = useServerFn(adminListProducts);
  const fetchCategories = useServerFn(adminListCategories);
  const getProduct = useServerFn(adminGetProduct);
  const createProduct = useServerFn(adminCreateProduct);
  const saveProduct = useServerFn(adminSaveProduct);
  const deleteProduct = useServerFn(adminDeleteProduct);
  const saveCategory = useServerFn(adminSaveCategory);

  const products = useQuery({ queryKey: ["admin-products"], queryFn: () => fetchProducts({}) });
  const categories = useQuery({ queryKey: ["admin-categories"], queryFn: () => fetchCategories({}) });

  const [editing, setEditing] = React.useState<{ id: string | null; draft: ProductDraft } | null>(null);
  const [newCategory, setNewCategory] = React.useState("");

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    void queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
    void queryClient.invalidateQueries({ queryKey: ["products"] });
    void queryClient.invalidateQueries({ queryKey: ["categories"] });
  };

  const openNew = () => {
    const firstCategory = categories.data?.[0]?.id ?? "";
    setEditing({ id: null, draft: { ...emptyDraft, categoryId: firstCategory } });
  };

  const openEdit = useMutation({
    mutationFn: (productId: string) => getProduct({ data: { productId } }),
    onSuccess: (row) => {
      setEditing({
        id: row.id,
        draft: {
          name: row.name,
          slug: row.slug,
          categoryId: row.category_id,
          productType: row.product_type,
          shortDescription: row.short_description ?? "",
          description: row.description ?? "",
          price: row.price,
          salePrice: row.sale_price,
          currency: row.currency,
          platform: row.platform ?? "",
          game: row.game ?? "",
          region: row.region ?? "",
          deliveryMethod: row.delivery_method,
          stockStatus: row.stock_status,
          imageKey: row.image_key,
          redemptionInstructions: row.redemption_instructions ?? "",
          terms: row.terms ?? "",
          isFeatured: row.is_featured,
          isBestseller: row.is_bestseller,
          isNew: row.is_new,
        },
      });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Couldn't open that product."),
  });

  const persist = useMutation({
    mutationFn: async (input: { id: string | null; draft: ProductDraft }) =>
      input.id
        ? saveProduct({ data: { ...input.draft, productId: input.id } })
        : createProduct({ data: input.draft }),
    onSuccess: (_result, input) => {
      toast.success(input.id ? "Product saved." : "Product added to the store.");
      setEditing(null);
      refresh();
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Couldn't save the product."),
  });

  const remove = useMutation({
    mutationFn: (productId: string) => deleteProduct({ data: { productId } }),
    onSuccess: () => {
      toast.success("Product removed.");
      setEditing(null);
      refresh();
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Couldn't remove the product."),
  });

  const addCategory = useMutation({
    mutationFn: (name: string) =>
      saveCategory({ data: { name, description: "", imageKey: "generic", sortOrder: 99, isActive: true } }),
    onSuccess: () => {
      toast.success("Category added.");
      setNewCategory("");
      refresh();
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Couldn't add the category."),
  });

  if (products.isPending || categories.isPending) {
    return <p className="text-sm text-muted-foreground">Loading catalog…</p>;
  }

  if (editing) {
    return (
      <ProductForm
        draft={editing.draft}
        isNew={editing.id === null}
        categories={categories.data ?? []}
        busy={persist.isPending || remove.isPending}
        onChange={(next) => setEditing({ id: editing.id, draft: next })}
        onCancel={() => setEditing(null)}
        onSave={() => persist.mutate(editing)}
        onDelete={editing.id ? () => remove.mutate(editing.id!) : undefined}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <p className="max-w-xl text-sm text-muted-foreground">
          Add new products, edit their descriptions, prices and images, or remove them from the store.
        </p>
        <Button onClick={openNew} className="w-full sm:w-auto">
          <Plus className="mr-2 size-4" aria-hidden /> Add product
        </Button>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <h2 className="font-display text-sm font-semibold">Categories</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {(categories.data ?? []).map((category) => (
            <span key={category.id} className="rounded-full bg-secondary px-3 py-1 text-xs">
              {category.name}
            </span>
          ))}
        </div>
        <form
          className="mt-4 flex flex-col gap-2 sm:flex-row"
          onSubmit={(event) => {
            event.preventDefault();
            if (newCategory.trim()) addCategory.mutate(newCategory.trim());
          }}
        >
          <Input
            value={newCategory}
            onChange={(event) => setNewCategory(event.target.value)}
            placeholder="New category name"
            className="h-10 bg-background sm:max-w-xs"
          />
          <Button type="submit" variant="secondary" disabled={addCategory.isPending}>
            {addCategory.isPending && <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />}
            Add category
          </Button>
        </form>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {(products.data?.products ?? []).map((product) => (
          <li
            key={product.id}
            className="flex gap-3 rounded-lg border border-border bg-card p-3"
          >
            <img
              src={artFor(product.image_key)}
              alt=""
              width={72}
              height={72}
              loading="lazy"
              className="size-16 shrink-0 rounded-md object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{product.name}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {formatPrice(product.sale_price ?? product.price, product.currency)} ·{" "}
                {STOCK_LABEL[product.stock_status as keyof typeof STOCK_LABEL]}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {TYPE_LABEL[product.product_type as keyof typeof TYPE_LABEL]} · {product.availableKeys} codes
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => openEdit.mutate(product.id)}
                  disabled={openEdit.isPending}
                >
                  <Pencil className="mr-1.5 size-3.5" aria-hidden /> Edit
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                  onClick={() => remove.mutate(product.id)}
                  disabled={remove.isPending}
                >
                  <Trash2 className="mr-1.5 size-3.5" aria-hidden /> Delete
                </Button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ProductForm({
  draft,
  isNew,
  categories,
  busy,
  onChange,
  onCancel,
  onSave,
  onDelete,
}: {
  draft: ProductDraft;
  isNew: boolean;
  categories: { id: string; name: string }[];
  busy: boolean;
  onChange: (next: ProductDraft) => void;
  onCancel: () => void;
  onSave: () => void;
  onDelete?: (() => void) | undefined;
}) {
  const patch = (next: Partial<ProductDraft>) => onChange({ ...draft, ...next });

  return (
    <form
      className="space-y-6"
      onSubmit={(event) => {
        event.preventDefault();
        onSave();
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-xl font-semibold">
          {isNew ? "Add a product" : `Editing ${draft.name || "product"}`}
        </h2>
        <Button type="button" variant="ghost" onClick={onCancel}>
          <X className="mr-1.5 size-4" aria-hidden /> Close
        </Button>
      </div>

      <div className="grid gap-4 rounded-lg border border-border bg-card p-4 sm:grid-cols-2">
        <Field label="Product name">
          <Input value={draft.name} onChange={(e) => patch({ name: e.target.value })} required className="bg-background" />
        </Field>
        <Field label="Web address (leave blank to auto-fill)">
          <Input value={draft.slug} onChange={(e) => patch({ slug: e.target.value })} className="bg-background" />
        </Field>

        <Field label="Category">
          <Select value={draft.categoryId} onValueChange={(value) => patch({ categoryId: value })}>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Choose a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Product type">
          <Select
            value={draft.productType}
            onValueChange={(value) => patch({ productType: value as ProductDraft["productType"] })}
          >
            <SelectTrigger className="bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {TYPE_LABEL[type]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Price">
          <Input
            inputMode="decimal"
            value={String(draft.price)}
            onChange={(e) => patch({ price: Number(e.target.value) || 0 })}
            className="bg-background"
          />
        </Field>
        <Field label="Sale price (optional)">
          <Input
            inputMode="decimal"
            value={draft.salePrice === null ? "" : String(draft.salePrice)}
            onChange={(e) => patch({ salePrice: e.target.value === "" ? null : Number(e.target.value) || 0 })}
            className="bg-background"
          />
        </Field>

        <Field label="Availability">
          <Select
            value={draft.stockStatus}
            onValueChange={(value) => patch({ stockStatus: value as ProductDraft["stockStatus"] })}
          >
            <SelectTrigger className="bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STOCKS.map((stock) => (
                <SelectItem key={stock} value={stock}>
                  {STOCK_LABEL[stock]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Image">
          <Select value={draft.imageKey} onValueChange={(value) => patch({ imageKey: value })}>
            <SelectTrigger className="bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {IMAGE_KEYS.map((key) => (
                <SelectItem key={key} value={key}>
                  {key}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <div className="sm:col-span-2 flex items-center gap-3">
          <img
            src={artFor(draft.imageKey)}
            alt=""
            width={96}
            height={96}
            className="size-20 rounded-md object-cover"
          />
          <p className="text-xs text-muted-foreground">This artwork is shown on the shop and product page.</p>
        </div>

        <Field label="Platform">
          <Input value={draft.platform} onChange={(e) => patch({ platform: e.target.value })} className="bg-background" />
        </Field>
        <Field label="Game">
          <Input value={draft.game} onChange={(e) => patch({ game: e.target.value })} className="bg-background" />
        </Field>
        <Field label="Region">
          <Input value={draft.region} onChange={(e) => patch({ region: e.target.value })} className="bg-background" />
        </Field>
        <Field label="Delivery">
          <Input
            value={draft.deliveryMethod}
            onChange={(e) => patch({ deliveryMethod: e.target.value })}
            className="bg-background"
          />
        </Field>

        <Field label="Short description" className="sm:col-span-2">
          <Textarea
            value={draft.shortDescription}
            onChange={(e) => patch({ shortDescription: e.target.value })}
            rows={2}
            className="bg-background"
          />
        </Field>
        <Field label="Full description" className="sm:col-span-2">
          <Textarea
            value={draft.description}
            onChange={(e) => patch({ description: e.target.value })}
            rows={6}
            className="bg-background"
          />
        </Field>
        <Field label="How to redeem" className="sm:col-span-2">
          <Textarea
            value={draft.redemptionInstructions}
            onChange={(e) => patch({ redemptionInstructions: e.target.value })}
            rows={3}
            className="bg-background"
          />
        </Field>
        <Field label="Terms" className="sm:col-span-2">
          <Textarea
            value={draft.terms}
            onChange={(e) => patch({ terms: e.target.value })}
            rows={3}
            className="bg-background"
          />
        </Field>

        <div className="sm:col-span-2 grid gap-3 sm:grid-cols-3">
          <Toggle label="Featured" checked={draft.isFeatured} onChange={(v) => patch({ isFeatured: v })} />
          <Toggle label="Best seller" checked={draft.isBestseller} onChange={(v) => patch({ isBestseller: v })} />
          <Toggle label="New" checked={draft.isNew} onChange={(v) => patch({ isNew: v })} />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={busy} className="w-full sm:w-auto">
          {busy && <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />}
          {isNew ? "Add product" : "Save changes"}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel} className="w-full sm:w-auto">
          Cancel
        </Button>
        {onDelete && (
          <Button
            type="button"
            variant="ghost"
            className="w-full text-destructive hover:text-destructive sm:w-auto"
            onClick={onDelete}
            disabled={busy}
          >
            <Trash2 className="mr-1.5 size-4" aria-hidden /> Delete product
          </Button>
        )}
      </div>
    </form>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  const id = React.useId();
  return (
    <div className={`space-y-1.5 ${className ?? ""}`}>
      <Label htmlFor={id}>{label}</Label>
      <div id={id}>{children}</div>
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-md border border-border bg-background px-3 py-2 text-sm">
      <span>{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </label>
  );
}
