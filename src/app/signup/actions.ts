"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const ALLOWED_DOMAIN = "clayworks.in";

export async function signUp(
  _prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData
) {
  const full_name = String(formData.get("full_name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const confirmPassword = String(formData.get("confirm_password") || "");

  if (!full_name || !email || !password) {
    return { error: "Fill in your name, work email, and a password." };
  }

  if (!email.endsWith(`@${ALLOWED_DOMAIN}`)) {
    return { error: `Sign-up is only open to @${ALLOWED_DOMAIN} email addresses.` };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  if (password !== confirmPassword) {
    return { error: "Passwords don't match." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name } },
  });

  if (error) {
    return { error: error.message || "Couldn't create your account. Try again." };
  }

  if (data.session) {
    // Email confirmation is off for this project — the account is active
    // immediately, so just sign them straight in.
    redirect("/dashboard");
  }

  // Email confirmation is required — no session yet. Show a "check your
  // inbox" message instead of redirecting.
  return { success: true };
}
