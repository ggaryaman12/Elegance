"use client";

import * as React from "react";
import Link, { type LinkProps } from "next/link";
import { useRouter } from "next/navigation";

type Props = LinkProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
    children: React.ReactNode;
  };

export function TransitionLink({ onClick, href, children, ...props }: Props) {
  const router = useRouter();
  const enabled =
    process.env.NEXT_PUBLIC_VIEW_TRANSITIONS === "1" ||
    process.env.NEXT_PUBLIC_VIEW_TRANSITIONS === "true";

  return (
    <Link
      href={href}
      {...props}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented) return;
        if (e.button !== 0) return;
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        if (!enabled) return;

        const target = (e.currentTarget as HTMLAnchorElement).target;
        if (target && target !== "_self") return;

        const nextHref =
          (e.currentTarget as HTMLAnchorElement).getAttribute("href") ||
          (typeof href === "string" ? href : href.pathname ?? "");
        if (!nextHref) return;

        const anyDoc = document as any;
        const canTransition = typeof anyDoc?.startViewTransition === "function";
        if (!canTransition) return;

        e.preventDefault();
        try {
          anyDoc.startViewTransition(() => {
            router.push(nextHref);
          });
        } catch {
          router.push(nextHref);
        }
      }}
    >
      {children}
    </Link>
  );
}
