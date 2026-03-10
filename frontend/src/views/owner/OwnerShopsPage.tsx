import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api } from "../../lib/api";
import type { Shop } from "../../lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { EmptyState } from "../../components/ui/EmptyState";
import { useToast } from "../../components/ui/Toast";
import { useAuth } from "../../state/auth";

export function OwnerShopsPage() {
  const { user } = useAuth();
  const { push } = useToast();
  const qc = useQueryClient();
  const [shopName, setShopName] = useState("");
  const [category, setCategory] = useState("");
  const [address, setAddress] = useState("");

  const shopsQuery = useQuery({
    queryKey: ["ownerShops"],
    queryFn: async () => {
      const res = await api.get<Shop[]>("/shops/mine");
      return res.data;
    },
    enabled: user?.role === "shopOwner",
  });
  const shops = shopsQuery.data ?? [];

  const createShop = useMutation({
    mutationFn: async () => {
      const res = await api.post<Shop>("/shops", {
        shopName: shopName.trim(),
        category: category.trim(),
        location: { address: address.trim() },
      });
      return res.data;
    },
    onSuccess: async () => {
      push("Shop created (pending verification)", "success");
      setShopName("");
      setCategory("");
      setAddress("");
      await qc.invalidateQueries({ queryKey: ["ownerShops"] });
    },
    onError: (e) => push((e as Error).message, "danger"),
  });

  const canSubmit = useMemo(
    () => shopName.trim() && category.trim() && address.trim(),
    [shopName, category, address]
  );

  if (user?.role !== "shopOwner") {
    return (
      <EmptyState
        title="Shop owner only"
        description="This page is available for shop owner accounts."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">My shops</h1>
        <p className="mt-1 text-sm text-slate-600">
          Create and manage your shops, products and orders.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create shop</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <Input label="Shop name" value={shopName} onChange={(e) => setShopName(e.target.value)} />
          <Input label="Category" value={category} onChange={(e) => setCategory(e.target.value)} />
          <Input
            label="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
          <div className="md:col-span-3">
            <Button
              isLoading={createShop.isPending}
              disabled={!canSubmit}
              onClick={() => createShop.mutate()}
            >
              Create
            </Button>
          </div>
        </CardContent>
      </Card>

      {shopsQuery.isLoading ? (
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
      ) : shopsQuery.isError ? (
        <EmptyState title="Couldn’t load shops" description={(shopsQuery.error as Error).message} />
      ) : shops.length === 0 ? (
        <EmptyState title="No shops yet" description="Create your first shop above." />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {shops.map((s) => (
            <Card key={s._id}>
              <CardHeader>
                <CardTitle>{s.shopName}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-slate-700">{s.location?.address}</div>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700 ring-1 ring-slate-200">
                    {s.category}
                  </span>
                  <span
                    className={
                      "rounded-full px-3 py-1 font-medium ring-1 " +
                      (s.isVerified
                        ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                        : "bg-amber-50 text-amber-700 ring-amber-200")
                    }
                  >
                    {s.isVerified ? "Verified" : "Pending verification"}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link to={`/owner/shops/${s._id}/products`}>
                    <Button variant="secondary" size="sm">
                      Products
                    </Button>
                  </Link>
                  <Link to={`/owner/shops/${s._id}/orders`}>
                    <Button variant="secondary" size="sm">
                      Orders
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

