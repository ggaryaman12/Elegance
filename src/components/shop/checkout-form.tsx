"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/lib/cart";
import { formatINRFromPaise } from "@/lib/money";

export function CheckoutForm() {
  const router = useRouter();
  const { items, clear } = useCart();

  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState(false);

  const totalPaise = items.reduce(
    (sum, item) => sum + item.pricePaise * item.quantity,
    0
  );

  async function placeOrder() {
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          customerName: name,
          phone,
          address,
          notes,
          items: items.map((i) => ({
            productId: i.productId,
            colorName: i.colorName,
            quantity: i.quantity
          }))
        })
      });

      const data = (await res.json()) as { orderNumber?: string; error?: string };
      if (!res.ok) throw new Error(data.error || "Failed to place order");

      clear();
      router.push(`/order/${data.orderNumber}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to place order");
    } finally {
      setPending(false);
    }
  }

  if (items.length === 0) {
    return (
      <Card className="mt-6 p-6">
        <div className="text-sm font-medium">Your cart is empty</div>
        <div className="mt-1 text-sm text-mutedForeground">
          Add a suit to checkout.
        </div>
      </Card>
    );
  }

  return (
    <div className="mt-6 grid gap-4 lg:grid-cols-3">
      <Card className="p-6 lg:col-span-2">
        <div className="text-sm font-semibold">Delivery details</div>
        <div className="mt-4 grid gap-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor="name">
              Name
            </label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor="phone">
              Phone
            </label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="10-digit mobile number"
              inputMode="numeric"
              required
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor="address">
              Address
            </label>
            <Textarea
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Full address"
              required
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor="notes">
              Notes (optional)
            </label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special instructions"
            />
          </div>
          {error ? (
            <div className="rounded-xl border border-border bg-muted px-3 py-2 text-sm">
              {error}
            </div>
          ) : null}
          <Button
            size="lg"
            disabled={pending || !name || !phone || !address}
            onClick={placeOrder}
          >
            {pending ? "Placing order..." : "Place COD order"}
          </Button>
          <p className="text-xs text-mutedForeground">
            No online payments for now. You pay on delivery (COD).
          </p>
        </div>
      </Card>

      <Card className="p-6">
        <div className="text-sm font-semibold">Order summary</div>
        <div className="mt-4 space-y-3">
          {items.map((item) => (
            <div key={`${item.productId}:${item.colorName}`} className="text-sm">
              <div className="font-medium">{item.title}</div>
              <div className="text-xs text-mutedForeground">
                {item.colorName} · Qty {item.quantity}
              </div>
              <div className="mt-1 font-semibold">
                {formatINRFromPaise(item.pricePaise * item.quantity)}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-5 flex items-center justify-between border-t border-border pt-4 text-sm">
          <div className="text-mutedForeground">Total</div>
          <div className="font-semibold">{formatINRFromPaise(totalPaise)}</div>
        </div>
      </Card>
    </div>
  );
}

