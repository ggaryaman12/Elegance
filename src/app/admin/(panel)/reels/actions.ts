"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { db } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

const createSchema = z.object({
  videoUrl: z.string().url(),
  caption: z.string().max(2000).optional().default(""),
  productId: z.string().optional().default(""),
  isPublished: z.string().optional()
});

export async function createReel(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) redirect("/admin/login");

  const parsed = createSchema.safeParse({
    videoUrl: formData.get("videoUrl"),
    caption: formData.get("caption"),
    productId: formData.get("productId"),
    isPublished: formData.get("isPublished")
  });
  if (!parsed.success) {
    throw new Error("Invalid reel details");
  }

  const prisma = db();
  try {
    await prisma.reel.create({
      data: {
        videoUrl: parsed.data.videoUrl,
        caption: parsed.data.caption ?? "",
        productId: parsed.data.productId ? parsed.data.productId : null,
        isPublished: Boolean(parsed.data.isPublished)
      }
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.toLowerCase().includes("productid")) {
      // DB not migrated yet; create without linking.
      await prisma.reel.create({
        data: {
          videoUrl: parsed.data.videoUrl,
          caption: parsed.data.caption ?? "",
          isPublished: Boolean(parsed.data.isPublished)
        }
      });
    } else {
      throw e;
    }
  }

  revalidatePath("/admin/reels");
  revalidatePath("/reels");
}

export async function toggleReelPublish(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) redirect("/admin/login");

  const id = String(formData.get("id") ?? "");
  const next = String(formData.get("next") ?? "");
  if (!id || (next !== "true" && next !== "false")) throw new Error("Invalid");

  const prisma = db();
  await prisma.reel.update({
    where: { id },
    data: { isPublished: next === "true" }
  });

  revalidatePath("/admin/reels");
  revalidatePath("/reels");
}

export async function deleteReel(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) redirect("/admin/login");

  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Invalid");

  const prisma = db();
  await prisma.reel.delete({ where: { id } });

  revalidatePath("/admin/reels");
  revalidatePath("/reels");
}

export async function updateReelProductLink(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) redirect("/admin/login");

  const id = String(formData.get("id") ?? "");
  const productId = String(formData.get("productId") ?? "");
  if (!id) throw new Error("Invalid");

  const prisma = db();
  try {
    await prisma.reel.update({
      where: { id },
      data: { productId: productId ? productId : null }
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.toLowerCase().includes("productid")) {
      throw new Error(
        "Your database is missing reel→product linking. Run `npm run db:migrate` and try again."
      );
    }
    throw e;
  }

  revalidatePath("/admin/reels");
  revalidatePath("/reels");
}
