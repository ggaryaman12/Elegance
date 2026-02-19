"use client";

import * as React from "react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ReelsViewer } from "@/components/reels/reels-viewer";
import { ArrowLeft } from "lucide-react";

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
      <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-3 py-3">
        <Button type="button" variant="secondary" onClick={onClose}>
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button type="button" variant="secondary" className="hidden sm:inline-flex" onClick={onClose}>
          Close
        </Button>
      </div>
      <div className="h-full">
        <ReelsViewer reels={reels as any} initialIndex={initialIndex} className="pt-14" />
      </div>
    </div>
  );
}
