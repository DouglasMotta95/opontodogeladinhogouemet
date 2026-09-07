import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Check, CreditCard, MapPin, ShoppingBag, UserRound } from "lucide-react";
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
  head: () => ({ meta: [
    { title }, { name: "description", content: description },
    { property: "og:title", content: title }, { property: "og:description", content: description },
    { property: "og:type", content: "website" }, { name: "robots", content: "noindex" },
  ] }),
  component: Checkout,
});

function Checkout() {
  const { items, subtotal, clear } = useCart();
  const navigate = useNavigate();
  const { data: areas } = useQuery(deliveryAreasQuery);
  const { data: settings } = useQuery(settingsQuery);
  const [form, setForm] = useState({ name: "", phone: "", street: "", number: "", complement: "", neighborhood: "", reference: "", notes: "" });
  const [fulfillment, setFulfillment] = useState<"delivery" | "pickup">("delivery");
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "online_card" | "cash" | "card_on_delivery">("cash");
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const area = (areas ?? []).find((a) => a.neighborhood === form.neighborhood);
  const deliveryFee = fulfillment === "delivery" ? (area?.delivery_fee ?? 0) : 0;
  const total = Math.max(subtotal - discount, 0) + deliveryFee;
  const set = (key: keyof typeof form, value: string) => setForm((prev) => ({ ...prev, [key]: value }));
  const payments = settings?.payments;
  const methods = useMemo(() => [
    { id: "pix" as const, label: "Pix", enabled: payments?.pix_enabled === true },
    { id: "online_card" as const, label: "Cartão online", enabled: !!payments?.mercadopago_enabled },
    { id: "cash" as const, label: "Dinheiro na entrega", enabled: payments?.cash_enabled !== false },
    { id: "card_on_delivery" as const, label: "Cartão na entrega", enabled: payments?.card_on_delivery_enabled !== false },
  ].filter((m) => m.enabled), [payments]);

  useEffect(() => { if (methods.length > 0 && !methods.some((m) => m.id === paymentMethod)) setPaymentMethod(methods[0].id); }, [methods, paymentMethod]);
  useEffect(() => { if (settings?.store.pickup_enabled === false && fulfillment === "pickup") setFulfillment("delivery"); }, [settings?.store.pickup_enabled, fulfillment]);

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    const result = await validateCoupon({ data: { code: couponCode, subtotal } });
    if (result.ok) { setDiscount(result.discount); toast.success("Cupom aplicado!"); } else { setDiscount(0); toast.error(result.message); }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return void toast.error("Seu carrinho está vazio.");
    if (settings?.store.accepting_orders === false) return void toast.error("A loja não está recebendo pedidos no momento.");
    if (methods.length === 0) return void toast.error("Nenhuma forma de pagamento está disponível no momento.");
    const minOrder = Number(settings?.store.min_order ?? 0);
    if (minOrder > 0 && subtotal < minOrder) return void toast.error(`O pedido mínimo é de ${brl(minOrder)}.`);
    setSubmitting(true);
    try {
      const result = await createOrder({ data: { ...form, fulfillment, paymentMethod, couponCode, scheduledFor: "", items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })), utm: {} } });
      clear();
      toast.success(`Pedido #${result.orderNumber} recebido!`);
      navigate({ to: "/pedido/$token", params: { token: result.token } });
    } catch (error) { toast.error(error instanceof Error ? error.message : "Não foi possível enviar o pedido."); } finally { setSubmitting(false); }
  };

  const minOrder = Number(settings?.store.min_order ?? 0);
  const belowMinOrder = minOrder > 0 && subtotal < minOrder;

  return (
    <SiteLayout>
      <div className="border-b border-border/60 bg-cream">
        <div className="mx-auto max-w-6xl px-4 py-7">
          <p className="text-xs font-black tracking-[.16em] text-brand-deep uppercase">Finalização segura</p>
          <h1 className="mt-1 font-display text-3xl font-black text-ink md:text-4xl">Finalize seu pedido</h1>
          <div className="mt-5 grid grid-cols-3 gap-2 text-center text-[0.68rem] font-bold text-muted-foreground sm:max-w-lg sm:text-xs">
            <Step icon={<UserRound />} label="Seus dados" /><Step icon={<MapPin />} label="Entrega" /><Step icon={<CreditCard />} label="Pagamento" />
          </div>
        </div>
      </div>

      <form onSubmit={submit} className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[1fr_360px] lg:gap-8 lg:py-10">
        <div className="space-y-5">
          {settings?.store.accepting_orders === false && <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm font-bold text-destructive">A loja está fechada para novos pedidos no momento.</div>}

          <CheckoutSection number="1" title="Seus dados" subtitle="Para identificar e confirmar o pedido">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nome completo" id="name"><Input id="name" required maxLength={80} autoComplete="name" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Seu nome" /></Field>
              <Field label="WhatsApp" id="phone"><Input id="phone" required inputMode="tel" autoComplete="tel" value={form.phone} onChange={(e) => set("phone", maskPhone(e.target.value))} placeholder="(00) 00000-0000" /></Field>
            </div>
          </CheckoutSection>

          <CheckoutSection number="2" title="Como você quer receber?" subtitle="Escolha entrega ou retirada">
            <div className="grid grid-cols-2 gap-2 sm:max-w-md">
              <Choice active={fulfillment === "delivery"} onClick={() => setFulfillment("delivery")}>🚚 Entrega</Choice>
              {settings?.store.pickup_enabled !== false && <Choice active={fulfillment === "pickup"} onClick={() => setFulfillment("pickup")}>🛍️ Retirada</Choice>}
            </div>
            {fulfillment === "delivery" && (
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2"><Label htmlFor="neighborhood">Bairro</Label><select id="neighborhood" required value={form.neighborhood} onChange={(e) => set("neighborhood", e.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-input bg-background px-3 text-sm"><option value="">Selecione seu bairro</option>{(areas ?? []).filter((a) => a.is_active).map((a) => <option key={a.id} value={a.neighborhood}>{a.neighborhood} — {brl(a.delivery_fee)}</option>)}</select>{area && <p className="mt-2 text-xs font-semibold text-brand-deep">Taxa para este bairro: {brl(area.delivery_fee)}</p>}</div>
                <Field label="Rua" id="street"><Input id="street" required autoComplete="street-address" value={form.street} onChange={(e) => set("street", e.target.value)} /></Field>
                <Field label="Número" id="number"><Input id="number" required inputMode="numeric" value={form.number} onChange={(e) => set("number", e.target.value)} /></Field>
                <Field label="Complemento" id="complement"><Input id="complement" value={form.complement} onChange={(e) => set("complement", e.target.value)} placeholder="Apto, bloco..." /></Field>
                <Field label="Ponto de referência" id="reference"><Input id="reference" value={form.reference} onChange={(e) => set("reference", e.target.value)} /></Field>
              </div>
            )}
            <div className="mt-4"><Label htmlFor="notes">Observações <span className="font-normal text-muted-foreground">(opcional)</span></Label><Textarea id="notes" maxLength={400} value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Alguma observação sobre o pedido?" className="mt-1.5" /></div>
          </CheckoutSection>

          <CheckoutSection number="3" title="Pagamento" subtitle="Escolha como prefere pagar">
            <div className="grid gap-2 sm:grid-cols-2">{methods.map((m) => <Choice key={m.id} active={paymentMethod === m.id} onClick={() => setPaymentMethod(m.id)}>{m.label}{paymentMethod === m.id && <Check className="ml-auto h-4 w-4" />}</Choice>)}</div>
            {methods.length === 0 && <p className="mt-3 text-sm font-bold text-destructive">Nenhuma forma de pagamento está habilitada.</p>}
          </CheckoutSection>
        </div>

        <aside className="h-fit rounded-3xl border border-border/70 bg-card shadow-[0_12px_40px_rgba(36,16,13,.08)] lg:sticky lg:top-28">
          <div className="border-b border-border p-5"><div className="flex items-center gap-2"><ShoppingBag className="h-5 w-5 text-brand-deep" /><h2 className="font-display text-xl font-black">Resumo do pedido</h2></div><p className="mt-1 text-xs text-muted-foreground">Confira tudo antes de confirmar.</p></div>
          <div className="space-y-3 p-5">
            <ul className="max-h-56 space-y-3 overflow-y-auto pr-1 text-sm">{items.map((i) => <li key={i.productId} className="flex items-start justify-between gap-3"><div className="min-w-0"><span className="font-bold text-ink">{i.quantity}× {i.name}</span><p className="text-xs text-muted-foreground">{brl(i.price)} cada</p></div><span className="shrink-0 font-bold">{brl(i.price * i.quantity)}</span></li>)}</ul>
            <div className="flex gap-2 border-t border-border pt-4"><Input placeholder="Cupom" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} maxLength={40} className="rounded-xl" /><Button type="button" variant="outline" onClick={applyCoupon} className="rounded-xl">Aplicar</Button></div>
            <div className="space-y-2 border-t border-border pt-4 text-sm text-muted-foreground"><div className="flex justify-between"><span>Subtotal</span><span>{brl(subtotal)}</span></div>{discount > 0 && <div className="flex justify-between text-emerald-700"><span>Desconto</span><span>- {brl(discount)}</span></div>}<div className="flex justify-between"><span>{fulfillment === "delivery" ? "Entrega" : "Retirada"}</span><span>{fulfillment === "delivery" && !form.neighborhood ? "A calcular" : brl(deliveryFee)}</span></div><div className="flex justify-between border-t border-border pt-3 text-lg font-black text-foreground"><span>Total</span><span>{brl(total)}</span></div></div>
            {belowMinOrder && <div className="rounded-2xl bg-accent p-3 text-sm"><p className="font-bold text-ink">Faltam {brl(minOrder - subtotal)} para o pedido mínimo</p><Link to="/cardapio" className="mt-1 inline-block text-xs font-bold text-brand-deep hover:underline">Adicionar mais sabores</Link></div>}
            <Button type="submit" size="lg" className="h-13 w-full rounded-2xl text-base font-black" disabled={submitting || belowMinOrder || methods.length === 0 || settings?.store.accepting_orders === false}>{submitting ? "Enviando pedido…" : `Confirmar pedido • ${brl(total)}`}</Button>
            <p className="text-center text-[0.68rem] leading-relaxed text-muted-foreground">Ao confirmar, seu pedido será registrado e você poderá acompanhar o andamento pelo site.</p>
          </div>
        </aside>
      </form>
    </SiteLayout>
  );
}

