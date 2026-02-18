"use client";

import * as React from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCart } from "@/lib/cart";

type ColorOption = { name: string; hex?: string };

export function AddToCart({
  productId,
  title,
  pricePaise,
  colors,
  imageUrl
}: {
  productId: string;
  productSlug: string;
  title: string;
  pricePaise: number;
  colors: ColorOption[];
  imageUrl?: string;
}) {
  const { addItem } = useCart();
  const [selectedColor, setSelectedColor] = React.useState<string>(
    colors[0]?.name ?? ""
  );

  const canAdd = Boolean(selectedColor);

  return (
    <Card className="p-5">
      <div className="text-sm font-medium">Choose color</div>
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
                  active ? "border-primary bg-muted" : "border-border hover:bg-muted"
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
          <div className="text-sm text-mutedForeground">
            No colors available.
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <Button
          type="button"
          className="flex-1"
          disabled={!canAdd}
          onClick={() =>
            addItem({
              productId,
              title,
              pricePaise,
              colorName: selectedColor,
              imageUrl,
              quantity: 1
            })
          }
        >
          Add to cart
        </Button>
        <Button asChild type="button" variant="secondary" className="flex-1">
          <Link href="/cart">Go to cart</Link>
        </Button>
      </div>
    </Card>
  );
}

