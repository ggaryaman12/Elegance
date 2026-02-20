"use client";

import * as React from "react";

export type CartItem = {
  productId: string;
  title: string;
  pricePaise: number;
  colorName: string;
  quantity: number;
  imageUrl?: string;
};

type CartState = {
  items: CartItem[];
};

type CartApi = CartState & {
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, colorName: string) => void;
  setQuantity: (productId: string, colorName: string, quantity: number) => void;
  clear: () => void;
};

const CART_KEY = "ewe_cart_v1";

function readCart(): CartState {
  if (typeof window === "undefined") return { items: [] };
  try {
    const raw = window.localStorage.getItem(CART_KEY);
    if (!raw) return { items: [] };
    const parsed = JSON.parse(raw) as CartState;
    if (!parsed?.items?.length) return { items: [] };
    return parsed;
  } catch {
    return { items: [] };
  }
}

function writeCart(state: CartState) {
  window.localStorage.setItem(CART_KEY, JSON.stringify(state));
}

const CartContext = React.createContext<CartApi | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = React.useState(false);
  const [state, setState] = React.useState<CartState>({ items: [] });

  React.useEffect(() => {
    setState(readCart());
    setHydrated(true);
  }, []);

  React.useEffect(() => {
    if (!hydrated) return;
    writeCart(state);
  }, [hydrated, state]);

  const api: CartApi = React.useMemo(
    () => ({
      items: state.items,
      addItem: (item) =>
        setState((prev) => {
          const existingIndex = prev.items.findIndex(
            (i) => i.productId === item.productId && i.colorName === item.colorName
          );
          if (existingIndex === -1) return { items: [...prev.items, item] };
          const items = [...prev.items];
          items[existingIndex] = {
            ...items[existingIndex],
            quantity: items[existingIndex].quantity + item.quantity
          };
          return { items };
        }),
      removeItem: (productId, colorName) =>
        setState((prev) => ({
          items: prev.items.filter(
            (i) => !(i.productId === productId && i.colorName === colorName)
          )
        })),
      setQuantity: (productId, colorName, quantity) =>
        setState((prev) => ({
          items: prev.items
            .map((i) =>
              i.productId === productId && i.colorName === colorName
                ? { ...i, quantity }
                : i
            )
            .filter((i) => i.quantity > 0)
        })),
      clear: () => setState({ items: [] })
    }),
    [state.items]
  );

  return <CartContext.Provider value={api}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = React.useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
