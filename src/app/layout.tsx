import type { Metadata } from "next";

import "@/app/globals.css";
import { Navbar } from "@/components/site/navbar";
import { Providers } from "@/app/providers";
import { AnnouncementBar } from "@/components/site/announcement-bar";
import { MobileNav } from "@/components/site/mobile-nav";

export const metadata: Metadata = {
  title: "Ethnic World (Exclusive) — Suits Marketplace",
  description:
    "Exclusive ready-made suits with COD in Jammu. Main Road, Rajupura Mangotrian, Jammu · Contact: 9149776197."
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
