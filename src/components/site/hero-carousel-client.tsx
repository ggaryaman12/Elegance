"use client";

import * as React from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";

type Banner = {
  id: string;
  imageUrl: string | null;
  videoUrl: string | null;
  videoPosterUrl: string | null;
  ctaText?: string;
  ctaHref?: string;
};

export function HeroCarouselClient({
  banners,
  rotateMs = 7000,
  className
}: {
  banners: Banner[];
  rotateMs?: number;
  className?: string;
}) {
  const [active, setActive] = React.useState(0);

  React.useEffect(() => {
    if (banners.length <= 1) return;
    const ms = Math.max(2500, rotateMs | 0);
    const t = window.setInterval(() => {
      setActive((a) => (a + 1) % banners.length);
    }, ms);
    return () => window.clearInterval(t);
  }, [banners.length, rotateMs]);

  const b = banners[Math.min(active, banners.length - 1)];
  const imageUrl = b.imageUrl ?? "/images/suits/suit-02.svg";

  return (
    <div className={cn("absolute inset-0", className)}>
      <div key={b.id} className="absolute inset-0 animate-[vt-fade-in_220ms_ease-out]">
        {b.videoUrl ? (
          <video
            className="absolute inset-0 h-full w-full object-cover opacity-95"
            src={b.videoUrl}
            poster={b.videoPosterUrl ?? undefined}
            muted
            playsInline
            autoPlay
            loop
            preload="metadata"
          />
        ) : (
          <Image
            src={imageUrl}
            alt="Hero banner"
            fill
            priority
            className="object-cover opacity-95"
            sizes="100vw"
          />
        )}
      </div>
    </div>
  );
}

