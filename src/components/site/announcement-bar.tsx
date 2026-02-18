import { db } from "@/lib/prisma";
import { Marquee } from "@/components/site/marquee";

export async function AnnouncementBar() {
  if (!process.env.DATABASE_URL) return null;

  try {
    const prisma = db();
    const rows = await prisma.announcement.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      take: 6
    });
    const items = rows.map((r) => r.message);
    if (items.length === 0) return null;

    return (
      <div className="border-b border-border bg-primary text-primaryForeground">
        <div className="mx-auto max-w-6xl px-4 py-2 sm:px-6">
          <Marquee items={items} className="opacity-95" speed={26} />
        </div>
      </div>
    );
  } catch {
    return null;
  }
}
