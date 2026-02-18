"use client";

import { Container } from "@/components/site/container";
import { TransitionLink } from "@/components/site/transition-link";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { useRouter } from "next/navigation";

export function Navbar() {
  const router = useRouter();
  const { items } = useCart();
  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur">
      <Container className="flex h-16 items-center justify-between">
        <TransitionLink href="/" className="font-semibold tracking-tight">
          Elegance by Neha
        </TransitionLink>
        <nav className="hidden items-center gap-6 text-sm md:flex">
          <TransitionLink
            href="/products"
            className="text-mutedForeground hover:text-foreground"
            onMouseEnter={() => router.prefetch("/products")}
            onFocus={() => router.prefetch("/products")}
          >
            Suits
          </TransitionLink>
          <TransitionLink
            href="/reels"
            className="text-mutedForeground hover:text-foreground"
            onMouseEnter={() => router.prefetch("/reels")}
            onFocus={() => router.prefetch("/reels")}
          >
            Reels
          </TransitionLink>
          <TransitionLink
            href="/cart"
            className="inline-flex items-center gap-2 text-mutedForeground hover:text-foreground"
            onMouseEnter={() => router.prefetch("/cart")}
            onFocus={() => router.prefetch("/cart")}
          >
            Cart
            {count ? (
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-foreground">
                {count}
              </span>
            ) : null}
          </TransitionLink>
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild variant="secondary" className="hidden md:inline-flex">
            <TransitionLink href="/admin/login">Admin</TransitionLink>
          </Button>
          <Button asChild>
            <TransitionLink href="/products">Shop now</TransitionLink>
          </Button>
        </div>
      </Container>
    </header>
  );
}
