import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatINRFromPaise } from "@/lib/money";
import { db } from "@/lib/prisma";

export default async function AdminOrderDetailsPage({
  params
}: {
  params: { id: string };
}) {
  if (!process.env.DATABASE_URL) notFound();

  let order: any | null = null;
  try {
    const prisma = db();
    order = await prisma.order.findUnique({
      where: { id: params.id },
      include: { items: true }
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
  if (!order) notFound();

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {order.orderNumber}
          </h1>
          <p className="mt-1 text-sm text-mutedForeground">
            {order.customerName} · {order.phone} ·{" "}
            {new Date(order.createdAt).toLocaleString("en-IN")}
          </p>
        </div>
        <Button asChild variant="secondary">
          <Link href="/admin/orders">Back</Link>
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <div className="text-sm font-semibold">Items</div>
          <div className="mt-4 divide-y divide-border">
            {order.items.map((i: any) => (
              <div key={i.id} className="py-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm font-medium">{i.productTitle}</div>
                    <div className="mt-1 text-xs text-mutedForeground">
                      {i.colorName} · Qty {i.quantity}
                    </div>
                  </div>
                  <div className="text-sm font-semibold">
                    {formatINRFromPaise(i.lineTotalPaise)}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-border pt-4 text-sm">
            <div className="text-mutedForeground">Total</div>
            <div className="font-semibold">
              {formatINRFromPaise(order.totalPaise)}
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="text-sm font-semibold">Delivery</div>
          <div className="mt-3 space-y-2 text-sm">
            <div>
              <div className="text-xs text-mutedForeground">Address</div>
              <div className="whitespace-pre-wrap font-medium">{order.address}</div>
            </div>
            {order.notes ? (
              <div>
                <div className="text-xs text-mutedForeground">Notes</div>
                <div className="whitespace-pre-wrap font-medium">{order.notes}</div>
              </div>
            ) : null}
            <div className="pt-2">
              <div className="text-xs text-mutedForeground">Status</div>
              <div className="font-medium">{order.status}</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
