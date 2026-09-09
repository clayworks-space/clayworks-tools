"use client";

import { useState, useTransition } from "react";
import type { Profile, Role } from "@/lib/database.types";
import { createUser, deleteUser, resetPassword, setRole } from "@/app/(app)/admin/users/actions";

export function UserManager({ users }: { users: Profile[] }) {
  const [credential, setCredential] = useState<{ email: string; password: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);

  function handleCreate(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        const result = await createUser(formData);
        setCredential({ email: result.email, password: result.tempPassword });
        setShowForm(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Couldn't create the user.");
      }
    });
  }

  function handleReset(userId: string, email: string) {
    setError(null);
    startTransition(async () => {
      try {
        const result = await resetPassword(userId);
        setCredential({ email, password: result.tempPassword });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Couldn't reset the password.");
      }
    });
  }

  function handleDelete(userId: string, email: string) {
    if (!confirm(`Remove ${email}? They will lose access immediately.`)) return;
    setError(null);
    startTransition(async () => {
      try {
        await deleteUser(userId);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Couldn't remove the user.");
      }
    });
  }

  function handleRoleChange(userId: string, role: Role) {
    setError(null);
    startTransition(async () => {
      try {
        await setRole(userId, role);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Couldn't update the role.");
      }
    });
  }

  return (
    <div>
      {credential && (
        <div className="mb-6 rounded-lg border border-brand bg-brand-light px-4 py-3 text-sm flex items-start justify-between gap-4">
          <div>
            <p className="font-medium">Share this temporary password with {credential.email}:</p>
            <p className="font-mono text-base mt-1 select-all">{credential.password}</p>
            <p className="text-muted mt-1">
              They should sign in and can be asked to note it down — there&rsquo;s no in-app password
              change yet, so re-use “Reset password” any time they need a new one.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setCredential(null)}
            className="text-muted hover:text-foreground"
          >
            ✕
          </button>
        </div>
      )}

      {error && (
        <p className="mb-6 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {error}
        </p>
      )}

      <div className="mb-6">
        {!showForm ? (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="rounded-lg bg-brand text-white text-sm font-medium px-4 py-2 hover:bg-brand-dark transition-colors"
          >
            + Add user
          </button>
        ) : (
          <form
            action={handleCreate}
            className="rounded-2xl border border-border bg-card p-5 grid sm:grid-cols-2 gap-4"
          >
            <label className="block">
              <span className="block text-xs font-medium text-foreground/70 mb-1">Full name *</span>
              <input name="full_name" required className="input" placeholder="Jane Doe" />
            </label>
            <label className="block">
              <span className="block text-xs font-medium text-foreground/70 mb-1">Email *</span>
              <input
                name="email"
                type="email"
                required
                className="input"
                placeholder="jane@clayworks.in"
              />
            </label>
            <label className="block">
              <span className="block text-xs font-medium text-foreground/70 mb-1">Job title</span>
              <input name="job_title" className="input" placeholder="Assistant Manager, Sales" />
            </label>
            <label className="block">
              <span className="block text-xs font-medium text-foreground/70 mb-1">Role</span>
              <select name="role" className="input" defaultValue="employee">
                <option value="employee">Employee</option>
                <option value="admin">Admin</option>
              </select>
            </label>
            <div className="sm:col-span-2 flex items-center gap-3">
              <button
                type="submit"
                disabled={isPending}
                className="rounded-lg bg-brand text-white text-sm font-medium px-4 py-2 hover:bg-brand-dark transition-colors disabled:opacity-60"
              >
                {isPending ? "Creating…" : "Create user"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-sm text-muted hover:text-foreground"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-brand-light text-foreground/70 text-left">
            <tr>
              <th className="px-4 py-2.5 font-medium">Name</th>
              <th className="px-4 py-2.5 font-medium">Email</th>
              <th className="px-4 py-2.5 font-medium">Role</th>
              <th className="px-4 py-2.5 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-border">
                <td className="px-4 py-2.5">{u.full_name || "—"}</td>
                <td className="px-4 py-2.5 text-muted">{u.email}</td>
                <td className="px-4 py-2.5">
                  <select
                    value={u.role}
                    onChange={(e) => handleRoleChange(u.id, e.target.value as Role)}
                    disabled={isPending}
                    className="border border-border rounded-md text-xs px-1.5 py-1 bg-white"
                  >
                    <option value="employee">Employee</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleReset(u.id, u.email)}
                      className="text-brand hover:underline disabled:opacity-60"
                    >
                      Reset password
                    </button>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleDelete(u.id, u.email)}
                      className="text-red-600 hover:underline disabled:opacity-60"
                    >
                      Remove
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-muted">
                  No users yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
