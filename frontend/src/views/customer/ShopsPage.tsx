import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api } from "../../lib/api";
import type { Shop } from "../../lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Badge } from "../../components/ui/Badge";
import { EmptyState } from "../../components/ui/EmptyState";

export function ShopsPage() {
  const [category, setCategory] = useState("");

  const queryKey = useMemo(
    () => ["shops", { category: category.trim() || null }],
    [category]
  );

  const shopsQuery = useQuery({
    queryKey,
    queryFn: async () => {
      const res = await api.get<Shop[]>("/shops", {
        params: category.trim() ? { category: category.trim() } : undefined,
      });
      return res.data;
    },
  });
  const shops = shopsQuery.data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Shops</h1>
          <p className="mt-1 text-sm text-slate-600">
            Browse verified local shops and start an order.
          </p>
        </div>
        <div className="w-full sm:w-80">
          <Input
            label="Filter by category"
            placeholder="e.g. Grocery, Bakery…"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
        </div>
      </div>

      {shopsQuery.isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 w-40 rounded bg-slate-100" />
              </CardHeader>
              <CardContent>
                <div className="h-4 w-3/4 rounded bg-slate-100" />
                <div className="mt-3 h-8 w-24 rounded bg-slate-100" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : shopsQuery.isError ? (
        <EmptyState
          title="Couldn’t load shops"
          description={(shopsQuery.error as Error).message}
        />
      ) : shops.length === 0 ? (
        <EmptyState
          title="No shops found"
          description="Try a different category filter."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {shops.map((s) => (
            <Link key={s._id} to={`/shops/${s._id}`} className="group">
              <Card className="transition group-hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between gap-3">
                  <CardTitle className="truncate">{s.shopName}</CardTitle>
                  <Badge tone="success">Verified</Badge>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-slate-700">{s.location?.address}</div>
                  <div className="mt-3 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200">
                    {s.category}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

