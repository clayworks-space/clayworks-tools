import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

/**
 * Service-role Supabase client. NEVER import this from a Client Component —
 * the "server-only" import will fail the build if you try. Used exclusively
 * inside admin API routes (after verifying the caller is an admin) to create
 * users, delete users, and reset passwords via the Supabase Auth Admin API.
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
