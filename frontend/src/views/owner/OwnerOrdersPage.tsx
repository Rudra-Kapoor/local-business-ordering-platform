import { useEffect, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { api } from "../../lib/api";
import type { Order, OrderStatus, PaymentStatus } from "../../lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { formatDateTime, formatMoney } from "../../lib/utils";
import { useToast } from "../../components/ui/Toast";
import { useAuth } from "../../state/auth";
import { getSocket } from "../../lib/socket";

const statusOptions: OrderStatus[] = [
  "pending",
  "confirmed",
  "preparing",
  "ready",
  "completed",
  "cancelled",
];
const payOptions: PaymentStatus[] = ["pending", "paid", "failed", "refunded"];

function statusTone(status: OrderStatus) {
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

function asUser(order: Order) {
  return typeof order.userId === "string" ? null : order.userId;
}

export function OwnerOrdersPage() {
  const { user } = useAuth();
  const { shopId } = useParams();
  const { push } = useToast();
  const qc = useQueryClient();

  const ordersQuery = useQuery({
    queryKey: ["shopOrders", { shopId }],
    queryFn: async () => {
      const res = await api.get<Order[]>(`/orders/shop/${shopId}`);
      return res.data;
    },
    enabled: user?.role === "shopOwner" && !!shopId,
  });

  const updateStatus = useMutation({
    mutationFn: async (args: { id: string; status: OrderStatus; paymentStatus: PaymentStatus }) => {
      const res = await api.patch<Order>(`/orders/${args.id}/status`, {
        status: args.status,
        paymentStatus: args.paymentStatus,
      });
      return res.data;
    },
    onSuccess: (order) => {
      push("Order updated", "success");
      qc.setQueryData<Order[]>(["shopOrders", { shopId }], (prev) => {
        if (!prev) return [order];
        const idx = prev.findIndex((o) => o._id === order._id);
        if (idx === -1) return [order, ...prev];
        const next = prev.slice();
        next[idx] = order;
        return next;
      });
    },
    onError: (e) => push((e as Error).message, "danger"),
  });

  useEffect(() => {
    if (!shopId) return;
    const socket = getSocket();
    socket.emit("joinRoom", { type: "shop", id: shopId });
    const handler = (order: Order) => {
      qc.setQueryData<Order[]>(["shopOrders", { shopId }], (prev) => {
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
  }, [qc, shopId]);

  const content = useMemo(() => {
    if (ordersQuery.isLoading) {
      return (
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
      );
    }
    if (ordersQuery.isError) {
      return (
        <EmptyState
          title="Couldn’t load orders"
          description={(ordersQuery.error as Error).message}
        />
      );
    }
    if (!ordersQuery.data?.length) {
      return <EmptyState title="No orders yet" description="Orders will appear here." />;
    }

    return (
      <div className="grid gap-3">
        {ordersQuery.data.map((o) => (
          <Card key={o._id}>
            <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <CardTitle>Order #{o._id.slice(-6).toUpperCase()}</CardTitle>
                <div className="mt-1 text-sm text-slate-600">
                  Placed {formatDateTime(o.createdAt)} • Total {formatMoney(o.totalAmount)}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={statusTone(o.status)}>{o.status}</Badge>
                <Badge tone="neutral">{o.paymentStatus}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {(() => {
                const u = asUser(o);
                if (!u) return null;
                return (
                  <div className="text-sm text-slate-700">
                    Customer: <span className="font-medium text-slate-900">{u.name}</span>{" "}
                    <span className="text-slate-500">({u.email})</span>
                  </div>
                );
              })()}
              <div className="text-sm text-slate-700">
                Delivery: <span className="font-medium text-slate-900">{o.deliveryAddress || "—"}</span>
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
                      <div className="font-medium text-slate-900">
                        {formatMoney(p.price * p.quantity)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <label className="block">
                  <div className="mb-1 text-sm font-medium text-slate-800">Status</div>
                  <select
                    className="h-11 w-full rounded-xl bg-white px-3 text-sm text-slate-900 ring-1 ring-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                    defaultValue={o.status}
                    onChange={(e) =>
                      updateStatus.mutate({
                        id: o._id,
                        status: e.target.value as OrderStatus,
                        paymentStatus: o.paymentStatus,
                      })
                    }
                  >
                    {statusOptions.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <div className="mb-1 text-sm font-medium text-slate-800">Payment</div>
                  <select
                    className="h-11 w-full rounded-xl bg-white px-3 text-sm text-slate-900 ring-1 ring-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                    defaultValue={o.paymentStatus}
                    onChange={(e) =>
                      updateStatus.mutate({
                        id: o._id,
                        status: o.status,
                        paymentStatus: e.target.value as PaymentStatus,
                      })
                    }
                  >
                    {payOptions.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="flex items-end">
                  <Button
                    variant="secondary"
                    isLoading={updateStatus.isPending}
                    onClick={() =>
                      updateStatus.mutate({
                        id: o._id,
                        status: o.status,
                        paymentStatus: o.paymentStatus,
                      })
                    }
                  >
                    Refresh
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }, [ordersQuery.data, ordersQuery.error, ordersQuery.isError, ordersQuery.isLoading, updateStatus]);

  if (user?.role !== "shopOwner") {
    return <EmptyState title="Shop owner only" description="This page is for shop owners." />;
  }
  if (!shopId) {
    return <EmptyState title="Invalid shop" description="Missing shop id." />;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Orders</h1>
          <p className="mt-1 text-sm text-slate-600">Live updates via Socket.IO.</p>
        </div>
        <Button variant="secondary" onClick={() => qc.invalidateQueries({ queryKey: ["shopOrders", { shopId }] })}>
          Reload
        </Button>
      </div>
      {content}
    </div>
  );
}

