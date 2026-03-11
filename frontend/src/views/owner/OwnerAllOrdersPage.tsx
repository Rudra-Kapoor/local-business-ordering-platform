import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import type { Order, OrderStatus } from "../../lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { EmptyState } from "../../components/ui/EmptyState";
import { formatDateTime, formatMoney } from "../../lib/utils";
import { useAuth } from "../../state/auth";
import { getSocket } from "../../lib/socket";
import { Button } from "../../components/ui/Button";
import { OrderChatBox } from "../../components/chat/OrderChatBox";

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

function asShop(order: Order) {
  return typeof order.shopId === "string" ? null : order.shopId;
}
function asUser(order: Order) {
  return typeof order.userId === "string" ? null : order.userId;
}

export function OwnerAllOrdersPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [openOrderId, setOpenOrderId] = useState<string | null>(null);

  const query = useQuery({
    queryKey: ["ownerOrdersAll"],
    queryFn: async () => {
      const res = await api.get<{ shops: unknown[]; orders: Order[] }>("/orders/owner/mine");
      return res.data;
    },
    enabled: user?.role === "shopOwner",
  });

  useEffect(() => {
    if (user?.role !== "shopOwner") return;
    if (!query.data?.shops) return;

    const socket = getSocket();
    const shops = query.data.shops as Array<{ _id: string }>;
    for (const s of shops) socket.emit("joinRoom", { type: "shop", id: s._id });

    const handler = (order: Order) => {
      qc.setQueryData<{ shops: unknown[]; orders: Order[] }>(["ownerOrdersAll"], (prev) => {
        if (!prev) return { shops: [], orders: [order] };
        const idx = prev.orders.findIndex((o) => o._id === order._id);
        if (idx === -1) return { ...prev, orders: [order, ...prev.orders] };
        const next = prev.orders.slice();
        next[idx] = order;
        return { ...prev, orders: next };
      });
    };
    socket.on("orderUpdated", handler);
    return () => {
      socket.off("orderUpdated", handler);
    };
  }, [qc, query.data?.shops, user?.role]);

  const content = useMemo(() => {
    if (query.isLoading) {
      return (
        <div className="grid gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
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
    if (query.isError) {
      return <EmptyState title="Couldn’t load orders" description={(query.error as Error).message} />;
    }
    const orders = query.data?.orders ?? [];
    if (!orders.length) {
      return <EmptyState title="No orders yet" description="Orders from all your shops will appear here." />;
    }

    return (
      <div className="grid gap-3">
        {orders.map((o) => {
          const shop = asShop(o);
          const u = asUser(o);
          return (
            <Card key={o._id}>
              <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <CardTitle>Order #{o._id.slice(-6).toUpperCase()}</CardTitle>
                  <div className="mt-1 text-sm text-slate-600">
                    {shop ? (
                      <>
                        {shop.shopName} • {shop.category} • {shop.location?.address}
                      </>
                    ) : (
                      <>Shop {String(o.shopId)}</>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setOpenOrderId((cur) => (cur === o._id ? null : o._id))}
                  >
                    {openOrderId === o._id ? "Close chat" : "Chat"}
                  </Button>
                  <Badge tone={statusTone(o.status)}>{o.status}</Badge>
                  <Badge tone="neutral">{o.paymentStatus}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-slate-700">
                  <div>
                    Placed: <span className="font-medium text-slate-900">{formatDateTime(o.createdAt)}</span>
                  </div>
                  <div>
                    Total: <span className="font-medium text-slate-900">{formatMoney(o.totalAmount)}</span>
                  </div>
                  {u ? (
                    <div>
                      Customer: <span className="font-medium text-slate-900">{u.name}</span>{" "}
                      <span className="text-slate-500">({u.email})</span>
                    </div>
                  ) : null}
                </div>
                <div className="text-sm text-slate-700">
                  Delivery: <span className="font-medium text-slate-900">{o.deliveryAddress || "—"}</span>
                </div>
                {openOrderId === o._id ? (
                  <OrderChatBox orderId={o._id} title="Chat with customer" />
                ) : null}
                <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Items</div>
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
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  }, [query.data?.orders, query.error, query.isError, query.isLoading]);

  if (user?.role !== "shopOwner") {
    return <EmptyState title="Shop owner only" description="This page is for shop owners." />;
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">All orders</h1>
        <p className="mt-1 text-sm text-slate-600">Orders across all your shops, with live updates.</p>
      </div>
      {content}
    </div>
  );
}

