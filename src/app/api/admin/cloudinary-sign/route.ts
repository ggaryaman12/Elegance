import crypto from "crypto";
import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdmin } from "@/lib/session";

const bodySchema = z.object({
  folder: z.string().min(1).max(200),
  resourceType: z.enum(["image", "video"])
});

function signCloudinary(params: Record<string, string>, apiSecret: string) {
  const toSign = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&");
  return crypto.createHash("sha1").update(toSign + apiSecret).digest("hex");
}

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME ?? "";
  const apiKey = process.env.CLOUDINARY_API_KEY ?? "";
  const apiSecret = process.env.CLOUDINARY_API_SECRET ?? "";
  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json(
      { error: "Cloudinary is not configured" },
      { status: 500 }
    );
  }

  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const timestamp = String(Math.floor(Date.now() / 1000));
  const paramsToSign = { folder: parsed.data.folder, timestamp };
  const signature = signCloudinary(paramsToSign, apiSecret);

  return NextResponse.json({
    cloudName,
    apiKey,
    signature,
    timestamp,
    folder: parsed.data.folder,
    resourceType: parsed.data.resourceType
  });
}

