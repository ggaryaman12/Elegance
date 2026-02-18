import { Card } from "@/components/ui/card";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-mutedForeground">
          Manage products, reels, and COD orders.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="p-6">
          <div className="text-sm font-semibold">Products</div>
          <div className="mt-1 text-sm text-mutedForeground">
            Add suits, colors, images.
          </div>
        </Card>
        <Card className="p-6">
          <div className="text-sm font-semibold">Reels</div>
          <div className="mt-1 text-sm text-mutedForeground">
            Upload short videos.
          </div>
        </Card>
        <Card className="p-6">
          <div className="text-sm font-semibold">Orders</div>
          <div className="mt-1 text-sm text-mutedForeground">
            Confirm and update status.
          </div>
        </Card>
      </div>
    </div>
  );
}

