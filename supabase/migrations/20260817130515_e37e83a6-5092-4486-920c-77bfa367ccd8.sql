-- ROLES
create type public.app_role as enum ('admin','staff','user');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  created_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "own profile" on public.profiles for select to authenticated using (id = auth.uid());
create policy "own profile update" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "read own roles" on public.user_roles for select to authenticated using (user_id = auth.uid());
create policy "admins manage roles" on public.user_roles for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, new.raw_user_meta_data->>'full_name', new.email)
  on conflict (id) do nothing;
  return new;
end; $$;
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end; $$;

-- CATALOG
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  emoji text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.categories to anon;
grant select, insert, update, delete on public.categories to authenticated;
grant all on public.categories to service_role;
alter table public.categories enable row level security;
create policy "public read categories" on public.categories for select to anon, authenticated using (true);
create policy "admins manage categories" on public.categories for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create trigger t_categories_updated before update on public.categories for each row execute function public.touch_updated_at();

create table public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete set null,
  name text not null,
  slug text not null unique,
  description text,
  ingredients text,
  price numeric(10,2) not null default 0,
  compare_at_price numeric(10,2),
  image_url text,
  is_available boolean not null default true,
  is_featured boolean not null default false,
  is_best_seller boolean not null default false,
  is_combo boolean not null default false,
  combo_units int,
  stock int,
  sort_order int not null default 0,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.products to anon;
grant select, insert, update, delete on public.products to authenticated;
grant all on public.products to service_role;
alter table public.products enable row level security;
create policy "public read products" on public.products for select to anon, authenticated using (true);
create policy "admins manage products" on public.products for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create trigger t_products_updated before update on public.products for each row execute function public.touch_updated_at();

-- CUSTOMERS
create table public.customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null unique,
  email text,
  addresses jsonb not null default '[]'::jsonb,
  orders_count int not null default 0,
  total_spent numeric(10,2) not null default 0,
  last_order_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.customers to authenticated;
grant all on public.customers to service_role;
alter table public.customers enable row level security;
create policy "admins manage customers" on public.customers for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create trigger t_customers_updated before update on public.customers for each row execute function public.touch_updated_at();

-- DELIVERY AREAS
create table public.delivery_areas (
  id uuid primary key default gen_random_uuid(),
  neighborhood text not null,
  city text not null default 'Indaiatuba',
  state text not null default 'SP',
  delivery_fee numeric(10,2) not null default 0,
  min_order numeric(10,2) not null default 0,
  eta_minutes int,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.delivery_areas to anon;
grant select, insert, update, delete on public.delivery_areas to authenticated;
grant all on public.delivery_areas to service_role;
alter table public.delivery_areas enable row level security;
create policy "public read areas" on public.delivery_areas for select to anon, authenticated using (true);
create policy "admins manage areas" on public.delivery_areas for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create trigger t_areas_updated before update on public.delivery_areas for each row execute function public.touch_updated_at();

-- BUSINESS HOURS
create table public.business_hours (
  id uuid primary key default gen_random_uuid(),
  weekday int not null unique check (weekday between 0 and 6),
  is_open boolean not null default true,
  opens_at time,
  closes_at time,
  break_start time,
  break_end time,
  updated_at timestamptz not null default now()
);
grant select on public.business_hours to anon;
grant select, insert, update, delete on public.business_hours to authenticated;
grant all on public.business_hours to service_role;
alter table public.business_hours enable row level security;
create policy "public read hours" on public.business_hours for select to anon, authenticated using (true);
create policy "admins manage hours" on public.business_hours for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create trigger t_hours_updated before update on public.business_hours for each row execute function public.touch_updated_at();

-- SETTINGS (key/value)
create table public.settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  is_public boolean not null default true,
  updated_at timestamptz not null default now()
);
grant select on public.settings to anon;
grant select, insert, update, delete on public.settings to authenticated;
grant all on public.settings to service_role;
alter table public.settings enable row level security;
create policy "public read public settings" on public.settings for select to anon, authenticated using (is_public = true);
create policy "admins manage settings" on public.settings for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create trigger t_settings_updated before update on public.settings for each row execute function public.touch_updated_at();

-- COUPONS
create table public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  description text,
  discount_type text not null default 'percent' check (discount_type in ('percent','fixed')),
  discount_value numeric(10,2) not null default 0,
  min_order numeric(10,2) not null default 0,
  starts_at timestamptz,
  expires_at timestamptz,
  usage_limit int,
  usage_count int not null default 0,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.coupons to authenticated;
