import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/database.types";

/**
 * The signed-in user's auth identity plus their `profiles` row. Returns
 * `null` if nobody is signed in (proxy.ts should already have redirected
 * to /login before this is called, but callers should still handle null).
 */
export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return profile ?? null;
}
