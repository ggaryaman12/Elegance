"use client";

import * as React from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCart } from "@/lib/cart";
import { formatINRFromPaise } from "@/lib/money";

type ColorOption = { name: string; hex?: string };

export function PurchasePanel({
  productId,
  title,
  slug,
  pricePaise,
  colors
}: {
  productId: string;
  title: string;
  slug: string;
  pricePaise: number;
  colors: ColorOption[];
}) {
  const { addItem } = useCart();
  const [selectedColor, setSelectedColor] = React.useState<string>(
    colors[0]?.name ?? ""
  );
  const [qty, setQty] = React.useState(1);

  const canAdd = Boolean(selectedColor) && qty > 0;

  return (
    <div className="space-y-4 lg:sticky lg:top-24">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <div className="mt-2 flex items-baseline justify-between gap-4">
          <div className="text-lg font-semibold">{formatINRFromPaise(pricePaise)}</div>
          <div className="text-xs text-mutedForeground">COD</div>
        </div>
      </div>

      <Card className="p-5 hover:shadow-sm">
        <div className="text-sm font-semibold">Color</div>
        <div className="mt-3 flex flex-wrap gap-2">
          {colors.length ? (
            colors.map((c) => {
              const active = c.name === selectedColor;
              return (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setSelectedColor(c.name)}
                  className={[
                    "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition-colors",
                    active
                      ? "border-primary bg-muted"
                      : "border-border hover:border-foreground/30 hover:bg-muted"
                  ].join(" ")}
                >
                  <span
                    className="h-3 w-3 rounded-full border border-border"
                    style={{ background: c.hex ?? "transparent" }}
                  />
                  {c.name}
                </button>
              );
            })
          ) : (
            <div className="text-sm text-mutedForeground">No colors available.</div>
          )}
        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          <div className="text-sm font-semibold">Quantity</div>
          <div className="inline-flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
            >
              −
            </Button>
            <div className="min-w-10 text-center text-sm font-semibold">{qty}</div>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setQty((q) => Math.min(10, q + 1))}
            >
              +
            </Button>
          </div>
        </div>

        <div className="mt-5 grid gap-2">
          <Button
            type="button"
            size="lg"
            disabled={!canAdd}
            onClick={() =>
              addItem({
                productId,
                title,
                pricePaise,
                colorName: selectedColor,
                quantity: qty
              })
            }
          >
            Add to cart
          </Button>
          <Button asChild size="lg" variant="secondary">
            <Link href="/checkout">Go to checkout</Link>
          </Button>
        </div>

        <div className="mt-4 text-xs text-mutedForeground">
          Selected: <span className="font-medium text-foreground">{selectedColor || "—"}</span>
        </div>
      </Card>

      <Card className="p-5 hover:shadow-sm">
        <div className="text-sm font-semibold">Quick links</div>
        <div className="mt-3 grid gap-2 text-sm">
          <Link className="rounded-xl px-3 py-2 hover:bg-muted" href="/cart">
            View cart
          </Link>
          <Link className="rounded-xl px-3 py-2 hover:bg-muted" href={`/products/${slug}`}>
            Refresh page
          </Link>
        </div>
      </Card>
    </div>
  );
}

