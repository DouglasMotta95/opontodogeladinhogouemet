import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { AlertTriangle, BarChart3, ImagePlus, LogOut, Package, Settings, ShoppingBag, Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { brl, formatDateTime, ORDER_STATUS_LABEL, PAYMENT_STATUS_LABEL } from "@/lib/format";

const STATUSES = ["received", "confirmed", "preparing", "out_for_delivery", "delivered", "cancelled"];
type Tab = "overview" | "orders" | "products" | "store";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({ meta: [
    { title: "Painel administrativo | O Ponto do Geladinho Gourmet" },
    { name: "description", content: "Gestão completa da loja e dos pedidos." },
    { name: "robots", content: "noindex" },
  ] }),
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
      <form onSubmit={async (e) => { e.preventDefault(); setLoading(true); const { error } = await supabase.auth.signInWithPassword({ email, password }); setLoading(false); if (error) toast.error("E-mail ou senha inválidos."); }} className="w-full max-w-sm space-y-4 rounded-3xl border border-border bg-card p-8 shadow-card">
        <p className="eyebrow">Área restrita</p><h1 className="font-display text-2xl font-extrabold">Painel da loja</h1>
        <div><Label htmlFor="email">E-mail</Label><Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <div><Label htmlFor="password">Senha</Label><Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} /></div>
        <Button type="submit" className="w-full" disabled={loading}>{loading ? "Entrando…" : "Entrar"}</Button>
      </form>
    </div>
  );
}

function Dashboard() {
  const [tab, setTab] = useState<Tab>("overview");
  const tabs = [
    { id: "overview" as const, label: "Visão geral", icon: BarChart3 },
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
        <div className="mb-6 flex gap-2 overflow-x-auto pb-1">{tabs.map(({ id, label, icon: Icon }) => <Button key={id} variant={tab === id ? "default" : "outline"} onClick={() => setTab(id)} className="shrink-0"><Icon className="h-4 w-4" /> {label}</Button>)}</div>
        {tab === "overview" && <Overview onGoProducts={() => setTab("products")} onGoOrders={() => setTab("orders")} />}
        {tab === "orders" && <Orders />}
        {tab === "products" && <Products />}
        {tab === "store" && <StoreSettings />}
      </div>
    </div>
  );
}

