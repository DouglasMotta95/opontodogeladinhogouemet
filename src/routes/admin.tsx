import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { brl, formatDateTime, ORDER_STATUS_LABEL, PAYMENT_STATUS_LABEL } from "@/lib/format";

const STATUSES = ["received", "confirmed", "preparing", "out_for_delivery", "delivered", "cancelled"];

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Painel administrativo | O Ponto do Geladinho Gourmet" },
      { name: "description", content: "Gestão de pedidos da loja." },
      { property: "og:title", content: "Painel administrativo" },
      { property: "og:description", content: "Gestão de pedidos da loja." },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Admin,
});

function Admin() {
  const [session, setSession] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(!!s));
    return () => sub.subscription.unsubscribe();
  }, []);

  if (session === null) return <p className="p-10 text-center">Carregando…</p>;
  if (!session) return <Login />;
  return <Orders />;
}

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4">
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setLoading(true);
          const { error } = await supabase.auth.signInWithPassword({ email, password });
          setLoading(false);
          if (error) toast.error("E-mail ou senha inválidos.");
        }}
        className="w-full max-w-sm space-y-4 rounded-3xl border border-border bg-card p-8 shadow-card"
      >
        <h1 className="font-display text-2xl font-extrabold">Painel administrativo</h1>
        <div>
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          Entrar
        </Button>
      </form>
    </div>
  );
}

function Orders() {
  const { data, refetch, isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data ?? [];
    },
    refetchInterval: 30000,
  });

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) toast.error("Sem permissão para atualizar este pedido.");
    else {
      toast.success("Status atualizado");
      void refetch();
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-3xl font-extrabold">Pedidos</h1>
        <Button variant="outline" onClick={() => supabase.auth.signOut()}>
          Sair
        </Button>
      </div>

      {isLoading && <p className="text-muted-foreground">Carregando pedidos…</p>}
      <div className="space-y-3">
        {(data ?? []).map((row) => {
          const o = row as unknown as Record<string, string | number>;
          return (
            <div key={String(o["id"])} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">
                    #{String(o["order_number"])} — {String(o["customer_name"])}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatDateTime(String(o["created_at"]))} • {brl(Number(o["total"]))} •{" "}
                    {PAYMENT_STATUS_LABEL[String(o["payment_status"])]}
                  </p>
                </div>
                <select
                  value={String(o["status"])}
                  onChange={(e) => updateStatus(String(o["id"]), e.target.value)}
                  className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {ORDER_STATUS_LABEL[s]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
