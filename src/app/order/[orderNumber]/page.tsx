import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/components/site/container";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatINRFromPaise } from "@/lib/money";
import { db } from "@/lib/prisma";

export default async function OrderPage({
  params
}: {
  params: { orderNumber: string };
}) {
  if (!process.env.DATABASE_URL) notFound();

  let order: any | null = null;
  try {
    const prisma = db();
    order = await prisma.order.findUnique({
      where: { orderNumber: params.orderNumber },
      include: { items: true }
    });
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
  if (!order) notFound();

  return (
    <main>
      <Container className="py-10">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Order {order.orderNumber}
            </h1>
            <p className="mt-1 text-sm text-mutedForeground">
              Status: <span className="font-medium">{order.status}</span>
            </p>
          </div>
          <Button asChild variant="secondary">
            <Link href="/products">Continue shopping</Link>
          </Button>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <Card className="p-6 lg:col-span-2">
            <div className="text-sm font-semibold">Items</div>
            <div className="mt-4 divide-y divide-border">
              {order.items.map((i) => (
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
              <div className="text-mutedForeground">Total (COD)</div>
              <div className="font-semibold">
                {formatINRFromPaise(order.totalPaise)}
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="text-sm font-semibold">Delivery</div>
            <div className="mt-3 space-y-2 text-sm">
              <div>
                <div className="text-xs text-mutedForeground">Name</div>
                <div className="font-medium">{order.customerName}</div>
              </div>
              <div>
                <div className="text-xs text-mutedForeground">Phone</div>
                <div className="font-medium">{order.phone}</div>
              </div>
              <div>
                <div className="text-xs text-mutedForeground">Address</div>
                <div className="whitespace-pre-wrap font-medium">
                  {order.address}
                </div>
              </div>
              {order.notes ? (
                <div>
                  <div className="text-xs text-mutedForeground">Notes</div>
                  <div className="whitespace-pre-wrap font-medium">
                    {order.notes}
                  </div>
                </div>
              ) : null}
            </div>
          </Card>
        </div>
      </Container>
    </main>
  );
}
