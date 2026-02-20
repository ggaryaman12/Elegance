import { CloudinaryUploadField } from "@/components/admin/cloudinary-upload-field";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { db } from "@/lib/prisma";
import type { Reel } from "@prisma/client";

import {
  createReel,
  deleteReel,
  toggleReelPublish,
  updateReelProductLink
} from "./actions";

export default function AdminReelsPage() {
  const dbConfigured = Boolean(process.env.DATABASE_URL);
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Reels</h1>
        <p className="mt-1 text-sm text-mutedForeground">
          Upload vertical videos and publish them to the Reels page.
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
        <>
          <AddReelCard />

          <ReelsList />
        </>
      )}
    </div>
  );
}

async function AddReelCard() {
  const prisma = db();
  const products = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, slug: true }
  });

  return (
    <Card className="p-6">
      <div className="text-sm font-semibold">Add a reel</div>
      <form action={createReel} className="mt-4 grid gap-4">
        <CloudinaryUploadField
          name="videoUrl"
          folder="ethnic-world-exclusive/reels"
          resourceType="video"
          label="Video"
        />
        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor="caption">
            Caption (optional)
          </label>
          <Input id="caption" name="caption" placeholder="New arrival ✨" />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor="productId">
            Link to product (optional)
          </label>
          <select
            id="productId"
            name="productId"
            className="h-10 rounded-xl border border-border bg-card px-3 text-sm"
            defaultValue=""
          >
            <option value="">No product link</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title} ({p.slug})
              </option>
            ))}
          </select>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="isPublished" defaultChecked />
          Publish now
        </label>
        <Button type="submit">Create reel</Button>
      </form>
    </Card>
  );
}

async function ReelsList() {
  let reels: Array<Reel & { product?: { id: string; title: string; slug: string } | null }> =
    [];
  let products: Array<{ id: string; title: string; slug: string }> = [];
  try {
    const prisma = db();
    [reels, products] = await Promise.all([
      prisma.reel.findMany({
        orderBy: { createdAt: "desc" },
        take: 50,
        include: { product: { select: { id: true, title: true, slug: true } } }
      }),
      prisma.product.findMany({
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
        select: { id: true, title: true, slug: true }
      })
    ]);
  } catch {
    try {
      const prisma = db();
      [reels, products] = await Promise.all([
        prisma.reel.findMany({
          orderBy: { createdAt: "desc" },
          take: 50
        }) as any,
        prisma.product.findMany({
          where: { isActive: true },
          orderBy: { createdAt: "desc" },
          select: { id: true, title: true, slug: true }
        })
      ]);
      reels = reels.map((r: any) => ({ ...r, product: null }));
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
  }

  if (reels.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-sm text-mutedForeground">No reels yet.</div>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {reels.map((r) => (
        <Card key={r.id} className="overflow-hidden">
          <div className="aspect-[9/16] bg-muted">
            <video
              className="h-full w-full object-cover"
              src={r.videoUrl}
              muted
              playsInline
              controls
            />
          </div>
          <div className="p-4">
            <div className="text-sm font-medium">{r.caption || "—"}</div>
            <div className="mt-1 text-xs text-mutedForeground">
              {new Date(r.createdAt).toLocaleString("en-IN")}
            </div>
            <div className="mt-3 grid gap-2">
              <div className="text-xs text-mutedForeground">Linked product</div>
              <form action={updateReelProductLink} className="flex items-center gap-2">
                <input type="hidden" name="id" value={r.id} />
                <select
                  name="productId"
                  defaultValue={r.product?.id ?? ""}
                  className="h-10 flex-1 rounded-xl border border-border bg-card px-3 text-sm"
                >
                  <option value="">No product link</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} ({p.slug})
                    </option>
                  ))}
                </select>
                <Button type="submit" variant="secondary">
                  Save
                </Button>
              </form>
              {r.product === null ? (
                <div className="text-xs text-mutedForeground">
                  If “Save” errors, run `npm run db:migrate` to enable reel→product linking.
                </div>
              ) : null}
              {r.product ? (
                <div className="text-xs text-mutedForeground">
                  Currently:{" "}
                  <span className="font-medium text-foreground">
                    {r.product.title}
                  </span>
                </div>
              ) : null}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <form action={toggleReelPublish}>
                <input type="hidden" name="id" value={r.id} />
                <input
                  type="hidden"
                  name="next"
                  value={r.isPublished ? "false" : "true"}
                />
                <Button type="submit" variant="secondary">
                  {r.isPublished ? "Unpublish" : "Publish"}
                </Button>
              </form>
              <form action={deleteReel}>
                <input type="hidden" name="id" value={r.id} />
                <Button type="submit" variant="ghost">
                  Delete
                </Button>
              </form>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
