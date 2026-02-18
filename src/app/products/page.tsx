import Image from "next/image";
import Link from "next/link";
import type { Prisma } from "@prisma/client";

import { Container } from "@/components/site/container";
import { Card } from "@/components/ui/card";
import { formatINRFromPaise } from "@/lib/money";
import { suitPlaceholderForKey } from "@/lib/placeholders";
import { db } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type ProductCard = Prisma.ProductGetPayload<{
  include: { images: true; colors: true };
}>;

export default function ProductsPage() {
  const dbConfigured = Boolean(process.env.DATABASE_URL);

  return (
    <main>
      <Container className="py-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Suits</h1>
            <p className="mt-1 text-sm text-mutedForeground">
              {dbConfigured
                ? "Pick a suit, choose a color, and checkout with COD."
                : "Set DATABASE_URL to load products from MySQL."}
            </p>
          </div>
        </div>

        <ProductsGrid dbConfigured={dbConfigured} />
      </Container>
    </main>
  );
}

async function ProductsGrid({ dbConfigured }: { dbConfigured: boolean }) {
  if (!dbConfigured) {
    return (
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="p-5">
            <div className="h-36 rounded-xl bg-muted" />
            <div className="mt-4 flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">Add your first suit</div>
                <div className="text-xs text-mutedForeground">
                  Go to Admin → Products
                </div>
              </div>
              <div className="text-sm font-semibold">—</div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  let products: ProductCard[] = [];
  try {
    const prisma = db();
    products = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      include: {
        images: { orderBy: { sortOrder: "asc" }, take: 1 },
        colors: { where: { isAvailable: true }, orderBy: { sortOrder: "asc" } }
      }
    }) as unknown as ProductCard[];
  } catch {
    return (
      <Card className="mt-6 p-6">
        <div className="text-sm font-medium">Database temporarily unavailable</div>
        <div className="mt-1 text-sm text-mutedForeground">
          Check your TiDB/MySQL connection and try again.
        </div>
      </Card>
    );
  }

  if (products.length === 0) {
    return (
      <Card className="mt-6 p-6">
        <div className="text-sm font-medium">No suits yet</div>
        <div className="mt-1 text-sm text-mutedForeground">
          Add products from `/admin/products`.
        </div>
      </Card>
    );
  }

  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((p) => {
        const imageUrl = p.images[0]?.imageUrl;
        const fallback = suitPlaceholderForKey(p.slug);
        const showUrl = imageUrl ?? fallback;
        return (
          <Link key={p.id} href={`/products/${p.slug}`} className="group">
            <Card className="overflow-hidden">
              <div className="relative aspect-[4/3] bg-muted">
                <Image
                  src={showUrl}
                  alt={p.title}
                  fill
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.08]"
                  priority={false}
                />
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold">{p.title}</div>
                    <div className="mt-1 text-xs text-mutedForeground">
                      {p.colors
                        .slice(0, 4)
                        .map((c) => c.colorName)
                        .join(" · ")}
                      {p.colors.length > 4 ? " · ..." : ""}
                    </div>
                  </div>
                  <div className="text-sm font-semibold">
                    {formatINRFromPaise(p.basePricePaise)}
                  </div>
                </div>
              </div>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
