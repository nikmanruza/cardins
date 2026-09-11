import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — NexusKeys" },
      {
        name: "description",
        content:
          "The terms that apply when you buy digital gaming products from NexusKeys, including delivery and refund rules.",
      },
      { property: "og:title", content: "Terms of Service — NexusKeys" },
      { property: "og:description", content: "Purchase, delivery and refund terms for NexusKeys." },
    ],
  }),
  component: TermsPage,
});

const SECTIONS = [
  {
    title: "1. Buying from NexusKeys",
    body: "By placing an order you confirm the details you provide are accurate and that you are permitted to buy the product in your country. Prices are shown in the currency listed on each product page.",
  },
  {
    title: "2. Digital delivery",
    body: "Products are delivered digitally once payment is confirmed. Instant products are released automatically. Account products are handed over manually after a security check, normally within 24 hours.",
  },
  {
    title: "3. Regions and compatibility",
    body: "Many codes only work in the region shown on the product page. It is your responsibility to check the region, platform and account requirements before purchase.",
  },
  {
    title: "4. Refunds",
    body: "Unused codes may be refunded within 14 days of purchase. Once a code has been redeemed the value has transferred and it can no longer be refunded.",
  },
  {
    title: "5. Publisher and platform terms",
    body: "All products remain subject to the terms of the relevant publisher or platform. We do not sell products where transfer or resale is prohibited.",
  },
  {
    title: "6. Acceptable use",
    body: "Fraudulent payments, chargeback abuse and attempts to resell fraudulently obtained products result in account suspension and cancellation of pending orders.",
  },
];

function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <h1 className="font-display text-3xl font-semibold tracking-tight">Terms of service</h1>
      <p className="mt-3 text-sm text-muted-foreground">Last updated 11 September 2026.</p>
      <div className="mt-8 space-y-8">
        {SECTIONS.map((section) => (
          <section key={section.title}>
            <h2 className="font-display text-lg font-semibold">{section.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{section.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
