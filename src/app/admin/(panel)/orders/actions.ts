"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { db } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

const statusSchema = z.enum([
  "PLACED",
  "CONFIRMED",
  "PACKED",
  "READY",
  "DELIVERED",
  "CANCELLED"
]);

export async function updateOrderStatus(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) redirect("/admin/login");

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  const parsed = statusSchema.safeParse(status);
  if (!id || !parsed.success) throw new Error("Invalid");

  const prisma = db();
  await prisma.order.update({
    where: { id },
    data: { status: parsed.data }
  });

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
}
