"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/profile";

const STARTER_HTML = `<table cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,Helvetica,sans-serif;color:#2b2420;">
  <tr>
    <td style="padding-right:16px;border-right:3px solid #b97134;" valign="top">
      <span style="font-size:18px;font-weight:bold;color:#b97134;">CLAYWORKS</span>
    </td>
    <td style="padding-left:16px;" valign="top">
      <span style="font-size:14px;font-weight:bold;">{{full_name}}</span><br/>
      <span style="font-size:12px;color:#8a8074;">{{job_title}}</span><br/>
      <span style="font-size:12px;">{{phone}} | {{email}}</span>
    </td>
  </tr>
</table>`;

async function requireAdmin() {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "admin") {
    throw new Error("You don't have permission to do that.");
  }
}

export async function createTemplate(name: string) {
  await requireAdmin();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("signature_templates")
    .insert({ name: name || "Untitled template", html: STARTER_HTML, is_active: false })
    .select("id")
    .single();

  if (error || !data) throw new Error(error?.message || "Couldn't create the template.");

  revalidatePath("/admin/templates");
  return data.id as string;
}

export async function updateTemplate(id: string, fields: { name: string; html: string }) {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from("signature_templates")
    .update({ name: fields.name, html: fields.html })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/templates");
  revalidatePath(`/admin/templates/${id}`);
}

export async function setActiveTemplate(id: string) {
  await requireAdmin();
  const supabase = await createClient();

  // Only one template is active at a time — deactivate the rest first.
  const { error: deactivateError } = await supabase
    .from("signature_templates")
    .update({ is_active: false })
    .neq("id", id);
  if (deactivateError) throw new Error(deactivateError.message);

  const { error } = await supabase
    .from("signature_templates")
    .update({ is_active: true })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/templates");
  revalidatePath("/dashboard");
}

export async function deleteTemplate(id: string) {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase.from("signature_templates").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/templates");
}
