"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signUp } from "@/app/signup/actions";
import { PasswordInput } from "@/components/PasswordInput";

export function SignupForm() {
  const [state, formAction, pending] = useActionState(signUp, undefined);

  if (state?.success) {
    return (
      <div className="text-center space-y-3">
        <p className="text-sm text-foreground">
          Account created — check your inbox for a confirmation email, then come back and sign in.
        </p>
        <Link href="/login" className="inline-block text-sm text-brand hover:underline">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="full_name" className="block text-sm font-medium text-foreground/80 mb-1">
          Full name
        </label>
        <input
          id="full_name"
          name="full_name"
          type="text"
          required
          autoComplete="name"
          placeholder="Jane Doe"
          className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-foreground/80 mb-1">
          Work email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="username"
          placeholder="you@clayworks.in"
          className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand"
        />
        <p className="text-xs text-muted mt-1">Only @clayworks.in email addresses can sign up.</p>
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-foreground/80 mb-1">
          Password
        </label>
        <PasswordInput id="password" name="password" required minLength={8} autoComplete="new-password" />
      </div>

      <div>
        <label htmlFor="confirm_password" className="block text-sm font-medium text-foreground/80 mb-1">
          Confirm password
        </label>
        <PasswordInput id="confirm_password" name="confirm_password" required minLength={8} autoComplete="new-password" />
      </div>

      {state?.error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-brand text-white font-medium py-2 text-sm hover:bg-brand-dark transition-colors disabled:opacity-60"
      >
        {pending ? "Creating account…" : "Create account"}
      </button>

      <p className="text-xs text-muted text-center">
        Already have an account?{" "}
        <Link href="/login" className="text-brand hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
