import { Container } from "@/components/site/container";
import { Card } from "@/components/ui/card";
import { db } from "@/lib/prisma";
import type { Reel } from "@prisma/client";
import { ReelsViewer } from "@/components/reels/reels-viewer";

export const dynamic = "force-dynamic";

export default function ReelsPage() {
  const dbConfigured = Boolean(process.env.DATABASE_URL);
  return (
    <main>
      <Container className="py-10">
        <h1 className="text-2xl font-semibold tracking-tight">Reels</h1>
        <p className="mt-1 text-sm text-mutedForeground">
          {dbConfigured
            ? "Watch the latest suit drops and styling ideas."
            : "Set DATABASE_URL to load reels from MySQL."}
        </p>

        <ReelsGrid dbConfigured={dbConfigured} />
      </Container>
    </main>
  );
}

async function ReelsGrid({ dbConfigured }: { dbConfigured: boolean }) {
  if (!dbConfigured) {
    return (
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <div className="aspect-[9/16] bg-muted" />
            <div className="p-4 text-sm">
              <div className="font-medium">Upload your first reel</div>
              <div className="mt-1 text-xs text-mutedForeground">
                Admin → Reels
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  let reels: Array<Reel & { product?: any | null }> = [];
  try {
    const prisma = db();
    reels = await prisma.reel.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: "desc" },
      take: 30,
      include: {
        product: {
          include: {
            images: { orderBy: { sortOrder: "asc" }, take: 8 },
            colors: {
              where: { isAvailable: true },
              orderBy: { sortOrder: "asc" }
            }
          }
        }
      }
    });
  } catch {
    try {
      const prisma = db();
      reels = (await prisma.reel.findMany({
        where: { isPublished: true },
        orderBy: { createdAt: "desc" },
        take: 30
      })) as any;
      reels = reels.map((r: any) => ({ ...r, product: null }));
    } catch {
      return (
        <Card className="mt-6 p-6">
          <div className="text-sm font-medium">Database temporarily unavailable</div>
          <div className="mt-1 text-sm text-mutedForeground">
            Check your TiDB/MySQL connection and try again.
          </div>
        </Card>
      );
    }
  }

  if (reels.length === 0) {
    return (
      <Card className="mt-6 p-6">
        <div className="text-sm font-medium">No reels yet</div>
        <div className="mt-1 text-sm text-mutedForeground">
          Upload reels from `/admin/reels`.
        </div>
      </Card>
    );
  }

  return (
    <div className="mt-6">
      <ReelsViewer reels={reels as any} />
    </div>
  );
}
