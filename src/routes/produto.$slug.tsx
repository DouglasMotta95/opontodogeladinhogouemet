import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Flame, Minus, Plus, ShieldCheck, ShoppingBag, Sparkles, Truck } from "lucide-react";
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
    return { meta: [
      { title }, { name: "description", content: description },
      { property: "og:title", content: title }, { property: "og:description", content: description },
      { property: "og:type", content: "product" }, { name: "twitter:card", content: "summary_large_image" },
    ] };
  },
  component: ProdutoPage,
});

function ProdutoPage() {
  const { slug } = Route.useParams();
  const { data: products } = useQuery(productsQuery);
  const { add, setOpen } = useCart();
  const [qty, setQty] = useState(1);
  const product = (products ?? []).find((p) => p.slug === slug);
  const related = useMemo(() => (products ?? [])
    .filter((p) => p.slug !== slug && p.is_available && (p.stock == null || p.stock > 0))
    .sort((a, b) => Number(b.is_best_seller) - Number(a.is_best_seller))
    .slice(0, 4), [products, slug]);

  if (!product) return <SiteLayout><div className="mx-auto max-w-3xl px-4 py-24 text-center"><h1 className="font-display text-3xl font-bold">Produto não encontrado</h1><p className="mt-2 text-muted-foreground">Esse sabor pode ter saído do cardápio ou estar temporariamente indisponível.</p><Button asChild className="mt-6"><Link to="/cardapio">Voltar ao cardápio</Link></Button></div></SiteLayout>;

  const maxQty = product.stock == null ? 99 : Math.max(product.stock, 0);
  const canAdd = product.is_available && maxQty > 0;
  const unitPrice = Number(product.price);
  const totalPrice = unitPrice * qty;
  const sensation = ["morango-cravejado", "pudim"].includes(product.slug);

  const addCurrent = () => {
    if (!canAdd) return;
    add({ productId: product.id, name: product.name, slug: product.slug, price: unitPrice, imageUrl: product.image_url }, qty);
    toast.success(`${qty}× ${product.name} adicionado ao carrinho`);
    setOpen(true);
  };

  return (
    <SiteLayout>
      <div className="mx-auto max-w-6xl px-4 pb-28 pt-7 lg:px-8 lg:py-12">
        <Link to="/cardapio" className="inline-flex rounded-full bg-muted px-3 py-2 text-sm font-bold text-brand-deep hover:bg-accent">← Voltar ao cardápio</Link>

        <div className="mt-5 grid gap-7 lg:grid-cols-[1.03fr_.97fr] lg:gap-12">
          <div className="relative overflow-hidden rounded-[2.25rem] bg-muted shadow-[0_20px_60px_rgba(36,16,13,.12)]">
            {product.image_url ? <img src={product.image_url} alt={product.name} className="aspect-square w-full object-cover" /> : <div className="flex aspect-square items-center justify-center bg-cream text-7xl">🍧</div>}
            <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-black/35 to-transparent" />
            <div className="absolute left-4 top-4 flex flex-col gap-2">
              {sensation && <span className="flex w-fit items-center gap-1.5 rounded-full bg-pink-500 px-3 py-1.5 text-xs font-black text-white shadow-lg"><Flame className="h-3.5 w-3.5" /> Sensação do momento</span>}
              {product.is_best_seller && !sensation && <span className="rounded-full bg-mango px-3 py-1.5 text-xs font-black text-ink shadow-sm">🔥 Mais vendido</span>}
              {product.is_featured && !sensation && !product.is_best_seller && <span className="flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-black text-brand-deep shadow-sm"><Sparkles className="h-3.5 w-3.5" /> Destaque</span>}
            </div>
            {product.stock != null && product.stock > 0 && product.stock <= 5 && <span className="absolute bottom-4 left-4 rounded-full bg-white/95 px-3 py-1.5 text-xs font-black text-destructive shadow-sm">⚡ Últimas {product.stock} unidades</span>}
          </div>

          <div className="flex flex-col justify-center">
            <div>
              <p className="eyebrow">Feito artesanalmente</p>
              <h1 className="mt-2 font-display text-4xl font-black leading-[1.02] text-ink lg:text-6xl">{product.name}</h1>
              {product.description && <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">{product.description}</p>}
            </div>

            <div className="mt-6 flex flex-wrap items-end gap-x-3 gap-y-1">
              <span className="text-4xl font-black text-brand-deep">{brl(unitPrice)}</span>
              <span className="pb-1 text-xs font-semibold text-muted-foreground">por unidade</span>
              {product.compare_at_price && Number(product.compare_at_price) > unitPrice && <span className="pb-1 text-sm text-muted-foreground line-through">{brl(Number(product.compare_at_price))}</span>}
            </div>

            {product.ingredients && <div className="mt-5 rounded-2xl border border-border bg-card p-4"><p className="text-xs font-black tracking-wide text-muted-foreground uppercase">O que vai nele</p><p className="mt-1.5 text-sm leading-relaxed text-foreground">{product.ingredients}</p></div>}

            <div className="mt-6 rounded-[2rem] border border-border/70 bg-card p-5 shadow-[0_12px_40px_rgba(36,16,13,.08)]">
              <div className="flex items-center justify-between gap-4">
                <div><p className="text-sm font-black text-ink">Quantidade</p><p className="text-xs text-muted-foreground">Escolha quantos deseja</p></div>
                <div className="flex items-center rounded-full border border-border bg-background shadow-sm">
                  <button type="button" className="flex h-11 w-11 items-center justify-center" aria-label="Diminuir quantidade" onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1}><Minus className="h-4 w-4" /></button>
                  <span className="w-10 text-center font-black">{qty}</span>
                  <button type="button" className="flex h-11 w-11 items-center justify-center" aria-label="Aumentar quantidade" onClick={() => setQty((q) => Math.min(maxQty, q + 1))} disabled={!canAdd || qty >= maxQty}><Plus className="h-4 w-4" /></button>
                </div>
              </div>
              <Button size="lg" className="mt-4 h-13 w-full justify-between rounded-2xl px-5 text-base font-black" disabled={!canAdd} onClick={addCurrent}><span className="flex items-center gap-2"><ShoppingBag className="h-4 w-4" />{canAdd ? "Adicionar ao pedido" : "Esgotado"}</span>{canAdd && <span>{brl(totalPrice)}</span>}</Button>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-2xl bg-accent/50 p-3 text-sm"><Truck className="h-5 w-5 shrink-0 text-brand-deep" /><span>Entrega calculada pelo bairro</span></div>
              <div className="flex items-center gap-3 rounded-2xl bg-accent/50 p-3 text-sm"><ShieldCheck className="h-5 w-5 shrink-0 text-brand-deep" /><span>Acompanhe seu pedido pelo site</span></div>
            </div>
          </div>
        </div>
      </div>

      {related.length > 0 && <div className="mx-auto max-w-7xl px-4 pb-20 lg:px-8"><p className="eyebrow">Complete seu pedido</p><h2 className="mb-6 font-display text-3xl font-black">Você também vai amar</h2><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{related.map((p) => <ProductCard key={p.id} product={p} />)}</div></div>}

      {canAdd && <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/96 p-3 pb-[max(.75rem,env(safe-area-inset-bottom))] shadow-[0_-12px_35px_rgba(36,16,13,.12)] backdrop-blur-xl lg:hidden"><div className="mx-auto flex max-w-xl items-center gap-3"><div className="min-w-0 flex-1"><p className="truncate text-xs font-bold text-muted-foreground">{qty}× {product.name}</p><p className="text-lg font-black text-brand-deep">{brl(totalPrice)}</p></div><Button className="h-12 rounded-2xl px-5 font-black" onClick={addCurrent}><ShoppingBag className="h-4 w-4" /> Adicionar</Button></div></div>}
    </SiteLayout>
  );
}
