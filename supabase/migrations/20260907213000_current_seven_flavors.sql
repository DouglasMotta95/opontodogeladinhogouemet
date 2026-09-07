-- Align storefront with the seven flavors currently being sold.
-- Keep historical products in the database for order history, but hide them from sale.

update public.products
set
  name = case slug
    when 'oreo' then 'Oreo'
    when 'pudim' then 'Pudim'
    when 'abacaxi-com-geleia' then 'Abacaxi com Geleia'
    when 'maracuja-com-geleia' then 'Maracujá com Geleia'
    when 'ninho-com-morango' then 'Ninho com Morango'
    when 'morango-cravejado' then 'Morango Cravejado'
    when 'prestigio' then 'Prestígio'
    else name
  end,
  description = case slug
    when 'oreo' then 'Base cremosa com pedaços de biscoito Oreo.'
    when 'pudim' then 'Geladinho cremoso com sabor de pudim e toque de caramelo.'
    when 'abacaxi-com-geleia' then 'Base cremosa de abacaxi com geleia da fruta.'
    when 'maracuja-com-geleia' then 'Maracujá cremoso com geleia da fruta.'
    when 'ninho-com-morango' then 'Base branca cremosa de Ninho com morango.'
    when 'morango-cravejado' then 'Base branca de Ninho com chocolate branco, pedaços de morango e crocante vermelho.'
    when 'prestigio' then 'Base branca cremosa com chocolate branco e toque de coco.'
    else description
  end,
  price = case slug
    when 'oreo' then 8.00
    when 'pudim' then 8.00
    when 'abacaxi-com-geleia' then 8.00
    when 'maracuja-com-geleia' then 8.00
    when 'ninho-com-morango' then 9.00
    when 'morango-cravejado' then 12.00
    when 'prestigio' then 8.00
    else price
  end,
  sort_order = case slug
    when 'morango-cravejado' then 1
    when 'pudim' then 2
    when 'oreo' then 3
    when 'ninho-com-morango' then 4
    when 'abacaxi-com-geleia' then 5
    when 'maracuja-com-geleia' then 6
    when 'prestigio' then 7
    else sort_order
  end,
  is_available = true,
  is_featured = slug in ('morango-cravejado','pudim'),
  is_best_seller = slug in ('morango-cravejado','pudim'),
  is_demo = false
where slug in (
  'oreo','pudim','abacaxi-com-geleia','maracuja-com-geleia',
  'ninho-com-morango','morango-cravejado','prestigio'
);

update public.products
set is_available = false, is_featured = false, is_best_seller = false
where slug in (
  'sensacao','ninho-com-nutella','maracuja-com-nutella','maracuja-com-chocolate'
);
