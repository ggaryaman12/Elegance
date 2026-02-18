"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export function Marquee({
  items,
  className,
  speed = 28
}: {
  items: string[];
  className?: string;
  speed?: number;
}) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const setRef = React.useRef<HTMLDivElement | null>(null);
  const display = items.filter(Boolean);
  const [repeat, setRepeat] = React.useState(display.length === 1 ? 8 : 1);

  React.useLayoutEffect(() => {
    if (display.length === 0) return;
    const container = containerRef.current;
    const set = setRef.current;
    if (!container || !set) return;

    const containerWidth = container.getBoundingClientRect().width;
    const setWidth = set.getBoundingClientRect().width;
    if (!containerWidth || !setWidth) return;

    // If the content is shorter than the viewport, it looks like it starts mid-screen.
    // Repeat enough times to always cover at least ~1.5x the container width.
    const target = containerWidth * 1.5;
    if (setWidth >= target) return;

    const factor = Math.ceil(target / setWidth);
    const next = Math.min(24, Math.max(repeat, factor));
    if (next !== repeat) setRepeat(next);
  }, [display.length, repeat]);

  if (display.length === 0) return null;

  const base = Array.from({ length: repeat }, () => display).flat();

  return (
    <div
      ref={containerRef}
      className={cn("marquee", className)}
      style={{ ["--speed" as any]: `${speed}s` }}
    >
      <div className="marquee__track" aria-hidden="true">
        <div ref={setRef} className="marquee__set">
          {base.map((t, i) => (
            <span key={`${t}-${i}`} className="marquee__item">
              {t}
            </span>
          ))}
        </div>
        <div className="marquee__set" aria-hidden="true">
          {base.map((t, i) => (
            <span key={`${t}-dup-${i}`} className="marquee__item">
              {t}
            </span>
          ))}
        </div>
      </div>
      <div className="sr-only">{display.join(" · ")}</div>
    </div>
  );
}
