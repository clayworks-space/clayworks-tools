import { createClient } from "@/lib/supabase/server";
import { TemplateList } from "@/components/admin/TemplateList";

export default async function AdminTemplatesPage() {
  const supabase = await createClient();
  const { data: templates } = await supabase
    .from("signature_templates")
    .select("*")
    .order("created_at", { ascending: true });

  return (
    <div>
      <h1 className="text-xl font-semibold mb-1">Signature templates</h1>
      <p className="text-sm text-muted mb-8">
        Only one template can be active at a time — that&rsquo;s the one employees see on their dashboard.
      </p>
      <TemplateList templates={templates ?? []} />
    </div>
  );
}
