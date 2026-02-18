"use client";

import * as React from "react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatINRFromPaise } from "@/lib/money";
import { suitPlaceholderForKey } from "@/lib/placeholders";
import { cn } from "@/lib/utils";
import { useCart } from "@/lib/cart";

type ProductQuickView = {
  id: string;
  slug: string;
  title: string;
  description: string;
  basePricePaise: number;
  images: Array<{ id: string; imageUrl: string; alt: string }>;
  colors: Array<{ id: string; colorName: string; colorHex: string | null }>;
};

export function QuickViewModal({
  open,
  product,
  onClose
}: {
  open: boolean;
  product: ProductQuickView | null;
  onClose: () => void;
}) {
  const { addItem } = useCart();
  const [active, setActive] = React.useState(0);
  const [selectedColor, setSelectedColor] = React.useState<string>("");
  const [qty, setQty] = React.useState(1);

  React.useEffect(() => {
    if (!open || !product) return;
    setActive(0);
    setSelectedColor(product.colors[0]?.colorName ?? "");
    setQty(1);
  }, [open, product]);

  React.useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open || !product) return null;

  const fallback = suitPlaceholderForKey(product.slug);
  const images = product.images.length
    ? product.images
    : [{ id: "placeholder", imageUrl: fallback, alt: product.title }];
  const activeImage = images[active] ?? images[0];

  return (
    <div
      className="fixed inset-0 z-[100] bg-background/70 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="mx-auto flex h-full max-w-5xl items-end p-3 sm:items-center sm:p-6">
        <Card className="w-full overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="text-sm font-semibold">Quick view</div>
            <Button type="button" variant="ghost" onClick={onClose}>
              Close
            </Button>
          </div>

          <div className="grid gap-0 lg:grid-cols-2">
            <div className="border-b border-border lg:border-b-0 lg:border-r lg:border-border">
              <div className="relative aspect-[4/5] bg-muted">
                <Image
                  src={activeImage.imageUrl}
                  alt={activeImage.alt || product.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex gap-2 overflow-auto p-3">
                {images.slice(0, 8).map((img, idx) => (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => setActive(idx)}
                    className={cn(
                      "relative h-16 w-16 flex-none overflow-hidden rounded-xl border",
                      idx === active
                        ? "border-primary"
                        : "border-border hover:border-foreground/30"
                    )}
                  >
                    <Image
                      src={img.imageUrl}
                      alt={img.alt || product.title}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="p-5">
              <div className="text-xs text-mutedForeground">Suit</div>
              <div className="mt-1 text-xl font-semibold tracking-tight">
                {product.title}
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <div className="text-lg font-semibold">
                  {formatINRFromPaise(product.basePricePaise)}
                </div>
                <div className="text-xs text-mutedForeground">COD</div>
              </div>

              <div className="mt-4 text-sm text-mutedForeground line-clamp-4">
                {product.description}
              </div>

              <div className="mt-5">
                <div className="text-sm font-semibold">Color</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {product.colors.slice(0, 10).map((c) => {
                    const activeColor = c.colorName === selectedColor;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setSelectedColor(c.colorName)}
                        className={cn(
                          "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition-colors",
                          activeColor
                            ? "border-primary bg-muted"
                            : "border-border hover:border-foreground/30 hover:bg-muted"
                        )}
                      >
                        <span
                          className="h-3 w-3 rounded-full border border-border"
                          style={{ background: c.colorHex ?? "transparent" }}
                        />
                        {c.colorName}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between">
                <div className="text-sm font-semibold">Quantity</div>
                <div className="inline-flex items-center gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                  >
                    −
                  </Button>
                  <div className="min-w-10 text-center text-sm font-semibold">
                    {qty}
                  </div>
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
                  disabled={!selectedColor}
                  onClick={() =>
                    addItem({
                      productId: product.id,
                      title: product.title,
                      pricePaise: product.basePricePaise,
                      colorName: selectedColor,
                      quantity: qty
                    })
                  }
                >
                  Add to cart
                </Button>
                <Button asChild size="lg" variant="secondary">
                  <a href={`/products/${product.slug}`}>View full details</a>
                </Button>
              </div>

              <div className="mt-4 text-xs text-mutedForeground">
                Tap outside to close.
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

