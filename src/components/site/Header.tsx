import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X, Sparkles, Truck, ShieldCheck } from "lucide-react";
import logo from "@/assets/reizinho-logo.jpg.asset.json";
import { WhatsAppCTA } from "./WhatsAppButton";
import { cn } from "@/lib/utils";

const nav = [
  { label: "Início", href: "/#inicio" },
  { label: "Coleções", href: "/#colecoes" },
  { label: "Lançamentos", href: "/#lancamentos" },
  { label: "Mais Vendidos", href: "/#mais-vendidos" },
  { label: "Sobre", href: "/#sobre" },
  { label: "Avaliações", href: "/#avaliacoes" },
  { label: "Perguntas Frequentes", href: "/#faq" },
  { label: "Contato", href: "/#contato" },
];

export function TopBar() {
  const items = [
    { icon: Sparkles, text: "Atendimento Personalizado" },
    { icon: Truck, text: "Envio para todo o Brasil" },
    { icon: ShieldCheck, text: "Compra Segura" },
  ];
  return (
    <div className="bg-ink text-background/90">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-8 overflow-hidden px-4 py-2.5 text-[0.68rem] tracking-[0.2em] uppercase">
        {items.map(({ icon: Icon, text }, i) => (
          <span
            key={text}
            className={cn(
              "flex items-center gap-2 whitespace-nowrap",
              i > 0 && "hidden sm:flex",
            )}
          >
            <Icon className="h-3.5 w-3.5 text-gold" strokeWidth={1.5} />
            {text}
          </span>
        ))}
      </div>
    </div>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="sticky top-0 z-50">
      <TopBar />
      <div
        className={cn(
          "border-b border-border/70 backdrop-blur-xl transition-all duration-500",
          scrolled ? "bg-background/90 shadow-soft" : "bg-background/70",
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-3 lg:px-8">
          <Link to="/" className="flex items-center gap-3" aria-label="Reizinho Joias">
            <img
              src={logo.url}
              alt="Reizinho Joias"
              width={56}
              height={56}
              className={cn(
                "rounded-full object-contain transition-all duration-500",
                scrolled ? "h-11 w-11" : "h-14 w-14",
              )}
            />
            <span className="sr-only">Reizinho Joias</span>
          </Link>

          <nav className="hidden items-center gap-6 xl:flex">
            {nav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="relative text-[0.78rem] tracking-[0.14em] text-ink/75 uppercase transition-colors duration-300 hover:text-ink after:absolute after:-bottom-1.5 after:left-0 after:h-px after:w-0 after:bg-gold after:transition-all after:duration-500 hover:after:w-full"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <WhatsAppCTA
              message="Olá! Vim pelo site da Reizinho Joias e gostaria de atendimento."
              size="sm"
              className="hidden sm:inline-flex"
            >
              Falar no WhatsApp
            </WhatsAppCTA>
            <button
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "Fechar menu" : "Abrir menu"}
              className="rounded-full border border-gold/40 p-2 text-ink transition-colors hover:bg-accent/70 xl:hidden"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <div
          className={cn(
            "overflow-hidden border-t border-border/60 bg-background/95 transition-all duration-500 xl:hidden",
            open ? "max-h-[32rem]" : "max-h-0",
          )}
        >
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4">
            {nav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-2.5 text-sm tracking-[0.12em] text-ink/80 uppercase transition-colors hover:bg-accent/70 hover:text-ink"
              >
                {item.label}
              </a>
            ))}
            <WhatsAppCTA
              message="Olá! Vim pelo site da Reizinho Joias e gostaria de atendimento."
              className="mt-3 w-full"
            >
              Falar no WhatsApp
            </WhatsAppCTA>
          </nav>
        </div>
      </div>
    </header>
  );
}
