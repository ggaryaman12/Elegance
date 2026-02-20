import Link from "next/link";
import type { Prisma } from "@prisma/client";

import { CloudinaryUploadField } from "@/components/admin/cloudinary-upload-field";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { formatINRFromPaise } from "@/lib/money";
import { db } from "@/lib/prisma";

import { createProduct, setProductActive } from "./actions";

type ProductAdminRow = Prisma.ProductGetPayload<{
  include: { _count: { select: { colors: true; images: true } } };
}>;

export default function AdminProductsPage() {
  const dbConfigured = Boolean(process.env.DATABASE_URL);
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
        <p className="mt-1 text-sm text-mutedForeground">
          Add suits, colors, and images for the storefront.
        </p>
      </div>
      {!dbConfigured ? (
        <Card className="p-6">
          <div className="text-sm font-medium">Database not configured</div>
          <div className="mt-1 text-sm text-mutedForeground">
            Set `DATABASE_URL` and run Prisma migrations.
          </div>
        </Card>
      ) : (
        <>
          <Card className="p-6">
            <div className="text-sm font-semibold">Add a product</div>
            <form action={createProduct} className="mt-4 grid gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium" htmlFor="title">
                  Title
                </label>
                <Input id="title" name="title" placeholder="Classic Navy Suit" required />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium" htmlFor="slug">
                  Slug (optional)
                </label>
                <Input id="slug" name="slug" placeholder="classic-navy-suit" />
              </div>
              <CloudinaryUploadField
                name="imageUrl"
                folder="ethnic-world-exclusive/products"
                resourceType="image"
                label="Cover image (optional)"
              />
              <div className="grid gap-2">
                <label className="text-sm font-medium" htmlFor="imageAlt">
                  Image alt (optional)
                </label>
                <Input id="imageAlt" name="imageAlt" placeholder="Navy suit front view" />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium" htmlFor="priceRupees">
                  Base price (₹)
                </label>
                <Input
                  id="priceRupees"
                  name="priceRupees"
                  type="number"
                  min={0}
                  placeholder="7999"
                  required
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium" htmlFor="description">
                  Description
                </label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Premium fabric, tailored fit..."
                />
              </div>
              <Button type="submit">Create product</Button>
            </form>
          </Card>

          <ProductsList />
        </>
      )}
    </div>
  );
}

async function ProductsList() {
  let products: ProductAdminRow[] = [];
  try {
    const prisma = db();
    products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { colors: true, images: true } }
      }
    }) as unknown as ProductAdminRow[];
  } catch {
    return (
      <Card className="p-6">
        <div className="text-sm font-medium">Database temporarily unavailable</div>
        <div className="mt-1 text-sm text-mutedForeground">
          Check your TiDB/MySQL connection and try again.
        </div>
      </Card>
    );
  }

  if (products.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-sm text-mutedForeground">No products yet.</div>
      </Card>
    );
  }

  return (
    <div className="grid gap-3">
      {products.map((p) => (
        <Card key={p.id} className="p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm font-semibold">{p.title}</div>
              <div className="mt-1 text-xs text-mutedForeground">
                {p.slug} · {formatINRFromPaise(p.basePricePaise)} ·{" "}
                {p._count.colors} colors · {p._count.images} images
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="secondary">
                <Link href={`/admin/products/${p.id}`}>Manage</Link>
              </Button>
              <form action={setProductActive}>
                <input type="hidden" name="id" value={p.id} />
                <input type="hidden" name="next" value={p.isActive ? "false" : "true"} />
                <Button type="submit" variant="ghost">
                  {p.isActive ? "Deactivate" : "Activate"}
                </Button>
              </form>
              <Button asChild variant="ghost">
                <Link href={`/products/${p.slug}`}>View</Link>
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
