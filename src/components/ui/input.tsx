import * as React from "react";

import { cn } from "@/lib/utils";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-xl border border-border bg-card px-3 text-sm outline-none transition-shadow placeholder:text-mutedForeground focus:ring-2 focus:ring-primary/30",
        className
      )}
      {...props}
    />
  );
}

