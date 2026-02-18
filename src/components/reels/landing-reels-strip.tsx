"use client";

import * as React from "react";

import { AnimateIn } from "@/components/site/animate-in";
import { Card } from "@/components/ui/card";
import { ReelsViewerModal } from "@/components/reels/reels-viewer-modal";

export function LandingReelsStrip({ reels }: { reels: any[] }) {
  const [open, setOpen] = React.useState(false);
  const [index, setIndex] = React.useState(0);

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-3">
        {reels.map((r, i) => (
          <AnimateIn key={r.id}>
            <button
              type="button"
              className="block text-left"
              onClick={() => {
                setIndex(i);
                setOpen(true);
              }}
            >
              <Card className="overflow-hidden">
                <div className="aspect-[9/16] bg-muted">
                  <video
                    className="h-full w-full object-cover"
                    src={r.videoUrl}
                    muted
                    playsInline
                    preload="metadata"
                  />
                </div>
                <div className="p-4 text-sm">
                  <div className="font-medium line-clamp-1">
                    {r.caption || "New reel"}
                  </div>
                  <div className="mt-1 text-xs text-mutedForeground">
                    Tap to open
                  </div>
                </div>
              </Card>
            </button>
          </AnimateIn>
        ))}
      </div>

      <ReelsViewerModal
        open={open}
        reels={reels}
        initialIndex={index}
        onClose={() => setOpen(false)}
      />
    </>
  );
}

