import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { api } from "../../lib/api";
import type { Product } from "../../lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { EmptyState } from "../../components/ui/EmptyState";
import { formatMoney } from "../../lib/utils";
import { useToast } from "../../components/ui/Toast";
import { useAuth } from "../../state/auth";

export function OwnerProductsPage() {
  const { user } = useAuth();
  const { shopId } = useParams();
  const { push } = useToast();
  const qc = useQueryClient();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [stock, setStock] = useState<number>(0);
  const [category, setCategory] = useState("");

  const productsQuery = useQuery({
    queryKey: ["products", { shopId }],
    queryFn: async () => {
      const res = await api.get<Product[]>(`/products/shop/${shopId}`);
      return res.data;
    },
    enabled: user?.role === "shopOwner" && !!shopId,
  });
  const products = productsQuery.data ?? [];

  const createProduct = useMutation({
    mutationFn: async () => {
      const res = await api.post<Product>("/products", {
        shopId,
        name: name.trim(),
        description: description.trim() || undefined,
        price,
        stock,
        category: category.trim() || undefined,
      });
      return res.data;
    },
    onSuccess: async () => {
      push("Product created", "success");
      setName("");
      setDescription("");
      setPrice(0);
      setStock(0);
      setCategory("");
      await qc.invalidateQueries({ queryKey: ["products", { shopId }] });
    },
    onError: (e) => push((e as Error).message, "danger"),
  });

  const deleteProduct = useMutation({
    mutationFn: async (productId: string) => {
      await api.delete(`/products/${productId}`);
    },
    onSuccess: async () => {
      push("Product deleted", "success");
      await qc.invalidateQueries({ queryKey: ["products", { shopId }] });
    },
    onError: (e) => push((e as Error).message, "danger"),
  });

  const canSubmit = useMemo(
    () => !!shopId && name.trim() && Number.isFinite(price) && Number.isFinite(stock),
    [shopId, name, price, stock]
  );

  if (user?.role !== "shopOwner") {
    return <EmptyState title="Shop owner only" description="This page is for shop owners." />;
  }
  if (!shopId) {
    return <EmptyState title="Invalid shop" description="Missing shop id." />;
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Products</h1>
        <p className="mt-1 text-sm text-slate-600">Manage your shop catalog.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add product</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Category (optional)" value={category} onChange={(e) => setCategory(e.target.value)} />
          <label className="block md:col-span-2">
            <div className="mb-1 text-sm font-medium text-slate-800">Description (optional)</div>
            <textarea
              className="min-h-24 w-full rounded-xl bg-white px-3 py-2 text-sm text-slate-900 ring-1 ring-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>
          <Input
            label="Price"
            type="number"
            min={0}
            value={String(price)}
            onChange={(e) => setPrice(Number(e.target.value))}
          />
          <Input
            label="Stock"
            type="number"
            min={0}
            value={String(stock)}
            onChange={(e) => setStock(Number(e.target.value))}
          />
          <div className="md:col-span-2">
            <Button
              isLoading={createProduct.isPending}
              disabled={!canSubmit}
              onClick={() => createProduct.mutate()}
            >
              Create product
            </Button>
          </div>
        </CardContent>
      </Card>

      {productsQuery.isLoading ? (
        <div className="grid gap-3 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 w-40 rounded bg-slate-100" />
              </CardHeader>
              <CardContent>
                <div className="h-4 w-3/4 rounded bg-slate-100" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : productsQuery.isError ? (
        <EmptyState title="Couldn’t load products" description={(productsQuery.error as Error).message} />
      ) : products.length === 0 ? (
        <EmptyState title="No products yet" description="Add your first product above." />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {products.map((p) => (
            <Card key={p._id}>
              <CardHeader className="flex flex-row items-start justify-between gap-3">
                <div className="min-w-0">
                  <CardTitle className="truncate">{p.name}</CardTitle>
                  <div className="mt-1 text-sm text-slate-600">
                    {p.category ? p.category : "Uncategorized"}
                  </div>
                </div>
                <div className="text-sm font-semibold text-slate-900">{formatMoney(p.price)}</div>
              </CardHeader>
              <CardContent className="flex items-center justify-between gap-3">
                <div className="text-sm text-slate-600">
                  Stock: <span className="font-medium text-slate-900">{p.stock}</span>
                </div>
                <Button
                  variant="danger"
                  size="sm"
                  isLoading={deleteProduct.isPending}
                  onClick={() => deleteProduct.mutate(p._id)}
                >
                  Delete
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

