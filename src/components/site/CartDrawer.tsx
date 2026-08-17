import { Link } from "@tanstack/react-router";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
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

export function CartDrawer() {
  const { items, isOpen, setOpen, setQuantity, remove, subtotal } = useCart();

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent className="flex w-full flex-col gap-0 sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-brand-deep" /> Seu carrinho
          </SheetTitle>
          <SheetDescription>Confira os sabores antes de finalizar.</SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-3 overflow-y-auto px-4">
          {items.length === 0 && (
            <p className="py-12 text-center text-sm text-muted-foreground">
              Seu carrinho está vazio. Escolha seus geladinhos favoritos!
            </p>
          )}
          {items.map((item) => (
            <div
              key={item.productId}
              className="flex gap-3 rounded-2xl border border-border bg-card p-3"
            >
              {item.imageUrl && (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  loading="lazy"
                  className="h-16 w-16 rounded-xl object-cover"
                />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{item.name}</p>
                <p className="text-sm text-muted-foreground">{brl(item.price)}</p>
                <div className="mt-2 flex items-center gap-2">
                  <button
                    aria-label="Diminuir"
                    onClick={() => setQuantity(item.productId, item.quantity - 1)}
                    className="rounded-full border border-border p-1 transition-colors hover:bg-accent"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                  <button
                    aria-label="Aumentar"
                    onClick={() => setQuantity(item.productId, item.quantity + 1)}
                    className="rounded-full border border-border p-1 transition-colors hover:bg-accent"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                  <button
                    aria-label="Remover"
                    onClick={() => remove(item.productId)}
                    className="ml-auto rounded-full p-1 text-muted-foreground transition-colors hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <p className="text-sm font-semibold">{brl(item.price * item.quantity)}</p>
            </div>
          ))}
        </div>

        <div className="space-y-3 border-t border-border p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="text-lg font-bold">{brl(subtotal)}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            A taxa de entrega é calculada no checkout conforme o bairro.
          </p>
          <Button asChild size="lg" className="w-full" disabled={items.length === 0}>
            <Link to="/checkout" onClick={() => setOpen(false)}>
              Finalizar pedido
            </Link>
          </Button>
          <Button variant="ghost" className="w-full" onClick={() => setOpen(false)}>
            Continuar comprando
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
