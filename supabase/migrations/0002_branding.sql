-- Clayworks Tools — Branding assets (logo + promotional banner)
--
-- Adds a singleton `app_settings` row that holds the org-wide logo and
-- banner image URLs shown in every employee's signature, a public storage
-- bucket to hold those images, and updates the default template's HTML to
-- the new reference design. Only admins can change branding; every
-- signed-in employee can read it (they need it to render their own
-- signature) and the images themselves are served from a public bucket so
-- Outlook can load them directly.

-- ---------------------------------------------------------------------------
-- app_settings
-- ---------------------------------------------------------------------------
create table public.app_settings (
  id          smallint primary key default 1,
  logo_url    text,
  banner_url  text,
  updated_at  timestamptz not null default now(),
  constraint app_settings_singleton check (id = 1)
);

alter table public.app_settings enable row level security;

-- Every signed-in employee can read the current branding (needed to render
-- their own signature preview).
create policy "app_settings: authenticated can select"
  on public.app_settings for select
  to authenticated
  using (true);

-- Only admins can create/update it. Uses the is_admin() helper from
-- 0001_init.sql (security-definer, avoids RLS recursion — see the comment
-- there).
create policy "app_settings: admin can insert"
  on public.app_settings for insert
  with check (public.is_admin());

create policy "app_settings: admin can update"
  on public.app_settings for update
  using (public.is_admin());

create trigger app_settings_set_updated_at
  before update on public.app_settings
  for each row execute function public.set_updated_at();

-- Seed the single settings row (empty — admin uploads the images from
-- Admin → Branding).
insert into public.app_settings (id) values (1);

-- ---------------------------------------------------------------------------
-- Storage bucket for the logo/banner images
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('signature-assets', 'signature-assets', true)
on conflict (id) do nothing;

-- Anyone (including Outlook loading the image, unauthenticated) can read
-- files in this bucket — that's what "public" bucket + this policy gives.
create policy "signature-assets: public can select"
  on storage.objects for select
  using (bucket_id = 'signature-assets');

-- Only admins can upload/replace/remove branding images.
create policy "signature-assets: admin can insert"
  on storage.objects for insert
  with check (bucket_id = 'signature-assets' and public.is_admin());

create policy "signature-assets: admin can update"
  on storage.objects for update
  using (bucket_id = 'signature-assets' and public.is_admin());

create policy "signature-assets: admin can delete"
  on storage.objects for delete
  using (bucket_id = 'signature-assets' and public.is_admin());

-- ---------------------------------------------------------------------------
-- Redesigned default template — matches the reference layout: logo mark,
-- name/title, LinkedIn + phone/email, static office address, and the
-- promotional banner at the bottom. {{logo_url}} and {{banner_url}} pull
-- from app_settings (wired up in the dashboard page), so this template
-- updates automatically whenever an admin replaces those images.
-- ---------------------------------------------------------------------------
update public.signature_templates
set html = '<table cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td valign="top">
      <table cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td width="86" valign="top" style="padding-right:18px;">
            <img src="{{logo_url}}" width="76" height="76" alt="Clayworks" style="display:block;border:0;" />
          </td>
          <td width="4" style="background-color:#b97134;font-size:0;line-height:0;" valign="top">&nbsp;</td>
          <td style="padding-left:20px;" valign="top">
            <table cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="font-family:Arial,Helvetica,sans-serif;font-size:24px;font-weight:bold;color:#1a1a1a;padding-bottom:2px;">{{full_name}}</td>
              </tr>
              <tr>
                <td style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#b97134;padding-bottom:14px;">{{job_title}}</td>
              </tr>
              <tr>
                <td>
                  <table cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td width="32" height="32" valign="middle" align="center" style="background-color:#0a66c2;border-radius:6px;">
                        <span style="color:#ffffff;font-size:15px;font-weight:bold;font-family:Arial,Helvetica,sans-serif;line-height:32px;">in</span>
                      </td>
                      <td style="padding-left:12px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#333333;line-height:19px;" valign="middle">
                        <a href="tel:{{phone}}" style="color:#333333;text-decoration:none;">{{phone}}</a><br/>
                        <a href="mailto:{{email}}" style="color:#333333;text-decoration:none;">{{email}}</a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding-top:16px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;color:#6b6b6b;">
                  3rd Floor, Site No. 74, Mass Complex, 15th Cross Rd,<br/>3rd Phase, J. P. Nagar, Bengaluru, Karnataka 560078
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="font-size:0;line-height:18px;">&nbsp;</td>
  </tr>
  <tr>
    <td>
      <img src="{{banner_url}}" width="600" height="150" alt="Clayworks — Premium Coworking & Managed Offices" style="display:block;border:0;max-width:600px;width:100%;height:auto;" />
    </td>
  </tr>
</table>'
where is_active = true;
