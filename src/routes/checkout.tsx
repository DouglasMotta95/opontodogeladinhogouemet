import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useCart } from "@/lib/cart";
import { brl, maskPhone } from "@/lib/format";
import { deliveryAreasQuery, settingsQuery } from "@/lib/shop-data";
import { createOrder, validateCoupon } from "@/lib/shop.functions";
import { cn } from "@/lib/utils";

const title = "Checkout | O Ponto do Geladinho Gourmet";
const description = "Finalize seu pedido de geladinho gourmet com entrega ou retirada.";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
    ],
  }),
  component: Checkout,
});

function Checkout() {
  const { items, subtotal, clear } = useCart();
  const navigate = useNavigate();
  const { data: areas } = useQuery(deliveryAreasQuery);
  const { data: settings } = useQuery(settingsQuery);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    reference: "",
    notes: "",
  });
  const [fulfillment, setFulfillment] = useState<"delivery" | "pickup">("delivery");
  const [paymentMethod, setPaymentMethod] = useState<
    "pix" | "online_card" | "cash" | "card_on_delivery"
  >("cash");
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const area = (areas ?? []).find((a) => a.neighborhood === form.neighborhood);
  const deliveryFee = fulfillment === "delivery" ? (area?.delivery_fee ?? 0) : 0;
  const total = Math.max(subtotal - discount, 0) + deliveryFee;

  const set = (key: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const payments = settings?.payments;
  const methods = useMemo(
    () =>
      [
        { id: "pix" as const, label: "Pix", enabled: payments?.pix_enabled === true },
        { id: "online_card" as const, label: "Cartão online", enabled: !!payments?.mercadopago_enabled },
        { id: "cash" as const, label: "Dinheiro na entrega", enabled: payments?.cash_enabled !== false },
        {
          id: "card_on_delivery" as const,
          label: "Cartão na entrega",
          enabled: payments?.card_on_delivery_enabled !== false,
        },
      ].filter((m) => m.enabled),
    [payments],
  );

  useEffect(() => {
    if (methods.length > 0 && !methods.some((m) => m.id === paymentMethod)) {
      setPaymentMethod(methods[0].id);
    }
  }, [methods, paymentMethod]);

  useEffect(() => {
    if (settings?.store.pickup_enabled === false && fulfillment === "pickup") {
      setFulfillment("delivery");
    }
  }, [settings?.store.pickup_enabled, fulfillment]);

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    const result = await validateCoupon({ data: { code: couponCode, subtotal } });
    if (result.ok) {
      setDiscount(result.discount);
      toast.success("Cupom aplicado!");
    } else {
      setDiscount(0);
      toast.error(result.message);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error("Seu carrinho está vazio.");
      return;
    }
    if (settings?.store.accepting_orders === false) {
      toast.error("A loja não está recebendo pedidos no momento.");
      return;
    }
    if (methods.length === 0) {
      toast.error("Nenhuma forma de pagamento está disponível no momento.");
      return;
    }
    const minOrder = Number(settings?.store.min_order ?? 0);
    if (minOrder > 0 && subtotal < minOrder) {
      toast.error(`O pedido mínimo é de ${brl(minOrder)}.`);
      return;
    }

    setSubmitting(true);
    try {
      const result = await createOrder({
        data: {
          ...form,
          fulfillment,
          paymentMethod,
          couponCode,
          scheduledFor: "",
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
          utm: {},
        },
      });
      clear();
      toast.success(`Pedido #${result.orderNumber} recebido!`);
      navigate({ to: "/pedido/$token", params: { token: result.token } });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível enviar o pedido.");
    } finally {
      setSubmitting(false);
    }
  };

  const minOrder = Number(settings?.store.min_order ?? 0);
  const belowMinOrder = minOrder > 0 && subtotal < minOrder;

  return (
    <SiteLayout>
      <form onSubmit={submit} className="mx-auto grid max-w-6xl gap-8 px-4 py-12 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {settings?.store.accepting_orders === false && (
            <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm font-medium text-destructive">
              A loja está fechada para novos pedidos no momento.
            </div>
          )}

          <section className="rounded-3xl border border-border bg-card p-6 shadow-card">
            <h2 className="font-display text-xl font-bold">Seus dados</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="name">Nome completo</Label>
                <Input id="name" required maxLength={80} value={form.name} onChange={(e) => set("name", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="phone">WhatsApp</Label>
                <Input id="phone" required value={form.phone} onChange={(e) => set("phone", maskPhone(e.target.value))} placeholder="(00) 00000-0000" />
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-border bg-card p-6 shadow-card">
            <h2 className="font-display text-xl font-bold">Entrega</h2>
            <div className="mt-4 flex gap-2">
              <button type="button" onClick={() => setFulfillment("delivery")} className={cn("rounded-full border px-4 py-2 text-sm font-medium", fulfillment === "delivery" ? "border-transparent bg-brand text-primary-foreground" : "border-border")}>Entrega</button>
              {settings?.store.pickup_enabled !== false && (
                <button type="button" onClick={() => setFulfillment("pickup")} className={cn("rounded-full border px-4 py-2 text-sm font-medium", fulfillment === "pickup" ? "border-transparent bg-brand text-primary-foreground" : "border-border")}>Retirada</button>
              )}
            </div>

            {fulfillment === "delivery" && (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label htmlFor="neighborhood">Bairro</Label>
                  <select id="neighborhood" required value={form.neighborhood} onChange={(e) => set("neighborhood", e.target.value)} className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                    <option value="">Selecione o bairro</option>
                    {(areas ?? []).filter((a) => a.is_active).map((a) => (
                      <option key={a.id} value={a.neighborhood}>{a.neighborhood} — {brl(a.delivery_fee)}</option>
                    ))}
                  </select>
                </div>
                <div><Label htmlFor="street">Rua</Label><Input id="street" required value={form.street} onChange={(e) => set("street", e.target.value)} /></div>
                <div><Label htmlFor="number">Número</Label><Input id="number" required value={form.number} onChange={(e) => set("number", e.target.value)} /></div>
                <div><Label htmlFor="complement">Complemento</Label><Input id="complement" value={form.complement} onChange={(e) => set("complement", e.target.value)} /></div>
                <div><Label htmlFor="reference">Ponto de referência</Label><Input id="reference" value={form.reference} onChange={(e) => set("reference", e.target.value)} /></div>
              </div>
            )}

            <div className="mt-4"><Label htmlFor="notes">Observações</Label><Textarea id="notes" maxLength={400} value={form.notes} onChange={(e) => set("notes", e.target.value)} /></div>
          </section>

          <section className="rounded-3xl border border-border bg-card p-6 shadow-card">
            <h2 className="font-display text-xl font-bold">Pagamento</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {methods.map((m) => (
                <button key={m.id} type="button" onClick={() => setPaymentMethod(m.id)} className={cn("rounded-full border px-4 py-2 text-sm font-medium", paymentMethod === m.id ? "border-transparent bg-brand text-primary-foreground" : "border-border")}>{m.label}</button>
              ))}
            </div>
            {methods.length === 0 && <p className="mt-3 text-sm text-destructive">Nenhuma forma de pagamento está habilitada.</p>}
          </section>
        </div>

        <aside className="h-fit space-y-4 rounded-3xl border border-border bg-card p-6 shadow-card">
          <h2 className="font-display text-xl font-bold">Resumo</h2>
          <ul className="space-y-2 text-sm">
            {items.map((i) => <li key={i.productId} className="flex justify-between gap-3"><span>{i.quantity}× {i.name}</span><span>{brl(i.price * i.quantity)}</span></li>)}
          </ul>

          <div className="flex gap-2"><Input placeholder="Cupom" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} maxLength={40} /><Button type="button" variant="outline" onClick={applyCoupon}>Aplicar</Button></div>

          <div className="space-y-1 border-t border-border pt-4 text-sm text-muted-foreground">
            <div className="flex justify-between"><span>Subtotal</span><span>{brl(subtotal)}</span></div>
            {discount > 0 && <div className="flex justify-between"><span>Desconto</span><span>- {brl(discount)}</span></div>}
            <div className="flex justify-between"><span>Entrega</span><span>{brl(deliveryFee)}</span></div>
            <div className="flex justify-between pt-2 text-base font-bold text-foreground"><span>Total</span><span>{brl(total)}</span></div>
          </div>

          {belowMinOrder && <p className="rounded-xl bg-muted p-3 text-sm text-muted-foreground">Pedido mínimo: {brl(minOrder)}. Faltam {brl(minOrder - subtotal)}.</p>}

          <Button type="submit" size="lg" className="w-full" disabled={submitting || belowMinOrder || methods.length === 0 || settings?.store.accepting_orders === false}>{submitting ? "Enviando…" : "Confirmar pedido"}</Button>
        </aside>
      </form>
    </SiteLayout>
  );
}
