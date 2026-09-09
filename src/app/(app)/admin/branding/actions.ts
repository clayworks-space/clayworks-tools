"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/profile";

const BUCKET = "signature-assets";
const MAX_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];

async function requireAdmin() {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "admin") {
    throw new Error("You don't have permission to do that.");
  }
}

function extFor(file: File) {
  const fromType: Record<string, string> = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/webp": "webp",
    "image/svg+xml": "svg",
  };
  return fromType[file.type] ?? "png";
}

async function uploadAsset(kind: "logo" | "banner", file: File) {
  await requireAdmin();

  if (!file || file.size === 0) throw new Error("Choose an image first.");
  if (file.size > MAX_BYTES) throw new Error("That image is larger than 5MB — use a smaller file.");
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Use a PNG, JPG, WEBP, or SVG image.");
  }

  const supabase = await createClient();
  const path = `${kind}.${extFor(file)}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type, cacheControl: "3600" });

  if (uploadError) throw new Error(uploadError.message);

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(path);

  // Cache-bust so employees immediately see a replaced image instead of a
  // stale browser/Outlook-cached copy at the same URL.
  const url = `${publicUrl}?v=${Date.now()}`;

  const patch = kind === "logo" ? { logo_url: url } : { banner_url: url };
  const { error: settingsError } = await supabase.from("app_settings").update(patch).eq("id", 1);

  if (settingsError) throw new Error(settingsError.message);

  revalidatePath("/admin/branding");
  revalidatePath("/dashboard");
  return url;
}

export async function uploadLogo(formData: FormData) {
  const file = formData.get("file");
  if (!(file instanceof File)) throw new Error("Choose an image first.");
  return uploadAsset("logo", file);
}

export async function uploadBanner(formData: FormData) {
  const file = formData.get("file");
  if (!(file instanceof File)) throw new Error("Choose an image first.");
  return uploadAsset("banner", file);
}
