import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";

import { ProductCard } from "@/components/store/product-card";
import { Button } from "@/components/ui/button";
import { categoriesQuery, productsQuery } from "@/lib/catalog";

export const Route = createFileRoute("/category/$slug")({
  loader: async ({ context, params }) => {
    const categories = await context.queryClient.ensureQueryData(categoriesQuery());
    const category = categories.find((item) => item.slug === params.slug);
    if (!category) throw notFound();
    context.queryClient.ensureQueryData(productsQuery());
    return { category };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Category unavailable — NexusKeys" }, { name: "robots", content: "noindex" }],
      };
    }
    const { category } = loaderData;
    const title = category.seo_title ?? `${category.name} — NexusKeys`;
    const description = category.seo_description ?? category.description;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: CategoryPage,
  notFoundComponent: CategoryNotFound,
});

function CategoryPage() {
  const { category } = Route.useLoaderData();
  const { data: products } = useSuspenseQuery(productsQuery());
  const items = products.filter((product) => product.category_id === category.id);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
        <Link to="/" className="hover:text-foreground">
          Home
        </Link>
        <span className="px-2">/</span>
        <Link to="/shop" className="hover:text-foreground">
          Shop
        </Link>
        <span className="px-2">/</span>
        <span className="text-foreground">{category.name}</span>
      </nav>

      <h1 className="mt-6 font-display text-3xl font-semibold tracking-tight">{category.name}</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        {category.description}
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {items.length === 0 && (
        <p className="mt-10 text-sm text-muted-foreground">
          No products in this category yet. Check back soon.
        </p>
      )}
    </div>
  );
}

function CategoryNotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="font-display text-2xl font-semibold">Category not found</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        This category may have been renamed or removed.
      </p>
      <Button asChild className="mt-6">
        <Link to="/shop">Browse all products</Link>
      </Button>
    </div>
  );
}
