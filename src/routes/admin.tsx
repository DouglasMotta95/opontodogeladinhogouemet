import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { ImagePlus, LogOut, Package, Settings, ShoppingBag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { brl, formatDateTime, ORDER_STATUS_LABEL, PAYMENT_STATUS_LABEL } from "@/lib/format";

const STATUSES = ["received", "confirmed", "preparing", "out_for_delivery", "delivered", "cancelled"];
type Tab = "orders" | "products" | "store";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Painel administrativo | O Ponto do Geladinho Gourmet" },
      { name: "description", content: "Gestão completa da loja e dos pedidos." },
      { name: "robots", content: "noindex" },
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
  return <Dashboard />;
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
        <p className="eyebrow">Área restrita</p>
        <h1 className="font-display text-2xl font-extrabold">Painel da loja</h1>
        <div><Label htmlFor="email">E-mail</Label><Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <div><Label htmlFor="password">Senha</Label><Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} /></div>
        <Button type="submit" className="w-full" disabled={loading}>{loading ? "Entrando…" : "Entrar"}</Button>
      </form>
    </div>
  );
}

function Dashboard() {
  const [tab, setTab] = useState<Tab>("orders");
  const tabs = [
    { id: "orders" as const, label: "Pedidos", icon: ShoppingBag },
    { id: "products" as const, label: "Produtos", icon: Package },
    { id: "store" as const, label: "Loja", icon: Settings },
  ];
  return (
    <div className="min-h-screen bg-cream/50">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-5 lg:px-8">
          <div><p className="eyebrow">O Ponto do Geladinho Gourmet</p><h1 className="font-display text-2xl font-extrabold">Central do delivery</h1></div>
          <Button variant="outline" onClick={() => supabase.auth.signOut()}><LogOut className="h-4 w-4" /> Sair</Button>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
        <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
          {tabs.map(({ id, label, icon: Icon }) => (
            <Button key={id} variant={tab === id ? "default" : "outline"} onClick={() => setTab(id)} className="shrink-0">
              <Icon className="h-4 w-4" /> {label}
            </Button>
          ))}
        </div>
        {tab === "orders" && <Orders />}
        {tab === "products" && <Products />}
        {tab === "store" && <StoreSettings />}
      </div>
    </div>
  );
}

