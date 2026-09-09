/**
 * Fields a signature template's HTML can reference as {{field_name}}
 * placeholders. Keep this in sync with the columns on `profiles`.
 */
export const PLACEHOLDER_FIELDS = [
  "full_name",
  "job_title",
  "phone",
  "email",
  "linkedin_url",
  "address_line1",
  "address_line2",
  "logo_url",
  "banner_url",
] as const;

export type PlaceholderField = (typeof PLACEHOLDER_FIELDS)[number];

/**
 * Values a template's {{field_name}} placeholders can be filled in with —
 * the employee's profile fields plus org-wide branding (logo_url,
 * banner_url from app_settings). Keys not present just render as empty.
 */
export type SignatureValues = Record<string, string | null | undefined>;

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Replace every {{field_name}} placeholder in a template's HTML with the
 * matching value. Unknown/blank fields render as an empty string rather
 * than leaving the raw placeholder visible.
 */
export function renderSignature(templateHtml: string, values: SignatureValues): string {
  return templateHtml.replace(/{{\s*([a-z_]+)\s*}}/gi, (_match, field: string) => {
    const value = values[field];
    if (!value) return "";
    // Multi-line fields (e.g. a typed-in address) should keep their line
    // breaks in the rendered HTML rather than collapsing to one line.
    return escapeHtml(String(value)).replace(/\n/g, "<br/>");
  });
}
