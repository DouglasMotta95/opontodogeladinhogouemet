import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Minus, Plus, ShoppingBag, Trash2, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useCart } from "@/lib/cart";
import { brl } from "@/lib/format";
import { settingsQuery } from "@/lib/shop-data";

export function CartDrawer() {
  const { items, isOpen, setOpen, setQuantity, remove, subtotal } = useCart();
  const { data: settings } = useQuery(settingsQuery);
  const minOrder = Number(settings?.store.min_order ?? 0);
  const missing = Math.max(minOrder - subtotal, 0);
  const canCheckout = items.length > 0 && missing <= 0 && settings?.store.accepting_orders !== false;
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const progress = minOrder > 0 ? Math.min((subtotal / minOrder) * 100, 100) : 100;

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <div className="border-b border-border bg-[#24100d] px-5 py-5 text-white">
          <SheetHeader className="text-left">
            <SheetTitle className="flex items-center gap-2 text-white"><ShoppingBag className="h-5 w-5 text-pink-300" /> Seu pedido</SheetTitle>
            <SheetDescription className="text-white/65">{items.length > 0 ? `${totalItems} ${totalItems === 1 ? "item escolhido" : "itens escolhidos"}` : "Escolha seus sabores favoritos para começar."}</SheetDescription>
          </SheetHeader>
          {items.length > 0 && minOrder > 0 && (
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/10 p-3">
              <div className="flex items-center justify-between gap-3 text-xs font-bold">
                <span>{missing > 0 ? `Faltam ${brl(missing)} para finalizar` : "Pedido mínimo atingido"}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-pink-400 transition-all" style={{ width: `${progress}%` }} /></div>
            </div>
          )}
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto bg-muted/20 p-4">
          {items.length === 0 && (
            <div className="flex min-h-[360px] flex-col items-center justify-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent"><ShoppingBag className="h-7 w-7 text-brand-deep" /></div>
              <p className="font-display text-xl font-black text-ink">Seu carrinho está vazio</p>
              <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">Escolha alguns sabores e monte seu pedido em poucos segundos.</p>
              <Button asChild className="mt-5 rounded-full px-6" onClick={() => setOpen(false)}><Link to="/cardapio">Escolher sabores</Link></Button>
            </div>
          )}

          {items.map((item) => (
            <div key={item.productId} className="flex gap-3 rounded-3xl border border-border/70 bg-card p-3 shadow-sm">
              {item.imageUrl ? <img src={item.imageUrl} alt={item.name} loading="lazy" className="h-20 w-20 shrink-0 rounded-2xl object-cover" /> : <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-cream text-3xl">🍧</div>}
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2"><div className="min-w-0"><p className="truncate text-sm font-black text-ink">{item.name}</p><p className="mt-0.5 text-xs text-muted-foreground">{brl(item.price)} cada</p></div><p className="shrink-0 text-sm font-black text-brand-deep">{brl(item.price * item.quantity)}</p></div>
                <div className="mt-3 flex items-center gap-2">
                  <button type="button" aria-label="Diminuir quantidade" onClick={() => setQuantity(item.productId, item.quantity - 1)} className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background transition-colors hover:bg-accent"><Minus className="h-3.5 w-3.5" /></button>
                  <span className="w-6 text-center text-sm font-black">{item.quantity}</span>
                  <button type="button" aria-label="Aumentar quantidade" onClick={() => setQuantity(item.productId, item.quantity + 1)} className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background transition-colors hover:bg-accent"><Plus className="h-3.5 w-3.5" /></button>
                  <button type="button" aria-label={`Remover ${item.name}`} onClick={() => remove(item.productId)} className="ml-auto rounded-full p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-3 border-t border-border bg-background p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          {items.length > 0 && missing <= 0 && minOrder > 0 && <p className="flex items-center gap-2 rounded-2xl bg-emerald-50 px-3 py-2.5 text-xs font-bold text-emerald-800"><CheckCircle2 className="h-4 w-4" /> Pedido mínimo atingido. Você já pode finalizar.</p>}
          <div className="flex items-end justify-between"><div><p className="text-xs font-semibold text-muted-foreground">Subtotal</p><p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground"><Truck className="h-3.5 w-3.5" /> Entrega calculada no checkout</p></div><span className="text-2xl font-black text-ink">{brl(subtotal)}</span></div>
          {settings?.store.accepting_orders === false && items.length > 0 && <p className="rounded-xl bg-destructive/10 px-3 py-2 text-xs font-bold text-destructive">A loja não está recebendo novos pedidos neste momento.</p>}
          {canCheckout ? <Button asChild size="lg" className="h-13 w-full rounded-2xl text-base font-black"><Link to="/checkout" onClick={() => setOpen(false)}>Finalizar pedido →</Link></Button> : <Button size="lg" className="h-13 w-full rounded-2xl font-black" disabled>{items.length === 0 ? "Adicione itens ao pedido" : missing > 0 ? `Adicione mais ${brl(missing)}` : "Pedidos indisponíveis"}</Button>}
          {items.length > 0 && <Button asChild variant="ghost" className="w-full rounded-xl" onClick={() => setOpen(false)}><Link to="/cardapio">+ Adicionar mais sabores</Link></Button>}
        </div>
      </SheetContent>
    </Sheet>
  );
}
