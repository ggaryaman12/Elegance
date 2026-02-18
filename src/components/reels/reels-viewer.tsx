"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatINRFromPaise } from "@/lib/money";
import { useCart } from "@/lib/cart";

type ReelItem = {
  id: string;
  videoUrl: string;
  caption: string;
  createdAt: string | Date;
  product?: null | {
    id: string;
    slug: string;
    title: string;
    basePricePaise: number;
    colors: Array<{ id: string; colorName: string; colorHex: string | null }>;
  };
};

export function ReelsViewer({
  reels,
  initialIndex = 0,
  className
}: {
  reels: ReelItem[];
  initialIndex?: number;
  className?: string;
}) {
  const { addItem } = useCart();
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const videoRefs = React.useRef<Record<string, HTMLVideoElement | null>>({});

  const [muted, setMuted] = React.useState(true);
  const [activeIndex, setActiveIndex] = React.useState(initialIndex);
  const [selectedColor, setSelectedColor] = React.useState<Record<string, string>>(
    {}
  );

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const el = container.querySelectorAll<HTMLElement>("[data-reel]");
    const target = el[initialIndex];
    if (target) target.scrollIntoView({ block: "start" });
  }, [initialIndex, reels.length]);

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const items = Array.from(container.querySelectorAll<HTMLElement>("[data-reel]"));
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0))[0];
        if (!visible) return;
        const idx = items.indexOf(visible.target as HTMLElement);
        if (idx >= 0) setActiveIndex(idx);
      },
      { threshold: [0.55, 0.7, 0.85] }
    );

    items.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, [reels.length]);

  React.useEffect(() => {
    // Autoplay only the active reel, pause others.
    reels.forEach((r, idx) => {
      const v = videoRefs.current[r.id];
      if (!v) return;
      v.muted = muted;
      if (idx === activeIndex) {
        const p = v.play();
        if (p && typeof (p as any).catch === "function") (p as any).catch(() => {});
      } else {
        v.pause();
      }
    });
  }, [activeIndex, muted, reels]);

  return (
    <div className={cn("relative", className)}>
      <div className="pointer-events-none absolute inset-x-0 top-3 z-10 flex justify-center">
        <div className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-1 text-xs text-mutedForeground backdrop-blur">
          Swipe/scroll · {muted ? "Muted" : "Sound on"}
        </div>
      </div>

      <div className="pointer-events-none absolute right-3 top-3 z-10">
        <div className="pointer-events-auto">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setMuted((m) => !m)}
          >
            {muted ? "Unmute" : "Mute"}
          </Button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="h-[calc(100vh-64px-42px)] snap-y snap-mandatory overflow-y-auto scroll-smooth"
      >
        {reels.map((r, idx) => {
          const product = r.product ?? null;
          const chosenColor =
            selectedColor[r.id] ?? product?.colors?.[0]?.colorName ?? "";

          return (
            <section
              key={r.id}
              data-reel
              className="relative h-[calc(100vh-64px-42px)] snap-start"
            >
              <video
                ref={(node) => {
                  videoRefs.current[r.id] = node;
                }}
                className="absolute inset-0 h-full w-full object-cover"
                src={r.videoUrl}
                muted
                playsInline
                loop
                preload="metadata"
                onClick={(e) => {
                  const v = e.currentTarget;
                  if (v.paused) {
                    void v.play().catch(() => {});
                  } else {
                    v.pause();
                  }
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/75 via-transparent to-transparent" />

              <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
                <div className="max-w-xl space-y-3">
                  <div className="text-sm font-semibold">
                    {r.caption || "New reel"}
                  </div>
                  {product ? (
                    <div className="rounded-2xl border border-border bg-background/75 p-4 backdrop-blur">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold">{product.title}</div>
                          <div className="mt-1 text-xs text-mutedForeground">
                            {formatINRFromPaise(product.basePricePaise)} · COD
                          </div>
                        </div>
                        <a
                          href={`/products/${product.slug}`}
                          className="text-xs text-mutedForeground underline-offset-4 hover:text-foreground hover:underline"
                        >
                          View
                        </a>
                      </div>

                      {product.colors.length ? (
                        <div className="mt-3 flex flex-wrap gap-2">
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
                                className={cn(
                                  "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs transition-colors",
                                  active
                                    ? "border-primary bg-muted"
                                    : "border-border hover:bg-muted"
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
                      ) : null}

                      <div className="mt-3 grid gap-2 sm:grid-cols-2">
                        <Button
                          type="button"
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
                        <Button type="button" variant="secondary" onClick={() => {
                          const container = containerRef.current;
                          if (!container) return;
                          const next = container.querySelectorAll<HTMLElement>("[data-reel]")[Math.min(reels.length - 1, idx + 1)];
                          next?.scrollIntoView({ block: "start" });
                        }}>
                          Next
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-mutedForeground">
                      Link this reel to a product in Admin.
                    </div>
                  )}
                </div>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

