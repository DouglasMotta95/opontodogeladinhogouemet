import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, BadgeCheck, Gem, Package, Star } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { WhatsAppFab } from "@/components/site/WhatsAppFab";
import { Reveal } from "@/components/site/Reveal";
import { WhatsAppCTA } from "@/components/site/WhatsAppButton";
import { products, testimonials } from "@/lib/site";

export const Route = createFileRoute("/produtos/$slug")({
  loader: ({ params }) => {
    const product = products.find((p) => p.slug === params.slug);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ params, loaderData }) => {
    const name = loaderData?.product.name ?? "Joia";
    const title = `${name} | Reizinho Joias`;
    const description = loaderData?.product.description ?? "Joias premium Reizinho Joias.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "product" },
        { property: "og:url", content: `/produtos/${params.slug}` },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: `/produtos/${params.slug}` }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name,
            description,
            brand: { "@type": "Brand", name: "Reizinho Joias" },
            material: loaderData?.product.material,
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: "5",
              reviewCount: "42",
            },
          }),
        },
      ],
    };
  },
  component: ProductPage,
});

function ProductPage() {
  const { product } = Route.useLoaderData();
  const [active, setActive] = useState(0);
  const related = products.filter((p) => p.slug !== product.slug).slice(0, 3);

  return (
    <>
      <Header />
      <main className="pb-24">
        <div className="mx-auto max-w-7xl px-4 pt-10 lg:px-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs tracking-[0.2em] text-muted-foreground uppercase transition-colors hover:text-gold-deep"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Voltar
          </Link>
        </div>

        <section className="mx-auto grid max-w-7xl gap-14 px-4 py-12 lg:grid-cols-2 lg:px-8">
          <Reveal>
            <div className="zoom-media rounded-[2rem] border border-gold/20 shadow-lift">
              <img
                src={product.gallery[active] ?? product.image}
                alt={product.name}
                width={1024}
                height={1280}
                className="aspect-4/5 w-full object-cover"
              />
            </div>
            <div className="mt-5 grid grid-cols-3 gap-4">
              {product.gallery.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  aria-label={`Ver imagem ${i + 1}`}
                  className={`overflow-hidden rounded-2xl border transition-all duration-500 ${
                    active === i
                      ? "border-gold shadow-soft"
                      : "border-border hover:border-gold/50"
                  }`}
                >
                  <img
                    src={src}
                    alt={`${product.name} — imagem ${i + 1}`}
                    width={400}
                    height={400}
                    loading="lazy"
                    className="aspect-square w-full object-cover"
                  />
                </button>
              ))}
            </div>
          </Reveal>

          <Reveal delay={120}>
            <p className="eyebrow">{product.category}</p>
            <h1 className="mt-4 text-4xl leading-[1.08] text-ink md:text-5xl">
              {product.name}
            </h1>
            <div className="mt-4 flex items-center gap-2 text-gold">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-gold" strokeWidth={0} />
              ))}
              <span className="ml-2 text-xs tracking-[0.18em] text-muted-foreground uppercase">
                42 avaliações
              </span>
            </div>

            <p className="mt-7 text-base leading-relaxed text-muted-foreground">
              {product.longDescription}
            </p>

            <ul className="mt-8 space-y-3">
              {product.caracteristicas.map((c) => (
                <li key={c} className="flex items-start gap-3 text-sm text-ink/80">
                  <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-gold" strokeWidth={1.5} />
                  {c}
                </li>
              ))}
            </ul>

            <dl className="mt-9 grid gap-4 sm:grid-cols-3">
              {[
                { icon: Gem, label: "Material", value: product.material },
                { icon: BadgeCheck, label: "Garantia", value: product.garantia },
                { icon: Package, label: "Disponibilidade", value: product.disponibilidade },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="card-luxe p-5">
                  <Icon className="h-4 w-4 text-gold-deep" strokeWidth={1.5} />
                  <dt className="mt-3 text-[0.62rem] tracking-[0.22em] text-muted-foreground uppercase">
                    {label}
                  </dt>
                  <dd className="mt-1.5 text-sm text-ink">{value}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-10">
              <WhatsAppCTA
                size="xl"
                message={`Olá! Quero comprar a peça ${product.name} da Reizinho Joias.`}
              />
            </div>
          </Reveal>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
          <h2 className="text-3xl text-ink">Avaliações de clientes</h2>
          <div className="hairline mt-6 w-40" />
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {testimonials.slice(0, 3).map((t, i) => (
              <Reveal key={t.name} delay={i * 80}>
                <figure className="card-luxe h-full p-7">
                  <div className="flex gap-1 text-gold">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star key={s} className="h-4 w-4 fill-gold" strokeWidth={0} />
                    ))}
                  </div>
                  <blockquote className="mt-4 text-sm leading-relaxed text-muted-foreground">
                    “{t.text}”
                  </blockquote>
                  <figcaption className="mt-5 text-sm text-ink">
                    {t.name}
                    <span className="block text-xs text-muted-foreground">{t.city}</span>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 lg:px-8">
          <h2 className="text-3xl text-ink">Você também pode gostar</h2>
          <div className="hairline mt-6 w-40" />
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p, i) => (
              <Reveal key={p.slug} delay={i * 80}>
                <article className="card-luxe h-full overflow-hidden">
                  <Link to="/produtos/$slug" params={{ slug: p.slug }}>
                    <div className="zoom-media aspect-4/5">
                      <img
                        src={p.image}
                        alt={p.name}
                        width={1024}
                        height={1280}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </Link>
                  <div className="space-y-3 p-7">
                    <p className="eyebrow">{p.category}</p>
                    <h3 className="text-2xl text-ink">{p.name}</h3>
                    <WhatsAppCTA
                      size="sm"
                      message={`Olá! Tenho interesse na peça ${p.name}.`}
                    >
                      Comprar pelo WhatsApp
                    </WhatsAppCTA>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppFab />
    </>
  );
}
