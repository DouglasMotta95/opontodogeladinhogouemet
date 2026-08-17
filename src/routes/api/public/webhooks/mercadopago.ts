import { createFileRoute } from "@tanstack/react-router";

/**
 * Webhook do Mercado Pago.
 * URL a cadastrar no painel do Mercado Pago:
 *   https://<seu-dominio>/api/public/webhooks/mercadopago
 * Secrets necessários: MERCADOPAGO_ACCESS_TOKEN (consulta oficial do pagamento).
 * O status do pedido só muda quando a própria API do Mercado Pago confirma.
 */
export const Route = createFileRoute("/api/public/webhooks/mercadopago")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const accessToken = process.env["MERCADOPAGO_ACCESS_TOKEN"];
        if (!accessToken) {
          return new Response(JSON.stringify({ error: "gateway_not_configured" }), {
            status: 503,
            headers: { "content-type": "application/json" },
          });
        }

        let body: { data?: { id?: string }; type?: string; action?: string } = {};
        try {
          body = (await request.json()) as typeof body;
        } catch {
          return new Response("invalid body", { status: 400 });
        }

        const paymentId = body.data?.id;
        if (!paymentId) return new Response("ok");

        const lookup = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!lookup.ok) return new Response("payment lookup failed", { status: 502 });

        const payment = (await lookup.json()) as { id: number; status: string };
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        const { data: row } = await supabaseAdmin
          .from("payments")
          .select("id,order_id")
          .eq("external_id", String(payment.id))
          .maybeSingle();
        if (!row) return new Response("ok");

        const mapped: Record<string, string> = {
          approved: "approved",
          rejected: "rejected",
          cancelled: "cancelled",
          refunded: "refunded",
          in_process: "in_process",
          pending: "pending",
        };
        const orderStatus = mapped[payment.status] ?? "pending";

        await supabaseAdmin
          .from("payments")
          .update({ status: payment.status, raw: payment as unknown as Record<string, unknown> })
          .eq("id", (row as { id: string }).id);

        await supabaseAdmin
          .from("orders")
          .update({ payment_status: orderStatus })
          .eq("id", (row as { order_id: string }).order_id);

        await supabaseAdmin.from("notifications").insert({
          order_id: (row as { order_id: string }).order_id,
          channel: "internal",
          event: `payment_${orderStatus}`,
          payload: { payment_id: payment.id },
          status: "queued",
        });

        return new Response("ok");
      },
    },
  },
});
