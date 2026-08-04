import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { waLink } from "@/lib/site";

const base =
  "group inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-wide transition-all duration-500 ease-out";

type Variant = "gold" | "outline" | "whatsapp" | "ghost";
type Size = "sm" | "md" | "lg" | "xl";

const variants: Record<Variant, string> = {
  gold: "bg-gold-gradient text-ink shadow-soft hover:shadow-lift hover:-translate-y-0.5",
  outline:
    "border border-gold/45 text-ink hover:border-gold hover:bg-accent/60 hover:-translate-y-0.5",
  whatsapp:
    "bg-whatsapp text-background shadow-soft hover:shadow-lift hover:-translate-y-0.5",
  ghost: "text-ink/80 hover:text-ink",
};

const sizes: Record<Size, string> = {
  sm: "px-4 py-2 text-xs",
  md: "px-6 py-3 text-sm",
  lg: "px-8 py-4 text-sm",
  xl: "px-10 py-5 text-base",
};

export function LuxeLink({
  href,
  children,
  variant = "gold",
  size = "md",
  className,
  external,
}: {
  href: string;
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string | undefined;
  external?: boolean | undefined;
}) {
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={cn(base, variants[variant], sizes[size], className)}
    >
      {children}
    </a>
  );
}

export function WhatsAppCTA({
  message,
  children = "Comprar pelo WhatsApp",
  variant = "whatsapp",
  size = "md",
  className,
}: {
  message: string;
  children?: ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string | undefined;
}) {
  return (
    <LuxeLink
      external
      href={waLink(message)}
      variant={variant}
      size={size}
      className={className}
    >
      <WhatsAppIcon className="h-4 w-4" />
      {children}
    </LuxeLink>
  );
}

export function WhatsAppIcon({ className }: { className?: string | undefined }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.64-2.05-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.6-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37s-1.04 1.02-1.04 2.48 1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.75-.72 2-1.41.25-.69.25-1.28.17-1.41-.07-.13-.27-.2-.57-.35zM12.04 2c-5.5 0-9.96 4.46-9.96 9.96 0 1.76.46 3.42 1.27 4.86L2 22l5.3-1.38a9.9 9.9 0 0 0 4.74 1.2c5.5 0 9.96-4.46 9.96-9.96S17.54 2 12.04 2zm0 18.13c-1.6 0-3.09-.47-4.34-1.28l-.31-.19-3.15.82.84-3.07-.2-.32a8.14 8.14 0 0 1-1.25-4.35c0-4.5 3.66-8.17 8.17-8.17s8.16 3.67 8.16 8.17-3.66 8.19-8.16 8.19z" />
    </svg>
  );
}