grant all on public.coupons to service_role;
alter table public.coupons enable row level security;
create policy "admins manage coupons" on public.coupons for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create trigger t_coupons_updated before update on public.coupons for each row execute function public.touch_updated_at();

-- ORDERS
create sequence public.order_number_seq start 1024;

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number int not null unique default nextval('public.order_number_seq'),
  public_token text not null unique default encode(gen_random_bytes(16),'hex'),
  customer_id uuid references public.customers(id) on delete set null,
  customer_name text not null,
  customer_phone text not null,
  fulfillment text not null default 'delivery' check (fulfillment in ('delivery','pickup')),
  address_street text,
  address_number text,
  address_complement text,
  address_neighborhood text,
  address_reference text,
  delivery_area_id uuid references public.delivery_areas(id) on delete set null,
  notes text,
  scheduled_for timestamptz,
  status text not null default 'received' check (status in ('received','confirmed','preparing','out_for_delivery','delivered','cancelled')),
  payment_method text not null default 'pix' check (payment_method in ('pix','online_card','cash','card_on_delivery')),
  payment_status text not null default 'pending' check (payment_status in ('pending','approved','rejected','in_process','cancelled','refunded','not_required')),
  subtotal numeric(10,2) not null default 0,
  discount numeric(10,2) not null default 0,
  delivery_fee numeric(10,2) not null default 0,
  total numeric(10,2) not null default 0,
  coupon_code text,
  utm jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.orders to authenticated;
grant all on public.orders to service_role;
alter table public.orders enable row level security;
create policy "admins manage orders" on public.orders for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create trigger t_orders_updated before update on public.orders for each row execute function public.touch_updated_at();

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  unit_price numeric(10,2) not null default 0,
  quantity int not null default 1,
  line_total numeric(10,2) not null default 0,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.order_items to authenticated;
grant all on public.order_items to service_role;
alter table public.order_items enable row level security;
create policy "admins manage order items" on public.order_items for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  provider text not null default 'mercadopago' check (provider in ('mercadopago','picpay','manual')),
  method text,
  external_id text,
  status text not null default 'pending',
  amount numeric(10,2) not null default 0,
  qr_code text,
  qr_code_base64 text,
  checkout_url text,
  raw jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.payments to authenticated;
grant all on public.payments to service_role;
alter table public.payments enable row level security;
create policy "admins manage payments" on public.payments for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create trigger t_payments_updated before update on public.payments for each row execute function public.touch_updated_at();

-- REVIEWS
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  author_name text not null,
  rating int not null default 5 check (rating between 1 and 5),
  comment text,
  is_approved boolean not null default false,
  is_demo boolean not null default false,
  created_at timestamptz not null default now()
);
grant select on public.reviews to anon;
grant select, insert, update, delete on public.reviews to authenticated;
grant all on public.reviews to service_role;
alter table public.reviews enable row level security;
create policy "public read approved reviews" on public.reviews for select to anon, authenticated using (is_approved = true);
create policy "admins manage reviews" on public.reviews for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- NOTIFICATIONS
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade,
  channel text not null default 'internal' check (channel in ('internal','whatsapp','email')),
  event text not null,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'queued' check (status in ('queued','sent','failed','skipped')),
  error text,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.notifications to authenticated;
