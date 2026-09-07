import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ProductCard } from "@/components/site/ProductCard";
import { categoriesQuery, productsQuery, settingsQuery } from "@/lib/shop-data";
import { brl } from "@/lib/format";
import { cn } from "@/lib/utils";

const title = "Cardápio de geladinhos gourmet | O Ponto do Geladinho Gourmet";
const description =
  "Confira todos os sabores de geladinho gourmet, combos e novidades. Escolha, adicione ao carrinho e receba em casa.";

export const Route = createFileRoute("/cardapio")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
    ],
  }),
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
      const matchesSearch =
        !term ||
        product.name.toLocaleLowerCase("pt-BR").includes(term) ||
        product.description?.toLocaleLowerCase("pt-BR").includes(term) ||
        product.ingredients?.toLocaleLowerCase("pt-BR").includes(term);
      return matchesCategory && matchesSearch;
    });
  }, [products, active, search]);

  const availableCount = (products ?? []).filter((product) => product.is_available).length;
  const store = settings?.store;

  return (
    <SiteLayout>
      <div className="border-b border-border/60 bg-cream">
        <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
          <p className="eyebrow">Delivery em {store?.city || "Indaiatuba"}</p>
          <div className="mt-2 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="font-display text-4xl font-extrabold text-ink">Escolha seus sabores</h1>
              <p className="mt-2 max-w-2xl text-muted-foreground">
                Monte seu pedido do seu jeito. Adicione os sabores ao carrinho e confira a taxa de
                entrega para o seu bairro no checkout.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-medium text-muted-foreground">
              <span className="rounded-full border border-border bg-background px-3 py-2">
                {availableCount} opções disponíveis
              </span>
              {store && store.min_order > 0 && (
                <span className="rounded-full border border-border bg-background px-3 py-2">
                  Pedido mínimo {brl(store.min_order)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <div className="sticky top-[106px] z-30 -mx-4 mb-8 border-y border-border/60 bg-background/95 px-4 py-3 backdrop-blur-xl lg:mx-0 lg:rounded-2xl lg:border">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative min-w-0 flex-1">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar sabor, ingrediente ou combo..."
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:max-w-[70%] lg:pb-0">
              <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-muted-foreground">
                <SlidersHorizontal className="h-3.5 w-3.5" /> Filtrar
              </span>
              <button
                onClick={() => setActive("all")}
                className={cn(
                  "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                  active === "all"
                    ? "border-transparent bg-brand text-primary-foreground"
                    : "border-border hover:bg-accent",
                )}
              >
                Todos
              </button>
              {(categories ?? []).map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActive(c.id)}
                  className={cn(
                    "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                    active === c.id
                      ? "border-transparent bg-brand text-primary-foreground"
                      : "border-border hover:bg-accent",
                  )}
                >
                  {c.emoji ? `${c.emoji} ` : ""}
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {list.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>

        {!isLoading && list.length === 0 && (
          <div className="rounded-3xl border border-dashed border-border py-16 text-center">
            <p className="font-display text-xl font-bold text-ink">Nenhum sabor encontrado</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Tente outro termo ou escolha uma categoria diferente.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setActive("all");
              }}
              className="mt-4 text-sm font-semibold text-brand-deep hover:underline"
            >
              Limpar filtros
            </button>
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
