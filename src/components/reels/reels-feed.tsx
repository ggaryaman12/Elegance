"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TransitionLink } from "@/components/site/transition-link";
import { QuickViewModal } from "@/components/product/quick-view-modal";
import { useCart } from "@/lib/cart";
import { formatINRFromPaise } from "@/lib/money";

type ReelFeedItem = {
  id: string;
  videoUrl: string;
  caption: string;
  createdAt: string | Date;
  product?: null | {
    id: string;
    slug: string;
    title: string;
    description?: string;
    basePricePaise: number;
    images?: Array<{ id: string; imageUrl: string; alt: string }>;
    colors: Array<{ id: string; colorName: string; colorHex: string | null }>;
  };
};

export function ReelsFeed({ reels }: { reels: ReelFeedItem[] }) {
  const { addItem } = useCart();
  const [selectedColor, setSelectedColor] = React.useState<Record<string, string>>(
    {}
  );
  const [quickView, setQuickView] = React.useState<ReelFeedItem["product"] | null>(
    null
  );

  return (
    <>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {reels.map((r) => {
          const product = r.product ?? null;
          const created = new Date(r.createdAt);
          const chosenColor =
            selectedColor[r.id] ?? product?.colors?.[0]?.colorName ?? "";

          return (
            <Card key={r.id} className="overflow-hidden">
              <div className="relative aspect-[9/16] bg-muted">
                <video
                  className="h-full w-full object-cover"
                  src={r.videoUrl}
                  muted
                  playsInline
                  preload="metadata"
                  controls
                />
              </div>
              <div className="p-4 text-sm">
                <div className="font-medium">{r.caption || "New reel"}</div>
                <div className="mt-1 text-xs text-mutedForeground">
                  {created.toLocaleDateString("en-IN")}
                </div>

                {product ? (
                  <div className="mt-4 space-y-3">
                    <button
                      type="button"
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-left transition-colors hover:bg-muted"
                      onClick={() => setQuickView(product)}
                    >
                      <div className="text-sm font-semibold">{product.title}</div>
                      <div className="mt-1 text-xs text-mutedForeground">
                        {formatINRFromPaise(product.basePricePaise)} · Tap for quick view
                      </div>
                    </button>

                    {product.colors.length ? (
                      <div className="flex flex-wrap gap-2">
                        {product.colors.slice(0, 6).map((c) => {
                          const active = c.colorName === chosenColor;
                          return (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() =>
                                setSelectedColor((prev) => ({
                                  ...prev,
                                  [r.id]: c.colorName
                                }))
                              }
                              className={[
                                "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs transition-colors",
                                active
                                  ? "border-primary bg-muted"
                                  : "border-border hover:bg-muted"
                              ].join(" ")}
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
                    ) : (
                      <div className="text-xs text-mutedForeground">
                        No colors available.
                      </div>
                    )}

                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Button
                        type="button"
                        className="flex-1"
                        disabled={!chosenColor}
                        onClick={() =>
                          addItem({
                            productId: product.id,
                            title: product.title,
                            pricePaise: product.basePricePaise,
                            colorName: chosenColor,
                            quantity: 1
                          })
                        }
                      >
                        Add to cart
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        className="flex-1"
                        onClick={() => setQuickView(product)}
                      >
                        Quick view
                      </Button>
                    </div>

                    <div className="text-xs">
                      <TransitionLink
                        href={`/products/${product.slug}`}
                        className="text-mutedForeground underline-offset-4 hover:text-foreground hover:underline"
                      >
                        Open full page
                      </TransitionLink>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 text-xs text-mutedForeground">
                    Admin can link this reel to a product.
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      <QuickViewModal
        open={Boolean(quickView)}
        product={
          quickView
            ? ({
                id: quickView.id,
                slug: quickView.slug,
                title: quickView.title,
                description: quickView.description ?? "",
                basePricePaise: quickView.basePricePaise,
                images: (quickView.images ?? []) as any,
                colors: quickView.colors
              } as any)
            : null
        }
        onClose={() => setQuickView(null)}
      />
    </>
  );
}
