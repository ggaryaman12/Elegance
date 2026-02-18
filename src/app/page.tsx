import Image from "next/image";

import { Container } from "@/components/site/container";
import { AnimateIn } from "@/components/site/animate-in";
import { TransitionLink } from "@/components/site/transition-link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatINRFromPaise } from "@/lib/money";
import { suitPlaceholderForKey } from "@/lib/placeholders";
import { db } from "@/lib/prisma";
import { LandingReelsStrip } from "@/components/reels/landing-reels-strip";
import { HeroCarouselClient } from "@/components/site/hero-carousel-client";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const dbConfigured = Boolean(process.env.DATABASE_URL);
  return (
    <main>
      <Hero dbConfigured={dbConfigured} />
      <Highlights />
      <Lookbook dbConfigured={dbConfigured} />
      <LandingSponsored dbConfigured={dbConfigured} />
      <LandingReels dbConfigured={dbConfigured} />
    </main>
  );
}

async function Hero({ dbConfigured }: { dbConfigured: boolean }) {
  let banners:
    | Array<{
        id: string;
        title: string;
        subtitle: string;
        imageUrl: string | null;
        videoUrl: string | null;
        videoPosterUrl: string | null;
        ctaText: string;
        ctaHref: string;
      }>
    | null = null;

  if (dbConfigured) {
    try {
      const prisma = db();
      banners = await prisma.homeBanner.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
        take: 5,
        select: {
          id: true,
          title: true,
          subtitle: true,
          imageUrl: true,
          videoUrl: true,
          videoPosterUrl: true,
          ctaText: true,
          ctaHref: true
        }
      });
    } catch {
      try {
        const prisma = db();
        const fallback = await prisma.homeBanner.findMany({
          where: { isActive: true },
          orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
          take: 5,
          select: {
            id: true,
            title: true,
            subtitle: true,
            imageUrl: true,
            ctaText: true,
            ctaHref: true
          }
        });
        banners = fallback.map((b: any) => ({
          ...b,
          videoUrl: null,
          videoPosterUrl: null
        }));
      } catch {
        banners = null;
      }
    }
  }

  let heroRotateMs = 7000;
  if (dbConfigured) {
    try {
      const prisma = db();
      const settings = await (prisma as any).homeSettings?.findUnique?.({
        where: { id: "singleton" },
        select: { heroRotateMs: true }
      });
      if (settings?.heroRotateMs) heroRotateMs = settings.heroRotateMs;
    } catch {
      heroRotateMs = 7000;
    }
  }

  const fallbackBanners = [
    {
      id: "fallback",
      title: "Elegance by Neha",
      subtitle: "Recently opened in Rajpura, Jammu · COD available",
      imageUrl: "/images/suits/suit-02.svg",
      videoUrl: null,
      videoPosterUrl: null,
      ctaText: "Shop suits",
      ctaHref: "/products"
    }
  ];

  const data = banners?.length ? banners : fallbackBanners;

  return (
    <section className="relative border-b border-border">
      <div className="relative min-h-[calc(100vh-64px)]">
        <div className="absolute inset-0">
          <HeroCarouselClient banners={data} rotateMs={heroRotateMs} />
          <div className="absolute inset-0 bg-black/35" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/10" />
        </div>

        <div className="group absolute inset-0 z-[2]">
          <TransitionLink
            href={data[0].ctaHref}
            aria-label={`Go to ${data[0].ctaText}`}
            className="absolute inset-0 cursor-pointer"
          >
            <span className="sr-only">{data[0].ctaText}</span>
          </TransitionLink>
          <div className="pointer-events-none absolute bottom-4 right-4 rounded-full border border-white/20 bg-black/35 px-3 py-1 text-xs text-white/85 opacity-0 backdrop-blur transition-opacity group-hover:opacity-100">
            Go to {data[0].ctaText}
          </div>
        </div>

        <Container className="relative z-10 flex min-h-[calc(100vh-64px)] items-end py-10 sm:py-14">
          <AnimateIn className="w-full">
            <div className="max-w-2xl rounded-3xl border border-white/10 bg-background/10 p-6 text-white backdrop-blur-md sm:p-8">
              <div className="text-xs font-medium tracking-wide text-white/80">
                SUITS MARKETPLACE · RAJPURA, JAMMU
              </div>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-6xl">
                {data[0].title}
              </h1>
              <p className="mt-4 text-sm text-white/80 sm:text-base">
                {data[0].subtitle}
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="shadow-sm hover:shadow-md">
                  <TransitionLink href={data[0].ctaHref}>{data[0].ctaText}</TransitionLink>
                </Button>
                <Button asChild size="lg" variant="secondary">
                  <TransitionLink href="/reels">Watch reels</TransitionLink>
                </Button>
              </div>
              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                {[
                  { t: "COD", d: "Pay on delivery" },
                  { t: "Colors", d: "Pick your shade" },
                  { t: "Fast", d: "Smooth checkout" }
                ].map((b) => (
                  <div
                    key={b.t}
                    className="rounded-2xl border border-white/10 bg-black/20 p-4"
                  >
                    <div className="text-sm font-semibold">{b.t}</div>
                    <div className="mt-1 text-xs text-white/75">{b.d}</div>
                  </div>
                ))}
              </div>
            </div>
          </AnimateIn>
        </Container>
      </div>
    </section>
  );
}