function Overview({ onGoProducts, onGoOrders }: { onGoProducts: () => void; onGoOrders: () => void }) {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: async () => {
      const [ordersRes, itemsRes, productsRes] = await Promise.all([
        supabase.from("orders").select("id,status,total,created_at").order("created_at", { ascending: false }).limit(500),
        supabase.from("order_items").select("order_id,product_name,quantity,created_at").order("created_at", { ascending: false }).limit(1500),
        supabase.from("products").select("id,name,slug,stock,is_available,image_url").order("sort_order"),
      ]);
      if (ordersRes.error) throw ordersRes.error;
      if (itemsRes.error) throw itemsRes.error;
      if (productsRes.error) throw productsRes.error;
      return { orders: ordersRes.data ?? [], items: itemsRes.data ?? [], products: productsRes.data ?? [] };
    },
    refetchInterval: 30000,
  });
  if (isLoading || !data) return <p className="text-muted-foreground">Carregando visão geral…</p>;

  const today = new Date().toDateString();
  const todayOrders = data.orders.filter((o) => new Date(String(o.created_at)).toDateString() === today);
  const activeTodayIds = new Set(todayOrders.filter((o) => o.status !== "cancelled").map((o) => o.id));
  const todayRevenue = todayOrders.filter((o) => o.status !== "cancelled").reduce((sum, o) => sum + Number(o.total), 0);
  const todayUnits = data.items.filter((i) => activeTodayIds.has(i.order_id)).reduce((sum, i) => sum + Number(i.quantity), 0);
  const openOrders = data.orders.filter((o) => !["delivered", "cancelled"].includes(String(o.status))).length;
  const lowStock = data.products.filter((p) => p.is_available && p.stock != null && p.stock <= 5);

  const sold = new Map<string, number>();
  const validOrderIds = new Set(data.orders.filter((o) => o.status !== "cancelled").map((o) => o.id));
  data.items.filter((i) => validOrderIds.has(i.order_id)).forEach((i) => sold.set(i.product_name, (sold.get(i.product_name) ?? 0) + Number(i.quantity)));
  const best = [...sold.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <section className="space-y-6">
      <div><p className="eyebrow">Hoje na loja</p><div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"><div><h2 className="font-display text-3xl font-black text-ink">Visão geral</h2><p className="text-sm text-muted-foreground">O que precisa da sua atenção sem precisar procurar pelo painel.</p></div><Button onClick={onGoOrders}>Ver pedidos</Button></div></div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Pedidos hoje" value={String(todayOrders.length)} hint="recebidos hoje" />
        <Metric label="Faturamento hoje" value={brl(todayRevenue)} hint="sem pedidos cancelados" />
        <Metric label="Geladinhos vendidos" value={String(todayUnits)} hint="unidades de hoje" />
        <Metric label="Pedidos em aberto" value={String(openOrders)} hint="aguardando conclusão" />
      </div>

      {lowStock.length > 0 && <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="flex items-center gap-2 font-black text-amber-900"><AlertTriangle className="h-5 w-5" /> Estoque baixo</p><p className="mt-1 text-sm text-amber-800">{lowStock.length} {lowStock.length === 1 ? "sabor precisa" : "sabores precisam"} de atenção.</p></div><Button variant="outline" onClick={onGoProducts} className="bg-white">Ajustar estoque</Button></div><div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{lowStock.map((p) => <div key={p.id} className="flex items-center gap-3 rounded-2xl bg-white p-3"><div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-muted">{p.image_url ? <img src={p.image_url} alt="" className="h-full w-full object-cover" /> : "🍧"}</div><div><p className="text-sm font-black text-ink">{p.name}</p><p className="text-xs font-bold text-destructive">{p.stock === 0 ? "Esgotado" : `Só ${p.stock} unidades`}</p></div></div>)}</div></div>}

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-3xl border border-border bg-card p-5 shadow-sm"><div className="flex items-center gap-2"><Trophy className="h-5 w-5 text-brand-deep" /><h3 className="font-display text-xl font-black">Sabores mais vendidos</h3></div><p className="mt-1 text-xs text-muted-foreground">Ranking com base nos pedidos registrados.</p><div className="mt-4 space-y-2">{best.length > 0 ? best.map(([name, quantity], index) => <div key={name} className="flex items-center gap-3 rounded-2xl bg-muted/50 p-3"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-background text-xs font-black">{index + 1}º</span><span className="min-w-0 flex-1 truncate text-sm font-bold">{name}</span><span className="text-sm font-black text-brand-deep">{quantity} un.</span></div>) : <p className="py-6 text-center text-sm text-muted-foreground">O ranking aparece assim que entrarem vendas.</p>}</div></div>
        <div className="rounded-3xl border border-border bg-[#24100d] p-5 text-white shadow-sm"><p className="text-xs font-black uppercase tracking-[.15em] text-pink-300">Atalhos rápidos</p><h3 className="mt-2 font-display text-2xl font-black">Controle a operação sem perder tempo.</h3><div className="mt-5 grid gap-2"><button onClick={onGoOrders} className="rounded-2xl border border-white/10 bg-white/10 p-4 text-left text-sm font-bold hover:bg-white/15">🧾 Atualizar status dos pedidos</button><button onClick={onGoProducts} className="rounded-2xl border border-white/10 bg-white/10 p-4 text-left text-sm font-bold hover:bg-white/15">🍧 Alterar estoque, preço ou foto</button></div></div>
      </div>
    </section>
  );
}

