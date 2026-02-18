"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type ResourceType = "image" | "video";

export function CloudinaryUploadField({
  name,
  folder,
  resourceType,
  label,
  initialUrl
}: {
  name: string;
  folder: string;
  resourceType: ResourceType;
  label: string;
  initialUrl?: string;
}) {
  const [url, setUrl] = React.useState<string>(initialUrl ?? "");
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    if (initialUrl) setUrl(initialUrl);
  }, [initialUrl]);

  async function upload(file: File) {
    setPending(true);
    setError(null);
    try {
      const signRes = await fetch("/api/admin/cloudinary-sign", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ folder, resourceType })
      });
      const signed = (await signRes.json()) as {
        cloudName?: string;
        apiKey?: string;
        signature?: string;
        timestamp?: string;
        folder?: string;
        resourceType?: ResourceType;
        error?: string;
      };
      if (!signRes.ok) throw new Error(signed.error || "Failed to sign upload");

      const form = new FormData();
      form.append("file", file);
      form.append("api_key", signed.apiKey!);
      form.append("timestamp", signed.timestamp!);
      form.append("signature", signed.signature!);
      form.append("folder", signed.folder!);

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${signed.cloudName}/${resourceType}/upload`,
        { method: "POST", body: form }
      );
      const uploaded = (await uploadRes.json()) as { secure_url?: string; error?: { message?: string } };
      if (!uploadRes.ok) throw new Error(uploaded.error?.message || "Upload failed");

      setUrl(uploaded.secure_url ?? "");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
      setUrl("");
    } finally {
      setPending(false);
    }
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-medium">{label}</div>
        <input
          ref={inputRef}
          type="file"
          accept={resourceType === "image" ? "image/*" : "video/*"}
          className="hidden"
          disabled={pending}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void upload(file);
          }}
        />
        <Button
          type="button"
          variant="secondary"
          disabled={pending}
          onClick={() => inputRef.current?.click()}
        >
          {pending ? "Uploading..." : "Upload"}
        </Button>
      </div>

      <input type="hidden" name={name} value={url} />

      {error ? (
        <div className="mt-3 rounded-xl border border-border bg-muted px-3 py-2 text-sm">
          {error}
        </div>
      ) : null}

      {url ? (
        <div className="mt-3 overflow-hidden rounded-xl border border-border bg-background">
          {resourceType === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt="Uploaded" className="h-48 w-full object-cover" />
          ) : (
            <video src={url} className="h-60 w-full object-cover" controls />
          )}
          <div className="border-t border-border px-3 py-2 text-xs text-mutedForeground">
            Uploaded
          </div>
        </div>
      ) : (
        <div className="mt-3 text-xs text-mutedForeground">
          {resourceType === "image"
            ? "Recommended: 1200×900 or higher."
            : "Recommended: 9:16 vertical, short and crisp."}
        </div>
      )}
    </Card>
  );
}
