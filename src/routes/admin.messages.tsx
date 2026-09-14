import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, MailOpen } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { adminListMessages, adminUpdateMessage } from "@/lib/contact.functions";

export const Route = createFileRoute("/admin/messages")({
  component: AdminMessagesPage,
});

const STATUSES = ["new", "open", "closed"] as const;

function AdminMessagesPage() {
  const queryClient = useQueryClient();
  const listMessages = useServerFn(adminListMessages);
  const updateMessage = useServerFn(adminUpdateMessage);

  const messages = useQuery({
    queryKey: ["admin-messages"],
    queryFn: () => listMessages({}),
  });

  const save = useMutation({
    mutationFn: (input: { messageId: string; status?: string; adminNote?: string }) =>
      updateMessage({ data: input }),
    onSuccess: () => {
      toast.success("Message updated.");
      void queryClient.invalidateQueries({ queryKey: ["admin-messages"] });
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "Couldn't update the message."),
  });

  if (messages.isPending) {
    return (
      <div className="grid min-h-[30vh] place-items-center">
        <Loader2 className="size-5 animate-spin text-muted-foreground" aria-hidden />
      </div>
    );
  }

  const rows = messages.data ?? [];

  return (
    <section>
      <h2 className="font-display text-lg font-semibold">Customer messages</h2>
      <p className="mt-1 text-sm text-muted-foreground">Messages sent through the contact page.</p>

      {rows.length === 0 ? (
        <div className="mt-6 rounded-lg border border-border bg-card p-8 text-center">
          <MailOpen className="mx-auto size-7 text-muted-foreground" aria-hidden />
          <p className="mt-3 text-sm text-muted-foreground">No messages yet.</p>
        </div>
      ) : (
        <ul className="mt-6 space-y-4">
          {rows.map((row) => (
            <MessageCard
              key={row.id}
              row={row}
              pending={save.isPending}
              onSave={(input) => save.mutate({ messageId: row.id, ...input })}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

function MessageCard({
  row,
  pending,
  onSave,
}: {
  row: {
    id: string;
    name: string;
    email: string;
    order_reference: string | null;
    message: string;
    status: string;
    admin_note: string;
    created_at: string;
  };
  pending: boolean;
  onSave: (input: { status?: string; adminNote?: string }) => void;
}) {
  const [note, setNote] = React.useState(row.admin_note ?? "");

  return (
    <li className="rounded-lg border border-border bg-card p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-medium">{row.name}</p>
          <p className="text-sm text-muted-foreground">{row.email}</p>
          {row.order_reference && (
            <p className="mt-1 text-xs text-muted-foreground">Order {row.order_reference}</p>
          )}
        </div>
        <div className="text-right">
          <span className="rounded-full bg-secondary px-2.5 py-1 text-xs capitalize">
            {row.status}
          </span>
          <p className="mt-1 text-xs text-muted-foreground">
            {new Date(row.created_at).toLocaleString()}
          </p>
        </div>
      </div>

      <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">{row.message}</p>

      <Textarea
        value={note}
        rows={2}
        placeholder="Internal note"
        className="mt-4 bg-background"
        onChange={(event) => setNote(event.target.value)}
      />

      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <Button
          size="sm"
          variant="outline"
          className="w-full sm:w-auto"
          disabled={pending}
          onClick={() => onSave({ adminNote: note })}
        >
          Save note
        </Button>
        {STATUSES.filter((status) => status !== row.status).map((status) => (
          <Button
            key={status}
            size="sm"
            variant="secondary"
            className="w-full capitalize sm:w-auto"
            disabled={pending}
            onClick={() => onSave({ status, adminNote: note })}
          >
            Mark {status}
          </Button>
        ))}
      </div>
    </li>
  );
}
