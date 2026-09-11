import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { OrderStatus } from "./orders.functions";

async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden");
}

export const getMyAccess = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    const roles = (data ?? []).map((row) => row.role as string);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { count } = await supabaseAdmin
      .from("user_roles")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin");

    return {
      userId: context.userId,
      email: (context.claims["email"] as string | undefined) ?? null,
      roles,
      isAdmin: roles.includes("admin"),
      adminExists: (count ?? 0) > 0,
    };
  });

/** First signed-in user can claim the admin seat while no admin exists yet. */
export const claimAdminSeat = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { count, error } = await supabaseAdmin
      .from("user_roles")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin");
    if (error) throw new Error(error.message);
    if ((count ?? 0) > 0) throw new Error("An administrator already exists for this store.");

    const { error: insertError } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: context.userId, role: "admin" });
    if (insertError) throw new Error(insertError.message);

    await supabaseAdmin.from("audit_logs").insert({
      actor_id: context.userId,
      action: "role.admin_claimed",
      entity: "user_roles",
      entity_id: context.userId,
      metadata: {},
    });
    return { ok: true };
  });

export const adminStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const [orders, paid, products, availableKeys] = await Promise.all([
      supabaseAdmin.from("orders").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("orders").select("total").eq("status", "paid"),
      supabaseAdmin.from("products").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("inventory_items").select("id", { count: "exact", head: true }).eq("status", "available"),
    ]);

    const revenue = (paid.data ?? []).reduce((sum, row) => sum + Number(row.total), 0);
    return {
      orderCount: orders.count ?? 0,
      paidCount: (paid.data ?? []).length,
      revenue,
      productCount: products.count ?? 0,
      availableKeys: availableKeys.count ?? 0,
    };
  });

export const adminListOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("orders")
      .select(
        "id, reference, email, status, total, currency, created_at, paid_at, payment_provider, payment_reference, order_items(id, product_name, quantity, unit_price)",
      )
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    return (data ?? []).map((order) => ({
      ...order,
      total: Number(order.total),
      status: order.status as OrderStatus,
      items: order.order_items.map((item) => ({
        id: item.id,
        name: item.product_name,
        quantity: item.quantity,
        unitPrice: Number(item.unit_price),
      })),
    }));
  });

export const adminSetOrderStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { orderId: string; status: OrderStatus }) => ({
    orderId: String(data.orderId),
    status: data.status,
  }))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const allowed: OrderStatus[] = ["pending", "paid", "failed", "refunded", "cancelled"];
    if (!allowed.includes(data.status)) throw new Error("Unknown status.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { error } = await supabaseAdmin
      .from("orders")
      .update({
        status: data.status,
        ...(data.status === "paid" ? { paid_at: new Date().toISOString() } : {}),
      })
      .eq("id", data.orderId);
    if (error) throw new Error(error.message);

    let delivered = 0;
    if (data.status === "paid") {
      const { data: count, error: allocError } = await supabaseAdmin.rpc("allocate_order_inventory", {
        _order_id: data.orderId,
      });
      if (allocError) throw new Error(allocError.message);
      delivered = Number(count ?? 0);
    }

    await supabaseAdmin.from("audit_logs").insert({
      actor_id: context.userId,
      action: "order.status_changed",
      entity: "orders",
      entity_id: data.orderId,
      metadata: { status: data.status, delivered },
    });
    return { ok: true, delivered };
  });

export const adminListProducts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [{ data: products, error }, { data: keys }, { data: categories }] = await Promise.all([
      supabaseAdmin
        .from("products")
        .select("id, name, slug, price, sale_price, currency, stock_status, category_id, product_type, platform")
        .order("name"),
      supabaseAdmin.from("inventory_items").select("product_id, status"),
      supabaseAdmin.from("categories").select("id, name").order("sort_order"),
    ]);
    if (error) throw new Error(error.message);

    const stock = new Map<string, { available: number; delivered: number }>();
    for (const key of keys ?? []) {
      const entry = stock.get(key.product_id) ?? { available: 0, delivered: 0 };
      if (key.status === "available") entry.available += 1;
      if (key.status === "delivered") entry.delivered += 1;
      stock.set(key.product_id, entry);
    }

    return {
      categories: (categories ?? []).map((row) => ({ id: row.id, name: row.name })),
      products: (products ?? []).map((product) => ({
        ...product,
        price: Number(product.price),
        sale_price: product.sale_price === null ? null : Number(product.sale_price),
        availableKeys: stock.get(product.id)?.available ?? 0,
        deliveredKeys: stock.get(product.id)?.delivered ?? 0,
      })),
    };
  });

export const adminUpdateProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: {
      productId: string;
      price: number;
      salePrice: number | null;
      stockStatus: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK" | "PREORDER";
    }) => ({
      productId: String(data.productId),
      price: Math.max(0, Number(data.price)),
      salePrice: data.salePrice === null || data.salePrice === undefined ? null : Math.max(0, Number(data.salePrice)),
      stockStatus: data.stockStatus,
    }),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("products")
      .update({ price: data.price, sale_price: data.salePrice, stock_status: data.stockStatus })
      .eq("id", data.productId);
    if (error) throw new Error(error.message);

    await supabaseAdmin.from("audit_logs").insert({
      actor_id: context.userId,
      action: "product.updated",
      entity: "products",
      entity_id: data.productId,
      metadata: { price: data.price, sale_price: data.salePrice, stock_status: data.stockStatus },
    });
    return { ok: true };
  });

/** Inventory keys are never returned in full — only masked previews. */
export const adminListInventory = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data?: { productId?: string }) => ({ productId: data?.productId ? String(data.productId) : null }))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let query = supabaseAdmin
      .from("inventory_items")
      .select("id, product_id, secret_code, status, delivered_at, created_at, products(name)")
      .order("created_at", { ascending: false })
      .limit(200);
    if (data.productId) query = query.eq("product_id", data.productId);
    const { data: rows, error } = await query;
    if (error) throw new Error(error.message);

    return (rows ?? []).map((row) => ({
      id: row.id,
      productId: row.product_id,
      productName: row.products?.name ?? "Unknown product",
      status: row.status as "available" | "allocated" | "delivered" | "void",
      masked: `${row.secret_code.slice(0, 4)}••••••${row.secret_code.slice(-3)}`,
      deliveredAt: row.delivered_at,
    }));
  });

export const adminAddInventory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { productId: string; codes: string }) => ({
    productId: String(data.productId),
    codes: String(data.codes),
  }))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const codes = data.codes
      .split(/[\n,]/)
      .map((code) => code.trim())
      .filter((code) => code.length >= 4)
      .slice(0, 500);
    if (codes.length === 0) throw new Error("Add at least one code.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("inventory_items")
      .insert(codes.map((code) => ({ product_id: data.productId, secret_code: code })));
    if (error) throw new Error(error.message);

    await supabaseAdmin.from("audit_logs").insert({
      actor_id: context.userId,
      action: "inventory.added",
      entity: "products",
      entity_id: data.productId,
      metadata: { count: codes.length },
    });
    return { added: codes.length };
  });

export const adminListAudit = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("audit_logs")
      .select("id, action, entity, entity_id, metadata, created_at")
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);
    return data ?? [];
  });
