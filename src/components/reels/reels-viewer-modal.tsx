"use client";

import * as React from "react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ReelsViewer } from "@/components/reels/reels-viewer";

export function ReelsViewerModal({
  open,
  reels,
  initialIndex = 0,
  onClose
}: {
  open: boolean;
  reels: any[];
  initialIndex?: number;
  onClose: () => void;
}) {
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

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[120] bg-background"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="absolute right-3 top-3 z-10">
        <Button type="button" variant="secondary" onClick={onClose}>
          Close
        </Button>
      </div>
      <div className="h-full">
        <ReelsViewer reels={reels as any} initialIndex={initialIndex} />
      </div>
    </div>
  );
}

