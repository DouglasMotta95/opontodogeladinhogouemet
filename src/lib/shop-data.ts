import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  emoji: string | null;
  sort_order: number;
  is_active: boolean;
};

export type Product = {
  id: string;
  category_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  ingredients: string | null;
  price: number;
  compare_at_price: number | null;
  image_url: string | null;
  is_available: boolean;
  is_featured: boolean;
  is_best_seller: boolean;
  is_combo: boolean;
  combo_units: number | null;
  stock: number | null;
  sort_order: number;
  is_demo: boolean;
};

export type DeliveryArea = {
  id: string;
  neighborhood: string;
  city: string;
  state: string;
  delivery_fee: number;
  min_order: number;
  eta_minutes: number | null;
  is_active: boolean;
};

export type BusinessHour = {
  id: string;
  weekday: number;
  is_open: boolean;
  opens_at: string | null;
  closes_at: string | null;
  break_start: string | null;
  break_end: string | null;
};

export type StoreSettings = {
  name: string;
  city: string;
  state: string;
  address: string;
  whatsapp: string;
  phone: string;
  email: string;
  pickup_enabled: boolean;
  scheduling_enabled: boolean;
  restrict_delivery_area: boolean;
  accepting_orders: boolean;
  min_order: number;
};

export type SocialSettings = {
  instagram: string;
  facebook: string;
  ifood: string;
  food99: string;
};

export type MarketingSettings = { meta_pixel_id: string; ga_measurement_id: string };

export type PaymentSettings = {
  mercadopago_enabled: boolean;
  pix_enabled: boolean;
  picpay_enabled: boolean;
  cash_enabled: boolean;
  card_on_delivery_enabled: boolean;
};

export type SettingsBundle = {
  store: StoreSettings;
  social: SocialSettings;
  marketing: MarketingSettings;
  payments: PaymentSettings;
};

export const DEFAULT_SETTINGS: SettingsBundle = {
  store: {
    name: "O Ponto do Geladinho Gourmet",
    city: "Indaiatuba",
    state: "SP",
    address: "",
    whatsapp: "",
    phone: "",
    email: "",
    pickup_enabled: true,
    scheduling_enabled: true,
    restrict_delivery_area: true,
    accepting_orders: true,
    min_order: 20,
  },
  social: { instagram: "", facebook: "", ifood: "", food99: "" },
  marketing: { meta_pixel_id: "", ga_measurement_id: "" },
  payments: {
    mercadopago_enabled: false,
    pix_enabled: false,
    picpay_enabled: false,
    cash_enabled: true,
    card_on_delivery_enabled: true,
  },
};

export const categoriesQuery = queryOptions({
  queryKey: ["categories"],
  queryFn: async (): Promise<Category[]> => {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("sort_order");
    if (error) throw error;
    return (data ?? []) as unknown as Category[];
  },
});

export const productsQuery = queryOptions({
  queryKey: ["products"],
  queryFn: async (): Promise<Product[]> => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_demo", false)
      .order("sort_order");
    if (error) throw error;
    return (data ?? []).map((p) => ({
      ...(p as unknown as Product),
      price: Number((p as { price: number }).price),
    }));
  },
});

export const deliveryAreasQuery = queryOptions({
  queryKey: ["delivery_areas"],
  queryFn: async (): Promise<DeliveryArea[]> => {
    const { data, error } = await supabase
      .from("delivery_areas")
      .select("*")
      .order("neighborhood");
    if (error) throw error;
    return (data ?? []).map((a) => ({
      ...(a as unknown as DeliveryArea),
      delivery_fee: Number((a as { delivery_fee: number }).delivery_fee),
      min_order: Number((a as { min_order: number }).min_order),
    }));
  },
});

export const businessHoursQuery = queryOptions({
  queryKey: ["business_hours"],
  queryFn: async (): Promise<BusinessHour[]> => {
    const { data, error } = await supabase.from("business_hours").select("*").order("weekday");
    if (error) throw error;
    return (data ?? []) as unknown as BusinessHour[];
  },
});

export const settingsQuery = queryOptions({
  queryKey: ["settings"],
  queryFn: async (): Promise<SettingsBundle> => {
    const { data, error } = await supabase.from("settings").select("key,value");
    if (error) throw error;
    const bundle = { ...DEFAULT_SETTINGS };
    for (const row of data ?? []) {
      const key = (row as { key: string }).key as keyof SettingsBundle;
      if (key in bundle) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (bundle as any)[key] = { ...(bundle as any)[key], ...((row as any).value ?? {}) };
      }
    }
    return bundle;
  },
});

export const reviewsQuery = queryOptions({
  queryKey: ["reviews"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("is_approved", true)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as unknown as {
      id: string;
      author_name: string;
      rating: number;
      comment: string | null;
      is_demo: boolean;
    }[];
  },
});

export const WEEKDAYS = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
];

export function isStoreOpenNow(hours: BusinessHour[], now = new Date()) {
  const today = hours.find((h) => h.weekday === now.getDay());
  if (!today || !today.is_open || !today.opens_at || !today.closes_at) return false;
  const minutes = now.getHours() * 60 + now.getMinutes();
  const toMin = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));
  if (minutes < toMin(today.opens_at) || minutes > toMin(today.closes_at)) return false;
  if (today.break_start && today.break_end) {
    if (minutes >= toMin(today.break_start) && minutes < toMin(today.break_end)) return false;
  }
  return true;
}

export function whatsappLink(whatsapp: string, message: string) {
  const digits = whatsapp.replace(/\D/g, "");
  if (!digits) return null;
  const withCountry = digits.startsWith("55") ? digits : `55${digits}`;
  return `https://wa.me/${withCountry}?text=${encodeURIComponent(message)}`;
}
