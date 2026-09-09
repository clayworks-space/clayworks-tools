import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/profile";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "admin") redirect("/dashboard");

  return (
    <div>
      <div className="flex items-center gap-1 mb-8 text-sm border-b border-border">
        <Link href="/admin" className="px-3 py-2 -mb-px border-b-2 border-transparent hover:border-brand">
          Overview
        </Link>
        <Link
          href="/admin/users"
          className="px-3 py-2 -mb-px border-b-2 border-transparent hover:border-brand"
        >
          Users
        </Link>
        <Link
          href="/admin/templates"
          className="px-3 py-2 -mb-px border-b-2 border-transparent hover:border-brand"
        >
          Templates
        </Link>
        <Link
          href="/admin/branding"
          className="px-3 py-2 -mb-px border-b-2 border-transparent hover:border-brand"
        >
          Branding
        </Link>
      </div>
      {children}
    </div>
  );
}