function Orders() {
  const { data, refetch, isLoading } = useQuery({ queryKey: ["admin-orders"], queryFn: async () => { const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(100); if (error) throw error; return data ?? []; }, refetchInterval: 15000 });
  const rows = data ?? [];
  const today = new Date().toDateString();
  const todayRows = rows.filter((r) => new Date(String(r.created_at)).toDateString() === today);
  const todayTotal = todayRows.filter((r) => r.status !== "cancelled").reduce((sum, r) => sum + Number(r.total), 0);
  const updateStatus = async (id: string, status: string) => { const { error } = await supabase.from("orders").update({ status }).eq("id", id); if (error) toast.error("Sem permissão para atualizar este pedido."); else { toast.success("Status atualizado"); void refetch(); } };
  return (
    <section>
      <div className="mb-6 grid gap-3 sm:grid-cols-3"><Metric label="Pedidos hoje" value={String(todayRows.length)} /><Metric label="Faturamento hoje" value={brl(todayTotal)} /><Metric label="Pedidos em aberto" value={String(rows.filter((r) => !["delivered","cancelled"].includes(String(r.status))).length)} /></div>
      {isLoading && <p className="text-muted-foreground">Carregando pedidos…</p>}
      <div className="space-y-3">{rows.map((row) => { const o = row as unknown as Record<string, string | number>; return <div key={String(o.id)} className="rounded-2xl border border-border bg-card p-5 shadow-sm"><div className="flex flex-wrap items-center justify-between gap-4"><div><p className="font-semibold">#{String(o.order_number)} — {String(o.customer_name)}</p><p className="mt-1 text-sm text-muted-foreground">{formatDateTime(String(o.created_at))} • {brl(Number(o.total))} • {PAYMENT_STATUS_LABEL[String(o.payment_status)]}</p><p className="mt-1 text-xs text-muted-foreground">{String(o.customer_phone)} {o.address_neighborhood ? `• ${String(o.address_neighborhood)}` : "• Retirada"}</p></div><select value={String(o.status)} onChange={(e) => updateStatus(String(o.id), e.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm">{STATUSES.map((s) => <option key={s} value={s}>{ORDER_STATUS_LABEL[s]}</option>)}</select></div></div>; })}</div>
    </section>
  );
}

function Products() {
  const { data, refetch, isLoading } = useQuery({ queryKey: ["admin-products"], queryFn: async () => { const { data, error } = await supabase.from("products").select("*").order("sort_order"); if (error) throw error; return data ?? []; } });
  if (isLoading) return <p>Carregando produtos…</p>;
  const active = (data ?? []).filter((p) => p.is_available);
  const low = active.filter((p) => p.stock != null && p.stock <= 5);
  return (
    <section>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><h2 className="font-display text-2xl font-extrabold">Cardápio e estoque</h2><p className="text-sm text-muted-foreground">Troque preço, foto, estoque e disponibilidade sem mexer no código.</p></div><div className="flex gap-2 text-xs font-bold"><span className="rounded-full bg-emerald-50 px-3 py-2 text-emerald-800">{active.length} ativos</span>{low.length > 0 && <span className="rounded-full bg-amber-50 px-3 py-2 text-amber-800">{low.length} com estoque baixo</span>}</div></div>
      <div className="grid gap-4 lg:grid-cols-2">{(data ?? []).map((p) => <ProductEditor key={p.id} product={p as unknown as ProductRow} onSaved={() => void refetch()} />)}</div>
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
  const uploadPhoto = async (file: File) => { setUploading(true); const ext = file.name.split(".").pop()?.toLowerCase() || "jpg"; const path = `${product.slug}-${Date.now()}.${ext}`; const { error } = await supabase.storage.from("product-images").upload(path, file, { upsert: true, contentType: file.type }); if (error) toast.error(error.message); else { const { data } = supabase.storage.from("product-images").getPublicUrl(path); setImageUrl(data.publicUrl); toast.success("Foto enviada. Clique em Salvar produto."); } setUploading(false); };
  const save = async () => { setSaving(true); const numericPrice = Number(price.replace(",", ".")); if (!Number.isFinite(numericPrice) || numericPrice < 0) { toast.error("Preço inválido."); setSaving(false); return; } const { error } = await supabase.from("products").update({ name: name.trim(), price: numericPrice, stock: stock.trim() === "" ? null : Number(stock), image_url: imageUrl.trim() || null, is_available: available, is_featured: featured }).eq("id", product.id); setSaving(false); if (error) toast.error(error.message); else { toast.success("Produto atualizado"); onSaved(); } };
  const lowStock = available && product.stock != null && product.stock <= 5;
  return (
    <article className="rounded-3xl border border-border bg-card p-4 shadow-sm">
      {lowStock && <p className="mb-3 flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2 text-xs font-bold text-amber-900"><AlertTriangle className="h-4 w-4" /> Estoque baixo: {product.stock} unidades</p>}
      <div className="flex gap-4"><div className="h-28 w-28 shrink-0 overflow-hidden rounded-2xl bg-muted">{imageUrl ? <img src={imageUrl} alt={name} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-3xl">🍧</div>}</div><div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-2"><div className="sm:col-span-2"><Label>Nome</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div><div><Label>Preço</Label><Input inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} /></div><div><Label>Estoque</Label><Input inputMode="numeric" value={stock} onChange={(e) => setStock(e.target.value.replace(/\D/g, ""))} placeholder="Sem limite" /></div></div></div>
      <div className="mt-4 grid gap-3"><div><Label>URL da foto</Label><Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." /></div><label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-border px-4 py-3 text-sm font-medium hover:bg-accent"><ImagePlus className="h-4 w-4" /> {uploading ? "Enviando foto…" : "Enviar foto do produto"}<input className="hidden" type="file" accept="image/jpeg,image/png,image/webp" disabled={uploading} onChange={(e) => { const file = e.target.files?.[0]; if (file) void uploadPhoto(file); }} /></label><div className="flex flex-wrap gap-4 text-sm"><label className="flex items-center gap-2"><input type="checkbox" checked={available} onChange={(e) => setAvailable(e.target.checked)} /> Disponível</label><label className="flex items-center gap-2"><input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} /> Destaque na home</label></div><Button onClick={save} disabled={saving}>{saving ? "Salvando…" : "Salvar produto"}</Button></div>
    </article>
  );
}

function StoreSettings() {
  const { data, refetch, isLoading } = useQuery({ queryKey: ["admin-store-settings"], queryFn: async () => { const { data, error } = await supabase.from("settings").select("key,value").eq("key", "store").maybeSingle(); if (error) throw error; return (data?.value ?? {}) as Record<string, unknown>; } });
  const initial = useMemo(() => ({ minOrder: String(Number(data?.min_order ?? 20)), whatsapp: String(data?.whatsapp ?? ""), accepting: data?.accepting_orders !== false }), [data]);
  const [minOrder, setMinOrder] = useState("20"); const [whatsapp, setWhatsapp] = useState(""); const [accepting, setAccepting] = useState(true);
  useEffect(() => { setMinOrder(initial.minOrder); setWhatsapp(initial.whatsapp); setAccepting(initial.accepting); }, [initial]);
  if (isLoading) return <p>Carregando configurações…</p>;
  const save = async () => { const current = data ?? {}; const value = { ...current, min_order: Number(minOrder.replace(",", ".")) || 0, whatsapp, accepting_orders: accepting }; const { error } = await supabase.from("settings").upsert({ key: "store", value, is_public: true }); if (error) toast.error(error.message); else { toast.success("Configurações salvas"); void refetch(); } };
  return <section className="max-w-2xl rounded-3xl border border-border bg-card p-6 shadow-sm"><h2 className="font-display text-2xl font-extrabold">Configurações da loja</h2><p className="mt-1 text-sm text-muted-foreground">Controle regras importantes do delivery.</p><div className="mt-6 grid gap-4"><div><Label>Pedido mínimo (R$)</Label><Input inputMode="decimal" value={minOrder} onChange={(e) => setMinOrder(e.target.value)} /><p className="mt-1 text-xs text-muted-foreground">Configurado em R$ 20,00 para ajudar a cobrir o custo do frete.</p></div><div><Label>WhatsApp da loja</Label><Input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="(19) 99999-9999" /></div><label className="flex items-center gap-3 rounded-2xl bg-accent/60 p-4"><input type="checkbox" checked={accepting} onChange={(e) => setAccepting(e.target.checked)} /><span><strong>Receber pedidos agora</strong><span className="block text-xs text-muted-foreground">Desative para pausar novos pedidos no site.</span></span></label><Button onClick={save}>Salvar configurações</Button></div></section>;
}

function Metric({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return <div className="rounded-2xl border border-border bg-card p-4 shadow-sm"><p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p><p className="mt-1 font-display text-2xl font-extrabold text-ink">{value}</p>{hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}</div>;
}
