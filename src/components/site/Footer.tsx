import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Clock, Instagram, Facebook, MapPin, Phone } from "lucide-react";
import { businessHoursQuery, settingsQuery, WEEKDAYS, whatsappLink } from "@/lib/shop-data";

export function Footer() {
  const { data: settings } = useQuery(settingsQuery);
  const { data: hours } = useQuery(businessHoursQuery);
  const store = settings?.store;
  const wa = store?.whatsapp ? whatsappLink(store.whatsapp, "Olá! Quero fazer um pedido.") : null;

  return (
    <footer className="mt-20 border-t border-border bg-cream">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 lg:grid-cols-4 lg:px-8">
        <div className="space-y-4">
          <img
            src={logoAsset.url}
            alt="O Ponto do Geladinho Gourmet"
            className="h-20 w-20 rounded-full object-cover shadow-card"
            loading="lazy"
          />
          <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
            Cremosos, recheados e irresistíveis. Feito em família para adoçar momentos em família —
            peça sem sair de casa.
          </p>
        </div>

        <div>
          <h3 className="eyebrow">Navegação</h3>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/" className="transition-colors hover:text-brand-deep">
                Início
              </Link>
            </li>
            <li>
              <Link to="/cardapio" className="transition-colors hover:text-brand-deep">
                Cardápio
              </Link>
            </li>
            <li>
              <Link to="/pedido" className="transition-colors hover:text-brand-deep">
                Acompanhar pedido
              </Link>
            </li>
            <li>
              <Link to="/admin" className="transition-colors hover:text-brand-deep">
                Área administrativa
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="eyebrow">Contato</h3>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            {wa && (
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-brand" strokeWidth={1.6} />
                <a href={wa} target="_blank" rel="noopener noreferrer">
                  {store?.whatsapp}
                </a>
              </li>
            )}
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand" strokeWidth={1.6} />
              {store?.address || `${store?.city ?? ""}${store?.state ? ` — ${store.state}` : ""}`}
            </li>
            <li className="flex gap-3 pt-1">
              {settings?.social.instagram && (
                <a
                  href={settings.social.instagram}
                  aria-label="Instagram"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-border p-2 transition-colors hover:text-brand-deep"
                >
                  <Instagram className="h-4 w-4" />
                </a>
              )}
              {settings?.social.facebook && (
                <a
                  href={settings.social.facebook}
                  aria-label="Facebook"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-border p-2 transition-colors hover:text-brand-deep"
                >
                  <Facebook className="h-4 w-4" />
                </a>
              )}
            </li>
          </ul>
        </div>

        <div>
          <h3 className="eyebrow">Horários</h3>
          <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground">
            {(hours ?? []).map((h) => (
              <li key={h.id} className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-brand" strokeWidth={1.6} />
                <span className="w-28">{WEEKDAYS[h.weekday]}</span>
                <span>
                  {h.is_open && h.opens_at && h.closes_at
                    ? `${h.opens_at.slice(0, 5)} — ${h.closes_at.slice(0, 5)}`
                    : "Fechado"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-border py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} O Ponto do Geladinho Gourmet. Todos os direitos reservados.
      </div>
    </footer>
  );
}