grant all on public.notifications to service_role;
alter table public.notifications enable row level security;
create policy "admins manage notifications" on public.notifications for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- ABANDONED CARTS
create table public.abandoned_carts (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  customer_name text,
  customer_phone text,
  items jsonb not null default '[]'::jsonb,
  subtotal numeric(10,2) not null default 0,
  reached_checkout boolean not null default false,
  recovered boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.abandoned_carts to authenticated;
grant all on public.abandoned_carts to service_role;
alter table public.abandoned_carts enable row level security;
create policy "admins manage carts" on public.abandoned_carts for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create trigger t_carts_updated before update on public.abandoned_carts for each row execute function public.touch_updated_at();

-- SEED
insert into public.categories (name, slug, description, emoji, sort_order) values
  ('Mais vendidos','mais-vendidos','Os queridinhos da galera','⭐',1),
  ('Cremosos','cremosos','Textura cremosa e recheio generoso','🍦',2),
  ('Frutas','frutas','Refrescância de fruta de verdade','🍓',3),
  ('Chocolates','chocolates','Para quem ama chocolate','🍫',4),
  ('Especiais','especiais','Criações exclusivas da casa','✨',5),
  ('Combos','combos','Peça mais e economize','📦',6);

insert into public.business_hours (weekday, is_open, opens_at, closes_at) values
  (0,true,'12:00','20:00'),(1,true,'10:00','20:00'),(2,true,'10:00','20:00'),
  (3,true,'10:00','20:00'),(4,true,'10:00','20:00'),(5,true,'10:00','22:00'),(6,true,'10:00','22:00');

insert into public.settings (key, value, is_public) values
  ('store', '{"name":"O Ponto do Geladinho Gourmet","city":"Indaiatuba","state":"SP","address":"","whatsapp":"","phone":"","email":"","pickup_enabled":true,"scheduling_enabled":true,"restrict_delivery_area":true,"accepting_orders":true,"min_order":0}'::jsonb, true),
  ('social', '{"instagram":"","facebook":"","ifood":"","food99":""}'::jsonb, true),
  ('marketing', '{"meta_pixel_id":"","ga_measurement_id":""}'::jsonb, true),
  ('payments', '{"mercadopago_enabled":false,"pix_enabled":false,"picpay_enabled":false,"cash_enabled":true,"card_on_delivery_enabled":true}'::jsonb, true);

insert into public.products (category_id, name, slug, description, ingredients, price, image_url, is_featured, is_best_seller, is_demo, sort_order)
select c.id, v.name, v.slug, v.descr, v.ing, v.price, null, v.feat, v.best, true, v.ord
from (values
  ('cremosos','Geladinho de Ninho com Nutella','ninho-nutella','Creme de leite ninho aveludado com recheio generoso de avelã.','Leite, leite em pó, creme de leite, creme de avelã.',10.00,true,true,1),
  ('cremosos','Geladinho de Leite Condensado','leite-condensado','Clássico cremoso, doce na medida certa.','Leite, leite condensado, creme de leite.',8.00,false,true,2),
  ('frutas','Geladinho de Morango Cremoso','morango-cremoso','Morangos selecionados batidos no creme.','Morango, leite, creme de leite, açúcar.',9.00,true,true,3),
  ('frutas','Geladinho de Maracujá','maracuja','Refrescante, com polpa natural de maracujá.','Polpa de maracujá, leite condensado, creme de leite.',9.00,false,false,4),
  ('chocolates','Geladinho de Chocolate Belga','chocolate-belga','Chocolate intenso com textura de trufa.','Chocolate, leite, creme de leite.',11.00,true,false,5),
  ('especiais','Geladinho de Pistache','pistache','Criação especial da casa com pistache.','Pistache, leite, creme de leite.',13.00,false,false,6)
) as v(cat,name,slug,descr,ing,price,feat,best,ord)
join public.categories c on c.slug = v.cat;

insert into public.products (category_id, name, slug, description, price, is_combo, combo_units, is_featured, is_demo, sort_order)
select c.id, v.name, v.slug, v.descr, v.price, true, v.units, v.feat, true, v.ord
from (values
  ('Combo 5 unidades','combo-5','Monte seu combo com 5 geladinhos.',45.00,5,true,1),
  ('Combo 10 unidades','combo-10','10 geladinhos com preço especial.',85.00,10,true,2),
  ('Combo 15 unidades','combo-15','15 geladinhos para dividir (ou não).',120.00,15,false,3),
  ('Combo Família','combo-familia','Seleção variada para a família toda.',150.00,20,false,4)
) as v(name,slug,descr,price,units,feat,ord)
cross join lateral (select id from public.categories where slug='combos') c;

insert into public.coupons (code, description, discount_type, discount_value, min_order, is_active) values
  ('BEMVINDO','Cupom demonstrativo de boas-vindas','percent',10,0,false),
  ('PRIMEIRACOMPRA','Cupom demonstrativo primeira compra','fixed',5,30,false),
  ('FIMDESEMANA','Cupom demonstrativo de fim de semana','percent',15,50,false);

insert into public.reviews (author_name, rating, comment, is_approved, is_demo) values
  ('Avaliação demonstrativa',5,'Cremoso demais, virou meu favorito. Entrega rápida!',true,true),
  ('Avaliação demonstrativa',5,'Sabor incrível e embalagem linda. Recomendo!',true,true),
  ('Avaliação demonstrativa',5,'Pedi para a família toda e todo mundo amou.',true,true);