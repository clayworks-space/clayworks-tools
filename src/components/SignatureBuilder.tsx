"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import type { Profile } from "@/lib/database.types";
import { renderSignature } from "@/lib/signature";
import { updateMyDetails } from "@/app/(app)/dashboard/actions";

type FormValues = {
  full_name: string;
  job_title: string;
  phone: string;
  linkedin_url: string;
  address_line1: string;
  address_line2: string;
};

export function SignatureBuilder({
  profile,
  templateHtml,
  logoUrl,
  bannerUrl,
}: {
  profile: Profile;
  templateHtml: string;
  logoUrl?: string | null;
  bannerUrl?: string | null;
}) {
  const [values, setValues] = useState<FormValues>({
    full_name: profile.full_name || "",
    job_title: profile.job_title || "",
    phone: profile.phone || "",
    linkedin_url: profile.linkedin_url || "",
    address_line1: profile.address_line1 || "",
    address_line2: profile.address_line2 || "",
  });
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const previewRef = useRef<HTMLDivElement>(null);

  const renderedHtml = useMemo(
    () =>
      renderSignature(templateHtml, {
        ...values,
        email: profile.email,
        logo_url: logoUrl,
        banner_url: bannerUrl,
      }),
    [templateHtml, values, profile.email, logoUrl, bannerUrl]
  );

  function update<K extends keyof FormValues>(key: K, value: string) {
    setValues((v) => ({ ...v, [key]: value }));
    setSaved(false);
  }

  function handleSave() {
    const fd = new FormData();
    Object.entries(values).forEach(([k, v]) => fd.set(k, v));
    setSaveError(null);
    startTransition(async () => {
      try {
        await updateMyDetails(fd);
        setSaved(true);
      } catch (err) {
        setSaveError(err instanceof Error ? err.message : "Couldn't save your details.");
      }
    });
  }

  function handleCopy() {
    const node = previewRef.current;
    if (!node) return;

    const range = document.createRange();
    range.selectNodeContents(node);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);

    try {
      document.execCommand("copy");
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fall back to the async Clipboard API with an HTML blob.
      const blob = new Blob([renderedHtml], { type: "text/html" });
      const item = new ClipboardItem({ "text/html": blob });
      navigator.clipboard
        .write([item])
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2500);
        })
        .catch(() => {
          alert("Couldn't copy automatically — select the signature preview and press Ctrl/Cmd+C.");
        });
    } finally {
      selection?.removeAllRanges();
    }
  }

  function handleDownload() {
    const doc = `<!doctype html><html><head><meta charset="utf-8"></head><body>${renderedHtml}</body></html>`;
    const blob = new Blob([doc], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(values.full_name || "clayworks-signature").replace(/\s+/g, "-").toLowerCase()}-signature.htm`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div>
        <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <Field label="Full name" required>
            <input
              value={values.full_name}
              onChange={(e) => update("full_name", e.target.value)}
              className="input"
              placeholder="Jane Doe"
            />
          </Field>
          <Field label="Job title">
            <input
              value={values.job_title}
              onChange={(e) => update("job_title", e.target.value)}
              className="input"
              placeholder="Assistant Manager, Sales"
            />
          </Field>
          <Field label="Phone">
            <input
              value={values.phone}
              onChange={(e) => update("phone", e.target.value)}
              className="input"
              placeholder="+91 90000 00000"
            />
          </Field>
          <Field label="LinkedIn profile URL">
            <input
              value={values.linkedin_url}
              onChange={(e) => update("linkedin_url", e.target.value)}
              className="input"
              placeholder="https://linkedin.com/in/jane-doe"
            />
          </Field>
          <Field label="Email">
            <input value={profile.email} disabled className="input opacity-60 cursor-not-allowed" />
          </Field>
          <Field label="Office address — line 1">
            <input
              value={values.address_line1}
              onChange={(e) => update("address_line1", e.target.value)}
              className="input"
              placeholder="3rd Floor, Site No. 74, Mass Complex, 15th Cross Rd"
            />
          </Field>
          <Field label="Office address — line 2">
            <input
              value={values.address_line2}
              onChange={(e) => update("address_line2", e.target.value)}
              className="input"
              placeholder="J. P. Nagar, Bengaluru, Karnataka 560078"
            />
          </Field>

          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={handleSave}
              disabled={isPending}
              className="text-sm rounded-lg border border-border px-3 py-1.5 hover:bg-brand-light transition-colors disabled:opacity-60"
            >
              {isPending ? "Saving…" : "Save my details"}
            </button>
            {saved && <span className="text-xs text-green-700">Saved ✓</span>}
            {saveError && <span className="text-xs text-red-600">{saveError}</span>}
          </div>
        </div>
      </div>

      <div>
        <p className="text-sm font-medium mb-2">Preview</p>
        <div className="bg-white border border-border rounded-2xl p-5 min-h-[140px]">
          <div ref={previewRef} dangerouslySetInnerHTML={{ __html: renderedHtml }} />
        </div>

        <div className="flex flex-wrap gap-3 mt-4">
          <button
            type="button"
            onClick={handleCopy}
            className="rounded-lg bg-brand text-white text-sm font-medium px-4 py-2 hover:bg-brand-dark transition-colors"
          >
            {copied ? "Copied ✓" : "Copy signature"}
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="rounded-lg border border-border text-sm font-medium px-4 py-2 hover:bg-brand-light transition-colors"
          >
            Download .htm
          </button>
        </div>

        <HowTo />
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-foreground/70 mb-1">
        {label}
        {required && <span className="text-brand"> *</span>}
      </span>
      {children}
    </label>
  );
}

function HowTo() {
  return (
    <details className="mt-6 text-sm text-muted">
      <summary className="cursor-pointer font-medium text-foreground/80">
        How do I add this to Outlook?
      </summary>
      <ol className="list-decimal list-inside mt-2 space-y-1.5">
        <li>Click <span className="font-medium text-foreground">Copy signature</span> above.</li>
        <li>
          In Outlook, go to <span className="font-medium text-foreground">File → Options → Mail → Signatures</span>{" "}
          (or, in new Outlook / Outlook on the web: <span className="font-medium text-foreground">Settings → Mail → Compose and reply</span>).
        </li>
        <li>Create a new signature, click inside the editor box, and paste (Ctrl/Cmd+V).</li>
        <li>Set it as your default signature for new messages and replies, then save.</li>
      </ol>
      <p className="mt-2">
        If paste strips the formatting, use <span className="font-medium text-foreground">Download .htm</span>{" "}
        instead: open the downloaded file in your browser, select all (Ctrl/Cmd+A), copy, and paste it into the
        signature editor the same way.
      </p>
    </details>
  );
}
