import * as React from "react";
import type { Product, Shop } from "../lib/types";

export type CartItem = {
  product: Product;
  quantity: number;
};

type CartState = {
  shop: Shop | null;
  items: CartItem[];
};

type CartContextValue = CartState & {
  add: (shop: Shop, product: Product) => void;
  setQty: (productId: string, qty: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
  total: number;
};

const CartContext = React.createContext<CartContextValue | null>(null);

export function useCart() {
  const ctx = React.useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

const STORAGE_KEY = "lbop_cart";

function load(): CartState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { shop: null, items: [] };
    return JSON.parse(raw) as CartState;
  } catch {
    return { shop: null, items: [] };
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<CartState>(() => load());

  React.useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const add: CartContextValue["add"] = (shop, product) => {
    setState((s) => {
      const sameShop = s.shop && s.shop._id === shop._id;
      const base: CartState = sameShop ? s : { shop, items: [] };
      const existing = base.items.find((i) => i.product._id === product._id);
      if (existing) {
        return {
          ...base,
          items: base.items.map((i) =>
            i.product._id === product._id
              ? { ...i, quantity: i.quantity + 1 }
              : i
          ),
        };
      }
      return { ...base, items: [{ product, quantity: 1 }, ...base.items] };
    });
  };

  const setQty: CartContextValue["setQty"] = (productId, qty) => {
    setState((s) => ({
      ...s,
      items: s.items
        .map((i) =>
          i.product._id === productId
            ? { ...i, quantity: Math.max(1, Math.floor(qty || 1)) }
            : i
        )
        .filter((i) => i.quantity > 0),
    }));
  };

  const remove: CartContextValue["remove"] = (productId) => {
    setState((s) => ({
      ...s,
      items: s.items.filter((i) => i.product._id !== productId),
      shop:
        s.items.length === 1 && s.items[0]?.product._id === productId
          ? null
          : s.shop,
    }));
  };

  const clear = () => setState({ shop: null, items: [] });

  const total = state.items.reduce(
    (sum, i) => sum + i.product.price * i.quantity,
    0
  );

  return (
    <CartContext.Provider value={{ ...state, add, setQty, remove, clear, total }}>
      {children}
    </CartContext.Provider>
  );
}

