import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type OrderStatus = "pending" | "paid" | "failed" | "refunded" | "cancelled";

export type OrderItemView = {
  id: string;
  productName: string;
  productSlug: string;
  imageKey: string;
  unitPrice: number;
  quantity: number;
  currency: string;
  deliveredCount: number;
};

export type OrderView = {
  id: string;
  reference: string;
  status: OrderStatus;
  total: number;
  currency: string;
  createdAt: string;
  paidAt: string | null;
  items: OrderItemView[];
};

function reference() {
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `NK-${Date.now().toString(36).toUpperCase()}-${random}`;
}

/** Creates a pending order. Prices always come from the database, never the browser. */
export const createOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { items: { productId: string; quantity: number }[]; email?: string }) => ({
    items: (data.items ?? [])
      .map((item) => ({
        productId: String(item.productId),
        quantity: Math.max(1, Math.min(20, Math.floor(Number(item.quantity) || 1))),
      }))
      .slice(0, 50),
    email: data.email ? String(data.email).trim().slice(0, 200) : undefined,
  }))
  .handler(async ({ data, context }) => {
    if (data.items.length === 0) throw new Error("Your cart is empty.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const ids = [...new Set(data.items.map((item) => item.productId))];
    const { data: products, error: productError } = await supabaseAdmin
      .from("products")
      .select("id, name, slug, image_key, price, sale_price, currency, stock_status")
      .in("id", ids);
    if (productError) throw new Error(productError.message);
    if (!products || products.length !== ids.length) throw new Error("A product is no longer available.");

    const email = data.email || (context.claims["email"] as string | undefined) || "";
    if (!email) throw new Error("An email address is required for delivery.");

    let subtotal = 0;
    const lines = data.items.map((item) => {
      const product = products.find((row) => row.id === item.productId)!;
      if (product.stock_status === "OUT_OF_STOCK") throw new Error(`${product.name} is sold out.`);
      const unitPrice = Number(product.sale_price ?? product.price);
      subtotal += unitPrice * item.quantity;
      return {
        product_id: product.id,
        product_name: product.name,
        product_slug: product.slug,
        image_key: product.image_key,
        unit_price: unitPrice,
        quantity: item.quantity,
        currency: product.currency,
      };
    });

    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        reference: reference(),
        user_id: context.userId,
        email,
        status: "pending",
        subtotal,
        total: subtotal,
        currency: lines[0]?.currency ?? "USD",
      })
      .select("id, reference, total, currency, status")
      .single();
    if (orderError) throw new Error(orderError.message);

    const { error: itemsError } = await supabaseAdmin
      .from("order_items")
      .insert(lines.map((line) => ({ ...line, order_id: order.id })));
    if (itemsError) throw new Error(itemsError.message);

    return {
      orderId: order.id,
      reference: order.reference,
      total: Number(order.total),
      currency: order.currency,
      status: order.status as OrderStatus,
    };
  });

/**
 * Confirms payment for an order and releases digital keys.
 * No card provider is connected yet, so the authorization step is simulated here —
 * everything else (status transition, atomic key allocation, audit trail) is real.
 */
export const payOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { orderId: string }) => ({ orderId: String(data.orderId) }))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .select("id, reference, user_id, status, total, currency")
      .eq("id", data.orderId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!order || order.user_id !== context.userId) throw new Error("Order not found.");
    if (order.status === "paid") return { status: "paid" as OrderStatus, delivered: 0, reference: order.reference };
    if (order.status !== "pending") throw new Error("This order can no longer be paid.");

    const paymentReference = `SIM-${Math.random().toString(36).slice(2, 12).toUpperCase()}`;

    const { error: updateError } = await supabaseAdmin
      .from("orders")
      .update({
        status: "paid",
        paid_at: new Date().toISOString(),
        payment_provider: "simulated",
        payment_reference: paymentReference,
      })
      .eq("id", order.id)
      .eq("status", "pending");
    if (updateError) throw new Error(updateError.message);

    const { data: delivered, error: allocError } = await supabaseAdmin.rpc("allocate_order_inventory", {
      _order_id: order.id,
    });
    if (allocError) throw new Error(allocError.message);

    await supabaseAdmin.from("audit_logs").insert({
      actor_id: context.userId,
      action: "order.paid",
      entity: "orders",
      entity_id: order.id,
      metadata: { reference: order.reference, delivered, payment_reference: paymentReference },
    });

    return { status: "paid" as OrderStatus, delivered: Number(delivered ?? 0), reference: order.reference };
  });

export const listMyOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("orders")
      .select(
        "id, reference, status, total, currency, created_at, paid_at, order_items(id, product_name, product_slug, image_key, unit_price, quantity, currency)",
      )
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const itemIds = (data ?? []).flatMap((order) => order.order_items.map((item) => item.id));
    const counts = new Map<string, number>();
    if (itemIds.length > 0) {
      const { data: keys } = await supabaseAdmin
        .from("inventory_items")
        .select("order_item_id")
        .in("order_item_id", itemIds)
        .eq("status", "delivered");
      for (const key of keys ?? []) {
        if (!key.order_item_id) continue;
        counts.set(key.order_item_id, (counts.get(key.order_item_id) ?? 0) + 1);
      }
    }

    return (data ?? []).map<OrderView>((order) => ({
      id: order.id,
      reference: order.reference,
      status: order.status as OrderStatus,
      total: Number(order.total),
      currency: order.currency,
      createdAt: order.created_at,
      paidAt: order.paid_at,
      items: order.order_items.map((item) => ({
        id: item.id,
        productName: item.product_name,
        productSlug: item.product_slug,
        imageKey: item.image_key,
        unitPrice: Number(item.unit_price),
        quantity: item.quantity,
        currency: item.currency,
        deliveredCount: counts.get(item.id) ?? 0,
      })),
    }));
  });

/** Returns the actual codes for one purchased line — owner only, paid orders only. */
export const revealKeys = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { orderItemId: string }) => ({ orderItemId: String(data.orderItemId) }))
  .handler(async ({ data, context }) => {
    const { data: item, error } = await context.supabase
      .from("order_items")
      .select("id, product_name, product_slug, order_id, orders(status, user_id)")
      .eq("id", data.orderItemId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!item || item.orders?.user_id !== context.userId) throw new Error("Not found.");
    if (item.orders?.status !== "paid") throw new Error("Payment for this order is not confirmed yet.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: keys, error: keyError } = await supabaseAdmin
      .from("inventory_items")
      .select("id, secret_code, delivered_at")
      .eq("order_item_id", item.id)
      .eq("status", "delivered");
    if (keyError) throw new Error(keyError.message);

    await supabaseAdmin.from("audit_logs").insert({
      actor_id: context.userId,
      action: "key.revealed",
      entity: "order_items",
      entity_id: item.id,
      metadata: { product: item.product_name },
    });

    const { data: product } = await supabaseAdmin
      .from("products")
      .select("redemption_instructions")
      .eq("slug", item.product_slug)
      .maybeSingle();

    return {
      productName: item.product_name,
      instructions: product?.redemption_instructions ?? null,
      keys: (keys ?? []).map((key) => ({ id: key.id, code: key.secret_code, deliveredAt: key.delivered_at })),
    };
  });
