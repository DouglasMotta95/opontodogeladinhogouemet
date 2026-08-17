import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ProductCard } from "@/components/site/ProductCard";
import { productsQuery } from "@/lib/shop-data";
import { useCart } from "@/lib/cart";
import { brl } from "@/lib/format";

export const Route = createFileRoute("/produto/$slug")({
  head: ({ params }) => {
    const name = params.slug.replace(/-/g, " ");
    const title = `Geladinho ${name} | O Ponto do Geladinho Gourmet`;
    const description = `Peça o geladinho gourmet de ${name} online e receba em casa, sempre gelado e cremoso.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "product" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
      ],
    };
  },
  component: ProdutoPage,
});

function ProdutoPage() {
  const { slug } = Route.useParams();
  const { data: products } = useQuery(productsQuery);
  const { add, setOpen } = useCart();
  const [qty, setQty] = useState(1);

  const product = (products ?? []).find((p) => p.slug === slug);
  const related = (products ?? []).filter((p) => p.slug !== slug).slice(0, 4);

  if (!product) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-3xl px-4 py-24 text-center">
          <h1 className="font-display text-3xl font-bold">Produto não encontrado</h1>
          <Button asChild className="mt-6">
            <Link to="/cardapio">Voltar ao cardápio</Link>
          </Button>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 lg:grid-cols-2 lg:px-8">
        <div className="overflow-hidden rounded-3xl bg-muted shadow-card">
          {product.image_url && (
            <img src={product.image_url} alt={product.name} className="w-full object-cover" />
          )}
        </div>
        <div className="space-y-5">
          <h1 className="font-display text-4xl font-extrabold text-ink">{product.name}</h1>
          <p className="text-lg text-muted-foreground">{product.description}</p>
          {product.ingredients && (
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">Ingredientes: </span>
              {product.ingredients}
            </p>
          )}
          <p className="text-3xl font-extrabold text-brand-deep">{brl(product.price)}</p>

          <div className="flex items-center gap-3">
            <div className="flex items-center rounded-full border border-border">
              <button
                className="px-4 py-2"
                aria-label="Diminuir"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
              >
                −
              </button>
              <span className="w-8 text-center font-semibold">{qty}</span>
              <button className="px-4 py-2" aria-label="Aumentar" onClick={() => setQty((q) => q + 1)}>
                +
              </button>
            </div>
            <Button
              size="lg"
              disabled={!product.is_available}
              onClick={() => {
                add(
                  {
                    productId: product.id,
                    name: product.name,
                    slug: product.slug,
                    price: Number(product.price),
                    imageUrl: product.image_url,
                  },
                  qty,
                );
                toast.success("Adicionado ao carrinho");
                setOpen(true);
              }}
            >
              {product.is_available ? "Adicionar ao carrinho" : "Esgotado"}
            </Button>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <div className="mx-auto max-w-7xl px-4 pb-16 lg:px-8">
          <h2 className="mb-6 font-display text-2xl font-extrabold">Você também vai amar</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </SiteLayout>
  );
}
