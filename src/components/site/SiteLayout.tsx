import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { MessageCircle } from "lucide-react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { CartDrawer } from "./CartDrawer";
import { settingsQuery, whatsappLink } from "@/lib/shop-data";

export function SiteLayout({ children }: { children: ReactNode }) {
  const { data: settings } = useQuery(settingsQuery);
  const wa = settings?.store.whatsapp
    ? whatsappLink(settings.store.whatsapp, "Olá! Preciso de ajuda com meu pedido.")
    : null;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartDrawer />
      {wa && (
        <a
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Falar no WhatsApp"
          className="fixed right-5 bottom-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-whatsapp text-white shadow-pop transition-transform hover:scale-105"
        >
          <MessageCircle className="h-6 w-6" />
        </a>
      )}
    </div>
  );
}
