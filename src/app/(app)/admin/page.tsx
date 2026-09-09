import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AdminOverviewPage() {
  const supabase = await createClient();

  const [{ count: userCount }, { count: templateCount }, { count: activeCount }] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("signature_templates").select("*", { count: "exact", head: true }),
    supabase
      .from("signature_templates")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true),
  ]);

  return (
    <div>
      <h1 className="text-xl font-semibold mb-1">Admin</h1>
      <p className="text-sm text-muted mb-8">
        Manage who can access Clayworks Tools and what their signatures look like.
      </p>

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <Stat label="Users" value={userCount ?? 0} />
        <Stat label="Templates" value={templateCount ?? 0} />
        <Stat label="Active template" value={activeCount ?? 0} />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Link
          href="/admin/users"
          className="block rounded-2xl border border-border bg-card p-5 hover:border-brand transition-colors"
        >
          <p className="font-medium mb-1">Manage users</p>
          <p className="text-sm text-muted">Add employees, reset passwords, remove access.</p>
        </Link>
        <Link
          href="/admin/templates"
          className="block rounded-2xl border border-border bg-card p-5 hover:border-brand transition-colors"
        >
          <p className="font-medium mb-1">Manage templates</p>
          <p className="text-sm text-muted">Design signature layouts and set the active one.</p>
        </Link>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="text-2xl font-semibold text-brand">{value}</p>
      <p className="text-sm text-muted">{label}</p>
    </div>
  );
}
