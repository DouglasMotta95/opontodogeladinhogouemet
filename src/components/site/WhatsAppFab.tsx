import { useEffect, useState } from "react";
import { waLink } from "@/lib/site";
import { WhatsAppIcon } from "./WhatsAppButton";
import { cn } from "@/lib/utils";

export function WhatsAppFab() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 320);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <a
      href={waLink("Olá! Gostaria de saber mais sobre as joias da Reizinho Joias.")}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar no WhatsApp"
      className={cn(
        "fixed right-5 bottom-5 z-50 flex items-center gap-3 rounded-full bg-whatsapp px-5 py-4 text-background shadow-lift transition-all duration-700 ease-out hover:-translate-y-1",
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0",
      )}
    >
      <WhatsAppIcon className="h-6 w-6" />
      <span className="hidden text-sm font-medium tracking-wide sm:inline">
        Falar no WhatsApp
      </span>
    </a>
  );
}
