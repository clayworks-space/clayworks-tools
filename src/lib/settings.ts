import { createClient } from "@/lib/supabase/server";
import type { AppSettings } from "@/lib/database.types";

/**
 * Org-wide branding (logo + promotional banner) shown in every employee's
 * signature. Falls back to an empty object if the row hasn't been created
 * yet (shouldn't happen once 0002_branding.sql has run, but keeps the
 * dashboard from crashing if it hasn't).
 */
export async function getAppSettings(): Promise<Pick<AppSettings, "logo_url" | "banner_url">> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("app_settings")
    .select("logo_url, banner_url")
    .eq("id", 1)
    .maybeSingle();

  return { logo_url: data?.logo_url ?? null, banner_url: data?.banner_url ?? null };
}
