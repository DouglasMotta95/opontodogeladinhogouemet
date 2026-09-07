import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const itemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().min(1).max(99),
});

const orderSchema = z.object({
  name: z.string().trim().min(2).max(80),
  phone: z.string().trim().min(10).max(20),
  fulfillment: z.enum(["delivery", "pickup"]),
  street: z.string().trim().max(120).optional().default(""),
  number: z.string().trim().max(20).optional().default(""),
  complement: z.string().trim().max(80).optional().default(""),
  neighborhood: z.string().trim().max(80).optional().default(""),
  reference: z.string().trim().max(120).optional().default(""),
  notes: z.string().trim().max(400).optional().default(""),
  paymentMethod: z.enum(["pix", "online_card", "cash", "card_on_delivery"]),
  couponCode: z.string().trim().max(40).optional().default(""),
  scheduledFor: z.string().trim().max(40).optional().default(""),
  items: z.array(itemSchema).min(1).max(50),
  utm: z.record(z.string(), z.string()).optional().default({}),
});

export const validateCoupon = createServerFn({ method: "POST" })
  .inputValidator((input: { code: string; subtotal: number }) =>
    z.object({ code: z.string().trim().min(1).max(40), subtotal: z.number().min(0) }).parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: coupon } = await supabaseAdmin
      .from("coupons")
      .select("*")
      .eq("code", data.code.toUpperCase())
      .eq("is_active", true)
      .maybeSingle();

    if (!coupon) return { ok: false as const, message: "Cupom inválido ou inativo." };
    const c = coupon as unknown as {
      discount_type: string;
      discount_value: number;
      min_order: number;
      expires_at: string | null;
      starts_at: string | null;
      usage_limit: number | null;
      usage_count: number;
    };
    const now = Date.now();
    if (c.starts_at && new Date(c.starts_at).getTime() > now)
      return { ok: false as const, message: "Cupom ainda não está válido." };
    if (c.expires_at && new Date(c.expires_at).getTime() < now)
      return { ok: false as const, message: "Cupom expirado." };
    if (c.usage_limit != null && c.usage_count >= c.usage_limit)
      return { ok: false as const, message: "Cupom esgotado." };
    if (data.subtotal < Number(c.min_order))
      return { ok: false as const, message: `Cupom válido a partir de R$ ${Number(c.min_order).toFixed(2)}.` };

    const discount =
      c.discount_type === "percent"
        ? (data.subtotal * Number(c.discount_value)) / 100
        : Number(c.discount_value);

    return {
      ok: true as const,
      code: data.code.toUpperCase(),
      discount: Math.min(Number(discount.toFixed(2)), data.subtotal),
    };
  });

