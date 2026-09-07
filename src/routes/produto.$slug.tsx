import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Minus, Plus, ShieldCheck, ShoppingBag, Truck } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ProductCard } from "@/components/site/ProductCard";
import { productsQuery } from "@/lib/shop-data";
import { useCart } from "@/lib/cart";
import { brl } from "@/lib/format";

export const Route = createFileRoute("/produto/$slug")({
  head: ({ params }) => {
    const name = params.slug.replace(/-/g, " ");
    const title = `Geladinho ${name} | O Ponto do Geladinho Gourmet`;
    const description = `Peça o geladinho gourmet de ${name} online e receba em casa, sempre gelado e cremoso.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "product" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
      ],
    };
  },
  component: ProdutoPage,
});

function ProdutoPage() {
  const { slug } = Route.useParams();
  const { data: products } = useQuery(productsQuery);
  const { add, setOpen } = useCart();
  const [qty, setQty] = useState(1);

  const product = (products ?? []).find((p) => p.slug === slug);
  const related = useMemo(
    () =>
      (products ?? [])
        .filter((p) => p.slug !== slug && p.is_available && p.category_id === product?.category_id)
        .slice(0, 4),
    [products, product?.category_id, slug],
  );

  if (!product) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-3xl px-4 py-24 text-center">
          <h1 className="font-display text-3xl font-bold">Produto não encontrado</h1>
          <p className="mt-2 text-muted-foreground">
            Esse sabor pode ter saído do cardápio ou estar temporariamente indisponível.
          </p>
          <Button asChild className="mt-6">
            <Link to="/cardapio">Voltar ao cardápio</Link>
          </Button>
        </div>
      </SiteLayout>
    );
  }

  const maxQty = product.stock == null ? 99 : Math.max(product.stock, 0);
  const canAdd = product.is_available && maxQty > 0;
  const unitPrice = Number(product.price);
  const totalPrice = unitPrice * qty;

  return (
    <SiteLayout>
      <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8 lg:py-12">
        <Link to="/cardapio" className="text-sm font-semibold text-brand-deep hover:underline">
          ← Voltar ao cardápio
        </Link>

        <div className="mt-5 grid gap-8 lg:grid-cols-2 lg:gap-12">
          <div className="relative overflow-hidden rounded-[2rem] bg-muted shadow-card">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="aspect-square w-full object-cover"
              />
            ) : (
              <div className="flex aspect-square items-center justify-center text-7xl">🍧</div>
            )}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {product.is_best_seller && (
                <span className="rounded-full bg-mango px-3 py-1.5 text-xs font-bold text-ink shadow-sm">
                  Mais vendido
                </span>
              )}
              {product.is_combo && (
                <span className="rounded-full bg-brand px-3 py-1.5 text-xs font-bold text-primary-foreground shadow-sm">
                  Combo {product.combo_units ? `com ${product.combo_units} unidades` : "especial"}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col">
            <div>
              <p className="eyebrow">Feito artesanalmente</p>
              <h1 className="mt-2 font-display text-4xl font-extrabold leading-tight text-ink lg:text-5xl">
                {product.name}
              </h1>
              {product.description && (
                <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{product.description}</p>
              )}
            </div>

            {product.ingredients && (
              <div className="mt-5 rounded-2xl border border-border bg-card p-4">
                <p className="text-xs font-bold tracking-wide text-muted-foreground uppercase">Ingredientes</p>
                <p className="mt-1 text-sm text-foreground">{product.ingredients}</p>
              </div>
            )}

            <div className="mt-6 flex flex-wrap items-end gap-x-3 gap-y-1">
              <span className="text-3xl font-extrabold text-brand-deep">{brl(unitPrice)}</span>
              {product.compare_at_price && Number(product.compare_at_price) > unitPrice && (
                <span className="pb-1 text-sm text-muted-foreground line-through">
                  {brl(Number(product.compare_at_price))}
                </span>
              )}
            </div>

            {product.stock != null && product.stock > 0 && product.stock <= 5 && (
              <p className="mt-2 text-sm font-semibold text-destructive">
                Últimas {product.stock} unidades disponíveis
              </p>
            )}

            <div className="mt-6 rounded-3xl border border-border bg-card p-5 shadow-card">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-ink">Quantidade</p>
                  <p className="text-xs text-muted-foreground">Escolha quantos deseja adicionar</p>
                </div>
                <div className="flex items-center rounded-full border border-border bg-background">
                  <button
                    type="button"
                    className="flex h-10 w-10 items-center justify-center"
                    aria-label="Diminuir quantidade"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    disabled={qty <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-9 text-center font-bold">{qty}</span>
                  <button
                    type="button"
                    className="flex h-10 w-10 items-center justify-center"
                    aria-label="Aumentar quantidade"
                    onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                    disabled={!canAdd || qty >= maxQty}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <Button
                size="lg"
                className="mt-4 w-full justify-between px-5"
                disabled={!canAdd}
                onClick={() => {
                  add(
                    {
                      productId: product.id,
                      name: product.name,
                      slug: product.slug,
                      price: unitPrice,
                      imageUrl: product.image_url,
                    },
                    qty,
                  );
                  toast.success(`${qty}× ${product.name} adicionado ao carrinho`);
                  setOpen(true);
                }}
              >
                <span className="flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4" />
                  {canAdd ? "Adicionar ao carrinho" : "Esgotado"}
                </span>
                {canAdd && <span>{brl(totalPrice)}</span>}
              </Button>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-2xl bg-accent/50 p-3 text-sm">
                <Truck className="h-5 w-5 shrink-0 text-brand-deep" />
                <span>Entrega calculada pelo bairro no checkout</span>
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-accent/50 p-3 text-sm">
                <ShieldCheck className="h-5 w-5 shrink-0 text-brand-deep" />
                <span>Pedido registrado e acompanhado pelo site</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <div className="mx-auto max-w-7xl px-4 pb-16 lg:px-8">
          <p className="eyebrow">Complete seu pedido</p>
          <h2 className="mb-6 font-display text-2xl font-extrabold">Você também vai amar</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </SiteLayout>
  );
}
