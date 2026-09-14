import { createFileRoute, Link } from "@tanstack/react-router";
import { LifeBuoy, Mail, KeyRound, RefreshCcw } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/support")({
  head: () => ({
    meta: [
      { title: "Help & Support — CardinsPro" },
      {
        name: "description",
        content:
          "Get help with orders, redeeming codes, regions and refunds for digital gaming products.",
      },
      { property: "og:title", content: "Help & Support — CardinsPro" },
      { property: "og:description", content: "Help with orders, codes, regions and refunds." },
    ],
  }),
  component: SupportPage,
});

const TOPICS = [
  {
    icon: KeyRound,
    title: "Redeeming codes",
    copy: "Step-by-step redemption help for each platform.",
  },
  { icon: RefreshCcw, title: "Order issues", copy: "Missing, delayed or already-used codes." },
  { icon: Mail, title: "Contact us", copy: "Reach the team with your order reference." },
];

const FAQ = [
  {
    q: "Where is my code?",
    a: "Codes appear in your order confirmation as soon as payment is confirmed. If payment is still processing, the code is released automatically once it clears.",
  },
  {
    q: "My code says it is invalid",
    a: "Check the region shown on the product page — codes usually work in one region only. If the region matches, contact support with your order reference and we will replace or refund it.",
  },
  {
    q: "Can I get a refund?",
    a: "Unused codes can be refunded within 14 days. Once a code has been redeemed it cannot be refunded, as the value has already been transferred.",
  },
  {
    q: "How are game accounts delivered?",
    a: "Account products are handed over manually after a security check, normally within 24 hours. Credentials are never shown before purchase.",
  },
];

function SupportPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <LifeBuoy className="size-6 text-primary" aria-hidden />
      <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight">
        Help &amp; support
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        Answers to the most common questions about orders, delivery and redemption.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {TOPICS.map((topic) => (
          <div key={topic.title} className="rounded-lg border border-border bg-card p-5">
            <topic.icon className="size-5 text-primary" aria-hidden />
            <h2 className="mt-3 text-sm font-semibold">{topic.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{topic.copy}</p>
          </div>
        ))}
      </div>

      <Accordion type="single" collapsible className="mt-10">
        {FAQ.map((item) => (
          <AccordionItem key={item.q} value={item.q}>
            <AccordionTrigger className="text-left text-sm">{item.q}</AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground">{item.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <div className="mt-10 rounded-lg border border-border bg-card p-6">
        <h2 className="font-display text-lg font-semibold">Still need help?</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Send us your order reference and we will look into it.
        </p>
        <Button asChild className="mt-4">
          <Link to="/contact">Contact support</Link>
        </Button>
      </div>
    </div>
  );
}
