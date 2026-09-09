"use client";

import { useRef, useState, useTransition } from "react";
import { uploadBanner, uploadLogo } from "@/app/(app)/admin/branding/actions";

export function BrandingManager({
  logoUrl,
  bannerUrl,
}: {
  logoUrl: string | null;
  bannerUrl: string | null;
}) {
  return (
    <div className="space-y-8 max-w-2xl">
      <AssetUploader
        title="Logo"
        description="Shown top-left of every signature, next to the person's name. A square image works best (e.g. 200×200px)."
        currentUrl={logoUrl}
        action={uploadLogo}
        previewClassName="h-20 w-20 object-contain"
      />
      <AssetUploader
        title="Promotional banner"
        description="Shown at the bottom of every signature. Use a wide image (e.g. 1200×300px)."
        currentUrl={bannerUrl}
        action={uploadBanner}
        previewClassName="w-full max-w-md h-auto object-contain"
      />
    </div>
  );
}

function AssetUploader({
  title,
  description,
  currentUrl,
  action,
  previewClassName,
}: {
  title: string;
  description: string;
  currentUrl: string | null;
  action: (formData: FormData) => Promise<string>;
  previewClassName: string;
}) {
  const [preview, setPreview] = useState<string | null>(currentUrl);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File | undefined) {
    setError(null);
    setSaved(false);
    if (!file) return;

    const fd = new FormData();
    fd.set("file", file);
    startTransition(async () => {
      try {
        const url = await action(fd);
        setPreview(url);
        setSaved(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Couldn't upload that image.");
      }
    });
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="font-medium">{title}</p>
      <p className="text-sm text-muted mt-0.5 mb-4">{description}</p>

      <div className="flex items-start gap-5">
        <div className="shrink-0 rounded-lg border border-dashed border-border bg-white p-3 flex items-center justify-center min-h-[88px] min-w-[88px]">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt={`${title} preview`} className={previewClassName} />
          ) : (
            <span className="text-xs text-muted text-center">No image yet</span>
          )}
        </div>

        <div>
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            onChange={(e) => handleFile(e.target.files?.[0])}
            className="hidden"
            id={`file-${title}`}
          />
          <button
            type="button"
            disabled={isPending}
            onClick={() => inputRef.current?.click()}
            className="rounded-lg bg-brand text-white text-sm font-medium px-4 py-2 hover:bg-brand-dark transition-colors disabled:opacity-60"
          >
            {isPending ? "Uploading…" : preview ? "Replace image" : "Upload image"}
          </button>
          {saved && <p className="text-xs text-green-700 mt-2">Saved ✓ — live on every signature now.</p>}
          {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
        </div>
      </div>
    </div>
  );
}