function Orders() {
  const { data, refetch, isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(100);
      if (error) throw error;
      return data ?? [];
    },
    refetchInterval: 15000,
  });
  const rows = data ?? [];
  const today = new Date().toDateString();
  const todayRows = rows.filter((r) => new Date(String(r.created_at)).toDateString() === today);
  const todayTotal = todayRows.filter((r) => r.status !== "cancelled").reduce((sum, r) => sum + Number(r.total), 0);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) toast.error("Sem permissão para atualizar este pedido.");
    else { toast.success("Status atualizado"); void refetch(); }
  };

  return (
    <section>
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <Metric label="Pedidos hoje" value={String(todayRows.length)} />
        <Metric label="Faturamento hoje" value={brl(todayTotal)} />
        <Metric label="Pedidos em aberto" value={String(rows.filter((r) => !["delivered","cancelled"].includes(String(r.status))).length)} />
      </div>
      {isLoading && <p className="text-muted-foreground">Carregando pedidos…</p>}
      <div className="space-y-3">
        {rows.map((row) => {
          const o = row as unknown as Record<string, string | number>;
          return (
            <div key={String(o.id)} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="font-semibold">#{String(o.order_number)} — {String(o.customer_name)}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{formatDateTime(String(o.created_at))} • {brl(Number(o.total))} • {PAYMENT_STATUS_LABEL[String(o.payment_status)]}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{String(o.customer_phone)} {o.address_neighborhood ? `• ${String(o.address_neighborhood)}` : "• Retirada"}</p>
                </div>
                <select value={String(o.status)} onChange={(e) => updateStatus(String(o.id), e.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
                  {STATUSES.map((s) => <option key={s} value={s}>{ORDER_STATUS_LABEL[s]}</option>)}
                </select>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Products() {
  const { data, refetch, isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").order("sort_order");
      if (error) throw error;
      return data ?? [];
    },
  });
  if (isLoading) return <p>Carregando produtos…</p>;
  return (
    <section>
      <div className="mb-5"><h2 className="font-display text-2xl font-extrabold">Cardápio e estoque</h2><p className="text-sm text-muted-foreground">Troque preço, foto, estoque e disponibilidade sem mexer no código.</p></div>
      <div className="grid gap-4 lg:grid-cols-2">
        {(data ?? []).map((p) => <ProductEditor key={p.id} product={p as unknown as ProductRow} onSaved={() => void refetch()} />)}
      </div>
    </section>
  );
}

type ProductRow = { id:string; name:string; description:string|null; price:number; image_url:string|null; stock:number|null; is_available:boolean; is_featured:boolean; is_best_seller:boolean; slug:string };

function ProductEditor({ product, onSaved }: { product: ProductRow; onSaved: () => void }) {
  const [name, setName] = useState(product.name);
  const [price, setPrice] = useState(String(Number(product.price).toFixed(2)).replace(".", ","));
  const [stock, setStock] = useState(product.stock == null ? "" : String(product.stock));
  const [imageUrl, setImageUrl] = useState(product.image_url ?? "");
  const [available, setAvailable] = useState(product.is_available);
  const [featured, setFeatured] = useState(product.is_featured);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const uploadPhoto = async (file: File) => {
    setUploading(true);
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${product.slug}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("product-images").upload(path, file, { upsert: true, contentType: file.type });
    if (error) toast.error(error.message);
    else {
      const { data } = supabase.storage.from("product-images").getPublicUrl(path);
      setImageUrl(data.publicUrl);
      toast.success("Foto enviada. Clique em Salvar produto.");
    }
    setUploading(false);
  };

  const save = async () => {
    setSaving(true);
    const numericPrice = Number(price.replace(",", "."));
    if (!Number.isFinite(numericPrice) || numericPrice < 0) { toast.error("Preço inválido."); setSaving(false); return; }
    const { error } = await supabase.from("products").update({
      name: name.trim(), price: numericPrice, stock: stock.trim() === "" ? null : Number(stock), image_url: imageUrl.trim() || null,
      is_available: available, is_featured: featured,
    }).eq("id", product.id);
    setSaving(false);
    if (error) toast.error(error.message); else { toast.success("Produto atualizado"); onSaved(); }
  };

  return (
    <article className="rounded-3xl border border-border bg-card p-4 shadow-sm">
      <div className="flex gap-4">
        <div className="h-28 w-28 shrink-0 overflow-hidden rounded-2xl bg-muted">
          {imageUrl ? <img src={imageUrl} alt={name} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-3xl">🍧</div>}
        </div>
        <div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2"><Label>Nome</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div><Label>Preço</Label><Input inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} /></div>
          <div><Label>Estoque</Label><Input inputMode="numeric" value={stock} onChange={(e) => setStock(e.target.value.replace(/\D/g, ""))} placeholder="Sem limite" /></div>
        </div>
      </div>
      <div className="mt-4 grid gap-3">
        <div><Label>URL da foto</Label><Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." /></div>
        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-border px-4 py-3 text-sm font-medium hover:bg-accent">
          <ImagePlus className="h-4 w-4" /> {uploading ? "Enviando foto…" : "Enviar foto do produto"}
          <input className="hidden" type="file" accept="image/jpeg,image/png,image/webp" disabled={uploading} onChange={(e) => { const file = e.target.files?.[0]; if (file) void uploadPhoto(file); }} />
        </label>
        <div className="flex flex-wrap gap-4 text-sm">
          <label className="flex items-center gap-2"><input type="checkbox" checked={available} onChange={(e) => setAvailable(e.target.checked)} /> Disponível</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} /> Destaque na home</label>
        </div>
        <Button onClick={save} disabled={saving}>{saving ? "Salvando…" : "Salvar produto"}</Button>
      </div>
    </article>
  );
}

function StoreSettings() {
  const { data, refetch, isLoading } = useQuery({
    queryKey: ["admin-store-settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("settings").select("key,value").eq("key", "store").maybeSingle();
      if (error) throw error;
      return (data?.value ?? {}) as Record<string, unknown>;
    },
  });
  const initial = useMemo(() => ({ minOrder: String(Number(data?.min_order ?? 20)), whatsapp: String(data?.whatsapp ?? ""), accepting: data?.accepting_orders !== false }), [data]);
  const [minOrder, setMinOrder] = useState("20");
  const [whatsapp, setWhatsapp] = useState("");
  const [accepting, setAccepting] = useState(true);
  useEffect(() => { setMinOrder(initial.minOrder); setWhatsapp(initial.whatsapp); setAccepting(initial.accepting); }, [initial]);
  if (isLoading) return <p>Carregando configurações…</p>;

  const save = async () => {
    const current = data ?? {};
    const value = { ...current, min_order: Number(minOrder.replace(",", ".")) || 0, whatsapp, accepting_orders: accepting };
    const { error } = await supabase.from("settings").upsert({ key: "store", value, is_public: true });
    if (error) toast.error(error.message); else { toast.success("Configurações salvas"); void refetch(); }
  };

  return (
    <section className="max-w-2xl rounded-3xl border border-border bg-card p-6 shadow-sm">
      <h2 className="font-display text-2xl font-extrabold">Configurações da loja</h2>
      <p className="mt-1 text-sm text-muted-foreground">Controle regras importantes do delivery.</p>
      <div className="mt-6 grid gap-4">
        <div><Label>Pedido mínimo (R$)</Label><Input inputMode="decimal" value={minOrder} onChange={(e) => setMinOrder(e.target.value)} /><p className="mt-1 text-xs text-muted-foreground">Configurado em R$ 20,00 para ajudar a cobrir o custo do frete.</p></div>
        <div><Label>WhatsApp da loja</Label><Input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="(19) 99999-9999" /></div>
        <label className="flex items-center gap-3 rounded-2xl bg-accent/60 p-4"><input type="checkbox" checked={accepting} onChange={(e) => setAccepting(e.target.checked)} /><span><strong>Receber pedidos agora</strong><span className="block text-xs text-muted-foreground">Desative para pausar novos pedidos no site.</span></span></label>
        <Button onClick={save}>Salvar configurações</Button>
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-border bg-card p-4 shadow-sm"><p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p><p className="mt-1 font-display text-2xl font-extrabold text-ink">{value}</p></div>;
}
