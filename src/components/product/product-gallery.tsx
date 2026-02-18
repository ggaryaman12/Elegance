"use client";

import * as React from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";

type GalleryImage = {
  id: string;
  url: string;
  alt: string;
};

export function ProductGallery({
  title,
  images,
  className
}: {
  title: string;
  images: GalleryImage[];
  className?: string;
}) {
  const [active, setActive] = React.useState(0);
  const [zoomed, setZoomed] = React.useState(false);
  const [origin, setOrigin] = React.useState({ x: 50, y: 50 });

  const activeImage = images[active] ?? images[0];

  return (
    <div className={cn("grid gap-3 lg:grid-cols-[92px_1fr]", className)}>
      <div className="order-2 flex gap-2 overflow-auto lg:order-1 lg:flex-col lg:overflow-visible">
        {images.map((img, idx) => {
          const isActive = idx === active;
          return (
            <button
              key={img.id}
              type="button"
              onClick={() => setActive(idx)}
              className={cn(
                "relative h-20 w-20 flex-none overflow-hidden rounded-xl border bg-muted transition-colors lg:h-24 lg:w-full",
                isActive ? "border-primary" : "border-border hover:border-foreground/30"
              )}
              aria-label={`View image ${idx + 1}`}
            >
              <Image
                src={img.url}
                alt={img.alt || title}
                fill
                className="object-cover"
                sizes="96px"
              />
            </button>
          );
        })}
      </div>

      <div className="order-1 lg:order-2">
        <div
          className="relative overflow-hidden rounded-2xl border border-border bg-muted"
          onMouseEnter={() => setZoomed(true)}
          onMouseLeave={() => {
            setZoomed(false);
            setOrigin({ x: 50, y: 50 });
          }}
          onMouseMove={(e) => {
            const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            setOrigin({
              x: Math.max(0, Math.min(100, x)),
              y: Math.max(0, Math.min(100, y))
            });
          }}
        >
          <div className="relative aspect-[4/5]">
            {activeImage ? (
              <Image
                src={activeImage.url}
                alt={activeImage.alt || title}
                fill
                priority
                sizes="(min-width: 1024px) 720px, 100vw"
                className={cn(
                  "object-cover transition-transform duration-300 ease-out motion-reduce:transition-none",
                  zoomed ? "scale-[1.28]" : "scale-100"
                )}
                style={{
                  transformOrigin: `${origin.x}% ${origin.y}%`
                }}
              />
            ) : null}
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/70 to-transparent p-4">
            <div className="text-xs text-mutedForeground">
              Hover to zoom · Scroll thumbnails
            </div>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-mutedForeground">
          <div>
            Image {active + 1} / {images.length}
          </div>
          <button
            type="button"
            className="rounded-xl px-3 py-2 hover:bg-muted"
            onClick={() => setActive((prev) => (prev + 1) % images.length)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

