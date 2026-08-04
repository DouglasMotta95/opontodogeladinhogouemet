import aneis from "@/assets/aneis.jpg";
import aliancas from "@/assets/aliancas.jpg";
import correntes from "@/assets/correntes.jpg";
import pulseiras from "@/assets/pulseiras.jpg";
import brincos from "@/assets/brincos.jpg";
import relogios from "@/assets/relogios.jpg";
import pingentes from "@/assets/pingentes.jpg";
import gallery1 from "@/assets/gallery-1.jpg";
import gallery2 from "@/assets/gallery-2.jpg";
import gallery3 from "@/assets/gallery-3.jpg";
import gallery4 from "@/assets/gallery-4.jpg";

export const WHATSAPP_URL = "https://wa.me/5522992761823";
export const WHATSAPP_DISPLAY = "+55 22 99276-1823";
export const INSTAGRAM_URL = "https://instagram.com/reizinhojoias";
export const FACEBOOK_URL = "https://facebook.com/reizinhojoias";

export function waLink(message: string) {
  return `${WHATSAPP_URL}?text=${encodeURIComponent(message)}`;
}

export type Product = {
  slug: string;
  name: string;
  category: string;
  description: string;
  longDescription: string;
  material: string;
  garantia: string;
  disponibilidade: string;
  caracteristicas: string[];
  image: string;
  gallery: string[];
  tag?: "Lançamento" | "Mais vendido" | "Exclusivo";
};

export const products: Product[] = [
  {
    slug: "anel-solitario-aurora",
    name: "Anel Solitário Aurora",
    category: "Anéis",
    description: "Solitário clássico com zircônia de lapidação brilhante em ouro 18k.",
    longDescription:
      "Um solitário atemporal, desenhado para durar gerações. As garras foram polidas à mão para elevar o brilho da pedra central, enquanto o aro de perfil confortável acompanha o movimento natural do dedo.",
    material: "Ouro 18k / Banho de ouro 18k sobre prata 925",
    garantia: "1 ano contra defeitos de fabricação",
    disponibilidade: "Pronta entrega",
    caracteristicas: [
      "Pedra central de lapidação brilhante",
      "Acabamento polido espelhado",
      "Aro de conforto anatômico",
      "Disponível do aro 12 ao 26",
    ],
    image: aneis,
    gallery: [aneis, gallery1, gallery4],
    tag: "Mais vendido",
  },
  {
    slug: "alianca-eterna",
    name: "Aliança Eterna",
    category: "Alianças",
    description: "Par de alianças em ouro com torção suave e acabamento espelhado.",
    longDescription:
      "Criada para celebrar histórias, a Aliança Eterna combina peso equilibrado, curvatura suave e um brilho profundo que permanece com o tempo. Acompanha estojo especial para presente.",
    material: "Ouro 18k",
    garantia: "1 ano contra defeitos de fabricação",
    disponibilidade: "Sob encomenda • 7 a 12 dias",
    caracteristicas: [
      "Par masculino e feminino",
      "Gravação interna personalizada",
      "Perfil anatômico confortável",
      "Estojo premium incluso",
    ],
    image: aliancas,
    gallery: [aliancas, gallery2, gallery1],
    tag: "Mais vendido",
  },
  {
    slug: "corrente-veneziana-luce",
    name: "Corrente Veneziana Luce",
    category: "Correntes",
    description: "Corrente delicada de elos finos, perfeita para uso diário.",
    longDescription:
      "Leve, discreta e sofisticada. A Veneziana Luce foi pensada para acompanhar você todos os dias, sozinha ou combinada em camadas com outros comprimentos.",
    material: "Ouro 18k / Banho de ouro 18k",
    garantia: "1 ano contra defeitos de fabricação",
    disponibilidade: "Pronta entrega",
    caracteristicas: [
      "Comprimentos de 40 a 70 cm",
      "Fecho reforçado tipo lagosta",
      "Elos soldados um a um",
      "Antialérgica",
    ],
    image: correntes,
    gallery: [correntes, gallery3, gallery2],
    tag: "Lançamento",
  },
  {
    slug: "pulseira-bianca",
    name: "Pulseira Bianca",
    category: "Pulseiras",
    description: "Bracelete trançado com volume suave e brilho intenso.",
    longDescription:
      "Um bracelete de presença marcante e peso confortável. O trançado é modelado peça a peça, resultando em um jogo de luz que muda conforme o movimento.",
    material: "Banho de ouro 18k sobre latão nobre",
    garantia: "1 ano contra defeitos de fabricação",
    disponibilidade: "Pronta entrega",
    caracteristicas: [
      "Ajuste flexível",
      "Acabamento polido à mão",
      "Resistente ao uso diário",
      "Embalagem para presente",
    ],
    image: pulseiras,
    gallery: [pulseiras, gallery1, gallery4],
  },
  {
    slug: "brincos-fiore",
    name: "Brincos Fiore",
    category: "Brincos",
    description: "Brincos florais cravejados, elegantes para o dia e para a noite.",
    longDescription:
      "Inspirados em pétalas, os brincos Fiore reúnem cravação delicada e leveza absoluta. Um clássico moderno que valoriza qualquer produção.",
    material: "Banho de ouro 18k • zircônias cristal",
    garantia: "1 ano contra defeitos de fabricação",
    disponibilidade: "Pronta entrega",
    caracteristicas: [
      "Pino e tarraxa em prata 925",
      "Peso ultraleve",
      "Cravação manual",
      "Hipoalergênico",
    ],
    image: brincos,
    gallery: [brincos, gallery2, gallery3],
    tag: "Lançamento",
  },
  {
    slug: "relogio-imperial-gold",
    name: "Relógio Imperial Gold",
    category: "Relógios",
    description: "Relógio dourado com mostrador negro e pulseira em elos.",
    longDescription:
      "Precisão e presença. O Imperial Gold combina mostrador negro fosco, índices dourados aplicados e caixa de acabamento espelhado — um contraste sóbrio e sofisticado.",
    material: "Aço inoxidável com banho dourado",
    garantia: "12 meses de garantia do fabricante",
    disponibilidade: "Estoque limitado",
    caracteristicas: [
      "Resistente à água 3ATM",
      "Movimento quartzo japonês",
      "Pulseira ajustável",
      "Caixa de 40 mm",
    ],
    image: relogios,
    gallery: [relogios, gallery4, gallery2],
    tag: "Exclusivo",
  },
  {
    slug: "pingente-coracao-amore",
    name: "Pingente Coração Amore",
    category: "Pingentes",
    description: "Pingente coração polido com corrente delicada inclusa.",
    longDescription:
      "Simples, afetivo e eterno. O coração Amore tem superfície espelhada e volume suave, ideal para presentear em datas especiais.",
    material: "Banho de ouro 18k",
    garantia: "1 ano contra defeitos de fabricação",
    disponibilidade: "Pronta entrega",
    caracteristicas: [
      "Corrente de 45 cm inclusa",
      "Superfície polida espelhada",
      "Opção de gravação",
      "Embalagem especial",
    ],
    image: pingentes,
    gallery: [pingentes, gallery2, gallery3],
    tag: "Mais vendido",
  },
];

