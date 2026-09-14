import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  order_reference: string | null;
  message: string;
  status: string;
  admin_note: string;
  created_at: string;
};

export const submitContactMessage = createServerFn({ method: "POST" })
  .inputValidator(
    (data: { name: string; email: string; orderReference?: string; message: string }) => data,
  )
  .handler(async ({ data }) => {
    const name = String(data.name ?? "")
      .trim()
      .slice(0, 120);
    const email = String(data.email ?? "")
      .trim()
      .slice(0, 200);
    const message = String(data.message ?? "")
      .trim()
      .slice(0, 4000);
    const orderReference =
      String(data.orderReference ?? "")
        .trim()
        .slice(0, 60) || null;

    if (!name || !email.includes("@") || message.length < 5) {
      throw new Error("Please add your name, a valid email address and a short message.");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await (supabaseAdmin as any).from("contact_messages").insert({
      name,
      email,
      message,
      order_reference: orderReference,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden");
}

export const adminListMessages = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await (supabaseAdmin as any)
      .from("contact_messages")
      .select("id, name, email, order_reference, message, status, admin_note, created_at")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return (data ?? []) as ContactMessage[];
  });

export const adminUpdateMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { messageId: string; status?: string; adminNote?: string }) => data)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const patch: Record<string, unknown> = {};
    if (data.status && ["new", "open", "closed"].includes(data.status))
      patch["status"] = data.status;
    if (typeof data.adminNote === "string") patch["admin_note"] = data.adminNote.slice(0, 2000);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await (supabaseAdmin as any)
      .from("contact_messages")
      .update(patch)
      .eq("id", String(data.messageId));
    if (error) throw new Error(error.message);

    await (supabaseAdmin as any).from("audit_logs").insert({
      actor_id: context.userId,
      action: "contact_message.updated",
      entity: "contact_messages",
      entity_id: String(data.messageId),
      metadata: patch,
    });
    return { ok: true };
  });
