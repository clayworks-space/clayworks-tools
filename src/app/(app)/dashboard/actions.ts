"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateMyDetails(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const full_name = String(formData.get("full_name") || "").trim();
  const job_title = String(formData.get("job_title") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const linkedin_url = String(formData.get("linkedin_url") || "").trim();
  const address = String(formData.get("address") || "").trim();

  if (!full_name) throw new Error("Name is required");

  const { error } = await supabase
    .from("profiles")
    .update({ full_name, job_title, phone, linkedin_url, address })
    .eq("id", user.id);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard");
}
