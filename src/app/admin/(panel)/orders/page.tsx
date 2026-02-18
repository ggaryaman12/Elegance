import Link from "next/link";
import type { Order } from "@prisma/client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatINRFromPaise } from "@/lib/money";
import { db } from "@/lib/prisma";

import { updateOrderStatus } from "./actions";

export default function AdminOrdersPage() {
  const dbConfigured = Boolean(process.env.DATABASE_URL);
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Orders</h1>
        <p className="mt-1 text-sm text-mutedForeground">
          View COD orders and update their status.
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
        <OrdersList />
      )}
    </div>
  );
}

async function OrdersList() {
  let orders: Array<Order & { _count: { items: number } }> = [];
  try {
    const prisma = db();
    orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        _count: { select: { items: true } }
      }
    });
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

  if (orders.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-sm text-mutedForeground">No orders yet.</div>
      </Card>
    );
  }

  const statuses = [
    "PLACED",
    "CONFIRMED",
    "PACKED",
    "READY",
    "DELIVERED",
    "CANCELLED"
  ] as const;

  return (
    <div className="grid gap-3">
      {orders.map((o) => (
        <Card key={o.id} className="p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="text-sm font-semibold">{o.orderNumber}</div>
              <div className="mt-1 text-xs text-mutedForeground">
                {o.customerName} · {o.phone} · {o._count.items} items ·{" "}
                {formatINRFromPaise(o.totalPaise)} ·{" "}
                {new Date(o.createdAt).toLocaleString("en-IN")}
              </div>
              <div className="mt-2 text-sm">
                <span className="text-mutedForeground">Status: </span>
                <span className="font-medium">{o.status}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button asChild variant="secondary">
                <Link href={`/admin/orders/${o.id}`}>View</Link>
              </Button>
              <form action={updateOrderStatus} className="flex items-center gap-2">
                <input type="hidden" name="id" value={o.id} />
                <select
                  name="status"
                  defaultValue={o.status}
                  className="h-10 rounded-xl border border-border bg-card px-3 text-sm"
                >
                  {statuses.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <Button type="submit">Update</Button>
              </form>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
