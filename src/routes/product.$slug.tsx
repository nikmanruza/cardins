import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Star, ShieldCheck, Zap, Globe } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ProductCard } from "@/components/store/product-card";
import { useCart } from "@/lib/cart";
import {
  artFor,
  formatPrice,
  priceOf,
  productQuery,
  productsQuery,
  STOCK_LABEL,
  TYPE_LABEL,
} from "@/lib/catalog";

export const Route = createFileRoute("/product/$slug")({
  loader: async ({ context, params }) => {
    const product = await context.queryClient.ensureQueryData(productQuery(params.slug));
    if (!product) throw notFound();
    context.queryClient.ensureQueryData(productsQuery());
    return { product };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Product unavailable — NexusKeys" }, { name: "robots", content: "noindex" }],
      };
    }
    const { product } = loaderData;
    const title = product.seo_title ?? `${product.name} — NexusKeys`;
    const description = product.seo_description ?? product.short_description;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: ProductPage,
  notFoundComponent: ProductNotFound,
});

function ProductPage() {
  const { product } = Route.useLoaderData();
  const { data: products } = useSuspenseQuery(productsQuery());
  const { add, openCart } = useCart();

  const price = priceOf(product);
  const soldOut = product.stock_status === "OUT_OF_STOCK";
  const related = products
    .filter((item) => item.category_id === product.category_id && item.id !== product.id)
    .slice(0, 4);

  const addToCart = () => {
    add({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      imageKey: product.image_key,
      unitPrice: price,
      currency: product.currency,
    });
    openCart();
  };

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
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="mt-8 grid gap-10 lg:grid-cols-2">
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-card">
          <img
            src={artFor(product.image_key)}
            alt={product.name}
            width={1024}
            height={1024}
            className="aspect-square w-full object-cover"
          />
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{TYPE_LABEL[product.product_type]}</Badge>
            {product.is_new && <Badge>New</Badge>}
            {product.is_bestseller && <Badge variant="secondary">Best seller</Badge>}
          </div>

          <h1 className="mt-4 font-display text-3xl font-semibold leading-tight tracking-tight">
            {product.name}
          </h1>

          <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
            <Star className="size-4 fill-warning text-warning" aria-hidden />
            <span className="text-foreground">{product.rating.toFixed(1)}</span>
            <span>({product.review_count} reviews)</span>
            <span aria-hidden>·</span>
            <span>{STOCK_LABEL[product.stock_status]}</span>
          </div>

          <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
            {product.short_description}
          </p>

          <div className="mt-6 flex items-baseline gap-3">
            <span className="font-display text-3xl font-semibold">
              {formatPrice(price, product.currency)}
            </span>
            {product.sale_price !== null && (
              <span className="text-base text-muted-foreground line-through">
                {formatPrice(product.price, product.currency)}
              </span>
            )}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button size="lg" disabled={soldOut} onClick={addToCart}>
              {soldOut ? "Sold out" : "Add to cart"}
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link to="/cart">View cart</Link>
            </Button>
          </div>

          <dl className="mt-8 grid gap-4 rounded-lg border border-border bg-card p-5 text-sm sm:grid-cols-2">
            <Detail icon={Zap} label="Delivery" value={product.delivery_method} />
            <Detail icon={Globe} label="Region" value={product.region ?? "Worldwide"} />
            <Detail icon={ShieldCheck} label="Platform" value={product.platform ?? "Multiple"} />
            <Detail icon={ShieldCheck} label="Game" value={product.game ?? "Not game specific"} />
          </dl>

          <Accordion type="single" collapsible className="mt-8">
            <AccordionItem value="description">
              <AccordionTrigger>Description</AccordionTrigger>
              <AccordionContent className="whitespace-pre-line text-sm text-muted-foreground">
                {product.description}
              </AccordionContent>
            </AccordionItem>
            {product.redemption_instructions && (
              <AccordionItem value="redeem">
                <AccordionTrigger>How to redeem</AccordionTrigger>
                <AccordionContent className="whitespace-pre-line text-sm text-muted-foreground">
                  {product.redemption_instructions}
                </AccordionContent>
              </AccordionItem>
            )}
            {product.terms && (
              <AccordionItem value="terms">
                <AccordionTrigger>Terms and conditions</AccordionTrigger>
                <AccordionContent className="whitespace-pre-line text-sm text-muted-foreground">
                  {product.terms}
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="font-display text-2xl font-semibold tracking-tight">You may also like</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Detail({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Zap;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-3">
      <Icon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
      <div>
        <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
        <dd className="mt-0.5">{value}</dd>
      </div>
    </div>
  );
}

function ProductNotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="font-display text-2xl font-semibold">Product not found</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        This product is no longer listed or the link is incorrect.
      </p>
      <Button asChild className="mt-6">
        <Link to="/shop">Browse all products</Link>
      </Button>
    </div>
  );
}
