import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search, SlidersHorizontal, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ProductCard } from "@/components/site/ProductCard";
import { categoriesQuery, productsQuery, settingsQuery } from "@/lib/shop-data";
import { brl } from "@/lib/format";
import { cn } from "@/lib/utils";

const title = "Cardápio de geladinhos gourmet | O Ponto do Geladinho Gourmet";
const description = "Confira todos os sabores de geladinho gourmet, combos e novidades. Escolha, adicione ao carrinho e receba em casa.";

export const Route = createFileRoute("/cardapio")({
  head: () => ({ meta: [
    { title }, { name: "description", content: description },
    { property: "og:title", content: title }, { property: "og:description", content: description },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Cardapio,
});

function Cardapio() {
  const { data: categories } = useQuery(categoriesQuery);
  const { data: products, isLoading } = useQuery(productsQuery);
  const { data: settings } = useQuery(settingsQuery);
  const [active, setActive] = useState<string | "all">("all");
  const [search, setSearch] = useState("");

  const list = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("pt-BR");
    return (products ?? []).filter((product) => {
      const matchesCategory = active === "all" || product.category_id === active;
      const matchesSearch = !term || product.name.toLocaleLowerCase("pt-BR").includes(term) || product.description?.toLocaleLowerCase("pt-BR").includes(term) || product.ingredients?.toLocaleLowerCase("pt-BR").includes(term);
      return matchesCategory && matchesSearch;
    });
  }, [products, active, search]);

  const availableCount = (products ?? []).filter((product) => product.is_available).length;
  const store = settings?.store;

  return (
    <SiteLayout>
      <section className="overflow-hidden border-b border-border/60 bg-[#24100d] text-white">
        <div className="mx-auto max-w-7xl px-4 py-9 lg:px-8 lg:py-12">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-3 flex items-center gap-2 text-xs font-black tracking-[.16em] text-pink-300 uppercase"><Sparkles className="h-4 w-4" /> Cardápio artesanal</div>
              <h1 className="font-display text-4xl font-black leading-tight md:text-5xl">Escolha seus sabores favoritos.</h1>
              <p className="mt-3 text-sm leading-relaxed text-white/70 sm:text-base">Monte seu pedido do seu jeito e veja a taxa de entrega do seu bairro antes de finalizar.</p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-bold">
              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-2">{availableCount} sabores disponíveis</span>
              {store && store.min_order > 0 && <span className="rounded-full border border-white/15 bg-white/10 px-3 py-2">Pedido mínimo {brl(store.min_order)}</span>}
              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-2">📍 {store?.city || "Indaiatuba"}</span>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8 lg:py-8">
        <div className="sticky top-[83px] z-30 -mx-4 mb-7 border-y border-border/60 bg-background/95 px-4 py-3 backdrop-blur-xl md:top-[87px] lg:mx-0 lg:rounded-3xl lg:border lg:p-3 lg:shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative min-w-0 flex-1">
              <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Qual sabor você está procurando?" className="h-11 rounded-2xl bg-muted/40 pl-10" />
            </div>
            <div className="-mx-1 flex items-center gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:max-w-[62%] lg:pb-0">
              <span className="flex shrink-0 items-center gap-1 text-xs font-bold text-muted-foreground"><SlidersHorizontal className="h-3.5 w-3.5" /> Filtros</span>
              <button onClick={() => setActive("all")} className={cn("shrink-0 rounded-full border px-4 py-2 text-sm font-bold transition-all", active === "all" ? "border-transparent bg-brand text-primary-foreground shadow-sm" : "border-border bg-background hover:bg-accent")}>Todos</button>
              {(categories ?? []).map((c) => (
                <button key={c.id} onClick={() => setActive(c.id)} className={cn("shrink-0 rounded-full border px-4 py-2 text-sm font-bold transition-all", active === c.id ? "border-transparent bg-brand text-primary-foreground shadow-sm" : "border-border bg-background hover:bg-accent")}>{c.emoji ? `${c.emoji} ` : ""}{c.name}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-5 flex items-center justify-between gap-3">
          <div><p className="text-xs font-bold tracking-wide text-muted-foreground uppercase">Cardápio</p><h2 className="font-display text-2xl font-black text-ink">{active === "all" ? "Todos os sabores" : categories?.find((c) => c.id === active)?.name || "Sabores"}</h2></div>
          <span className="rounded-full bg-muted px-3 py-1.5 text-xs font-bold text-muted-foreground">{list.length} {list.length === 1 ? "opção" : "opções"}</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{list.map((p) => <ProductCard key={p.id} product={p} />)}</div>

        {!isLoading && list.length === 0 && (
          <div className="rounded-3xl border border-dashed border-border bg-muted/20 py-16 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-accent text-xl">🍧</div>
            <p className="font-display text-xl font-black text-ink">Nenhum sabor encontrado</p>
            <p className="mt-2 text-sm text-muted-foreground">Tente outro nome ou escolha uma categoria diferente.</p>
            <button type="button" onClick={() => { setSearch(""); setActive("all"); }} className="mt-4 text-sm font-bold text-brand-deep hover:underline">Limpar filtros</button>
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
