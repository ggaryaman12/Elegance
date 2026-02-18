import Image from "next/image";
import { notFound } from "next/navigation";

import { Container } from "@/components/site/container";
import { Card } from "@/components/ui/card";
import { suitPlaceholderForKey } from "@/lib/placeholders";
import { db } from "@/lib/prisma";
import { ProductGallery } from "@/components/product/product-gallery";
import { PurchasePanel } from "@/components/product/purchase-panel";
import { ProductSections } from "@/components/product/product-sections";
import { TransitionLink } from "@/components/site/transition-link";

export default async function ProductDetailsPage({
  params
}: {
  params: { slug: string };
}) {
  if (!process.env.DATABASE_URL) {
    return (
      <main>
        <Container className="py-10">
          <Card className="p-6">
            <div className="text-sm font-medium">Database not configured</div>
            <div className="mt-1 text-sm text-mutedForeground">
              Set `DATABASE_URL` and run Prisma migrations.
            </div>
          </Card>
        </Container>
      </main>
    );
  }

  let product: any | null = null;
  try {
    const prisma = db();
    product = await prisma.product.findUnique({
      where: { slug: params.slug },
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        details: true,
        materialsCare: true,
        deliveryPayment: true,
        basePricePaise: true,
        isActive: true,
        images: { orderBy: { sortOrder: "asc" } },
        colors: {
          where: { isAvailable: true },
          orderBy: { sortOrder: "asc" }
        }
      }
    });
  } catch {
    try {
      const prisma = db();
      product = await prisma.product.findUnique({
        where: { slug: params.slug },
        select: {
          id: true,
          slug: true,
          title: true,
          description: true,
          basePricePaise: true,
          isActive: true,
          images: { orderBy: { sortOrder: "asc" } },
          colors: {
            where: { isAvailable: true },
            orderBy: { sortOrder: "asc" }
          }
        }
      });
      if (product) {
        product = {
          ...product,
          details: null,
          materialsCare: null,
          deliveryPayment: null
        };
      }
    } catch {
      return (
        <main>
          <Container className="py-10">
            <Card className="p-6">
              <div className="text-sm font-medium">Database temporarily unavailable</div>
              <div className="mt-1 text-sm text-mutedForeground">
                Check your TiDB/MySQL connection and try again.
              </div>
            </Card>
          </Container>
        </main>
      );
    }
  }

  if (!product || !product.isActive) notFound();

  const fallback = suitPlaceholderForKey(product.slug);
  const galleryImages = (product.images?.length
    ? product.images
    : [{ id: "placeholder", imageUrl: fallback, alt: product.title } as any]
  ).map((img: any) => ({
    id: String(img.id),
    url: String(img.imageUrl),
    alt: String(img.alt || product.title)
  }));

  return (
    <main>
      <Container className="py-10">
        <div className="mb-6 flex flex-wrap items-center gap-2 text-xs text-mutedForeground">
          <TransitionLink href="/" className="hover:text-foreground">
            Home
          </TransitionLink>
          <span>›</span>
          <TransitionLink href="/products" className="hover:text-foreground">
            Suits
          </TransitionLink>
          <span>›</span>
          <span className="text-foreground">{product.title}</span>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
          <div className="space-y-8">
            <ProductGallery title={product.title} images={galleryImages} />
            <ProductSections
              details={product.details ?? product.description}
              materialsCare={product.materialsCare}
              deliveryPayment={product.deliveryPayment}
            />
          </div>

          <PurchasePanel
            productId={product.id}
            title={product.title}
            slug={product.slug}
            pricePaise={product.basePricePaise}
            colors={product.colors.map((c: any) => ({
              name: c.colorName,
              hex: c.colorHex ?? undefined
            }))}
          />
        </div>
      </Container>
    </main>
  );
}
