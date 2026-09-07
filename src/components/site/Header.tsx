import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Menu, MessageCircle, ShoppingBag, X } from "lucide-react";
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
        ? "Aberto agora"
        : "Fechado no momento";

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/95 shadow-[0_1px_0_rgba(0,0,0,.03)] backdrop-blur-xl">
      <div className="bg-brand-gradient text-primary-foreground">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-4 py-1.5 text-center text-[0.66rem] font-bold tracking-[0.08em] uppercase sm:justify-between sm:text-[0.7rem] lg:px-8">
          <span className="flex items-center gap-2">
            <span className={cn("h-2 w-2 rounded-full", isOpenNow ? "bg-emerald-300" : "bg-background/70")} />
            {statusText}
          </span>
          <div className="hidden items-center gap-3 sm:flex">
            {store && store.min_order > 0 && <span>Pedido mínimo {brl(store.min_order)}</span>}
            {store?.city && <span className="opacity-80">Delivery em {store.city}</span>}
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2 lg:px-8">
        <Link to="/" className="flex min-w-0 items-center gap-2.5" aria-label="O Ponto do Geladinho Gourmet">
          <img src={logoAsset.url} alt="O Ponto do Geladinho Gourmet" className="h-11 w-11 shrink-0 rounded-full object-cover shadow-card sm:h-14 sm:w-14" />
          <span className="min-w-0 leading-tight">
            <span className="block text-[0.58rem] font-bold tracking-[0.2em] text-brand-deep uppercase sm:text-[0.64rem]">O Ponto do</span>
            <span className="block truncate font-display text-[0.96rem] font-black text-ink sm:text-lg">Geladinho Gourmet</span>
          </span>
        </Link>

        <nav className="hidden items-center rounded-full border border-border/80 bg-muted/35 p-1 md:flex">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeProps={{ className: "bg-background text-brand-deep shadow-sm" }}
              className="rounded-full px-4 py-2 text-sm font-semibold text-foreground/70 transition-all hover:text-brand-deep"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          {wa && (
            <Button asChild variant="outline" size="sm" className="hidden rounded-full lg:inline-flex">
              <a href={wa} target="_blank" rel="noopener noreferrer"><MessageCircle className="h-4 w-4" /> WhatsApp</a>
            </Button>
          )}
          <Button size="sm" onClick={() => setCartOpen(true)} className="relative rounded-full px-3.5" aria-label="Abrir carrinho">
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:inline">Carrinho</span>
            {count > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-mango px-1 text-[0.68rem] font-black text-ink shadow-sm">{count}</span>
            )}
          </Button>
          <button className="rounded-full border border-border p-2 md:hidden" aria-label={open ? "Fechar menu" : "Abrir menu"} onClick={() => setOpen((v) => !v)}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-border bg-background px-4 py-3 shadow-lg md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1">
            {nav.map((item) => (
              <Link key={item.to} to={item.to} onClick={() => setOpen(false)} className="rounded-2xl px-4 py-3 text-sm font-bold transition-colors hover:bg-accent">{item.label}</Link>
            ))}
            {wa && (
              <a href={wa} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)} className="mt-1 flex items-center gap-2 rounded-2xl bg-accent px-4 py-3 text-sm font-bold text-brand-deep">
                <MessageCircle className="h-4 w-4" /> Falar no WhatsApp
              </a>
            )}
            <p className="px-4 pt-2 text-xs text-muted-foreground">{store?.city || "Indaiatuba"} • {store?.min_order ? `Pedido mínimo ${brl(store.min_order)}` : "Delivery local"}</p>
          </div>
        </nav>
      )}
    </header>
  );
}
