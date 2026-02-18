"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { db } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

const createAnnouncementSchema = z.object({
  message: z.string().min(2).max(180),
  sortOrder: z.coerce.number().int().min(0).max(9999).optional().default(0),
  isActive: z.string().optional()
});

export async function createAnnouncement(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) redirect("/admin/login");

  const parsed = createAnnouncementSchema.safeParse({
    message: formData.get("message"),
    sortOrder: formData.get("sortOrder"),
    isActive: formData.get("isActive")
  });
  if (!parsed.success) throw new Error("Invalid announcement");

  const prisma = db();
  await prisma.announcement.create({
    data: {
      message: parsed.data.message,
      sortOrder: parsed.data.sortOrder,
      isActive: Boolean(parsed.data.isActive)
    }
  });

  revalidatePath("/");
  revalidatePath("/admin/home");
}

export async function deleteAnnouncement(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) redirect("/admin/login");

  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Invalid");

  const prisma = db();
  await prisma.announcement.delete({ where: { id } });

  revalidatePath("/");
  revalidatePath("/admin/home");
}

export async function toggleAnnouncement(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) redirect("/admin/login");

  const id = String(formData.get("id") ?? "");
  const next = String(formData.get("next") ?? "");
  if (!id || (next !== "true" && next !== "false")) throw new Error("Invalid");

  const prisma = db();
  await prisma.announcement.update({
    where: { id },
    data: { isActive: next === "true" }
  });

  revalidatePath("/");
  revalidatePath("/admin/home");
}

const upsertBannerSchema = z.object({
  id: z.string().optional().default(""),
  title: z.string().min(2).max(120),
  subtitle: z.string().min(0).max(240).optional().default(""),
  imageUrl: z.string().url().optional().or(z.literal("")).default(""),
  videoUrl: z.string().url().optional().or(z.literal("")).default(""),
  videoPosterUrl: z.string().url().optional().or(z.literal("")).default(""),
  ctaText: z.string().min(1).max(60),
  ctaHref: z.string().min(1).max(200),
  sortOrder: z.coerce.number().int().min(0).max(9999).optional().default(0),
  isActive: z.string().optional()
});

export async function upsertHomeBanner(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) redirect("/admin/login");

  const parsed = upsertBannerSchema.safeParse({
    id: formData.get("id"),
    title: formData.get("title"),
    subtitle: formData.get("subtitle"),
    imageUrl: formData.get("imageUrl"),
    videoUrl: formData.get("videoUrl"),
    videoPosterUrl: formData.get("videoPosterUrl"),
    ctaText: formData.get("ctaText"),
    ctaHref: formData.get("ctaHref"),
    sortOrder: formData.get("sortOrder"),
    isActive: formData.get("isActive")
  });
  if (!parsed.success) throw new Error("Invalid banner");

  const imageUrl = parsed.data.imageUrl?.trim() || null;
  const videoUrl = parsed.data.videoUrl?.trim() || null;
  const videoPosterUrl = parsed.data.videoPosterUrl?.trim() || null;
  if (!imageUrl && !videoUrl) {
    throw new Error("Banner needs an image or a video.");
  }

  const prisma = db();
  try {
    if (parsed.data.id) {
      await prisma.homeBanner.update({
        where: { id: parsed.data.id },
        data: {
          title: parsed.data.title,
          subtitle: parsed.data.subtitle,
          imageUrl,
          videoUrl,
          videoPosterUrl,
          ctaText: parsed.data.ctaText,
          ctaHref: parsed.data.ctaHref,
          sortOrder: parsed.data.sortOrder,
          isActive: Boolean(parsed.data.isActive)
        }
      });
    } else {
      await prisma.homeBanner.create({
        data: {
          title: parsed.data.title,
          subtitle: parsed.data.subtitle,
          imageUrl,
          videoUrl,
          videoPosterUrl,
          ctaText: parsed.data.ctaText,
          ctaHref: parsed.data.ctaHref,
          sortOrder: parsed.data.sortOrder,
          isActive: Boolean(parsed.data.isActive)
        }
      });
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.toLowerCase().includes("videourl")) {
      throw new Error(
        "Your database is missing the banner video columns. Run `npx prisma migrate deploy` and try again."
      );
    }
    throw e;
  }

  revalidatePath("/");
  revalidatePath("/admin/home");
}

export async function deleteHomeBanner(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) redirect("/admin/login");

  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Invalid");

  const prisma = db();
  // Use raw delete so it still works even if the DB is behind the Prisma schema
  // (e.g. missing `videoUrl` columns). `delete()` can fail because Prisma selects
  // all columns for the returning row.
  await prisma.$executeRaw`DELETE FROM HomeBanner WHERE id = ${id}`;

  revalidatePath("/");
  revalidatePath("/admin/home");
}

const sponsoredSchema = z.object({
  productId: z.string().min(10),
  next: z.string()
});

export async function setSponsored(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) redirect("/admin/login");

  const parsed = sponsoredSchema.safeParse({
    productId: formData.get("productId"),
    next: formData.get("next")
  });
  if (!parsed.success) throw new Error("Invalid");

  const prisma = db();
  await prisma.product.update({
    where: { id: parsed.data.productId },
    data: { isSponsored: parsed.data.next === "true" }
  });

  revalidatePath("/");
  revalidatePath("/admin/home");
  revalidatePath("/admin/products");
}

const sortSchema = z.object({
  productId: z.string().min(10),
  sponsoredSortOrder: z.coerce.number().int().min(0).max(9999)
});

const homeSettingsSchema = z.object({
  heroRotateMs: z.coerce.number().int().min(2500).max(60000)
});

export async function updateHomeSettings(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) redirect("/admin/login");

  const parsed = homeSettingsSchema.safeParse({
    heroRotateMs: formData.get("heroRotateMs")
  });
  if (!parsed.success) throw new Error("Invalid settings");

  const prisma = db();
  try {
    const api = (prisma as any).homeSettings;
    if (!api?.upsert) {
      throw new Error("Home settings are not available. Run `npx prisma generate`.");
    }
    await api.upsert({
      where: { id: "singleton" },
      create: { id: "singleton", heroRotateMs: parsed.data.heroRotateMs },
      update: { heroRotateMs: parsed.data.heroRotateMs }
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.toLowerCase().includes("homesettings")) {
      throw new Error(
        "Your database is missing Home settings. Run `npm run db:migrate` and try again."
      );
    }
    throw e;
  }

  revalidatePath("/");
  revalidatePath("/admin/home");
}

export async function setSponsoredSort(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) redirect("/admin/login");

  const parsed = sortSchema.safeParse({
    productId: formData.get("productId"),
    sponsoredSortOrder: formData.get("sponsoredSortOrder")
  });
  if (!parsed.success) throw new Error("Invalid");

  const prisma = db();
  await prisma.product.update({
    where: { id: parsed.data.productId },
    data: { sponsoredSortOrder: parsed.data.sponsoredSortOrder }
  });

  revalidatePath("/");
  revalidatePath("/admin/home");
}
