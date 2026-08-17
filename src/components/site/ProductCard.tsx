import { Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { brl } from "@/lib/format";
import type { Product } from "@/lib/shop-data";

export function ProductCard({ product }: { product: Product }) {
  const { add, setOpen } = useCart();

  const addToCart = () => {
    add({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: Number(product.price),
      imageUrl: product.image_url,
    });
    toast.success(`${product.name} adicionado ao carrinho`);
    setOpen(true);
  };

  return (
    <article className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-card transition-transform duration-500 hover:-translate-y-1">
      <Link
        to="/produto/$slug"
        params={{ slug: product.slug }}
        className="relative block aspect-square overflow-hidden bg-muted"
      >
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl">🍧</div>
        )}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.is_best_seller && (
            <span className="rounded-full bg-mango px-2.5 py-1 text-[0.65rem] font-bold tracking-wide text-ink uppercase">
              Mais vendido
            </span>
          )}
          {product.is_combo && (
            <span className="rounded-full bg-brand px-2.5 py-1 text-[0.65rem] font-bold tracking-wide text-primary-foreground uppercase">
              Combo
            </span>
          )}
        </div>
        {!product.is_available && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/70 text-sm font-semibold">
            Esgotado
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <Link to="/produto/$slug" params={{ slug: product.slug }}>
          <h3 className="font-display text-lg leading-snug font-bold text-ink">{product.name}</h3>
        </Link>
        {product.description && (
          <p className="line-clamp-2 text-sm text-muted-foreground">{product.description}</p>
        )}
        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <div>
            {product.compare_at_price && (
              <span className="mr-2 text-xs text-muted-foreground line-through">
                {brl(product.compare_at_price)}
              </span>
            )}
            <span className="text-lg font-extrabold text-brand-deep">{brl(product.price)}</span>
          </div>
          <Button size="sm" onClick={addToCart} disabled={!product.is_available}>
            <Plus className="h-4 w-4" /> Adicionar
          </Button>
        </div>
      </div>
    </article>
  );
}
