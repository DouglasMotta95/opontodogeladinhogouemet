import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Menu, ShoppingBag, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
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
  const wa = settings?.store.whatsapp
    ? whatsappLink(settings.store.whatsapp, "Olá! Vim pelo site e quero fazer um pedido.")
    : null;

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur-xl">
      <div className="bg-brand-gradient text-primary-foreground">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-3 px-4 py-2 text-[0.7rem] font-medium tracking-[0.14em] uppercase">
          <span
            className={cn(
              "h-2 w-2 rounded-full",
              isOpenNow ? "bg-emerald-300" : "bg-background/70",
            )}
          />
          {isOpenNow === null
            ? "Geladinho gourmet artesanal"
            : isOpenNow
              ? "Estamos abertos — peça agora"
              : "Fechado no momento — agende seu pedido"}
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 lg:px-8">
        <Link to="/" className="flex items-center gap-3" aria-label="O Ponto do Geladinho Gourmet">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-gradient text-lg font-black text-primary-foreground">
            PG
          </span>
          <span className="leading-tight">
            <span className="block text-xs tracking-[0.24em] text-brand-deep uppercase">
              O Ponto do
            </span>
            <span className="block font-display text-lg font-extrabold text-ink">
              Geladinho Gourmet
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

        <div className="flex items-center gap-2">
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
            className="relative"
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
        </nav>
      )}
    </header>
  );
}
