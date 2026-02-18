import Link from "next/link";
import { notFound } from "next/navigation";

import { CloudinaryUploadField } from "@/components/admin/cloudinary-upload-field";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { db } from "@/lib/prisma";

import { addProductColor, addProductImage, deleteProductColor, deleteProductImage } from "../actions";
import { updateProductSections } from "../actions";

export default async function AdminProductDetailsPage({
  params
}: {
  params: { id: string };
}) {
  if (!process.env.DATABASE_URL) notFound();

  let product: any | null = null;
  try {
    const prisma = db();
    product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        colors: { orderBy: { sortOrder: "asc" } },
        images: { orderBy: { sortOrder: "asc" } }
      }
    });
  } catch {
    return (
      <div className="space-y-4">
        <Card className="p-6">
          <div className="text-sm font-medium">Database temporarily unavailable</div>
          <div className="mt-1 text-sm text-mutedForeground">
            Check your TiDB/MySQL connection and try again.
          </div>
        </Card>
      </div>
    );
  }
  if (!product) notFound();

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{product.title}</h1>
          <p className="mt-1 text-sm text-mutedForeground">{product.slug}</p>
        </div>
        <Button asChild variant="secondary">
          <Link href="/admin/products">Back</Link>
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-6 lg:col-span-2">
          <div className="text-sm font-semibold">Product page sections</div>
          <p className="mt-1 text-sm text-mutedForeground">
            These show under the gallery on the product description page.
          </p>
          <form action={updateProductSections} className="mt-4 grid gap-4">
            <input type="hidden" name="productId" value={product.id} />
            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="details">
                Product details
              </label>
              <Textarea
                id="details"
                name="details"
                defaultValue={product.details ?? ""}
                placeholder="Fit, style, what’s included, etc."
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="materialsCare">
                Materials & care
              </label>
              <Textarea
                id="materialsCare"
                name="materialsCare"
                defaultValue={product.materialsCare ?? ""}
                placeholder="Fabric, wash/care instructions..."
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="deliveryPayment">
                Delivery & payment
              </label>
              <Textarea
                id="deliveryPayment"
                name="deliveryPayment"
                defaultValue={product.deliveryPayment ?? ""}
                placeholder="COD info, delivery info..."
              />
            </div>
            <Button type="submit">Save sections</Button>
          </form>
        </Card>

        <Card className="p-6">
          <div className="text-sm font-semibold">Colors</div>
          <form action={addProductColor} className="mt-4 grid gap-3">
            <input type="hidden" name="productId" value={product.id} />
            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="colorName">
                Color name
              </label>
              <Input id="colorName" name="colorName" placeholder="Navy Blue" required />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="colorHex">
                Hex (optional)
              </label>
              <Input id="colorHex" name="colorHex" placeholder="#0A2342" />
            </div>
            <Button type="submit">Add color</Button>
          </form>

          <div className="mt-5 space-y-2">
            {product.colors.length === 0 ? (
              <div className="text-sm text-mutedForeground">No colors yet.</div>
            ) : (
              product.colors.map(
                (c: { id: string; colorName: string; colorHex: string | null }) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between rounded-xl border border-border px-3 py-2"
                  >
                    <div className="flex items-center gap-2 text-sm">
                      <span
                        className="h-3 w-3 rounded-full border border-border"
                        style={{ background: c.colorHex ?? "transparent" }}
                      />
                      {c.colorName}
                    </div>
                    <form action={deleteProductColor}>
                      <input type="hidden" name="id" value={c.id} />
                      <input type="hidden" name="productId" value={product.id} />
                      <Button type="submit" variant="ghost">
                        Delete
                      </Button>
                    </form>
                  </div>
                )
              )
            )}
          </div>
        </Card>

        <Card className="p-6">
          <div className="text-sm font-semibold">Images</div>
          <form action={addProductImage} className="mt-4 grid gap-3">
            <input type="hidden" name="productId" value={product.id} />
            <CloudinaryUploadField
              name="imageUrl"
              folder="elegance-by-neha/products"
              resourceType="image"
              label="Image"
            />
            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="alt">
                Alt text (optional)
              </label>
              <Input id="alt" name="alt" placeholder="Navy suit front view" />
            </div>
            <Button type="submit">Add image</Button>
          </form>

          <div className="mt-5 space-y-2">
            {product.images.length === 0 ? (
              <div className="text-sm text-mutedForeground">No images yet.</div>
            ) : (
              product.images.map(
                (img: { id: string; imageUrl: string; alt: string }) => (
                  <div
                    key={img.id}
                    className="flex items-center justify-between rounded-xl border border-border px-3 py-2"
                  >
                    <div className="truncate text-sm">{img.alt || img.imageUrl}</div>
                    <form action={deleteProductImage}>
                      <input type="hidden" name="id" value={img.id} />
                      <input type="hidden" name="productId" value={product.id} />
                      <Button type="submit" variant="ghost">
                        Delete
                      </Button>
                    </form>
                  </div>
                )
              )
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
