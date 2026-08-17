import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/site/SiteLayout";
import { getOrderByToken } from "@/lib/shop.functions";
import {
  brl,
  formatDateTime,
  ORDER_STATUS_LABEL,
  PAYMENT_METHOD_LABEL,
  PAYMENT_STATUS_LABEL,
} from "@/lib/format";

const STEPS = ["received", "confirmed", "preparing", "out_for_delivery", "delivered"];

export const Route = createFileRoute("/pedido/$token")({
  head: () => ({
    meta: [
      { title: "Status do pedido | O Ponto do Geladinho Gourmet" },
      {
        name: "description",
        content: "Acompanhe em tempo real o preparo e a entrega do seu geladinho gourmet.",
      },
      { property: "og:title", content: "Status do pedido" },
      { property: "og:description", content: "Acompanhe o preparo e a entrega do seu pedido." },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PedidoStatus,
});

function PedidoStatus() {
  const { token } = Route.useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["order", token],
    queryFn: () => getOrderByToken({ data: { token } }),
    refetchInterval: 20000,
  });

  if (isLoading) {
    return (
      <SiteLayout>
        <p className="py-24 text-center text-muted-foreground">Carregando pedido…</p>
      </SiteLayout>
    );
  }

  if (!data) {
    return (
      <SiteLayout>
        <p className="py-24 text-center text-muted-foreground">Pedido não encontrado.</p>
      </SiteLayout>
    );
  }

  const order = data.order as unknown as Record<string, string | number | null>;
  const currentStep = STEPS.indexOf(String(order["status"]));

  return (
    <SiteLayout>
      <div className="mx-auto max-w-2xl space-y-6 px-4 py-12">
        <div className="rounded-3xl border border-border bg-card p-6 shadow-card">
          <p className="eyebrow">Pedido #{String(order["order_number"])}</p>
          <h1 className="font-display text-3xl font-extrabold text-ink">
            {ORDER_STATUS_LABEL[String(order["status"])] ?? "Pedido recebido"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Feito em {formatDateTime(String(order["created_at"]))}
          </p>

          <ol className="mt-6 space-y-3">
            {STEPS.map((step, i) => (
              <li key={step} className="flex items-center gap-3 text-sm">
                <span
                  className={
                    i <= currentStep
                      ? "h-3 w-3 rounded-full bg-brand"
                      : "h-3 w-3 rounded-full bg-border"
                  }
                />
                <span className={i <= currentStep ? "font-semibold" : "text-muted-foreground"}>
                  {ORDER_STATUS_LABEL[step]}
                </span>
              </li>
            ))}
          </ol>
        </div>

        <div className="rounded-3xl border border-border bg-card p-6 shadow-card">
          <h2 className="font-display text-xl font-bold">Itens</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {data.items.map((item, i) => {
              const it = item as unknown as {
                product_name: string;
                quantity: number;
                line_total: number;
              };
              return (
                <li key={i} className="flex justify-between gap-3">
                  <span>
                    {it.quantity}× {it.product_name}
                  </span>
                  <span>{brl(it.line_total)}</span>
                </li>
              );
            })}
          </ul>
          <div className="mt-4 space-y-1 border-t border-border pt-4 text-sm">
            <Row label="Subtotal" value={brl(Number(order["subtotal"]))} />
            {Number(order["discount"]) > 0 && (
              <Row label="Desconto" value={`- ${brl(Number(order["discount"]))}`} />
            )}
            <Row label="Entrega" value={brl(Number(order["delivery_fee"]))} />
            <div className="flex justify-between pt-2 text-base font-bold">
              <span>Total</span>
              <span>{brl(Number(order["total"]))}</span>
            </div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            {PAYMENT_METHOD_LABEL[String(order["payment_method"])]} •{" "}
            {PAYMENT_STATUS_LABEL[String(order["payment_status"])]}
          </p>
        </div>
      </div>
    </SiteLayout>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-muted-foreground">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
