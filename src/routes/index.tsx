import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Clock3, MapPin, ShieldCheck, Snowflake, Star, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ProductCard } from "@/components/site/ProductCard";
import {
  deliveryAreasQuery,
  productsQuery,
  reviewsQuery,
  settingsQuery,
} from "@/lib/shop-data";
import { brl } from "@/lib/format";
import hero from "@/assets/hero.jpg.asset.json";

const title = "O Ponto do Geladinho Gourmet | Delivery em Indaiatuba";
const description =
  "Geladinho gourmet artesanal em Indaiatuba. Escolha seus sabores, monte o pedido online e receba em casa.";

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
  const { data: settings } = useQuery(settingsQuery);
  const { data: areas } = useQuery(deliveryAreasQuery);

  const featured = (products ?? [])
    .filter((p) => p.is_available && (p.is_featured || p.is_best_seller))
    .slice(0, 8);
  const activeAreas = (areas ?? []).filter((area) => area.is_active);
  const fees = activeAreas.map((area) => Number(area.delivery_fee));
  const minFee = fees.length ? Math.min(...fees) : null;
  const maxEta = activeAreas
    .map((area) => area.eta_minutes)
    .filter((eta): eta is number => typeof eta === "number" && eta > 0);
  const store = settings?.store;

  return (
    <SiteLayout>
      <section className="relative overflow-hidden bg-cream">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-10 lg:grid-cols-2 lg:px-8 lg:py-20">
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-background px-3 py-2 text-xs font-semibold text-brand-deep shadow-sm">
                🍧 Feito artesanalmente
              </span>
              <span className="rounded-full bg-background px-3 py-2 text-xs font-semibold text-brand-deep shadow-sm">
                📍 Delivery em {store?.city || "Indaiatuba"}
              </span>
            </div>

            <div>
              <p className="eyebrow">O Ponto do Geladinho Gourmet</p>
              <h1 className="mt-2 font-display text-4xl leading-[1.03] font-extrabold text-ink md:text-6xl">
                Seu geladinho favorito, <span className="text-brand-gradient">na sua porta</span>
              </h1>
            </div>

            <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
              Escolha os sabores, monte seu pedido e finalize tudo pelo site. Cremoso, gelado e feito
              com muito capricho para chegar perfeito até você.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="sm:min-w-48">
                <Link to="/cardapio">
                  Pedir agora <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/pedido">Acompanhar pedido</Link>
              </Button>
            </div>

            <div className="grid max-w-xl grid-cols-2 gap-3 pt-2 sm:grid-cols-3">
              <div className="rounded-2xl border border-border/70 bg-background/80 p-3">
                <MapPin className="mb-2 h-4 w-4 text-brand-deep" />
                <p className="text-xs text-muted-foreground">Região</p>
                <p className="text-sm font-bold text-ink">{store?.city || "Indaiatuba"} - SP</p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-background/80 p-3">
                <Truck className="mb-2 h-4 w-4 text-brand-deep" />
                <p className="text-xs text-muted-foreground">Entrega</p>
                <p className="text-sm font-bold text-ink">
                  {minFee != null ? `A partir de ${brl(minFee)}` : "Consulte seu bairro"}
                </p>
              </div>
              <div className="col-span-2 rounded-2xl border border-border/70 bg-background/80 p-3 sm:col-span-1">
                <Clock3 className="mb-2 h-4 w-4 text-brand-deep" />
                <p className="text-xs text-muted-foreground">Pedido mínimo</p>
                <p className="text-sm font-bold text-ink">
                  {store && store.min_order > 0 ? brl(store.min_order) : "Sem mínimo geral"}
                </p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-[2rem] shadow-pop">
              <img
                src={hero.url}
                alt="Geladinhos gourmet artesanais coloridos"
                className="aspect-[4/4.4] h-full w-full object-cover lg:aspect-square"
              />
            </div>
            <div className="absolute right-4 bottom-4 left-4 rounded-2xl bg-background/95 p-4 shadow-card backdrop-blur md:right-auto md:max-w-sm">
              <p className="text-xs font-bold tracking-wide text-brand-deep uppercase">Pedido fácil</p>
              <p className="mt-1 text-sm font-semibold text-ink">
                Escolha → adicione ao carrinho → informe seu bairro → finalize o pedido.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-border/60 bg-background">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 py-5 sm:grid-cols-3 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent">
              <Snowflake className="h-5 w-5 text-brand-deep" />
            </div>
            <div>
              <p className="text-sm font-bold text-ink">Sempre bem gelado</p>
              <p className="text-xs text-muted-foreground">Preparado para chegar cremoso até você</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent">
              <Truck className="h-5 w-5 text-brand-deep" />
            </div>
            <div>
              <p className="text-sm font-bold text-ink">Delivery local</p>
              <p className="text-xs text-muted-foreground">
                {activeAreas.length > 0
                  ? `${activeAreas.length} regiões configuradas para entrega`
                  : "Taxa calculada conforme sua região"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent">
              <ShieldCheck className="h-5 w-5 text-brand-deep" />
            </div>
            <div>
              <p className="text-sm font-bold text-ink">Pedido acompanhado</p>
              <p className="text-xs text-muted-foreground">Você recebe um código para acompanhar o status</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Favoritos da casa</p>
            <h2 className="font-display text-3xl font-extrabold text-ink">Os mais pedidos</h2>
            <p className="mt-2 text-sm text-muted-foreground">Comece pelos queridinhos dos clientes.</p>
          </div>
          <Button asChild variant="ghost" className="hidden sm:inline-flex">
            <Link to="/cardapio">Ver cardápio completo</Link>
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
        <Button asChild variant="outline" className="mt-6 w-full sm:hidden">
          <Link to="/cardapio">Ver cardápio completo</Link>
        </Button>
      </section>

      <section className="section bg-cream">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid gap-8 rounded-[2rem] border border-border bg-background p-6 shadow-card lg:grid-cols-[1.1fr_0.9fr] lg:p-10">
            <div>
              <p className="eyebrow">Como funciona</p>
              <h2 className="font-display text-3xl font-extrabold text-ink">Do cardápio até a sua porta</h2>
              <p className="mt-3 max-w-xl text-muted-foreground">
                Você monta o pedido pelo celular, escolhe entrega ou retirada quando disponível e
                acompanha o andamento sem precisar ficar perguntando pelo WhatsApp.
              </p>
              <Button asChild size="lg" className="mt-6">
                <Link to="/cardapio">Montar meu pedido</Link>
              </Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {[
                ["1", "Escolha", "Navegue pelos sabores e combos."],
                ["2", "Finalize", "Informe bairro, endereço e pagamento."],
                ["3", "Acompanhe", "Veja o status do pedido pelo site."],
              ].map(([step, label, text]) => (
                <div key={step} className="flex gap-3 rounded-2xl bg-accent/50 p-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand font-bold text-primary-foreground">
                    {step}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-ink">{label}</p>
                    <p className="text-xs text-muted-foreground">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
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
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{r.comment}</p>
                <p className="mt-4 text-sm font-semibold">{r.author_name}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </SiteLayout>
  );
}
