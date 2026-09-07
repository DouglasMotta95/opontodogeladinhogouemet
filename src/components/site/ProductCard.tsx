import { Link } from "@tanstack/react-router";
import { Plus, ShoppingBag, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { brl } from "@/lib/format";
import type { Product } from "@/lib/shop-data";

export function ProductCard({ product }: { product: Product }) {
  const { add, setOpen } = useCart();
  const hasStock = product.stock == null || product.stock > 0;
  const canAdd = product.is_available && hasStock;
  const hasDiscount = product.compare_at_price != null && Number(product.compare_at_price) > Number(product.price);

  const addToCart = () => {
    if (!canAdd) return;
    add({ productId: product.id, name: product.name, slug: product.slug, price: Number(product.price), imageUrl: product.image_url });
    toast.success(`${product.name} adicionado ao carrinho`);
    setOpen(true);
  };

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-border/70 bg-card shadow-[0_10px_35px_rgba(36,16,13,.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-pop">
      <Link to="/produto/$slug" params={{ slug: product.slug }} className="relative block aspect-[4/3] overflow-hidden bg-muted sm:aspect-square">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
        ) : (
          <div className="flex h-full items-center justify-center bg-cream text-5xl">🍧</div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/25 to-transparent" />

        <div className="absolute top-3 left-3 flex max-w-[78%] flex-col gap-1.5">
          {product.is_best_seller && <span className="w-fit rounded-full bg-mango px-3 py-1.5 text-[0.62rem] font-black tracking-wide text-ink uppercase shadow-sm">🔥 Mais vendido</span>}
          {product.is_combo && <span className="w-fit rounded-full bg-brand px-3 py-1.5 text-[0.62rem] font-black tracking-wide text-primary-foreground uppercase shadow-sm">{product.combo_units ? `Combo ${product.combo_units} un.` : "Combo"}</span>}
        </div>

        {product.is_featured && !product.is_best_seller && (
          <span className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-background/95 px-2.5 py-1.5 text-[0.62rem] font-black text-brand-deep shadow-sm backdrop-blur"><Sparkles className="h-3 w-3" /> Destaque</span>
        )}

        {!canAdd && <div className="absolute inset-0 flex items-center justify-center bg-background/75 backdrop-blur-[1px]"><span className="rounded-full bg-background px-4 py-2 text-sm font-black text-ink shadow-card">Esgotado</span></div>}
      </Link>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <Link to="/produto/$slug" params={{ slug: product.slug }} className="min-w-0 flex-1">
            <h3 className="font-display text-lg leading-tight font-black text-ink transition-colors group-hover:text-brand-deep sm:text-xl">{product.name}</h3>
          </Link>
          <div className="shrink-0 text-right">
            <span className="block text-lg font-black text-brand-deep sm:text-xl">{brl(Number(product.price))}</span>
            {hasDiscount && <span className="text-[0.68rem] text-muted-foreground line-through">{brl(Number(product.compare_at_price))}</span>}
          </div>
        </div>

        {product.description && <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-relaxed text-muted-foreground">{product.description}</p>}

        <div className="mt-auto pt-4">
          {product.stock != null && product.stock > 0 && product.stock <= 5 && <p className="mb-2 text-xs font-bold text-destructive">⚡ Últimas {product.stock} unidades</p>}
          <div className="flex items-center gap-2">
            <Button className="h-11 flex-1 rounded-2xl font-bold" onClick={addToCart} disabled={!canAdd}>
              {canAdd ? <><Plus className="h-4 w-4" /> Adicionar</> : <><ShoppingBag className="h-4 w-4" /> Indisponível</>}
            </Button>
            {canAdd && <Button asChild variant="outline" size="icon" className="h-11 w-11 shrink-0 rounded-2xl"><Link to="/produto/$slug" params={{ slug: product.slug }} aria-label={`Ver ${product.name}`}>→</Link></Button>}
          </div>
        </div>
      </div>
    </article>
  );
}
