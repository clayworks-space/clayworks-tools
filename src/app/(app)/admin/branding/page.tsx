import { getAppSettings } from "@/lib/settings";
import { BrandingManager } from "@/components/admin/BrandingManager";

export default async function AdminBrandingPage() {
  const settings = await getAppSettings();

  return (
    <div>
      <h1 className="text-xl font-semibold mb-1">Branding</h1>
      <p className="text-sm text-muted mb-8">
        The logo and promotional banner shown in every employee&rsquo;s signature. Only admins can
        change these — employees just fill in their own details and the images below are added
        automatically.
      </p>
      <BrandingManager logoUrl={settings.logo_url} bannerUrl={settings.banner_url} />
    </div>
  );
}
