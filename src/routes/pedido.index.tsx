import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SiteLayout } from "@/components/site/SiteLayout";

const title = "Acompanhar pedido | O Ponto do Geladinho Gourmet";
const description = "Digite o código do seu pedido para acompanhar o status da entrega em tempo real.";

export const Route = createFileRoute("/pedido/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
    ],
  }),
  component: PedidoIndex,
});

function PedidoIndex() {
  const [token, setToken] = useState("");
  const navigate = useNavigate();

  return (
    <SiteLayout>
      <div className="mx-auto max-w-lg px-4 py-20">
        <h1 className="font-display text-3xl font-extrabold text-ink">Acompanhar pedido</h1>
        <p className="mt-2 text-muted-foreground">
          Informe o código recebido ao finalizar a compra.
        </p>
        <form
          className="mt-6 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (token.trim().length >= 8) {
              navigate({ to: "/pedido/$token", params: { token: token.trim() } });
            }
          }}
        >
          <Input
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Código do pedido"
            maxLength={80}
          />
          <Button type="submit">Buscar</Button>
        </form>
      </div>
    </SiteLayout>
  );
}
