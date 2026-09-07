-- Delivery catalog and admin image management

insert into public.settings (key, value, is_public)
values (
  'store',
  jsonb_build_object(
    'name','O Ponto do Geladinho Gourmet',
    'city','Indaiatuba',
    'state','SP',
    'pickup_enabled',true,
    'scheduling_enabled',true,
    'restrict_delivery_area',true,
    'accepting_orders',true,
    'min_order',20
  ),
  true
)
on conflict (key) do update
set value = public.settings.value || excluded.value,
    is_public = true;

insert into storage.buckets (id, name, public)
values ('product-images','product-images',true)
on conflict (id) do update set public = true;

create policy "public read product images"
on storage.objects for select
to public
using (bucket_id = 'product-images');

create policy "admins upload product images"
on storage.objects for insert
to authenticated
with check (bucket_id = 'product-images' and public.has_role(auth.uid(),'admin'));

create policy "admins update product images"
on storage.objects for update
to authenticated
using (bucket_id = 'product-images' and public.has_role(auth.uid(),'admin'))
with check (bucket_id = 'product-images' and public.has_role(auth.uid(),'admin'));

create policy "admins delete product images"
on storage.objects for delete
to authenticated
using (bucket_id = 'product-images' and public.has_role(auth.uid(),'admin'));

with cat as (
  select id from public.categories where slug = 'cremosos' limit 1
), items(name,slug,description,price,sort_order,is_best_seller) as (
  values
    ('Abacaxi com Geleia','abacaxi-com-geleia','Geladinho cremoso de abacaxi com geleia de fruta.',8.00,1,false),
    ('Pudim','pudim','Cremoso com sabor de pudim e toque de caramelo.',8.00,2,false),
    ('Oreo','oreo','Base cremosa com pedaços de biscoito Oreo.',8.00,3,true),
    ('Maracujá com Geleia de Maracujá','maracuja-com-geleia','Maracujá cremoso com geleia da própria fruta.',8.00,4,false),
    ('Prestígio','prestigio','Chocolate com coco em uma combinação clássica.',8.00,5,false),
    ('Sensação','sensacao','Morango cremoso com chocolate.',8.00,6,true),
    ('Ninho com Morango','ninho-com-morango','Leite Ninho cremoso com morango.',9.00,7,true),
    ('Ninho com Nutella','ninho-com-nutella','Leite Ninho cremoso com recheio de Nutella.',9.00,8,true),
    ('Maracujá com Nutella','maracuja-com-nutella','Maracujá com recheio cremoso de Nutella.',9.00,9,false),
    ('Maracujá com Chocolate','maracuja-com-chocolate','Maracujá cremoso com chocolate.',9.00,10,false),
    ('Morango Cravejado','morango-cravejado','Morango premium, caprichado e super recheado.',12.00,11,true)
)
insert into public.products (
  category_id,name,slug,description,price,sort_order,is_available,is_featured,is_best_seller,is_demo
)
select cat.id, items.name, items.slug, items.description, items.price, items.sort_order, true, items.is_best_seller, items.is_best_seller, false
from items cross join cat
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  sort_order = excluded.sort_order,
  is_available = true,
  is_featured = excluded.is_featured,
  is_best_seller = excluded.is_best_seller,
  is_demo = false;

-- Remove old demo catalog entries from the storefront without deleting historical data.
update public.products
set is_available = false, is_featured = false
where slug not in (
  'abacaxi-com-geleia','pudim','oreo','maracuja-com-geleia','prestigio','sensacao',
  'ninho-com-morango','ninho-com-nutella','maracuja-com-nutella','maracuja-com-chocolate','morango-cravejado'
) and is_demo = true;
