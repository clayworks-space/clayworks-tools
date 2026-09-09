import { createClient } from "@/lib/supabase/server";
import { UserManager } from "@/components/admin/UserManager";

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const { data: users } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: true });

  return (
    <div>
      <h1 className="text-xl font-semibold mb-1">Users</h1>
      <p className="text-sm text-muted mb-8">
        Add Clayworks employees, reset their passwords, or remove access.
      </p>
      <UserManager users={users ?? []} />
    </div>
  );
}
