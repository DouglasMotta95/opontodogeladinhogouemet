import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Minus, Plus, ShoppingBag, Trash2, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useCart } from "@/lib/cart";
import { brl } from "@/lib/format";
import { settingsQuery } from "@/lib/shop-data";

export function CartDrawer() {
  const { items, isOpen, setOpen, setQuantity, remove, subtotal } = useCart();
  const { data: settings } = useQuery(settingsQuery);
  const minOrder = Number(settings?.store.min_order ?? 0);
  const missing = Math.max(minOrder - subtotal, 0);
  const canCheckout = items.length > 0 && missing <= 0 && settings?.store.accepting_orders !== false;

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent className="flex w-full flex-col gap-0 sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-brand-deep" /> Seu carrinho
          </SheetTitle>
          <SheetDescription>
            {items.length > 0
              ? `${items.reduce((acc, item) => acc + item.quantity, 0)} item(ns) no pedido`
              : "Escolha seus sabores favoritos para começar."}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-3 overflow-y-auto px-4 pb-4">
          {items.length === 0 && (
            <div className="flex flex-col items-center py-14 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent">
                <ShoppingBag className="h-6 w-6 text-brand-deep" />
              </div>
              <p className="font-display text-lg font-bold text-ink">Seu carrinho está vazio</p>
              <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                Adicione alguns geladinhos e volte aqui para finalizar a entrega.
              </p>
              <Button asChild className="mt-5" onClick={() => setOpen(false)}>
                <Link to="/cardapio">Ver cardápio</Link>
              </Button>
            </div>
          )}

          {items.map((item) => (
            <div
              key={item.productId}
              className="flex gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm"
            >
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  loading="lazy"
                  className="h-16 w-16 shrink-0 rounded-xl object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-muted text-2xl">
                  🍧
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{item.name}</p>
                <p className="text-xs text-muted-foreground">{brl(item.price)} cada</p>
                <div className="mt-2 flex items-center gap-2">
                  <button
                    type="button"
                    aria-label="Diminuir quantidade"
                    onClick={() => setQuantity(item.productId, item.quantity - 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-border transition-colors hover:bg-accent"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                  <button
                    type="button"
                    aria-label="Aumentar quantidade"
                    onClick={() => setQuantity(item.productId, item.quantity + 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-border transition-colors hover:bg-accent"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    aria-label={`Remover ${item.name}`}
                    onClick={() => remove(item.productId)}
                    className="ml-auto rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <p className="text-sm font-bold text-ink">{brl(item.price * item.quantity)}</p>
            </div>
          ))}
        </div>

        <div className="space-y-3 border-t border-border bg-background p-4">
          {items.length > 0 && minOrder > 0 && (
            <div className="rounded-2xl bg-accent/60 p-3 text-sm">
              {missing > 0 ? (
                <>
                  <p className="font-semibold text-ink">Faltam {brl(missing)} para o pedido mínimo</p>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-background">
                    <div
                      className="h-full rounded-full bg-brand transition-all"
                      style={{ width: `${Math.min((subtotal / minOrder) * 100, 100)}%` }}
                    />
                  </div>
                </>
              ) : (
                <p className="flex items-center gap-2 font-semibold text-ink">
                  <CheckCircle2 className="h-4 w-4 text-brand-deep" /> Pedido mínimo atingido
                </p>
              )}
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Subtotal</span>
            <span className="text-xl font-extrabold text-ink">{brl(subtotal)}</span>
          </div>
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <Truck className="h-3.5 w-3.5" /> A taxa de entrega é calculada pelo bairro no checkout.
          </p>

          {settings?.store.accepting_orders === false && items.length > 0 && (
            <p className="rounded-xl bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">
              A loja não está recebendo novos pedidos neste momento.
            </p>
          )}

          <Button asChild size="lg" className="w-full" disabled={!canCheckout}>
            <Link to="/checkout" onClick={() => setOpen(false)}>
              Ir para entrega e pagamento
            </Link>
          </Button>
          {items.length > 0 && (
            <Button asChild variant="ghost" className="w-full" onClick={() => setOpen(false)}>
              <Link to="/cardapio">Adicionar mais sabores</Link>
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
