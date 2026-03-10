import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { useCart } from "../../state/cart";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { EmptyState } from "../../components/ui/EmptyState";
import { formatMoney } from "../../lib/utils";
import { useToast } from "../../components/ui/Toast";
import type { Order } from "../../lib/types";

export function CartPage() {
  const { shop, items, setQty, remove, clear, total } = useCart();
  const { push } = useToast();
  const [deliveryAddress, setDeliveryAddress] = useState("");

  const createOrder = useMutation({
    mutationFn: async () => {
      if (!shop) throw new Error("Missing shop");
      const res = await api.post<Order>("/orders", {
        shopId: shop._id,
        items: items.map((i) => ({
          productId: i.product._id,
          quantity: i.quantity,
        })),
        deliveryAddress: deliveryAddress.trim() || undefined,
      });
      return res.data;
    },
    onSuccess: () => {
      push("Order placed", "success");
      clear();
      setDeliveryAddress("");
    },
    onError: (e) => push((e as Error).message, "danger"),
  });

  if (!shop || items.length === 0) {
    return (
      <EmptyState
        title="Your cart is empty"
        description="Add some products from a shop to place an order."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Cart</h1>
          <p className="mt-1 text-sm text-slate-600">
            Ordering from <span className="font-medium text-slate-900">{shop.shopName}</span>
          </p>
        </div>
        <Button variant="ghost" onClick={clear}>
          Clear cart
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_360px]">
        <div className="space-y-3">
          {items.map((i) => (
            <Card key={i.product._id}>
              <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-slate-900">
                    {i.product.name}
                  </div>
                  <div className="mt-1 text-sm text-slate-600">
                    {formatMoney(i.product.price)} • Subtotal{" "}
                    <span className="font-medium text-slate-900">
                      {formatMoney(i.product.price * i.quantity)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    className="h-10 w-20 rounded-xl bg-white px-3 text-sm text-slate-900 ring-1 ring-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                    type="number"
                    min={1}
                    value={i.quantity}
                    onChange={(e) => setQty(i.product._id, Number(e.target.value))}
                  />
                  <Button variant="secondary" onClick={() => remove(i.product._id)}>
                    Remove
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Checkout</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Delivery address (optional)"
              placeholder="House no, street, landmark…"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
            />
            <div className="flex items-center justify-between text-sm">
              <div className="text-slate-600">Total</div>
              <div className="text-base font-semibold text-slate-900">{formatMoney(total)}</div>
            </div>
            <Button
              className="w-full"
              isLoading={createOrder.isPending}
              onClick={() => createOrder.mutate()}
            >
              Place order
            </Button>
            <div className="text-xs text-slate-500">
              Payment is marked <span className="font-medium">pending</span> in this demo backend.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

