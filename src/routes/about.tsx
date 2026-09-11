import { createFileRoute, Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About NexusKeys — Digital Gaming Marketplace" },
      {
        name: "description",
        content:
          "NexusKeys is a digital gaming marketplace focused on fast delivery, verified listings and secure checkout.",
      },
      { property: "og:title", content: "About NexusKeys" },
      {
        property: "og:description",
        content: "Who we are and how we handle delivery, regions and buyer protection.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <h1 className="font-display text-3xl font-semibold tracking-tight">About NexusKeys</h1>
      <div className="mt-6 space-y-5 text-sm leading-relaxed text-muted-foreground">
        <p>
          NexusKeys is a digital marketplace for gaming products: platform game cards, gift cards,
          subscriptions, digital goods and approved game accounts. Everything we sell is delivered
          digitally, so there is nothing to ship and nothing to wait for beyond payment confirmation.
        </p>
        <p>
          Every listing states the platform, region and delivery method up front, because those are
          the three things that decide whether a code will work for you. We would rather you buy the
          right product than deal with a refund afterwards.
        </p>
        <p>
          Payments are verified on our own servers before anything is released, and digital
          credentials are never displayed publicly. Account products are handed over only to the
          buyer, and only where the publisher or platform permits transfer.
        </p>
        <p>
          If something goes wrong, support will check the code and resolve it. Unused codes can be
          refunded within 14 days.
        </p>
      </div>
      <Button asChild className="mt-8">
        <Link to="/shop">Browse the catalog</Link>
      </Button>
    </div>
  );
}
