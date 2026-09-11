import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { SlidersHorizontal } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductCard } from "@/components/store/product-card";
import { categoriesQuery, priceOf, productsQuery, TYPE_LABEL } from "@/lib/catalog";
import type { CatalogProduct } from "@/lib/catalog.functions";

type ShopSearch = { q?: string | undefined };

export const Route = createFileRoute("/shop")({
  validateSearch: (search: Record<string, unknown>): ShopSearch =>
    typeof search['q'] === "string" ? { q: search['q'] } : {},
  head: () => ({
    meta: [
      { title: "Shop All Digital Gaming Products — NexusKeys" },
      {
        name: "description",
        content:
          "Browse every game card, gift card, game account and digital product, with search, filters and sorting.",
      },
      { property: "og:title", content: "Shop All Digital Gaming Products — NexusKeys" },
      {
        property: "og:description",
        content: "Search and filter game cards, gift cards, accounts and digital products.",
      },
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(productsQuery());
    context.queryClient.ensureQueryData(categoriesQuery());
  },
  component: ShopPage,
});

const SORTS = {
  featured: "Featured",
  "price-asc": "Price: low to high",
  "price-desc": "Price: high to low",
  rating: "Top rated",
  newest: "Newest",
} as const;

const PAGE_SIZE = 8;

function ShopPage() {
  const { q } = Route.useSearch();
  const { data: products } = useSuspenseQuery(productsQuery());
  const { data: categories } = useSuspenseQuery(categoriesQuery());

  const [query, setQuery] = React.useState(q ?? "");
  const [selectedCategories, setSelectedCategories] = React.useState<string[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = React.useState<string[]>([]);
  const [selectedRegions, setSelectedRegions] = React.useState<string[]>([]);
  const [maxPrice, setMaxPrice] = React.useState(200);
  const [sort, setSort] = React.useState<keyof typeof SORTS>("featured");
  const [page, setPage] = React.useState(1);
  const [filtersOpen, setFiltersOpen] = React.useState(false);

  React.useEffect(() => setPage(1), [query, selectedCategories, selectedPlatforms, selectedRegions, maxPrice, sort]);

  const platforms = Array.from(
    new Set(products.map((product) => product.platform).filter(Boolean) as string[]),
  ).sort();
  const regions = Array.from(
    new Set(products.map((product) => product.region).filter(Boolean) as string[]),
  ).sort();

  const filtered = products
    .filter((product) => {
      const term = query.trim().toLowerCase();
      const matchesTerm =
        term.length === 0 ||
        product.name.toLowerCase().includes(term) ||
        product.short_description.toLowerCase().includes(term) ||
        product.tags.some((tag) => tag.toLowerCase().includes(term));
      const matchesCategory =
        selectedCategories.length === 0 || selectedCategories.includes(product.category_id);
      const matchesPlatform =
        selectedPlatforms.length === 0 ||
        (product.platform !== null && selectedPlatforms.includes(product.platform));
      const matchesRegion =
        selectedRegions.length === 0 ||
        (product.region !== null && selectedRegions.includes(product.region));
      return (
        matchesTerm && matchesCategory && matchesPlatform && matchesRegion && priceOf(product) <= maxPrice
      );
    })
    .sort(sorter(sort));

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggle = (list: string[], value: string, set: (next: string[]) => void) =>
    set(list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="font-display text-3xl font-semibold tracking-tight">All products</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {filtered.length} product{filtered.length === 1 ? "" : "s"} available
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search products, platforms or tags…"
          aria-label="Search products"
          className="h-11 bg-card sm:max-w-sm"
        />
        <Select value={sort} onValueChange={(value) => setSort(value as keyof typeof SORTS)}>
          <SelectTrigger className="h-11 bg-card sm:w-52" aria-label="Sort products">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(SORTS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="secondary"
          className="h-11 lg:hidden"
          onClick={() => setFiltersOpen((open) => !open)}
        >
          <SlidersHorizontal className="size-4" /> Filters
        </Button>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside className={`${filtersOpen ? "block" : "hidden"} lg:block`}>
          <FilterGroup title="Category">
            {categories.map((category) => (
              <FilterRow
                key={category.id}
                id={`cat-${category.id}`}
                label={category.name}
                checked={selectedCategories.includes(category.id)}
                onChange={() => toggle(selectedCategories, category.id, setSelectedCategories)}
              />
            ))}
          </FilterGroup>
          <FilterGroup title="Platform">
            {platforms.map((platform) => (
              <FilterRow
                key={platform}
                id={`plat-${platform}`}
                label={platform}
                checked={selectedPlatforms.includes(platform)}
                onChange={() => toggle(selectedPlatforms, platform, setSelectedPlatforms)}
              />
            ))}
          </FilterGroup>
          <FilterGroup title="Region">
            {regions.map((region) => (
              <FilterRow
                key={region}
                id={`reg-${region}`}
                label={region}
                checked={selectedRegions.includes(region)}
                onChange={() => toggle(selectedRegions, region, setSelectedRegions)}
              />
            ))}
          </FilterGroup>
          <FilterGroup title={`Max price: $${maxPrice}`}>
            <Slider
              value={[maxPrice]}
              min={10}
              max={200}
              step={5}
              onValueChange={([value]) => setMaxPrice(value ?? 200)}
              aria-label="Maximum price"
            />
          </FilterGroup>
        </aside>

        <div>
          {visible.length === 0 ? (
            <div className="rounded-lg border border-border bg-card p-10 text-center">
              <p className="font-display text-base font-semibold">No products match your filters</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Try a different search term or widen the price range.
              </p>
              <Button
                variant="secondary"
                className="mt-5"
                onClick={() => {
                  setQuery("");
                  setSelectedCategories([]);
                  setSelectedPlatforms([]);
                  setSelectedRegions([]);
                  setMaxPrice(200);
                }}
              >
                Clear filters
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {visible.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {pageCount > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage((current) => current - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {pageCount}
              </span>
              <Button
                variant="secondary"
                size="sm"
                disabled={page === pageCount}
                onClick={() => setPage((current) => current + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function sorter(sort: keyof typeof SORTS) {
  return (a: CatalogProduct, b: CatalogProduct) => {
    switch (sort) {
      case "price-asc":
        return priceOf(a) - priceOf(b);
      case "price-desc":
        return priceOf(b) - priceOf(a);
      case "rating":
        return b.rating - a.rating;
      case "newest":
        return Number(b.is_new) - Number(a.is_new);
      default:
        return Number(b.is_featured) - Number(a.is_featured);
    }
  };
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-border py-5 first:pt-0">
      <h2 className="text-sm font-semibold">{title}</h2>
      <div className="mt-3 space-y-2.5">{children}</div>
    </div>
  );
}

function FilterRow({
  id,
  label,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <Checkbox id={id} checked={checked} onCheckedChange={onChange} />
      <Label htmlFor={id} className="text-sm font-normal text-muted-foreground">
        {label}
      </Label>
    </div>
  );
}

export { TYPE_LABEL };
