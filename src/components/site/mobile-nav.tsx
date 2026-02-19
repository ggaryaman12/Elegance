"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Home, ShoppingBag, Shirt, Video } from "lucide-react";

import { TransitionLink } from "@/components/site/transition-link";
import { cn } from "@/lib/utils";
import { useCart } from "@/lib/cart";

type Item = {
  href: string;
  label: string;
  icon: React.ReactNode;
  match?: (pathname: string) => boolean;
};

export function MobileNav() {
  const pathname = usePathname() || "/";
  const { items } = useCart();
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  if (pathname.startsWith("/admin")) return null;

  const nav: Item[] = [
    { href: "/", label: "Home", icon: <Home className="h-5 w-5" /> },
    {
      href: "/products",
      label: "Suits",
      icon: <Shirt className="h-5 w-5" />,
      match: (p) => p.startsWith("/products")
    },
    {
      href: "/reels",
      label: "Reels",
      icon: <Video className="h-5 w-5" />,
      match: (p) => p.startsWith("/reels")
    },
    {
      href: "/cart",
      label: "Cart",
      icon: (
        <span className="relative">
          <ShoppingBag className="h-5 w-5" />
          {count ? (
            <span className="absolute -right-2 -top-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-semibold text-primaryForeground">
              {count > 9 ? "9+" : count}
            </span>
          ) : null}
        </span>
      ),
      match: (p) => p.startsWith("/cart") || p.startsWith("/checkout") || p.startsWith("/order")
    }
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-[80] border-t border-border bg-background/90 backdrop-blur md:hidden">
      <div className="mx-auto grid max-w-6xl grid-cols-4 px-4 pb-[env(safe-area-inset-bottom)] pt-2">
        {nav.map((item) => {
          const active = item.match ? item.match(pathname) : pathname === item.href;
          return (
            <TransitionLink
              key={item.href}
              href={item.href}
              aria-label={item.label}
              className={cn(
                "flex flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-xs transition-colors",
                active ? "text-foreground" : "text-mutedForeground hover:text-foreground"
              )}
            >
              {item.icon}
              <span>{item.label}</span>
            </TransitionLink>
          );
        })}
      </div>
    </nav>
  );
}

