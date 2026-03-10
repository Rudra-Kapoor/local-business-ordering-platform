import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import type { Shop } from "../../lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { EmptyState } from "../../components/ui/EmptyState";
import { useAuth } from "../../state/auth";
import { useToast } from "../../components/ui/Toast";

type AdminShop = Shop & { ownerId: { name: string; email: string } | string };

export function AdminShopsPage() {
  const { user } = useAuth();
  const { push } = useToast();
  const qc = useQueryClient();

  const shopsQuery = useQuery({
    queryKey: ["adminShops"],
    queryFn: async () => {
      const res = await api.get<AdminShop[]>("/shops/admin/all");
      return res.data;
    },
    enabled: user?.role === "admin",
  });
  const shops = shopsQuery.data ?? [];

  const verify = useMutation({
    mutationFn: async (shopId: string) => {
      const res = await api.patch<Shop>(`/shops/admin/${shopId}/verify`);
      return res.data;
    },
    onSuccess: async () => {
      push("Shop verified", "success");
      await qc.invalidateQueries({ queryKey: ["adminShops"] });
    },
    onError: (e) => push((e as Error).message, "danger"),
  });

  if (user?.role !== "admin") {
    return <EmptyState title="Admin only" description="This page is available for admins." />;
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Verify shops</h1>
        <p className="mt-1 text-sm text-slate-600">
          Review new shops and approve them for customers.
        </p>
      </div>

      {shopsQuery.isLoading ? (
        <div className="grid gap-3 md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
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
        <EmptyState title="No shops" description="No shops exist yet." />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {shops.map((s) => {
            const owner =
              typeof s.ownerId === "string" ? null : (s.ownerId as { name: string; email: string });
            return (
              <Card key={s._id}>
                <CardHeader className="flex flex-row items-center justify-between gap-3">
                  <CardTitle className="truncate">{s.shopName}</CardTitle>
                  {s.isVerified ? <Badge tone="success">Verified</Badge> : <Badge tone="warning">Pending</Badge>}
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm text-slate-700">{s.location?.address}</div>
                  <div className="text-sm text-slate-700">
                    Category: <span className="font-medium text-slate-900">{s.category}</span>
                  </div>
                  {owner ? (
                    <div className="rounded-xl bg-slate-50 p-3 text-sm ring-1 ring-slate-200">
                      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Owner
                      </div>
                      <div className="mt-1 font-medium text-slate-900">{owner.name}</div>
                      <div className="text-slate-600">{owner.email}</div>
                    </div>
                  ) : null}
                  {!s.isVerified ? (
                    <Button
                      isLoading={verify.isPending}
                      onClick={() => verify.mutate(s._id)}
                    >
                      Verify
                    </Button>
                  ) : null}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