function Highlights() {
  return (
    <section>
      <Container className="py-12">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              t: "Curated styles",
              d: "Sponsored picks on the homepage, best sellers on top."
            },
            { t: "Smooth experience", d: "Fast pages + quick view from reels." },
            { t: "COD checkout", d: "Simple delivery details, order in minutes." }
          ].map((b, idx) => (
            <AnimateIn key={b.t} delayMs={idx * 60}>
              <Card className="p-6">
                <div className="text-sm font-semibold">{b.t}</div>
                <p className="mt-2 text-sm text-mutedForeground">{b.d}</p>
              </Card>
            </AnimateIn>
          ))}
        </div>
      </Container>
    </section>
  );
}

async function Lookbook({ dbConfigured }: { dbConfigured: boolean }) {
  let products: any[] = [];
  if (dbConfigured) {
    try {
      const prisma = db();
      products = await prisma.product.findMany({
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
        take: 6,
        include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } }
      });
    } catch {
      products = [];
    }
  }

  return (
    <section className="border-y border-border bg-gradient-to-b from-background to-muted/30">
      <Container className="py-12">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-xs font-medium tracking-wide text-mutedForeground">
              LOOKBOOK
            </div>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
              Dress sharp. Feel confident.
            </h2>
            <p className="mt-2 text-sm text-mutedForeground">
              Explore new arrivals and styling ideas — then order with COD.
            </p>
          </div>
          <Button asChild variant="secondary">
            <TransitionLink href="/products">Browse all suits</TransitionLink>
          </Button>
        </div>

        {products.length ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p, idx) => {
              const imageUrl =
                p.images?.[0]?.imageUrl ?? suitPlaceholderForKey(p.slug);
              return (
                <AnimateIn key={p.id} delayMs={idx * 50}>
                  <TransitionLink
                    href={`/products/${p.slug}`}
                    className="group block"
                  >
                    <Card className="overflow-hidden">
                      <div className="relative aspect-[4/3] bg-muted">
                        <Image
                          src={imageUrl}
                          alt={p.title}
                          fill
                          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.08]"
                          sizes="(min-width: 1024px) 420px, 100vw"
                        />
                      </div>
                      <div className="p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="text-sm font-semibold">{p.title}</div>
                          <div className="text-sm font-semibold">
                            {formatINRFromPaise(p.basePricePaise)}
                          </div>
                        </div>
                        <div className="mt-1 text-xs text-mutedForeground">
                          COD · Colors available
                        </div>
                      </div>
                    </Card>
                  </TransitionLink>
                </AnimateIn>
              );
            })}
          </div>
        ) : (
          <div className="mt-8 rounded-3xl border border-border bg-card p-6">
            <div className="text-sm font-semibold">Add suits to show here</div>
            <div className="mt-1 text-sm text-mutedForeground">
              Create products in Admin → Products. This section automatically shows the latest 6 active suits.
            </div>
          </div>
        )}
      </Container>
    </section>
  );
}

async function LandingSponsored({ dbConfigured }: { dbConfigured: boolean }) {
  if (!dbConfigured) return null;

  let products: any[] = [];
  try {
    const prisma = db();
    products = await prisma.product.findMany({
      where: { isActive: true, isSponsored: true },
      orderBy: [{ sponsoredSortOrder: "asc" }, { createdAt: "desc" }],
      take: 6,
      include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } }
    });
  } catch {
    return null;
  }

  if (products.length === 0) return null;

  return (
    <section>
      <Container className="py-12">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="text-xs font-medium tracking-wide text-mutedForeground">
              SPONSORED
            </div>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
              Featured suits
            </h2>
            <p className="mt-2 text-sm text-mutedForeground">
              Hand-picked selections from the shop.
            </p>
          </div>
          <Button asChild variant="secondary" className="hidden sm:inline-flex">
            <TransitionLink href="/products">View all</TransitionLink>
          </Button>
        </div>

        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => {
            const imageUrl = p.images[0]?.imageUrl ?? suitPlaceholderForKey(p.slug);
            return (
              <AnimateIn key={p.id}>
                <TransitionLink href={`/products/${p.slug}`} className="group block">
                  <Card className="overflow-hidden">
                    <div className="relative aspect-[4/3] bg-muted">
                      <Image
                        src={imageUrl}
                        alt={p.title}
                        fill
                        className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.08]"
                      />
                    </div>
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="text-sm font-semibold">{p.title}</div>
                        <div className="text-sm font-semibold">
                          {formatINRFromPaise(p.basePricePaise)}
                        </div>
                      </div>
                      <div className="mt-1 text-xs text-mutedForeground">
                        COD · Colors available
                      </div>
                    </div>
                  </Card>
                </TransitionLink>
              </AnimateIn>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

async function LandingReels({ dbConfigured }: { dbConfigured: boolean }) {
  if (!dbConfigured) return null;
  let reels: any[] = [];
  try {
    const prisma = db();
    reels = await prisma.reel.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: "desc" },
      take: 3
    });
  } catch {
    return null;
  }
  if (reels.length === 0) return null;

  return (
    <section className="border-t border-border">
      <Container className="py-12">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="text-xs font-medium tracking-wide text-mutedForeground">
              REELS
            </div>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
              Quick suit drops
            </h2>
            <p className="mt-2 text-sm text-mutedForeground">
              Watch compact reels — open full reels for quick view and add-to-cart.
            </p>
          </div>
          <Button asChild variant="secondary">
            <TransitionLink href="/reels">Open reels</TransitionLink>
          </Button>
        </div>

        <div className="mt-7">
          <LandingReelsStrip reels={reels as any} />
        </div>
      </Container>
    </section>
  );
}