export const collections = products.map((p) => ({
  slug: p.slug,
  name: p.category,
  image: p.image,
  description: p.description,
}));

export const galleryImages = [
  { src: gallery1, alt: "Modelo usando anéis e pulseira em ouro" },
  { src: gallery2, alt: "Colar de ouro em embalagem premium para presente" },
  { src: gallery3, alt: "Colares em camadas de ouro" },
  { src: gallery4, alt: "Bracelete de ouro cravejado sobre seda" },
];

export const faqs = [
  {
    q: "Os produtos possuem garantia?",
    a: "Sim. Todas as peças possuem garantia de 1 ano contra defeitos de fabricação, e nossos relógios seguem a garantia do fabricante.",
  },
  {
    q: "Vocês enviam para todo o Brasil?",
    a: "Enviamos para todo o território nacional com embalagem protegida, código de rastreio e envio segurado.",
  },
  {
    q: "Como comprar?",
    a: "É simples: escolha a peça desejada e clique em “Comprar pelo WhatsApp”. Nossa equipe faz todo o atendimento de forma personalizada.",
  },
  {
    q: "Como funciona o pagamento?",
    a: "Aceitamos PIX, cartão de crédito em até 12x e transferência bancária. O link de pagamento é enviado com total segurança.",
  },
  {
    q: "Quanto tempo leva a entrega?",
    a: "Peças em pronta entrega saem em até 2 dias úteis. O prazo de transporte varia de 3 a 10 dias úteis conforme a região.",
  },
  {
    q: "Posso comprar pelo WhatsApp?",
    a: "Sim! O WhatsApp é o nosso canal principal de atendimento e compra, com consultoria completa antes da escolha.",
  },
];

export const testimonials = [
  {
    name: "Mariana Costa",
    city: "Macaé • RJ",
    text: "Atendimento impecável do início ao fim. A aliança chegou antes do prazo e a embalagem é um espetáculo à parte.",
    initials: "MC",
  },
  {
    name: "Rafael Andrade",
    city: "Rio de Janeiro • RJ",
    text: "Comprei um relógio e fui surpreendido pela qualidade. Parece uma vitrine de shopping de luxo, mas com atendimento humano.",
    initials: "RA",
  },
  {
    name: "Juliana Prado",
    city: "Campos dos Goytacazes • RJ",
    text: "Já é a terceira peça que compro. Brilho, acabamento e durabilidade que valem cada centavo.",
    initials: "JP",
  },
  {
    name: "Carla Menezes",
    city: "São Paulo • SP",
    text: "Me ajudaram a escolher o presente perfeito pelo WhatsApp. Minha mãe amou o pingente.",
    initials: "CM",
  },
];
