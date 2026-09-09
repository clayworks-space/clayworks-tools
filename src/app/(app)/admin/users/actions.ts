"use server";

import { revalidatePath } from "next/cache";
import { getCurrentProfile } from "@/lib/profile";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Role } from "@/lib/database.types";

async function requireAdmin() {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "admin") {
    throw new Error("You don't have permission to do that.");
  }
  return profile;
}

function generateTempPassword() {
  // 12 random characters from a set that's easy to read aloud/type.
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$";
  let out = "";
  for (let i = 0; i < 12; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export async function createUser(formData: FormData) {
  await requireAdmin();

  const email = String(formData.get("email") || "").trim().toLowerCase();
  const full_name = String(formData.get("full_name") || "").trim();
  const role = (String(formData.get("role") || "employee") as Role) || "employee";
  const job_title = String(formData.get("job_title") || "").trim();

  if (!email || !full_name) {
    throw new Error("Name and email are required.");
  }

  const tempPassword = generateTempPassword();
  const admin = createAdminClient();

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true,
  });

  if (createError || !created.user) {
    throw new Error(createError?.message || "Couldn't create the account.");
  }

  const { error: profileError } = await admin.from("profiles").upsert({
    id: created.user.id,
    email,
    full_name,
    job_title: job_title || null,
    role,
  });

  if (profileError) {
    // Roll back the auth user so we don't leave an orphaned account.
    await admin.auth.admin.deleteUser(created.user.id);
    throw new Error(profileError.message);
  }

  revalidatePath("/admin/users");
  return { email, tempPassword };
}

export async function resetPassword(userId: string) {
  await requireAdmin();

  const tempPassword = generateTempPassword();
  const admin = createAdminClient();

  const { error } = await admin.auth.admin.updateUserById(userId, {
    password: tempPassword,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/admin/users");
  return { tempPassword };
}

export async function deleteUser(userId: string) {
  const me = await requireAdmin();

  if (me.id === userId) {
    throw new Error("You can't delete your own account while signed in as it.");
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/users");
}

export async function setRole(userId: string, role: Role) {
  await requireAdmin();

  const admin = createAdminClient();
  const { error } = await admin.from("profiles").update({ role }).eq("id", userId);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/users");
}
