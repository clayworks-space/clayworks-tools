import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/profile";
import { signOut } from "@/app/login/actions";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  return (
    <div className="flex-1 flex flex-col">
      <header className="border-b border-border bg-card">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/clayworks-logo.webp" alt="Clayworks" width={32} height={32} className="rounded-md" />
            <span className="text-lg font-bold text-brand tracking-wide">Tools</span>
          </Link>

          <nav className="flex items-center gap-1 text-sm">
            <Link
              href="/dashboard"
              className="px-3 py-1.5 rounded-md hover:bg-brand-light transition-colors"
            >
              Signature
            </Link>
            {profile.role === "admin" && (
              <Link
                href="/admin"
                className="px-3 py-1.5 rounded-md hover:bg-brand-light transition-colors"
              >
                Admin
              </Link>
            )}
            <span className="mx-2 h-4 w-px bg-border hidden sm:inline-block" />
            <span className="text-muted hidden sm:inline text-xs">{profile.email}</span>
            <form action={signOut}>
              <button
                type="submit"
                className="px-3 py-1.5 rounded-md text-muted hover:bg-brand-light hover:text-foreground transition-colors"
              >
                Sign out
              </button>
            </form>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8">{children}</main>
    </div>
  );
}
