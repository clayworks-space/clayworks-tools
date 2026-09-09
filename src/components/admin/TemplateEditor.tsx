"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { SignatureTemplate } from "@/lib/database.types";
import { renderSignature } from "@/lib/signature";
import { deleteTemplate, setActiveTemplate, updateTemplate } from "@/app/(app)/admin/templates/actions";

const SAMPLE_PROFILE = {
  full_name: "Jane Doe",
  job_title: "Assistant Manager, Sales",
  phone: "+91 90000 00000",
  email: "jane.doe@clayworks.in",
  linkedin_url: "https://linkedin.com/in/jane-doe",
  address_line1: "3rd Floor, Site No. 74, Mass Complex, 15th Cross Rd",
  address_line2: "J. P. Nagar, Bengaluru, Karnataka 560078",
};

export function TemplateEditor({
  template,
  logoUrl,
  bannerUrl,
}: {
  template: SignatureTemplate;
  logoUrl?: string | null;
  bannerUrl?: string | null;
}) {
  const router = useRouter();
  const [name, setName] = useState(template.name);
  const [html, setHtml] = useState(template.html);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  const preview = useMemo(
    () => renderSignature(html, { ...SAMPLE_PROFILE, logo_url: logoUrl, banner_url: bannerUrl }),
    [html, logoUrl, bannerUrl]
  );

  function handleSave() {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      try {
        await updateTemplate(template.id, { name, html });
        setSaved(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Couldn't save the template.");
      }
    });
  }

  function handleActivate() {
    startTransition(async () => {
      try {
        await updateTemplate(template.id, { name, html });
        await setActiveTemplate(template.id);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Couldn't activate the template.");
      }
    });
  }

  function handleDelete() {
    if (!confirm(`Delete "${template.name}"? This can't be undone.`)) return;
    startTransition(async () => {
      try {
        await deleteTemplate(template.id);
        router.push("/admin/templates");
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

      <label className="block mb-4 max-w-sm">
        <span className="block text-xs font-medium text-foreground/70 mb-1">Template name</span>
        <input value={name} onChange={(e) => setName(e.target.value)} className="input" />
      </label>

      <div className="grid lg:grid-cols-2 gap-6">
        <label className="block">
          <span className="block text-xs font-medium text-foreground/70 mb-1">
            HTML {template.is_active && <span className="text-brand">(currently active)</span>}
          </span>
          <textarea
            value={html}
            onChange={(e) => setHtml(e.target.value)}
            rows={20}
            spellCheck={false}
            className="input font-mono text-xs leading-relaxed"
          />
        </label>

        <div>
          <p className="text-xs font-medium text-foreground/70 mb-1">Preview (sample data)</p>
          <div className="rounded-lg border border-border bg-white p-4 min-h-[200px]">
            <div dangerouslySetInnerHTML={{ __html: preview }} />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 mt-6">
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="rounded-lg bg-brand text-white text-sm font-medium px-4 py-2 hover:bg-brand-dark transition-colors disabled:opacity-60"
        >
          {isPending ? "Saving…" : "Save"}
        </button>
        {!template.is_active && (
          <button
            type="button"
            onClick={handleActivate}
            disabled={isPending}
            className="rounded-lg border border-border text-sm font-medium px-4 py-2 hover:bg-brand-light transition-colors disabled:opacity-60"
          >
            Save &amp; set active
          </button>
        )}
        {saved && <span className="text-xs text-green-700">Saved ✓</span>}
        <button
          type="button"
          onClick={handleDelete}
          disabled={isPending}
          className="ml-auto text-sm text-red-600 hover:underline disabled:opacity-60"
        >
          Delete template
        </button>
      </div>
    </div>
  );
}
