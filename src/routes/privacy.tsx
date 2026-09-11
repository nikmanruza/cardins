import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — NexusKeys" },
      {
        name: "description",
        content:
          "How NexusKeys collects, uses and protects your personal data when you buy digital gaming products.",
      },
      { property: "og:title", content: "Privacy Policy — NexusKeys" },
      { property: "og:description", content: "How we handle your data and payment information." },
    ],
  }),
  component: PrivacyPage,
});

const SECTIONS = [
  {
    title: "Data we collect",
    body: "Your email address, order history and the technical details needed to process a payment and deliver a digital product. We do not store full card numbers.",
  },
  {
    title: "How we use it",
    body: "To process orders, deliver purchases, provide support, prevent fraud and meet legal record-keeping requirements.",
  },
  {
    title: "Payments",
    body: "Card details are handled by our payment provider and never stored on our servers. We receive only a payment status and a reference.",
  },
  {
    title: "Sharing",
    body: "We share data with our payment provider and email provider so orders can be paid for and delivered. We do not sell personal data.",
  },
  {
    title: "Retention",
    body: "Order records are kept for as long as required for accounting and dispute resolution, then deleted.",
  },
  {
    title: "Your rights",
    body: "You can request a copy of your data, ask for corrections, or ask us to delete your account by contacting support.",
  },
];

function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <h1 className="font-display text-3xl font-semibold tracking-tight">Privacy policy</h1>
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
