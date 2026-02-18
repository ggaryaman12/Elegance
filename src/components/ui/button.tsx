import * as React from "react";
import { Slot } from "@radix-ui/react-slot";

import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
};

export function Button({
  className,
  asChild = false,
  variant = "primary",
  size = "md",
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:pointer-events-none disabled:opacity-50 active:opacity-95",
        variant === "primary" &&
          "bg-primary text-primaryForeground hover:bg-primary/90",
        variant === "secondary" &&
          "bg-muted text-foreground hover:bg-muted/80",
        variant === "ghost" &&
          "bg-transparent text-foreground hover:bg-muted",
        size === "sm" && "h-9 px-3",
        size === "md" && "h-10 px-4",
        size === "lg" && "h-11 px-5",
        className
      )}
      {...props}
    />
  );
}
