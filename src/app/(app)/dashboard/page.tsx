import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/profile";
import { getAppSettings } from "@/lib/settings";
import { SignatureBuilder } from "@/components/SignatureBuilder";

export default async function DashboardPage() {
  const profile = await getCurrentProfile();
  const supabase = await createClient();

  const [{ data: template }, settings] = await Promise.all([
    supabase
      .from("signature_templates")
      .select("*")
      .eq("is_active", true)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    getAppSettings(),
  ]);

  if (!profile) return null;

  return (
    <div>
      <h1 className="text-xl font-semibold mb-1">Email signature generator</h1>
      <p className="text-sm text-muted mb-8">
        Fill in your details, then copy or download your signature and add it to Outlook.
      </p>

      {!template ? (
        <div className="rounded-lg border border-border bg-card p-6 text-sm text-muted">
          No signature template is active yet. Ask an admin to publish one from{" "}
          <span className="font-medium">Admin → Templates</span>.
        </div>
      ) : (
        <>
          {(!settings.logo_url || !settings.banner_url) && profile.role !== "admin" && (
            <div className="rounded-lg border border-border bg-card p-4 text-sm text-muted mb-6">
              The logo/banner haven&rsquo;t been set up yet — ask an admin to add them from{" "}
              <span className="font-medium">Admin → Branding</span>. You can still fill in your
              details below.
            </div>
          )}
          <SignatureBuilder
            profile={profile}
            templateHtml={template.html}
            logoUrl={settings.logo_url}
            bannerUrl={settings.banner_url}
          />
        </>
      )}
    </div>
  );
}
