import { CloudinaryUploadField } from "@/components/admin/cloudinary-upload-field";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { db } from "@/lib/prisma";

import {
  createAnnouncement,
  deleteAnnouncement,
  deleteHomeBanner,
  updateHomeSettings,
  setSponsored,
  setSponsoredSort,
  toggleAnnouncement,
  upsertHomeBanner
} from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminHomePage({
  searchParams
}: {
  searchParams?: { editBanner?: string };
}) {
  if (!process.env.DATABASE_URL) {
    return (
      <Card className="p-6">
        <div className="text-sm font-medium">Database not configured</div>
        <div className="mt-1 text-sm text-mutedForeground">
          Set `DATABASE_URL` and run Prisma migrations.
        </div>
      </Card>
    );
  }

  const prisma = db();
  let announcements: any[] = [];
  let banners: any[] = [];
  let products: any[] = [];
  let heroRotateMs = 7000;

  try {
    announcements = await prisma.announcement.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      take: 20
    });
  } catch {
    announcements = [];
  }

  try {
    banners = await prisma.homeBanner.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      take: 10,
      select: {
        id: true,
        title: true,
        subtitle: true,
        imageUrl: true,
        videoUrl: true,
        videoPosterUrl: true,
        ctaText: true,
        ctaHref: true,
        isActive: true,
        sortOrder: true,
        createdAt: true
      }
    });
  } catch {
    // DB not migrated yet (table/columns missing). Fall back gracefully.
    try {
      banners = await prisma.homeBanner.findMany({
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
        take: 10,
        select: {
          id: true,
          title: true,
          subtitle: true,
          imageUrl: true,
          ctaText: true,
          ctaHref: true,
          isActive: true,
          sortOrder: true,
          createdAt: true
        }
      });
      banners = banners.map((b: any) => ({
        ...b,
        videoUrl: null,
        videoPosterUrl: null
      }));
    } catch {
      banners = [];
    }
  }

  try {
    products = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: [
        { isSponsored: "desc" },
        { sponsoredSortOrder: "asc" },
        { createdAt: "desc" }
      ],
      select: {
        id: true,
        title: true,
        slug: true,
        isSponsored: true,
        sponsoredSortOrder: true
      }
    });
  } catch {
    products = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: [{ createdAt: "desc" }],
      select: { id: true, title: true, slug: true }
    });
    products = products.map((p: any) => ({
      ...p,
      isSponsored: false,
      sponsoredSortOrder: 0
    }));
  }

  try {
    const s = await (prisma as any).homeSettings?.findUnique?.({
      where: { id: "singleton" },
      select: { heroRotateMs: true }
    });
    if (s?.heroRotateMs) heroRotateMs = s.heroRotateMs;
  } catch {
    heroRotateMs = 7000;
  }

  const editId = searchParams?.editBanner ?? "";
  const editing = editId ? banners.find((b) => b.id === editId) : null;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Home</h1>
        <p className="mt-1 text-sm text-mutedForeground">
          Configure the announcement bar, banner, and sponsored suits on the landing page.
        </p>
      </div>

      <Card className="p-6">
        <div className="text-sm font-semibold">Hero rotation</div>
        <p className="mt-1 text-sm text-mutedForeground">
          Set how often the banner changes (in milliseconds). Applies to all visitors.
        </p>
        <form action={updateHomeSettings} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor="heroRotateMs">
              Rotate every (ms)
            </label>
            <Input
              id="heroRotateMs"
              name="heroRotateMs"
              type="number"
              min={2500}
              max={60000}
              defaultValue={heroRotateMs}
              className="w-48"
            />
          </div>
          <Button type="submit">Save rotation</Button>
        </form>
      </Card>

      <Card className="p-6">
        <div className="text-sm font-semibold">Announcement bar (marquee)</div>
        <p className="mt-1 text-sm text-mutedForeground">
          Add up to 6 active messages; they’ll scroll right-to-left on the storefront.
        </p>

        <form action={createAnnouncement} className="mt-4 grid gap-3 md:grid-cols-[1fr_140px_auto] md:items-end">
          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor="message">
              Message
            </label>
            <Input id="message" name="message" placeholder="Buy 4 and get 20% off" required />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor="sortOrder">
              Order
            </label>
            <Input id="sortOrder" name="sortOrder" type="number" min={0} defaultValue={0} />
          </div>
          <label className="flex items-center gap-2 text-sm md:pb-2">
            <input type="checkbox" name="isActive" defaultChecked />
            Active
          </label>
          <div className="md:col-span-3">
            <Button type="submit">Add message</Button>
          </div>
        </form>

        <div className="mt-5 space-y-2">
          {announcements.length === 0 ? (
            <div className="text-sm text-mutedForeground">No messages yet.</div>
          ) : (
            announcements.map((a) => (
              <div key={a.id} className="flex flex-col gap-2 rounded-xl border border-border p-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-sm font-medium">{a.message}</div>
                  <div className="mt-1 text-xs text-mutedForeground">Order: {a.sortOrder} · {a.isActive ? "Active" : "Inactive"}</div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <form action={toggleAnnouncement}>
                    <input type="hidden" name="id" value={a.id} />
                    <input type="hidden" name="next" value={a.isActive ? "false" : "true"} />
                    <Button type="submit" variant="secondary">
                      {a.isActive ? "Disable" : "Enable"}
                    </Button>
                  </form>
                  <form action={deleteAnnouncement}>
                    <input type="hidden" name="id" value={a.id} />
                    <Button type="submit" variant="ghost">
                      Delete
                    </Button>
                  </form>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      <Card className="p-6">
        <div className="text-sm font-semibold">Banner</div>
        <p className="mt-1 text-sm text-mutedForeground">
          Add multiple banners (image or video). The storefront uses the first active banner by sort order.
        </p>
        {banners.length && banners[0].videoUrl === null ? (
          <div className="mt-3 rounded-2xl border border-border bg-muted px-4 py-3 text-sm">
            Video banners are not enabled in your DB yet. Run `npx prisma migrate deploy` to add the `videoUrl` columns.
          </div>
        ) : null}

        <form action={upsertHomeBanner} className="mt-4 grid gap-4">
          <input type="hidden" name="id" value={editing?.id ?? ""} />
          <CloudinaryUploadField
            name="imageUrl"
            folder="ethnic-world-exclusive/home"
            resourceType="image"
            label="Banner image (optional)"
            initialUrl={editing?.imageUrl ?? undefined}
          />
          <CloudinaryUploadField
            name="videoUrl"
            folder="ethnic-world-exclusive/home"
            resourceType="video"
            label="Banner video (optional)"
            initialUrl={editing?.videoUrl ?? undefined}
          />
          <CloudinaryUploadField
            name="videoPosterUrl"
            folder="ethnic-world-exclusive/home"
            resourceType="image"
            label="Video poster (optional)"
            initialUrl={editing?.videoPosterUrl ?? undefined}
          />
          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor="title">
              Title
            </label>
            <Input
              id="title"
              name="title"
              defaultValue={editing?.title ?? "New arrivals in Jammu"}
              required
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor="subtitle">
              Subtitle
            </label>
            <Input id="subtitle" name="subtitle" defaultValue={editing?.subtitle ?? "Premium suits with COD"} />
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="ctaText">
                CTA text
              </label>
              <Input id="ctaText" name="ctaText" defaultValue={editing?.ctaText ?? "Shop suits"} required />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="ctaHref">
                CTA link
              </label>
              <Input id="ctaHref" name="ctaHref" defaultValue={editing?.ctaHref ?? "/products"} required />
            </div>
          </div>
          <div className="grid gap-2 md:grid-cols-[140px_auto] md:items-end">
            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="bannerSortOrder">
                Order
              </label>
              <Input id="bannerSortOrder" name="sortOrder" type="number" min={0} defaultValue={editing?.sortOrder ?? 0} />
            </div>
            <label className="flex items-center gap-2 text-sm md:pb-2">
              <input type="checkbox" name="isActive" defaultChecked={editing?.isActive ?? true} />
              Active
            </label>
          </div>
          <Button type="submit">{editing ? "Update banner" : "Create banner"}</Button>
        </form>

        <div className="mt-5 space-y-2">
          {banners.length === 0 ? (
            <div className="text-sm text-mutedForeground">No banners yet.</div>
          ) : (
            banners.map((b) => (
              <div
                key={b.id}
                className="flex flex-col gap-2 rounded-xl border border-border p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="text-sm font-medium">{b.title}</div>
                  <div className="mt-1 text-xs text-mutedForeground">
                    {b.isActive ? "Active" : "Inactive"} · Order {b.sortOrder} ·{" "}
                    {b.videoUrl ? "Video" : "Image"}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <a
                    className="inline-flex h-10 items-center rounded-xl border border-border bg-card px-3 text-sm hover:bg-muted"
                    href={`/admin/home?editBanner=${b.id}`}
                  >
                    Edit
                  </a>
                  <form action={deleteHomeBanner}>
                    <input type="hidden" name="id" value={b.id} />
                    <Button type="submit" variant="ghost">
                      Delete
                    </Button>
                  </form>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      <Card className="p-6">
        <div className="text-sm font-semibold">Sponsored suits</div>
        <p className="mt-1 text-sm text-mutedForeground">
          These appear on the bottom of the landing page.
        </p>
        <div className="mt-4 space-y-2">
          {products.map((p) => (
            <div key={p.id} className="flex flex-col gap-3 rounded-xl border border-border p-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-sm font-medium">{p.title}</div>
                <div className="mt-1 text-xs text-mutedForeground">
                  {p.slug} · {p.isSponsored ? "Sponsored" : "Not sponsored"} · Order {p.sponsoredSortOrder}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <form action={setSponsored} className="flex items-center gap-2">
                  <input type="hidden" name="productId" value={p.id} />
                  <input type="hidden" name="next" value={p.isSponsored ? "false" : "true"} />
                  <Button type="submit" variant="secondary">
                    {p.isSponsored ? "Remove" : "Sponsor"}
                  </Button>
                </form>
                <form action={setSponsoredSort} className="flex items-center gap-2">
                  <input type="hidden" name="productId" value={p.id} />
                  <Input
                    name="sponsoredSortOrder"
                    type="number"
                    min={0}
                    defaultValue={p.sponsoredSortOrder}
                    className="h-10 w-24"
                  />
                  <Button type="submit">Save</Button>
                </form>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