export const createOrder = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => orderSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: settingRows } = await supabaseAdmin
      .from("settings")
      .select("key,value")
      .in("key", ["store", "payments"]);

    const rowMap = Object.fromEntries(
      (settingRows ?? []).map((row) => [
        (row as { key: string }).key,
        (row as { value?: Record<string, unknown> }).value ?? {},
      ]),
    ) as Record<string, Record<string, unknown>>;

    const store = rowMap.store;
    const payments = rowMap.payments;

    if (store && store["accepting_orders"] === false) {
      throw new Error("A loja não está recebendo pedidos no momento.");
    }
    if (data.fulfillment === "pickup" && store && store["pickup_enabled"] === false) {
      throw new Error("A retirada no local está desativada.");
    }

    const paymentEnabled =
      data.paymentMethod === "pix"
        ? payments?.["pix_enabled"] === true
        : data.paymentMethod === "online_card"
          ? payments?.["mercadopago_enabled"] === true
          : data.paymentMethod === "cash"
            ? payments?.["cash_enabled"] !== false
            : payments?.["card_on_delivery_enabled"] !== false;

    if (!paymentEnabled) {
      throw new Error("A forma de pagamento selecionada não está disponível no momento.");
    }

    const ids = data.items.map((i) => i.productId);
    const { data: products, error: prodError } = await supabaseAdmin
      .from("products")
      .select("id,name,price,is_available,stock")
      .in("id", ids);
    if (prodError) throw new Error("Não foi possível validar os produtos.");

    const lines = data.items.map((item) => {
      const product = (products ?? []).find(
        (p) => (p as { id: string }).id === item.productId,
      ) as {
        id: string;
        name: string;
        price: number;
        is_available: boolean;
        stock: number | null;
      } | undefined;
      if (!product) throw new Error("Produto indisponível no carrinho.");
      if (!product.is_available) throw new Error(`${product.name} está esgotado no momento.`);
      if (product.stock != null && item.quantity > Number(product.stock)) {
        throw new Error(`Temos apenas ${product.stock} unidade(s) de ${product.name} disponíveis.`);
      }
      const unit = Number(product.price);
      return {
        product_id: product.id,
        product_name: product.name,
        unit_price: unit,
        quantity: item.quantity,
        line_total: Number((unit * item.quantity).toFixed(2)),
      };
    });

    const subtotal = Number(lines.reduce((acc, l) => acc + l.line_total, 0).toFixed(2));
    const storeMinOrder = Number(store?.["min_order"] ?? 0);
    if (storeMinOrder > 0 && subtotal < storeMinOrder) {
      throw new Error(`O pedido mínimo da loja é de R$ ${storeMinOrder.toFixed(2)}.`);
    }

    let deliveryFee = 0;
    let areaId: string | null = null;
    if (data.fulfillment === "delivery") {
      const { data: areas } = await supabaseAdmin
        .from("delivery_areas")
        .select("*")
        .eq("is_active", true);
      const area = (areas ?? []).find(
        (a) =>
          (a as { neighborhood: string }).neighborhood.trim().toLowerCase() ===
          data.neighborhood.trim().toLowerCase(),
      ) as { id: string; delivery_fee: number; min_order: number } | undefined;
      const restrict = !store || store["restrict_delivery_area"] !== false;
      if (!area && restrict && (areas ?? []).length > 0) {
        throw new Error("Desculpe, ainda não realizamos entregas nessa região.");
      }
      if (area) {
        areaId = area.id;
        deliveryFee = Number(area.delivery_fee);
        if (subtotal < Number(area.min_order)) {
          throw new Error(
            `O pedido mínimo para esse bairro é de R$ ${Number(area.min_order).toFixed(2)}.`,
          );
        }
      }
      if (!data.street || !data.number || !data.neighborhood) {
        throw new Error("Informe o endereço completo para entrega.");
      }
    }

    let discount = 0;
    let couponCode: string | null = null;
    if (data.couponCode) {
      const result = await validateCoupon({
        data: { code: data.couponCode, subtotal },
      });
      if (result.ok) {
        discount = result.discount;
        couponCode = result.code;
      }
    }

    const total = Number(Math.max(subtotal - discount + deliveryFee, 0).toFixed(2));
    const phoneDigits = data.phone.replace(/\D/g, "");

    const { data: existingCustomer } = await supabaseAdmin
      .from("customers")
      .select("id,orders_count,total_spent,addresses")
      .eq("phone", phoneDigits)
      .maybeSingle();

    let customerId: string | null = (existingCustomer as { id?: string } | null)?.id ?? null;
    const address = {
      street: data.street,
      number: data.number,
      complement: data.complement,
      neighborhood: data.neighborhood,
      reference: data.reference,
    };

    if (!customerId) {
      const { data: created } = await supabaseAdmin
        .from("customers")
        .insert({
          name: data.name,
          phone: phoneDigits,
          addresses: data.fulfillment === "delivery" ? [address] : [],
        })
        .select("id")
        .single();
      customerId = (created as { id?: string } | null)?.id ?? null;
    }

    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        customer_id: customerId,
        customer_name: data.name,
        customer_phone: phoneDigits,
        fulfillment: data.fulfillment,
        address_street: data.street || null,
        address_number: data.number || null,
        address_complement: data.complement || null,
        address_neighborhood: data.neighborhood || null,
        address_reference: data.reference || null,
        delivery_area_id: areaId,
        notes: data.notes || null,
        scheduled_for: data.scheduledFor ? new Date(data.scheduledFor).toISOString() : null,
        payment_method: data.paymentMethod,
        payment_status:
          data.paymentMethod === "cash" || data.paymentMethod === "card_on_delivery"
            ? "not_required"
            : "pending",
        subtotal,
        discount,
        delivery_fee: deliveryFee,
        total,
        coupon_code: couponCode,
        utm: data.utm,
      })
      .select("id,order_number,public_token")
      .single();

    if (orderError || !order) throw new Error("Não foi possível registrar o pedido.");
    const created = order as unknown as {
      id: string;
      order_number: number;
      public_token: string;
    };

    await supabaseAdmin
      .from("order_items")
      .insert(lines.map((l) => ({ ...l, order_id: created.id })));

    if (couponCode) {
      const { data: coupon } = await supabaseAdmin
        .from("coupons")
        .select("id,usage_count")
        .eq("code", couponCode)
        .maybeSingle();
      if (coupon) {
        await supabaseAdmin
          .from("coupons")
          .update({ usage_count: ((coupon as { usage_count: number }).usage_count ?? 0) + 1 })
          .eq("id", (coupon as { id: string }).id);
      }
    }

    if (customerId) {
      const prev = existingCustomer as { orders_count?: number; total_spent?: number } | null;
      await supabaseAdmin
        .from("customers")
        .update({
          name: data.name,
          orders_count: (prev?.orders_count ?? 0) + 1,
          total_spent: Number((Number(prev?.total_spent ?? 0) + total).toFixed(2)),
          last_order_at: new Date().toISOString(),
        })
        .eq("id", customerId);
    }

    await supabaseAdmin.from("notifications").insert({
      order_id: created.id,
      channel: "internal",
      event: "order_received",
      payload: { order_number: created.order_number, total },
      status: "queued",
    });

    return { orderNumber: created.order_number, token: created.public_token };
  });

export const getOrderByToken = createServerFn({ method: "POST" })
  .inputValidator((input: { token: string }) =>
    z.object({ token: z.string().trim().min(8).max(80) }).parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: order } = await supabaseAdmin
      .from("orders")
      .select(
        "order_number,public_token,customer_name,fulfillment,address_street,address_number,address_complement,address_neighborhood,address_reference,notes,status,payment_method,payment_status,subtotal,discount,delivery_fee,total,coupon_code,scheduled_for,created_at",
      )
      .eq("public_token", data.token)
      .maybeSingle();
    if (!order) return null;

    const { data: full } = await supabaseAdmin
      .from("orders")
      .select("id")
      .eq("public_token", data.token)
      .single();

    const { data: items } = await supabaseAdmin
      .from("order_items")
      .select("product_name,quantity,unit_price,line_total")
      .eq("order_id", (full as { id: string }).id);

    const { data: payment } = await supabaseAdmin
      .from("payments")
      .select("provider,method,status,qr_code,qr_code_base64,checkout_url,amount")
      .eq("order_id", (full as { id: string }).id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    return { order, items: items ?? [], payment: payment ?? null };
  });
