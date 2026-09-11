import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact NexusKeys Support" },
      {
        name: "description",
        content: "Contact the NexusKeys team about an order, a code that will not redeem, or a refund.",
      },
      { property: "og:title", content: "Contact NexusKeys Support" },
      { property: "og:description", content: "Reach our team about orders, codes and refunds." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [sent, setSent] = React.useState(false);

  return (
    <div className="mx-auto max-w-2xl px-4 py-14">
      <Mail className="size-6 text-primary" aria-hidden />
      <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight">Contact us</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        Include your order reference so we can find your purchase quickly.
      </p>

      {sent ? (
        <div className="mt-8 rounded-lg border border-border bg-card p-6">
          <h2 className="font-display text-lg font-semibold">Message received</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Thanks — our team replies to most messages within one business day.
          </p>
        </div>
      ) : (
        <form
          className="mt-8 space-y-5 rounded-lg border border-border bg-card p-6"
          onSubmit={(event) => {
            event.preventDefault();
            setSent(true);
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="name">Your name</Label>
            <Input id="name" required className="h-11 bg-background" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input id="email" type="email" required className="h-11 bg-background" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="order">Order reference (optional)</Label>
            <Input id="order" placeholder="NK-XXXXXX" className="h-11 bg-background" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">How can we help?</Label>
            <Textarea id="message" required rows={5} className="bg-background" />
          </div>
          <Button type="submit" size="lg" className="w-full">
            Send message
          </Button>
        </form>
      )}
    </div>
  );
}
