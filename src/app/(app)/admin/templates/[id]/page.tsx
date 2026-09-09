import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAppSettings } from "@/lib/settings";
import { TemplateEditor } from "@/components/admin/TemplateEditor";

export default async function EditTemplatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: template }, settings] = await Promise.all([
    supabase.from("signature_templates").select("*").eq("id", id).single(),
    getAppSettings(),
  ]);

  if (!template) notFound();

  return (
    <div>
      <Link href="/admin/templates" className="text-sm text-muted hover:text-foreground">
        ← All templates
      </Link>
      <h1 className="text-xl font-semibold mt-2 mb-1">Edit template</h1>
      <p className="text-sm text-muted mb-8">
        Use <code className="bg-brand-light px-1 rounded">{"{{full_name}}"}</code>,{" "}
        <code className="bg-brand-light px-1 rounded">{"{{job_title}}"}</code>,{" "}
        <code className="bg-brand-light px-1 rounded">{"{{phone}}"}</code>,{" "}
        <code className="bg-brand-light px-1 rounded">{"{{email}}"}</code>,{" "}
        <code className="bg-brand-light px-1 rounded">{"{{linkedin_url}}"}</code>,{" "}
        <code className="bg-brand-light px-1 rounded">{"{{address}}"}</code>,{" "}
        <code className="bg-brand-light px-1 rounded">{"{{logo_url}}"}</code>, and{" "}
        <code className="bg-brand-light px-1 rounded">{"{{banner_url}}"}</code> as placeholders —
        the last two come from <span className="font-medium">Admin → Branding</span>, everything
        else from the employee&rsquo;s own details.
      </p>
      <TemplateEditor template={template} logoUrl={settings.logo_url} bannerUrl={settings.banner_url} />
    </div>
  );
}