function CheckoutSection({ number, title, subtitle, children }: { number: string; title: string; subtitle: string; children: React.ReactNode }) {
  return <section className="rounded-3xl border border-border/70 bg-card p-5 shadow-sm sm:p-6"><div className="mb-5 flex items-start gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand font-black text-primary-foreground">{number}</span><div><h2 className="font-display text-xl font-black text-ink">{title}</h2><p className="text-xs text-muted-foreground">{subtitle}</p></div></div>{children}</section>;
}
function Field({ label, id, children }: { label: string; id: string; children: React.ReactNode }) { return <div><Label htmlFor={id}>{label}</Label><div className="mt-1.5">{children}</div></div>; }
function Choice({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) { return <button type="button" onClick={onClick} className={cn("flex min-h-11 items-center rounded-2xl border px-4 py-2.5 text-left text-sm font-bold transition-all", active ? "border-brand bg-accent text-brand-deep shadow-sm" : "border-border bg-background hover:bg-muted")}>{children}</button>; }
function Step({ icon, label }: { icon: React.ReactNode; label: string }) { return <div className="flex flex-col items-center gap-1.5 rounded-2xl border border-border bg-background px-2 py-3 text-ink shadow-sm"><span className="text-brand-deep [&>svg]:h-4 [&>svg]:w-4">{icon}</span><span>{label}</span></div>; }
