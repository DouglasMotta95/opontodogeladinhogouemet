import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Snowflake, Truck, ShieldCheck, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ProductCard } from "@/components/site/ProductCard";
import { productsQuery, reviewsQuery } from "@/lib/shop-data";
import hero from "@/assets/hero.jpg.asset.json";

const title = "O Ponto do Geladinho Gourmet | Peça online e receba em casa";
const description =
  "Geladinho gourmet artesanal feito com fruta de verdade. Monte seu combo, peça online e receba com entrega rápida.";

export const Route = createFileRoute("/")({
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
  component: Home,
});

function Home() {
  const { data: products } = useQuery(productsQuery);
  const { data: reviews } = useQuery(reviewsQuery);
  const featured = (products ?? []).filter((p) => p.is_featured || p.is_best_seller).slice(0, 8);

  return (
    <SiteLayout>
      <section className="relative overflow-hidden bg-cream">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 lg:grid-cols-2 lg:px-8 lg:py-24">
          <div className="space-y-6">
            <p className="eyebrow">Artesanal • Cremoso • Gelado</p>
            <h1 className="font-display text-4xl leading-[1.05] font-extrabold text-ink md:text-6xl">
              O geladinho gourmet que <span className="text-brand-gradient">derrete o coração</span>
            </h1>
            <p className="max-w-lg text-lg text-muted-foreground">
              Sabores cremosos feitos com fruta de verdade, leite Ninho, Nutella e muito capricho.
              Peça pelo site e receba geladinho na porta da sua casa.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/cardapio">Ver cardápio</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/pedido">Acompanhar pedido</Link>
              </Button>
            </div>
            <div className="flex flex-wrap gap-5 pt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-brand" /> Entrega rápida
              </span>
              <span className="flex items-center gap-2">
                <Snowflake className="h-4 w-4 text-brand" /> Sempre gelado
              </span>
              <span className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-brand" /> Compra segura
              </span>
            </div>
          </div>
          <div className="overflow-hidden rounded-[2rem] shadow-pop">
            <img
              src={hero.url}
              alt="Geladinhos gourmet artesanais coloridos"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      <section className="section mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Favoritos da casa</p>
            <h2 className="font-display text-3xl font-extrabold text-ink">Mais pedidos</h2>
          </div>
          <Button asChild variant="ghost">
            <Link to="/cardapio">Ver tudo</Link>
          </Button>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {(reviews ?? []).length > 0 && (
        <section className="section mx-auto max-w-7xl px-4 lg:px-8">
          <p className="eyebrow">Quem prova, ama</p>
          <h2 className="font-display text-3xl font-extrabold text-ink">Avaliações de clientes</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {(reviews ?? []).slice(0, 3).map((r) => (
              <div key={r.id} className="rounded-3xl border border-border bg-card p-6 shadow-card">
                <div className="flex gap-0.5 text-mango">
                  {Array.from({ length: r.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{r.comment}</p>
                <p className="mt-4 text-sm font-semibold">{r.author_name}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </SiteLayout>
  );
}
