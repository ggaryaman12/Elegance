import Link from "next/link";
import { redirect } from "next/navigation";

import { adminLogout } from "@/app/admin/(auth)/login/actions";
import { Container } from "@/components/site/container";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/session";

export default async function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin();
  if (!admin) redirect("/admin/login");

  return (
    <main>
      <Container className="py-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="min-w-60 rounded-2xl border border-border bg-card p-4">
            <div className="text-sm font-semibold">Admin</div>
            <div className="mt-1 text-xs text-mutedForeground">{admin.email}</div>
            <nav className="mt-4 grid gap-1 text-sm">
              <Link className="rounded-xl px-3 py-2 hover:bg-muted" href="/admin">
                Dashboard
              </Link>
              <Link
                className="rounded-xl px-3 py-2 hover:bg-muted"
                href="/admin/home"
              >
                Home
              </Link>
              <Link
                className="rounded-xl px-3 py-2 hover:bg-muted"
                href="/admin/products"
              >
                Products
              </Link>
              <Link className="rounded-xl px-3 py-2 hover:bg-muted" href="/admin/reels">
                Reels
              </Link>
              <Link
                className="rounded-xl px-3 py-2 hover:bg-muted"
                href="/admin/orders"
              >
                Orders
              </Link>
            </nav>
            <form action={adminLogout} className="mt-4">
              <Button type="submit" variant="secondary" className="w-full">
                Sign out
              </Button>
            </form>
          </div>

          <div className="flex-1">{children}</div>
        </div>
      </Container>
    </main>
  );
}
