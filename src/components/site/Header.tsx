import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Menu, ShoppingBag, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import logoAsset from "@/assets/logo.png.asset.json";
import { useCart } from "@/lib/cart";
import { brl } from "@/lib/format";
import { businessHoursQuery, isStoreOpenNow, settingsQuery, whatsappLink } from "@/lib/shop-data";
import { cn } from "@/lib/utils";

const nav = [
  { label: "Início", to: "/" as const },
  { label: "Cardápio", to: "/cardapio" as const },
  { label: "Meu pedido", to: "/pedido" as const },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const { count, setOpen: setCartOpen } = useCart();
  const { data: settings } = useQuery(settingsQuery);
  const { data: hours } = useQuery(businessHoursQuery);
  const isOpenNow = hours ? isStoreOpenNow(hours) : null;
  const store = settings?.store;
  const wa = store?.whatsapp
    ? whatsappLink(store.whatsapp, "Olá! Vim pelo site e quero fazer um pedido.")
    : null;

  const statusText =
    isOpenNow === null
      ? "Geladinho gourmet artesanal"
      : isOpenNow
        ? "Estamos abertos — peça agora"
        : "Fechado no momento — agende seu pedido";

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/95 backdrop-blur-xl">
      <div className="bg-brand-gradient text-primary-foreground">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-3 gap-y-1 px-4 py-2 text-center text-[0.68rem] font-semibold tracking-[0.1em] uppercase sm:text-[0.72rem] sm:tracking-[0.14em]">
          <span className="flex items-center gap-2">
            <span
              className={cn(
                "h-2 w-2 rounded-full",
                isOpenNow ? "bg-emerald-300" : "bg-background/70",
              )}
            />
            {statusText}
          </span>
          {store && store.min_order > 0 && (
            <>
              <span className="hidden opacity-60 sm:inline">•</span>
              <span>Pedido mínimo {brl(store.min_order)}</span>
            </>
          )}
          {store?.city && (
            <>
              <span className="hidden opacity-60 md:inline">•</span>
              <span className="hidden md:inline">Delivery em {store.city}</span>
            </>
          )}
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2.5 lg:px-8 lg:py-3">
        <Link to="/" className="flex min-w-0 items-center gap-2.5" aria-label="O Ponto do Geladinho Gourmet">
          <img
            src={logoAsset.url}
            alt="O Ponto do Geladinho Gourmet"
            className="h-12 w-12 shrink-0 rounded-full object-cover shadow-card sm:h-16 sm:w-16"
          />
          <span className="min-w-0 leading-tight">
            <span className="block text-[0.62rem] tracking-[0.2em] text-brand-deep uppercase sm:text-xs sm:tracking-[0.24em]">
              O Ponto do
            </span>
            <span className="block truncate font-display text-base font-extrabold text-ink sm:text-lg">
              Geladinho Gourmet
            </span>
            <span className="mt-0.5 block text-[0.68rem] font-medium text-muted-foreground sm:hidden">
              Delivery em {store?.city || "Indaiatuba"}
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeProps={{ className: "text-brand-deep" }}
              className="text-sm font-medium text-foreground/75 transition-colors hover:text-brand-deep"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          {wa && (
            <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
              <a href={wa} target="_blank" rel="noopener noreferrer">
                WhatsApp
              </a>
            </Button>
          )}
          <Button
            size="sm"
            onClick={() => setCartOpen(true)}
            className="relative px-3"
            aria-label="Abrir carrinho"
          >
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:inline">Carrinho</span>
            {count > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-mango px-1 text-[0.7rem] font-bold text-ink">
                {count}
              </span>
            )}
          </Button>
          <button
            className="rounded-xl border border-border p-2 md:hidden"
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="flex flex-col gap-1 border-t border-border bg-background px-4 py-3 md:hidden">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className="rounded-xl px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent"
            >
              {item.label}
            </Link>
          ))}
          {wa && (
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="mt-1 rounded-xl bg-accent px-3 py-2.5 text-sm font-semibold text-brand-deep"
            >
              Falar no WhatsApp
            </a>
          )}
        </nav>
      )}
    </header>
  );
}
