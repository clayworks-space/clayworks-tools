"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { SignatureTemplate } from "@/lib/database.types";
import { createTemplate, deleteTemplate, setActiveTemplate } from "@/app/(app)/admin/templates/actions";

export function TemplateList({ templates }: { templates: SignatureTemplate[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleCreate() {
    setError(null);
    startTransition(async () => {
      try {
        const id = await createTemplate(name.trim() || "Untitled template");
        router.push(`/admin/templates/${id}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Couldn't create the template.");
      }
    });
  }

  function handleActivate(id: string) {
    setError(null);
    startTransition(async () => {
      try {
        await setActiveTemplate(id);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Couldn't activate the template.");
      }
    });
  }

  function handleDelete(id: string, tplName: string) {
    if (!confirm(`Delete "${tplName}"? This can't be undone.`)) return;
    setError(null);
    startTransition(async () => {
      try {
        await deleteTemplate(id);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Couldn't delete the template.");
      }
    });
  }

  return (
    <div>
      {error && (
        <p className="mb-6 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-3 mb-6">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New template name"
          className="input max-w-xs"
        />
        <button
          type="button"
          onClick={handleCreate}
          disabled={isPending}
          className="rounded-lg bg-brand text-white text-sm font-medium px-4 py-2 hover:bg-brand-dark transition-colors disabled:opacity-60"
        >
          + New template
        </button>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {templates.map((t) => (
          <div key={t.id} className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-start justify-between gap-2 mb-3">
              <p className="font-medium">{t.name}</p>
              {t.is_active && (
                <span className="text-xs rounded-full bg-brand text-white px-2 py-0.5 shrink-0">
                  Active
                </span>
              )}
            </div>
            <div
              className="rounded-lg border border-border bg-white p-3 mb-4 text-xs overflow-hidden max-h-24"
              dangerouslySetInnerHTML={{ __html: t.html }}
            />
            <div className="flex flex-wrap gap-3 text-sm">
              <a href={`/admin/templates/${t.id}`} className="text-brand hover:underline">
                Edit
              </a>
              {!t.is_active && (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleActivate(t.id)}
                  className="text-foreground/70 hover:underline disabled:opacity-60"
                >
                  Set active
                </button>
              )}
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleDelete(t.id, t.name)}
                className="text-red-600 hover:underline disabled:opacity-60"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {templates.length === 0 && (
          <p className="text-muted text-sm">No templates yet — create one above.</p>
        )}
      </div>
    </div>
  );
}
