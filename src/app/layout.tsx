import type { Metadata } from "next";

import "@/app/globals.css";
import { Navbar } from "@/components/site/navbar";
import { Providers } from "@/app/providers";
import { AnnouncementBar } from "@/components/site/announcement-bar";
import { MobileNav } from "@/components/site/mobile-nav";

export const metadata: Metadata = {
  title: "Elegance by Neha — Suits Marketplace",
  description: "Order suits with COD in Rajpura, Jammu."
};

export const dynamic = "force-dynamic";

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen pb-20 font-sans md:pb-0">
        <Providers>
          <AnnouncementBar />
          <Navbar />
          {children}
          <MobileNav />
        </Providers>
      </body>
    </html>
  );
}
