import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * Integração de pagamento — estrutura real, credenciais pendentes.
 *
 * Mercado Pago: cadastre o secret MERCADOPAGO_ACCESS_TOKEN no painel de secrets
 * do projeto. Enquanto ele não existir, esta função responde `configured: false`
 * e a loja segue com pagamento na entrega, sem simular aprovação.
 *
 * PicPay: preparado no mesmo formato (PICPAY_TOKEN), ainda sem implementação ativa.
 */
export const createPixPayment = createServerFn({ method: "POST" })
  .inputValidator((input: { token: string }) =>
    z.object({ token: z.string().trim().min(8).max(80) }).parse(input),
  )
  .handler(async ({ data }) => {
    const accessToken = process.env["MERCADOPAGO_ACCESS_TOKEN"];
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: order } = await supabaseAdmin
      .from("orders")
      .select("id,order_number,total,customer_name,payment_method,payment_status")
      .eq("public_token", data.token)
      .maybeSingle();
    if (!order) return { configured: false as const, error: "Pedido não encontrado." };
    const o = order as unknown as {
      id: string;
      order_number: number;
      total: number;
      customer_name: string;
    };

    if (!accessToken) {
      return {
        configured: false as const,
        error:
          "Pagamento online ainda não configurado. Cadastre a credencial do Mercado Pago para ativar.",
      };
    }

    const response = await fetch("https://api.mercadopago.com/v1/payments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "X-Idempotency-Key": `${o.id}-pix`,
      },
      body: JSON.stringify({
        transaction_amount: Number(o.total),
        description: `Pedido #${o.order_number}`,
        payment_method_id: "pix",
        payer: { email: `pedido${o.order_number}@example.com`, first_name: o.customer_name },
      }),
    });

    if (!response.ok) {
      return { configured: true as const, error: "Não foi possível gerar o Pix agora." };
    }

    const payload = (await response.json()) as {
      id: number;
      status: string;
      point_of_interaction?: {
        transaction_data?: { qr_code?: string; qr_code_base64?: string; ticket_url?: string };
      };
    };
    const tx = payload.point_of_interaction?.transaction_data;

    await supabaseAdmin.from("payments").insert({
      order_id: o.id,
      provider: "mercadopago",
      method: "pix",
      external_id: String(payload.id),
      status: payload.status,
      amount: Number(o.total),
      qr_code: tx?.qr_code ?? null,
      qr_code_base64: tx?.qr_code_base64 ?? null,
      checkout_url: tx?.ticket_url ?? null,
      raw: payload as unknown as never,
    });

    return {
      configured: true as const,
      status: payload.status,
      qrCode: tx?.qr_code ?? null,
      qrCodeBase64: tx?.qr_code_base64 ?? null,
      ticketUrl: tx?.ticket_url ?? null,
    };
  });
