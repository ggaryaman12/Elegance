"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatINRFromPaise } from "@/lib/money";
import { useCart } from "@/lib/cart";

export function CartView() {
  const { items, removeItem, setQuantity, clear } = useCart();

  const subtotalPaise = items.reduce(
    (sum, item) => sum + item.pricePaise * item.quantity,
    0
  );

  if (items.length === 0) {
    return (
      <Card className="mt-6 p-6">
        <div className="text-sm font-medium">Your cart is empty</div>
        <div className="mt-1 text-sm text-mutedForeground">
          Add a suit to place a COD order.
        </div>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Button asChild>
            <Link href="/products">Browse suits</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/reels">Watch reels</Link>
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="mt-6 grid gap-4 lg:grid-cols-3">
      <Card className="p-5 lg:col-span-2">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold">Items</div>
          <button
            type="button"
            className="text-xs text-mutedForeground hover:text-foreground"
            onClick={clear}
          >
            Clear cart
          </button>
        </div>
        <div className="mt-4 divide-y divide-border">
          {items.map((item) => (
            <div key={`${item.productId}:${item.colorName}`} className="py-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-medium">{item.title}</div>
                  <div className="mt-1 text-xs text-mutedForeground">
                    Color: {item.colorName}
                  </div>
                  <div className="mt-2 text-sm font-semibold">
                    {formatINRFromPaise(item.pricePaise)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    aria-label="Quantity"
                    className="h-10 w-20"
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) =>
                      setQuantity(
                        item.productId,
                        item.colorName,
                        Number(e.target.value || 1)
                      )
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => removeItem(item.productId, item.colorName)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <div className="text-sm font-semibold">Summary</div>
        <div className="mt-4 flex items-center justify-between text-sm">
          <div className="text-mutedForeground">Subtotal</div>
          <div className="font-semibold">{formatINRFromPaise(subtotalPaise)}</div>
        </div>
        <div className="mt-1 flex items-center justify-between text-sm">
          <div className="text-mutedForeground">Payment</div>
          <div className="font-semibold">COD</div>
        </div>
        <div className="mt-5 flex flex-col gap-2">
          <Button asChild size="lg">
            <Link href="/checkout">Checkout</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/products">Add more</Link>
          </Button>
        </div>
        <p className="mt-4 text-xs text-mutedForeground">
          No shipping rules configured (as requested).
        </p>
      </Card>
    </div>
  );
}

