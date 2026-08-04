import { Instagram, Facebook, MapPin, Clock, Phone } from "lucide-react";
import { Link } from "@tanstack/react-router";
import logo from "@/assets/reizinho-logo.jpg.asset.json";
import {
  FACEBOOK_URL,
  INSTAGRAM_URL,
  WHATSAPP_DISPLAY,
  WHATSAPP_URL,
} from "@/lib/site";
import { WhatsAppIcon } from "./WhatsAppButton";

export function Footer() {
  return (
    <footer className="border-t border-gold/20 bg-ivory">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 lg:grid-cols-4 lg:px-8">
        <div className="space-y-5">
          <Link to="/" aria-label="Reizinho Joias">
            <img
              src={logo.url}
              alt="Reizinho Joias"
              width={80}
              height={80}
              loading="lazy"
              className="h-20 w-20 rounded-full object-contain"
            />
          </Link>
          <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
            Joias que eternizam momentos. Peças selecionadas, atendimento humano e
            entrega segura para todo o Brasil.
          </p>
        </div>

        <div>
          <h3 className="eyebrow">Navegação</h3>
          <ul className="mt-5 space-y-2.5 text-sm text-muted-foreground">
            {[
              ["Início", "/#inicio"],
              ["Coleções", "/#colecoes"],
              ["Lançamentos", "/#lancamentos"],
              ["Mais Vendidos", "/#mais-vendidos"],
              ["Sobre", "/#sobre"],
              ["Avaliações", "/#avaliacoes"],
              ["Perguntas Frequentes", "/#faq"],
            ].map(([label, href]) => (
              <li key={href}>
                <a href={href} className="transition-colors hover:text-gold-deep">
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="eyebrow">Contato</h3>
          <ul className="mt-5 space-y-3.5 text-sm text-muted-foreground">
            <li className="flex items-center gap-2.5">
              <Phone className="h-4 w-4 text-gold" strokeWidth={1.5} />
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-gold-deep"
              >
                {WHATSAPP_DISPLAY}
              </a>
            </li>
            <li className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" strokeWidth={1.5} />
              Macaé — Rio de Janeiro, Brasil
            </li>
            <li className="flex items-start gap-2.5">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-gold" strokeWidth={1.5} />
              Seg. a Sex. 9h — 18h • Sáb. 9h — 13h
            </li>
          </ul>
        </div>

        <div>
          <h3 className="eyebrow">Redes Sociais</h3>
          <div className="mt-5 flex gap-3">
            {[
              { href: INSTAGRAM_URL, Icon: Instagram, label: "Instagram" },
              { href: FACEBOOK_URL, Icon: Facebook, label: "Facebook" },
              { href: WHATSAPP_URL, Icon: WhatsAppIcon, label: "WhatsApp" },
            ].map(({ href, Icon, label }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-gold/35 p-3 text-ink/80 transition-all duration-500 hover:-translate-y-0.5 hover:border-gold hover:text-gold-deep"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="hairline" />
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-6 text-xs text-muted-foreground lg:flex-row lg:px-8">
        <p>© {new Date().getFullYear()} Reizinho Joias. Todos os direitos reservados.</p>
        <p className="tracking-[0.2em] uppercase">Elegância • Exclusividade • Sofisticação</p>
      </div>
    </footer>
  );
}
