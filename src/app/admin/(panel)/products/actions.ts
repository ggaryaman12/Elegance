"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { db } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

const createProductSchema = z.object({
  title: z.string().min(2).max(180),
  description: z.string().min(0).max(5000).optional().default(""),
  priceRupees: z.coerce.number().int().min(0).max(999999),
  slug: z.string().min(0).max(120).optional().default(""),
  imageUrl: z.string().url().optional(),
  imageAlt: z.string().max(255).optional().default("")
});

export async function createProduct(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) redirect("/admin/login");

  const parsed = createProductSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    priceRupees: formData.get("priceRupees"),
    slug: formData.get("slug"),
    imageUrl: formData.get("imageUrl") || undefined,
    imageAlt: formData.get("imageAlt")
  });
  if (!parsed.success) throw new Error("Invalid product details");

  const baseSlug = parsed.data.slug ? slugify(parsed.data.slug) : slugify(parsed.data.title);
  if (!baseSlug) throw new Error("Slug cannot be empty");

  const prisma = db();
  let slug = baseSlug;
  const exists = await prisma.product.findUnique({ where: { slug } });
  if (exists) slug = `${baseSlug}-${Math.random().toString(16).slice(2, 6)}`;

  const product = await prisma.product.create({
    data: {
      slug,
      title: parsed.data.title,
      description: parsed.data.description ?? "",
      basePricePaise: parsed.data.priceRupees * 100,
      images: parsed.data.imageUrl
        ? {
            create: {
              imageUrl: parsed.data.imageUrl,
              alt: parsed.data.imageAlt ?? "",
              sortOrder: 1
            }
          }
        : undefined
    }
  });

  revalidatePath("/admin/products");
  redirect(`/admin/products/${product.id}`);
}

export async function setProductActive(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) redirect("/admin/login");

  const id = String(formData.get("id") ?? "");
  const next = String(formData.get("next") ?? "");
  if (!id || (next !== "true" && next !== "false")) throw new Error("Invalid");

  const prisma = db();
  await prisma.product.update({
    where: { id },
    data: { isActive: next === "true" }
  });

  revalidatePath("/admin/products");
  revalidatePath("/products");
}

const addColorSchema = z.object({
  productId: z.string().min(10),
  colorName: z.string().min(1).max(80),
  colorHex: z.string().max(20).optional().default("")
});

export async function addProductColor(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) redirect("/admin/login");

  const parsed = addColorSchema.safeParse({
    productId: formData.get("productId"),
    colorName: formData.get("colorName"),
    colorHex: formData.get("colorHex")
  });
  if (!parsed.success) throw new Error("Invalid color");

  const prisma = db();
  await prisma.productColor.create({
    data: {
      productId: parsed.data.productId,
      colorName: parsed.data.colorName,
      colorHex: parsed.data.colorHex || null
    }
  });

  revalidatePath(`/admin/products/${parsed.data.productId}`);
  revalidatePath("/products");
}

export async function deleteProductColor(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) redirect("/admin/login");
  const id = String(formData.get("id") ?? "");
  const productId = String(formData.get("productId") ?? "");
  if (!id || !productId) throw new Error("Invalid");

  const prisma = db();
  await prisma.productColor.delete({ where: { id } });

  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/products");
}

const addImageSchema = z.object({
  productId: z.string().min(10),
  imageUrl: z.string().url(),
  alt: z.string().max(255).optional().default("")
});

export async function addProductImage(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) redirect("/admin/login");

  const parsed = addImageSchema.safeParse({
    productId: formData.get("productId"),
    imageUrl: formData.get("imageUrl"),
    alt: formData.get("alt")
  });
  if (!parsed.success) throw new Error("Invalid image");

  const prisma = db();
  const maxSort = await prisma.productImage.aggregate({
    where: { productId: parsed.data.productId },
    _max: { sortOrder: true }
  });

  await prisma.productImage.create({
    data: {
      productId: parsed.data.productId,
      imageUrl: parsed.data.imageUrl,
      alt: parsed.data.alt ?? "",
      sortOrder: (maxSort._max.sortOrder ?? 0) + 1
    }
  });

  revalidatePath(`/admin/products/${parsed.data.productId}`);
  revalidatePath("/products");
}

export async function deleteProductImage(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) redirect("/admin/login");
  const id = String(formData.get("id") ?? "");
  const productId = String(formData.get("productId") ?? "");
  if (!id || !productId) throw new Error("Invalid");

  const prisma = db();
  await prisma.productImage.delete({ where: { id } });

  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/products");
}

const updateSectionsSchema = z.object({
  productId: z.string().min(10),
  details: z.string().max(10000).optional().default(""),
  materialsCare: z.string().max(10000).optional().default(""),
  deliveryPayment: z.string().max(10000).optional().default("")
});

export async function updateProductSections(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) redirect("/admin/login");

  const parsed = updateSectionsSchema.safeParse({
    productId: formData.get("productId"),
    details: formData.get("details"),
    materialsCare: formData.get("materialsCare"),
    deliveryPayment: formData.get("deliveryPayment")
  });
  if (!parsed.success) throw new Error("Invalid section details");

  const prisma = db();
  await prisma.product.update({
    where: { id: parsed.data.productId },
    data: {
      details: parsed.data.details ? parsed.data.details : null,
      materialsCare: parsed.data.materialsCare ? parsed.data.materialsCare : null,
      deliveryPayment: parsed.data.deliveryPayment
        ? parsed.data.deliveryPayment
        : null
    }
  });

  revalidatePath(`/admin/products/${parsed.data.productId}`);
  revalidatePath(`/products`);
}
