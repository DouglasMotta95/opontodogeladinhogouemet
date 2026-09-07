import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Clock3, Flame, MapPin, ShieldCheck, Snowflake, Sparkles, Star, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ProductCard } from "@/components/site/ProductCard";
import { deliveryAreasQuery, productsQuery, reviewsQuery, settingsQuery } from "@/lib/shop-data";
import { brl } from "@/lib/format";
import hero from "@/assets/hero.jpg.asset.json";

const title = "O Ponto do Geladinho Gourmet | Delivery em Indaiatuba";
const description = "Geladinho gourmet artesanal em Indaiatuba. Escolha seus sabores, monte o pedido online e receba em casa.";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title }, { name: "description", content: description },
    { property: "og:title", content: title }, { property: "og:description", content: description },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Home,
});

function Home() {
  const { data: products } = useQuery(productsQuery);
  const { data: reviews } = useQuery(reviewsQuery);
  const { data: settings } = useQuery(settingsQuery);
  const { data: areas } = useQuery(deliveryAreasQuery);
  const available = (products ?? []).filter((p) => p.is_available);
  const sensations = ["morango-cravejado", "pudim"].map((slug) => available.find((p) => p.slug === slug)).filter(Boolean) as typeof available;
  const featured = available.filter((p) => p.is_featured || p.is_best_seller).filter((p) => !sensations.some((s) => s.id === p.id)).slice(0, 8);
  const showcase = (featured.length ? featured : available.filter((p) => !sensations.some((s) => s.id === p.id))).slice(0, 8);
  const activeAreas = (areas ?? []).filter((a) => a.is_active);
  const fees = activeAreas.map((a) => Number(a.delivery_fee));
  const minFee = fees.length ? Math.min(...fees) : null;
  const store = settings?.store;
  const minOrder = store?.min_order && store.min_order > 0 ? Number(store.min_order) : 20;

  return <SiteLayout>
    <section className="relative overflow-hidden bg-[#190a08] text-white">
      <div className="absolute inset-0 opacity-30"><img src={hero.url} alt="" className="h-full w-full object-cover" /></div>
      <div className="absolute inset-0 bg-gradient-to-r from-[#160806] via-[#160806]/90 to-[#160806]/35" />
      <div className="relative mx-auto grid min-h-[620px] max-w-7xl items-center gap-10 px-4 py-14 lg:grid-cols-[1.05fr_.95fr] lg:px-8 lg:py-20">
        <div className="max-w-2xl">
          <div className="mb-5 flex flex-wrap gap-2">
            <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold backdrop-blur">🍧 PRODUÇÃO ARTESANAL</span>
            <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold backdrop-blur">📍 {store?.city || "Indaiatuba"} - SP</span>
          </div>
          <p className="mb-2 text-sm font-black tracking-[.2em] text-pink-300 uppercase">O Ponto do Geladinho Gourmet</p>
          <h1 className="font-display text-5xl font-black leading-[.98] md:text-7xl">Sabores que <span className="text-pink-400">apaixonam.</span></h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/75">Geladinhos gourmet cremosos, recheados e preparados com carinho. Escolha seus favoritos e receba sem sair de casa.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="h-14 rounded-full px-8 text-base font-black"><Link to="/cardapio">VER CARDÁPIO <ArrowRight className="h-5 w-5" /></Link></Button>
            <Button asChild size="lg" variant="outline" className="h-14 rounded-full border-white/30 bg-white/10 px-8 text-base font-bold text-white hover:bg-white hover:text-black"><Link to="/pedido">ACOMPANHAR PEDIDO</Link></Button>
          </div>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-white/80">
            <span>✓ Pedido mínimo {brl(minOrder)}</span><span>✓ Delivery local</span><span>✓ Pagamento fácil</span>
          </div>
        </div>
        <div className="hidden lg:block"><div className="ml-auto max-w-md rounded-[2.5rem] border border-white/10 bg-white/10 p-3 shadow-2xl backdrop-blur"><img src={hero.url} alt="Geladinhos gourmet" className="aspect-[4/5] w-full rounded-[2rem] object-cover" /></div></div>
      </div>
    </section>

    <section className="relative z-10 -mt-5 px-4">
      <div className="mx-auto grid max-w-5xl gap-2 rounded-3xl border bg-background p-3 shadow-xl sm:grid-cols-3">
        <Info icon={<MapPin />} label="Onde entregamos" value={`${store?.city || "Indaiatuba"} - SP`} />
        <Info icon={<Truck />} label="Taxa de entrega" value={minFee != null ? `A partir de ${brl(minFee)}` : "Consulte seu bairro"} />
        <Info icon={<Clock3 />} label="Pedido mínimo" value={brl(minOrder)} />
      </div>
    </section>

    {sensations.length > 0 && (
      <section className="mx-auto max-w-7xl px-4 pt-14 lg:px-8">
        <div className="overflow-hidden rounded-[2.25rem] bg-gradient-to-br from-[#fff2f6] via-[#fff8fa] to-[#fff3e8] p-5 shadow-[0_18px_55px_rgba(88,22,36,.08)] sm:p-7 lg:p-9">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div><p className="flex items-center gap-2 text-xs font-black tracking-[.16em] text-brand-deep uppercase"><Flame className="h-4 w-4" /> Sensações do momento</p><h2 className="mt-2 font-display text-3xl font-black text-ink md:text-4xl">Os sabores que todo mundo quer provar.</h2><p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">Morango Cravejado e Pudim estão em destaque por aqui. Se ainda não provou, começa por eles.</p></div>
            <Button asChild variant="outline" className="w-fit rounded-full bg-white"><Link to="/cardapio">Ver cardápio completo</Link></Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">{sensations.map((p) => <ProductCard key={p.id} product={p} />)}</div>
        </div>
      </section>
    )}

    <section className="mx-auto max-w-7xl px-4 py-14 lg:px-8">
      <div className="mb-7 flex items-end justify-between gap-4">
        <div><p className="eyebrow">Escolha seu favorito</p><h2 className="font-display text-3xl font-black text-ink md:text-4xl">Mais sabores para se apaixonar</h2><p className="mt-2 text-muted-foreground">Deslize, escolha e adicione ao seu pedido.</p></div>
        <Button asChild variant="outline" className="hidden rounded-full sm:inline-flex"><Link to="/cardapio">Ver todos</Link></Button>
      </div>
      <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:px-0">
        {showcase.map((p) => <div key={p.id} className="w-[78vw] max-w-[300px] shrink-0 snap-start sm:w-[280px]"><ProductCard product={p} /></div>)}
      </div>
      <Button asChild variant="outline" className="mt-2 w-full rounded-full sm:hidden"><Link to="/cardapio">Ver cardápio completo</Link></Button>
    </section>

    <section className="bg-cream py-14">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="grid gap-5 md:grid-cols-3">
          <Feature icon={<Snowflake />} title="Sempre cremoso" text="Geladinhos preparados para chegar deliciosos até você." />
          <Feature icon={<Sparkles />} title="Feito com carinho" text="Produção artesanal e ingredientes selecionados." />
          <Feature icon={<ShieldCheck />} title="Pedido acompanhado" text="Receba seu código e acompanhe o andamento pelo site." />
        </div>
      </div>
    </section>

    <section className="mx-auto max-w-7xl px-4 py-14 lg:px-8">
      <div className="overflow-hidden rounded-[2rem] bg-[#24100d] p-7 text-white md:p-10">
        <div className="grid items-center gap-8 lg:grid-cols-[1fr_.8fr]">
          <div><p className="text-xs font-black tracking-[.18em] text-pink-300 uppercase">Seu pedido em poucos passos</p><h2 className="mt-2 font-display text-3xl font-black md:text-4xl">Da nossa produção até a sua porta.</h2><p className="mt-3 max-w-xl text-white/70">Escolha os sabores, informe seu bairro e endereço, finalize o pagamento e acompanhe o pedido.</p><Button asChild size="lg" className="mt-6 rounded-full"><Link to="/cardapio">Montar meu pedido <ArrowRight className="h-4 w-4" /></Link></Button></div>
          <div className="grid gap-3">{[["1","Escolha seus sabores"],["2","Finalize o pedido"],["3","Acompanhe a entrega"]].map(([n,t]) => <div key={n} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-500 font-black">{n}</span><span className="font-bold">{t}</span></div>)}</div>
        </div>
      </div>
    </section>

    {(reviews ?? []).length > 0 && <section className="mx-auto max-w-7xl px-4 pb-16 lg:px-8"><p className="eyebrow">Quem prova, ama</p><h2 className="font-display text-3xl font-black text-ink">Avaliações de clientes</h2><div className="mt-7 grid gap-5 md:grid-cols-3">{(reviews ?? []).slice(0,3).map((r) => <div key={r.id} className="rounded-3xl border bg-card p-6 shadow-card"><div className="flex text-mango">{Array.from({length:r.rating}).map((_,i)=><Star key={i} className="h-4 w-4 fill-current" />)}</div><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{r.comment}</p><p className="mt-4 font-bold">{r.author_name}</p></div>)}</div></section>}
  </SiteLayout>;
}

function Info({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) { return <div className="flex items-center gap-3 rounded-2xl p-3"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent text-brand-deep [&>svg]:h-5 [&>svg]:w-5">{icon}</span><div><p className="text-xs text-muted-foreground">{label}</p><p className="font-black text-ink">{value}</p></div></div>; }
function Feature({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) { return <div className="rounded-3xl border bg-background p-6 shadow-sm"><span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-brand-deep [&>svg]:h-6 [&>svg]:w-6">{icon}</span><h3 className="text-lg font-black text-ink">{title}</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p></div>; }
