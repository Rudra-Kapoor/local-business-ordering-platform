import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import type { Order } from "../../lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { EmptyState } from "../../components/ui/EmptyState";
import { formatDateTime, formatMoney } from "../../lib/utils";
import { useAuth } from "../../state/auth";
import { getSocket } from "../../lib/socket";

function statusTone(status: Order["status"]) {
  switch (status) {
    case "completed":
      return "success";
    case "cancelled":
      return "danger";
    case "ready":
      return "info";
    case "confirmed":
    case "preparing":
      return "warning";
    default:
      return "neutral";
  }
}

export function MyOrdersPage() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const ordersQuery = useQuery({
    queryKey: ["myOrders"],
    queryFn: async () => {
      const res = await api.get<Order[]>("/orders/my");
      return res.data;
    },
  });
  const orders = ordersQuery.data ?? [];

  useEffect(() => {
    if (!user) return;
    const socket = getSocket();
    socket.emit("joinRoom", { type: "user", id: user.id });
    const handler = (order: Order) => {
      qc.setQueryData<Order[]>(["myOrders"], (prev) => {
        if (!prev) return [order];
        const idx = prev.findIndex((o) => o._id === order._id);
        if (idx === -1) return [order, ...prev];
        const next = prev.slice();
        next[idx] = order;
        return next;
      });
    };
    socket.on("orderUpdated", handler);
    return () => {
      socket.off("orderUpdated", handler);
    };
  }, [qc, user]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">My orders</h1>
        <p className="mt-1 text-sm text-slate-600">
          Real-time updates will appear automatically.
        </p>
      </div>

      {ordersQuery.isLoading ? (
        <div className="grid gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 w-48 rounded bg-slate-100" />
              </CardHeader>
              <CardContent>
                <div className="h-4 w-72 rounded bg-slate-100" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : ordersQuery.isError ? (
        <EmptyState title="Couldn’t load orders" description={(ordersQuery.error as Error).message} />
      ) : orders.length === 0 ? (
        <EmptyState title="No orders yet" description="Place your first order from a shop." />
      ) : (
        <div className="grid gap-3">
          {orders.map((o) => (
            <Card key={o._id}>
              <CardHeader className="flex flex-row items-center justify-between gap-3">
                <CardTitle>Order #{o._id.slice(-6).toUpperCase()}</CardTitle>
                <Badge tone={statusTone(o.status)}>{o.status}</Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-slate-700">
                  <div>
                    Placed: <span className="font-medium text-slate-900">{formatDateTime(o.createdAt)}</span>
                  </div>
                  <div>
                    Total: <span className="font-medium text-slate-900">{formatMoney(o.totalAmount)}</span>
                  </div>
                  <div>
                    Payment: <span className="font-medium text-slate-900">{o.paymentStatus}</span>
                  </div>
                </div>
                <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Items
                  </div>
                  <div className="mt-2 space-y-1 text-sm">
                    {o.products.map((p) => (
                      <div key={String(p.productId)} className="flex items-center justify-between gap-3">
                        <div className="min-w-0 truncate text-slate-800">
                          {p.name} <span className="text-slate-500">× {p.quantity}</span>
                        </div>
                        <div className="font-medium text-slate-900">{formatMoney(p.price * p.quantity)}</div>
                      </div>
                    ))}
                  </div>
                </div>
                {o.deliveryAddress ? (
                  <div className="text-sm text-slate-700">
                    Delivery: <span className="font-medium text-slate-900">{o.deliveryAddress}</span>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

