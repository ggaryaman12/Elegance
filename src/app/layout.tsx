import type { Metadata } from "next";

import "@/app/globals.css";
import { Navbar } from "@/components/site/navbar";
import { Providers } from "@/app/providers";
import { AnnouncementBar } from "@/components/site/announcement-bar";

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
      <body className="min-h-screen font-sans">
        <Providers>
          <AnnouncementBar />
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
