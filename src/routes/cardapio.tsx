import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ProductCard } from "@/components/site/ProductCard";
import { categoriesQuery, productsQuery } from "@/lib/shop-data";
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
  const [active, setActive] = useState<string | "all">("all");

  const list = (products ?? []).filter((p) => active === "all" || p.category_id === active);

  return (
    <SiteLayout>
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <p className="eyebrow">Cardápio completo</p>
        <h1 className="font-display text-4xl font-extrabold text-ink">Escolha seus sabores</h1>

        <div className="mt-8 flex flex-wrap gap-2">
          <button
            onClick={() => setActive("all")}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
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
                "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
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

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {list.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
        {!isLoading && list.length === 0 && (
          <p className="py-16 text-center text-muted-foreground">
            Nenhum produto cadastrado nesta categoria ainda.
          </p>
        )}
      </div>
    </SiteLayout>
  );
}
