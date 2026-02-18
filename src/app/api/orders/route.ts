import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/prisma";

const bodySchema = z.object({
  customerName: z.string().min(2).max(120),
  phone: z.string().min(8).max(30),
  address: z.string().min(5).max(2000),
  notes: z.string().max(2000).optional().default(""),
  items: z
    .array(
      z.object({
        productId: z.string().min(10),
        colorName: z.string().min(1).max(80),
        quantity: z.number().int().min(1).max(10)
      })
    )
    .min(1)
});

function makeOrderNumber() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const rand = Math.random().toString(16).slice(2, 6).toUpperCase();
  return `EBN-${y}${m}${day}-${rand}`;
}

export async function POST(req: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { error: "Database not configured" },
      { status: 500 }
    );
  }

  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid order details" },
      { status: 400 }
    );
  }

  const { customerName, phone, address, notes, items } = parsed.data;
  const productIds = Array.from(new Set(items.map((i) => i.productId)));
  const prisma = db();

  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, isActive: true },
    include: { colors: { where: { isAvailable: true } } }
  });

  const productById = new Map(products.map((p) => [p.id, p]));

  try {
    const orderItems = items.map((i) => {
      const product = productById.get(i.productId);
      if (!product) {
        throw new Error("One of the items is unavailable.");
      }
      const colorOk = product.colors.some(
        (c) => c.colorName.toLowerCase() === i.colorName.toLowerCase()
      );
      if (!colorOk) {
        throw new Error("Selected color is unavailable.");
      }
      const unit = product.basePricePaise;
      return {
        productId: product.id,
        productTitle: product.title,
        colorName: i.colorName,
        unitPricePaise: unit,
        quantity: i.quantity,
        lineTotalPaise: unit * i.quantity
      };
    });

    const totalPaise = orderItems.reduce((sum, i) => sum + i.lineTotalPaise, 0);

    let createdOrderNumber: string | null = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      const orderNumber = makeOrderNumber();
      try {
        const result = await prisma.$transaction(async (tx) => {
          const order = await tx.order.create({
            data: {
              orderNumber,
              customerName,
              phone,
              address,
              notes,
              totalPaise
            }
          });

          await tx.orderItem.createMany({
            data: orderItems.map((i) => ({
              orderId: order.id,
              ...i
            }))
          });

          return order;
        });
        createdOrderNumber = result.orderNumber;
        break;
      } catch (e) {
        const msg = e instanceof Error ? e.message : "";
        if (msg.includes("Unique constraint failed") || msg.includes("Duplicate")) {
          continue;
        }
        throw e;
      }
    }

    if (!createdOrderNumber) throw new Error("Failed to generate order number.");

    return NextResponse.json({ orderNumber: createdOrderNumber });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to place order";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
