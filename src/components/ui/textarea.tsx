import * as React from "react";

import { cn } from "@/lib/utils";

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        "min-h-24 w-full rounded-xl border border-border bg-card px-3 py-2 text-sm outline-none transition-shadow placeholder:text-mutedForeground focus:ring-2 focus:ring-primary/30",
        className
      )}
      {...props}
    />
  );
}

