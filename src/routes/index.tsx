import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { WhatsAppFab } from "@/components/site/WhatsAppFab";
import {
  Avaliacoes,
  Colecoes,
  Contato,
  CtaFinal,
  Diferenciais,
  Faq,
  Galeria,
  Hero,
  InstagramFeed,
  Lancamentos,
  MaisVendidos,
  Newsletter,
  PorQue,
  Sobre,
} from "@/components/site/Sections";
import { faqs, WHATSAPP_DISPLAY } from "@/lib/site";

const title = "Reizinho Joias | Elegância, Exclusividade e Sofisticação";
const description =
  "Conheça a Reizinho Joias. Joias premium, atendimento personalizado e compra fácil pelo WhatsApp.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
      { property: "og:locale", content: "pt_BR" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "JewelryStore",
          name: "Reizinho Joias",
          description,
          telephone: WHATSAPP_DISPLAY,
          priceRange: "$$",
          address: {
            "@type": "PostalAddress",
            addressLocality: "Macaé",
            addressRegion: "RJ",
            addressCountry: "BR",
          },
          openingHours: ["Mo-Fr 09:00-18:00", "Sa 09:00-13:00"],
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: "5",
            reviewCount: "128",
          },
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
      },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Diferenciais />
        <Colecoes />
        <Lancamentos />
        <MaisVendidos />
        <Galeria />
        <Sobre />
        <PorQue />
        <Avaliacoes />
        <InstagramFeed />
        <Faq />
        <Newsletter />
        <CtaFinal />
        <Contato />
      </main>
      <Footer />
      <WhatsAppFab />
    </>
  );
}
