import { Link } from "@tanstack/react-router";
import {
  Award,
  BadgeCheck,
  CreditCard,
  Gem,
  Gift,
  HeartHandshake,
  Instagram,
  Mail,
  MapPin,
  Clock,
  Star,
  Truck,
  ShieldCheck,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import heroImg from "@/assets/hero.jpg";
import sobreImg from "@/assets/sobre.jpg";
import { Reveal } from "./Reveal";
import { LuxeLink, WhatsAppCTA } from "./WhatsAppButton";
import {
  faqs,
  galleryImages,
  products,
  testimonials,
  INSTAGRAM_URL,
  WHATSAPP_DISPLAY,
} from "@/lib/site";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "sonner";

export function SectionTitle({
  eyebrow,
  title,
  subtitle,
  center = true,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  center?: boolean;
}) {
  return (
    <Reveal className={center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mt-4 text-4xl leading-[1.1] text-ink md:text-5xl">{title}</h2>
      {subtitle ? (
        <p className="mt-5 text-base leading-relaxed text-muted-foreground">{subtitle}</p>
      ) : null}
      <div className={`hairline mt-7 ${center ? "mx-auto w-40" : "w-40"}`} />
    </Reveal>
  );
}

export function Hero() {
  return (
    <section id="inicio" className="relative isolate overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <img
          src={heroImg}
          alt="Joias de ouro sobre seda branca"
          width={1920}
          height={1280}
          fetchPriority="high"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-r from-background/95 via-background/70 to-background/20" />
        <div className="absolute inset-0 bg-linear-to-t from-background via-transparent to-transparent" />
      </div>

      <div className="mx-auto flex min-h-[88vh] max-w-7xl flex-col justify-center px-4 py-24 lg:px-8">
        <Reveal className="max-w-2xl">
          <p className="eyebrow">Joalheria de alto padrão</p>
          <h1 className="mt-6 text-5xl leading-[1.03] text-ink sm:text-6xl lg:text-7xl">
            Joias que{" "}
            <span className="shimmer inline-block text-gold-gradient">eternizam</span>{" "}
            momentos.
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Elegância, exclusividade e sofisticação para pessoas que valorizam
            qualidade.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <LuxeLink href="#colecoes" size="lg">
              <Sparkles className="h-4 w-4" strokeWidth={1.5} />
              Ver Coleção
            </LuxeLink>
            <WhatsAppCTA
              size="lg"
              variant="outline"
              message="Olá! Gostaria de comprar uma joia da Reizinho Joias."
            />
          </div>
          <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-3 text-xs tracking-[0.18em] text-muted-foreground uppercase">
            <span className="flex items-center gap-2">
              <Star className="h-3.5 w-3.5 fill-gold text-gold" /> +2.000 clientes
            </span>
            <span className="flex items-center gap-2">
              <ShieldCheck className="h-3.5 w-3.5 text-gold" strokeWidth={1.5} /> Compra
              segura
            </span>
            <span className="flex items-center gap-2">
              <Truck className="h-3.5 w-3.5 text-gold" strokeWidth={1.5} /> Todo o Brasil
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

const diferenciais = [
  { icon: HeartHandshake, title: "Atendimento Exclusivo", text: "Consultoria individual para escolher a peça certa." },
  { icon: BadgeCheck, title: "Garantia de Qualidade", text: "Todas as joias com garantia e certificado de origem." },
  { icon: Gem, title: "Produtos Selecionados", text: "Curadoria criteriosa peça por peça." },
  { icon: ShieldCheck, title: "Compra Segura", text: "Pagamento protegido e envio rastreado." },
  { icon: Truck, title: "Envio para Todo Brasil", text: "Embalagem protegida e frete assegurado." },
  { icon: CreditCard, title: "Pagamento Facilitado", text: "PIX, cartão em até 12x e transferência." },
];

export function Diferenciais() {
  return (
    <section className="bg-ivory py-24">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <SectionTitle
          eyebrow="Diferenciais"
          title="Uma experiência de joalheria completa"
          subtitle="Cada detalhe do atendimento à entrega foi pensado para que sua compra seja tão especial quanto a joia."
        />
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {diferenciais.map(({ icon: Icon, title, text }, i) => (
            <Reveal key={title} delay={i * 70}>
              <article className="card-luxe h-full p-8">
                <span className="inline-flex rounded-2xl border border-gold/25 bg-background p-3.5">
                  <Icon className="h-5 w-5 text-gold-deep" strokeWidth={1.4} />
                </span>
                <h3 className="mt-6 text-2xl text-ink">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{text}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductCard({ product, index }: { product: (typeof products)[number]; index: number }) {
  return (
    <Reveal delay={index * 70}>
      <article className="card-luxe group h-full overflow-hidden">
        <Link to="/produtos/$slug" params={{ slug: product.slug }} className="block">
          <div className="zoom-media relative aspect-4/5">
            <img
              src={product.image}
              alt={product.name}
              width={1024}
              height={1280}
              loading="lazy"
              className="h-full w-full object-cover"
            />
            {product.tag ? (
              <span className="absolute top-4 left-4 rounded-full border border-gold/40 bg-background/85 px-3 py-1 text-[0.6rem] tracking-[0.22em] text-gold-deep uppercase backdrop-blur">
                {product.tag}
              </span>
            ) : null}
          </div>
        </Link>
        <div className="space-y-3 p-7">
          <p className="eyebrow">{product.category}</p>
          <h3 className="text-2xl text-ink">{product.name}</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {product.description}
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-3">
            <WhatsAppCTA
              size="sm"
              message={`Olá! Tenho interesse na peça ${product.name} da Reizinho Joias.`}
            >
              Solicitar pelo WhatsApp
            </WhatsAppCTA>
            <Link
              to="/produtos/$slug"
              params={{ slug: product.slug }}
              className="inline-flex items-center gap-1.5 text-xs tracking-[0.18em] text-ink/70 uppercase transition-colors hover:text-gold-deep"
            >
              Detalhes <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </article>
    </Reveal>
  );
}

export function Colecoes() {
  return (
    <section id="colecoes" className="py-24">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <SectionTitle
          eyebrow="Coleções"
          title="Categorias que traduzem sua história"
          subtitle="Anéis, alianças, correntes, pulseiras, brincos, relógios e pingentes — selecionados com o mesmo padrão de exigência."
        />
        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p, i) => (
            <ProductCard key={p.slug} product={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function Lancamentos() {
  const items = products.filter((p) => p.tag === "Lançamento" || p.tag === "Exclusivo");
  return (
    <section id="lancamentos" className="bg-ink py-24 text-background">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="eyebrow text-gold">Lançamentos</p>
          <h2 className="mt-4 text-4xl leading-[1.1] text-background md:text-5xl">
            Coleção exclusiva, recém-chegada
          </h2>
          <p className="mt-5 text-base leading-relaxed text-background/70">
            Peças premium produzidas em quantidade limitada para quem busca algo
            verdadeiramente único.
          </p>
          <div className="hairline mx-auto mt-7 w-40" />
        </Reveal>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {items.map((p, i) => (
            <Reveal key={p.slug} delay={i * 90}>
              <article className="group h-full overflow-hidden rounded-3xl border border-gold/25 bg-background/5">
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
                  <p className="text-[0.65rem] tracking-[0.3em] text-gold uppercase">
                    {p.tag}
                  </p>
                  <h3 className="text-2xl text-background">{p.name}</h3>
                  <p className="text-sm leading-relaxed text-background/65">
                    {p.description}
                  </p>
                  <WhatsAppCTA
                    size="sm"
                    variant="gold"
                    className="mt-2"
                    message={`Olá! Quero saber mais sobre o lançamento ${p.name}.`}
                  />
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function MaisVendidos() {
  const items = products.filter((p) => p.tag === "Mais vendido");
  return (
    <section id="mais-vendidos" className="py-24">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <SectionTitle
          eyebrow="Mais Vendidos"
          title="As favoritas das nossas clientes"
          subtitle="Peças que se tornaram clássicos da casa pela qualidade, brilho e acabamento."
        />
        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p, i) => (
            <ProductCard key={p.slug} product={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function Galeria() {
  return (
    <section id="galeria" className="bg-ivory py-24">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <SectionTitle
          eyebrow="Galeria"
          title="O brilho em cada detalhe"
          subtitle="Registros reais das nossas peças e da experiência Reizinho Joias."
        />
        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {galleryImages.map((img, i) => (
            <Reveal key={img.alt} delay={i * 70}>
              <div className="zoom-media rounded-3xl border border-gold/20 shadow-soft">
                <img
                  src={img.src}
                  alt={img.alt}
                  width={1024}
                  height={1024}
                  loading="lazy"
                  className="aspect-square w-full object-cover"
                />
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Sobre() {
  return (
    <section id="sobre" className="py-24">
      <div className="mx-auto grid max-w-7xl items-center gap-16 px-4 lg:grid-cols-2 lg:px-8">
        <Reveal>
          <div className="zoom-media rounded-[2rem] border border-gold/20 shadow-lift">
            <img
              src={sobreImg}
              alt="Interior da joalheria Reizinho Joias"
              width={1400}
              height={1024}
              loading="lazy"
              className="aspect-4/3 w-full object-cover"
            />
          </div>
        </Reveal>
        <div>
          <SectionTitle
            center={false}
            eyebrow="Sobre nós"
            title="Uma joalheria construída sobre confiança"
          />
          <Reveal delay={120} className="mt-8 space-y-5 text-base leading-relaxed text-muted-foreground">
            <p>
              A Reizinho Joias nasceu do desejo de tornar o luxo acessível sem abrir mão
              da excelência. Selecionamos cada peça com o mesmo cuidado de quem escolhe
              uma joia para a própria família.
            </p>
            <p>
              Nossa curadoria reúne fornecedores reconhecidos, materiais nobres e
              acabamentos que resistem ao tempo. Mas o que realmente nos define é o
              atendimento: humano, atento e presente do primeiro contato ao pós-venda.
            </p>
            <p>
              Mais do que vender joias, criamos memórias. Um pedido de casamento, uma
              conquista, uma data que merece ser marcada para sempre.
            </p>
          </Reveal>
          <Reveal delay={200} className="mt-10">
            <WhatsAppCTA
              variant="gold"
              size="lg"
              message="Olá! Gostaria de conhecer melhor a Reizinho Joias."
            >
              Falar com um consultor
            </WhatsAppCTA>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

const razoes = [
  { icon: HeartHandshake, title: "Atendimento Humanizado" },
  { icon: Gem, title: "Produtos Premium" },
  { icon: Award, title: "Garantia" },
  { icon: Gift, title: "Embalagem Especial" },
  { icon: CreditCard, title: "Compra Fácil" },
  { icon: Sparkles, title: "Atendimento via WhatsApp" },
];

export function PorQue() {
  return (
    <section className="bg-ivory py-24">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <SectionTitle
          eyebrow="Por que escolher"
          title="Por que escolher a Reizinho Joias"
        />
        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {razoes.map(({ icon: Icon, title }, i) => (
            <Reveal key={title} delay={i * 60}>
              <div className="card-luxe flex items-center gap-4 p-6">
                <span className="inline-flex rounded-full border border-gold/25 bg-background p-3">
                  <Icon className="h-5 w-5 text-gold-deep" strokeWidth={1.4} />
                </span>
                <p className="text-lg text-ink">{title}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Avaliacoes() {
  return (
    <section id="avaliacoes" className="overflow-hidden py-24">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <SectionTitle
          eyebrow="Avaliações"
          title="Histórias de quem já brilha conosco"
        />
      </div>
      <div className="mt-16 [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]">
        <div
          className="flex w-max gap-6 px-4"
          style={{ animation: "marquee-x 46s linear infinite" }}
        >
          {[...testimonials, ...testimonials].map((t, i) => (
            <figure
              key={`${t.name}-${i}`}
              className="card-luxe w-[21rem] shrink-0 p-8"
            >
              <div className="flex gap-1 text-gold">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star key={s} className="h-4 w-4 fill-gold" strokeWidth={0} />
                ))}
              </div>
              <blockquote className="mt-5 text-sm leading-relaxed text-muted-foreground">
                “{t.text}”
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gold-gradient text-sm font-medium text-ink">
                  {t.initials}
                </span>
                <span>
                  <span className="block text-sm text-ink">{t.name}</span>
                  <span className="block text-xs text-muted-foreground">{t.city}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

export function InstagramFeed() {
  return (
    <section className="bg-ivory py-24">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <SectionTitle
          eyebrow="Instagram"
          title="@reizinhojoias"
          subtitle="Acompanhe lançamentos, bastidores e inspirações diárias."
        />
        <div className="mt-16 grid grid-cols-2 gap-4 md:grid-cols-4">
          {galleryImages.map((img, i) => (
            <Reveal key={`ig-${i}`} delay={i * 60}>
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="zoom-media group relative block rounded-2xl border border-gold/20 shadow-soft"
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  width={1024}
                  height={1024}
                  loading="lazy"
                  className="aspect-square w-full object-cover"
                />
                <span className="absolute inset-0 flex items-center justify-center bg-ink/0 opacity-0 transition-all duration-500 group-hover:bg-ink/35 group-hover:opacity-100">
                  <Instagram className="h-7 w-7 text-background" strokeWidth={1.4} />
                </span>
              </a>
            </Reveal>
          ))}
        </div>
        <Reveal delay={120} className="mt-12 text-center">
          <LuxeLink href={INSTAGRAM_URL} external variant="outline" size="lg">
            <Instagram className="h-4 w-4" strokeWidth={1.5} />
            Seguir no Instagram
          </LuxeLink>
        </Reveal>
      </div>
    </section>
  );
}

export function Faq() {
  return (
    <section id="faq" className="py-24">
      <div className="mx-auto max-w-3xl px-4 lg:px-8">
        <SectionTitle eyebrow="FAQ" title="Perguntas frequentes" />
        <Reveal delay={100} className="mt-14">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((item, i) => (
              <AccordionItem
                key={item.q}
                value={`item-${i}`}
                className="border-b border-gold/20"
              >
                <AccordionTrigger className="py-6 text-left font-sans text-base text-ink hover:text-gold-deep hover:no-underline">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="pb-6 text-sm leading-relaxed text-muted-foreground">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  );
}

export function Newsletter() {
  return (
    <section className="bg-ivory py-24">
      <div className="mx-auto max-w-3xl px-4 text-center lg:px-8">
        <Reveal>
          <span className="inline-flex rounded-full border border-gold/25 bg-background p-3.5">
            <Mail className="h-5 w-5 text-gold-deep" strokeWidth={1.4} />
          </span>
          <h2 className="mt-6 text-4xl text-ink md:text-5xl">Novidades em primeira mão</h2>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground">
            Receba lançamentos exclusivos e novidades da Reizinho Joias.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.currentTarget;
              toast.success("Cadastro realizado! Em breve você receberá nossas novidades.");
              form.reset();
            }}
            className="mx-auto mt-10 flex max-w-lg flex-col gap-3 sm:flex-row"
          >
            <input
              type="email"
              required
              placeholder="Seu melhor e-mail"
              aria-label="Seu melhor e-mail"
              className="w-full rounded-full border border-gold/30 bg-background px-6 py-4 text-sm text-ink outline-none transition-all duration-300 placeholder:text-muted-foreground focus:border-gold focus:ring-2 focus:ring-gold/25"
            />
            <button
              type="submit"
              className="rounded-full bg-gold-gradient px-8 py-4 text-sm font-medium text-ink shadow-soft transition-all duration-500 hover:-translate-y-0.5 hover:shadow-lift"
            >
              Cadastrar
            </button>
          </form>
        </Reveal>
      </div>
    </section>
  );
}

export function CtaFinal() {
  return (
    <section className="relative isolate overflow-hidden bg-ink py-28 text-background">
      <div className="absolute inset-0 -z-10 opacity-25">
        <img
          src={heroImg}
          alt=""
          aria-hidden="true"
          width={1920}
          height={1280}
          loading="lazy"
          className="h-full w-full object-cover"
        />
      </div>
      <div className="mx-auto max-w-3xl px-4 text-center lg:px-8">
        <Reveal>
          <p className="eyebrow text-gold">Atendimento exclusivo</p>
          <h2 className="mt-6 text-4xl leading-[1.08] text-background md:text-6xl">
            A joia perfeita para momentos inesquecíveis.
          </h2>
          <p className="mt-6 text-lg text-background/70">
            Fale agora com nossa equipe e receba um atendimento personalizado.
          </p>
          <div className="mt-12">
            <WhatsAppCTA
              size="xl"
              variant="gold"
              className="text-lg"
              message="Olá! Quero um atendimento personalizado da Reizinho Joias."
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function Contato() {
  return (
    <section id="contato" className="py-24">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <SectionTitle
          eyebrow="Contato"
          title="Estamos à sua disposição"
          subtitle="Fale conosco pelo canal que preferir. Respondemos rapidamente durante o horário de atendimento."
        />
        <div className="mt-16 grid gap-8 lg:grid-cols-2">
          <Reveal>
            <div className="card-luxe space-y-6 p-9">
              <div className="flex items-start gap-4">
                <MapPin className="mt-1 h-5 w-5 shrink-0 text-gold" strokeWidth={1.4} />
                <div>
                  <p className="text-sm tracking-[0.2em] text-ink uppercase">Endereço</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Macaé — Rio de Janeiro, Brasil
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Clock className="mt-1 h-5 w-5 shrink-0 text-gold" strokeWidth={1.4} />
                <div>
                  <p className="text-sm tracking-[0.2em] text-ink uppercase">Horário</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Segunda a Sexta: 9h às 18h • Sábado: 9h às 13h
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Sparkles className="mt-1 h-5 w-5 shrink-0 text-gold" strokeWidth={1.4} />
                <div>
                  <p className="text-sm tracking-[0.2em] text-ink uppercase">WhatsApp</p>
                  <p className="mt-1 text-sm text-muted-foreground">{WHATSAPP_DISPLAY}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 pt-2">
                <WhatsAppCTA message="Olá! Gostaria de falar com a Reizinho Joias." />
                <LuxeLink href={INSTAGRAM_URL} external variant="outline">
                  <Instagram className="h-4 w-4" strokeWidth={1.5} /> Instagram
                </LuxeLink>
              </div>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div className="h-full overflow-hidden rounded-3xl border border-gold/20 shadow-soft">
              <iframe
                title="Localização Reizinho Joias no Google Maps"
                src="https://www.google.com/maps?q=Maca%C3%A9%2C%20RJ&output=embed"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-full min-h-[22rem] w-full border-0"
              />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
