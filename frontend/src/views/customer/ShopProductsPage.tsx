import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import type { Product, Shop } from "../../lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { formatMoney } from "../../lib/utils";
import { useCart } from "../../state/cart";
import { useToast } from "../../components/ui/Toast";

export function ShopProductsPage() {
  const { shopId } = useParams();
  const { add, shop: cartShop } = useCart();
  const { push } = useToast();

  const shopQuery = useQuery({
    queryKey: ["shop", shopId],
    queryFn: async () => {
      const res = await api.get<Shop[]>("/shops");
      const match = res.data.find((s) => s._id === shopId);
      if (!match) throw new Error("Shop not found");
      return match;
    },
    enabled: !!shopId,
  });

  const productsQuery = useQuery({
    queryKey: ["products", { shopId }],
    queryFn: async () => {
      const res = await api.get<Product[]>(`/products/shop/${shopId}`);
      return res.data;
    },
    enabled: !!shopId,
  });
  const products = productsQuery.data ?? [];

  const header = useMemo(() => {
    if (!shopQuery.data) return null;
    return (
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            {shopQuery.data.shopName}
          </h1>
          <p className="mt-1 text-sm text-slate-600">{shopQuery.data.location?.address}</p>
        </div>
        <div className="text-sm font-medium text-slate-700">
          Category: <span className="text-slate-900">{shopQuery.data.category}</span>
        </div>
      </div>
    );
  }, [shopQuery.data]);

  if (!shopId) {
    return <EmptyState title="Invalid shop" description="Missing shop id." />;
  }

  return (
    <div className="space-y-4">
      {shopQuery.isLoading ? (
        <div className="h-16 animate-pulse rounded-2xl bg-white ring-1 ring-slate-200" />
      ) : shopQuery.isError ? (
        <EmptyState title="Couldn’t load shop" description={(shopQuery.error as Error).message} />
      ) : (
        header
      )}

      {productsQuery.isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 w-40 rounded bg-slate-100" />
              </CardHeader>
              <CardContent>
                <div className="h-4 w-3/4 rounded bg-slate-100" />
                <div className="mt-3 h-10 w-28 rounded bg-slate-100" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : productsQuery.isError ? (
        <EmptyState
          title="Couldn’t load products"
          description={(productsQuery.error as Error).message}
        />
      ) : products.length === 0 ? (
        <EmptyState title="No products yet" description="This shop has no active products." />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {products.map((p) => (
            <Card key={p._id}>
              <CardHeader className="flex flex-row items-start justify-between gap-3">
                <div className="min-w-0">
                  <CardTitle className="truncate">{p.name}</CardTitle>
                  {p.description ? (
                    <div className="mt-1 line-clamp-2 text-sm text-slate-600">{p.description}</div>
                  ) : (
                    <div className="mt-1 text-sm text-slate-500">No description</div>
                  )}
                </div>
                <div className="text-sm font-semibold text-slate-900">{formatMoney(p.price)}</div>
              </CardHeader>
              <CardContent className="flex items-center justify-between gap-3">
                <div className="text-sm text-slate-600">
                  Stock: <span className="font-medium text-slate-900">{p.stock}</span>
                </div>
                <Button
                  onClick={() => {
                    const shop = shopQuery.data;
                    if (!shop) return;
                    if (cartShop && cartShop._id !== shop._id) {
                      push("Your cart contains items from another shop. Clear it first.", "danger");
                      return;
                    }
                    add(shop, p);
                    push("Added to cart", "success");
                  }}
                >
                  Add
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

