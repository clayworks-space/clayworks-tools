-- Clayworks Tools — Email Signature Generator
-- Initial schema: profiles (linked 1:1 to auth.users), signature_templates,
-- row level security, and a trigger that seeds a profile row whenever an
-- admin creates a new auth user from the admin panel.

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create type public.user_role as enum ('admin', 'employee');

create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text not null unique,
  full_name   text not null default '',
  job_title   text,
  phone       text,
  department  text,
  centre      text,
  role        public.user_role not null default 'employee',
  created_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Every signed-in user can read their own profile row.
create policy "profiles: self can select"
  on public.profiles for select
  using (auth.uid() = id);

-- Every signed-in user can update the signature-relevant fields on their own
-- row (name/title/phone/department/centre) but not their role or email.
create policy "profiles: self can update own details"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Admin-check helper. IMPORTANT: this must be its own security-definer
-- function rather than an inline `exists (select 1 from public.profiles ...)`
-- in each policy below — a policy ON profiles that queries profiles again
-- makes Postgres detect infinite recursion ("infinite recursion detected in
-- policy for relation 'profiles'"), which breaks every profile read and
-- shows up as an app-level redirect loop between /login and /dashboard.
-- security definer runs this with the function owner's privileges, so the
-- inner select bypasses RLS instead of re-triggering these same policies.
create function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- Admins can read and manage every profile.
create policy "profiles: admin can select all"
  on public.profiles for select
  using (public.is_admin());

create policy "profiles: admin can update all"
  on public.profiles for update
  using (public.is_admin());

create policy "profiles: admin can insert"
  on public.profiles for insert
  with check (public.is_admin());

create policy "profiles: admin can delete"
  on public.profiles for delete
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- signature_templates
-- ---------------------------------------------------------------------------
create table public.signature_templates (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  html        text not null,
  is_active   boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.signature_templates enable row level security;

-- Any signed-in employee can read templates (they need the active one to
-- build their own signature).
create policy "templates: authenticated can select"
  on public.signature_templates for select
  to authenticated
  using (true);

-- Only admins can create/edit/delete templates. Uses the same is_admin()
-- helper defined above (see the comment there on why it exists).
create policy "templates: admin can insert"
  on public.signature_templates for insert
  with check (public.is_admin());

create policy "templates: admin can update"
  on public.signature_templates for update
  using (public.is_admin());

create policy "templates: admin can delete"
  on public.signature_templates for delete
  using (public.is_admin());

create function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger signature_templates_set_updated_at
  before update on public.signature_templates
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Seed: a default Clayworks-branded template (edit anytime from /admin/templates)
-- ---------------------------------------------------------------------------
insert into public.signature_templates (name, html, is_active) values (
  'Clayworks Default',
  '<table cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,Helvetica,sans-serif;color:#2b2420;">
  <tr>
    <td style="padding-right:16px;border-right:3px solid #b97134;" valign="top">
      <span style="font-family:Arial,Helvetica,sans-serif;font-size:18px;font-weight:bold;color:#b97134;letter-spacing:0.5px;">CLAYWORKS</span><br/>
      <span style="font-family:Arial,Helvetica,sans-serif;font-size:10px;color:#8a8074;letter-spacing:0.5px;">HUMANSENSE AT WORK&reg;</span>
    </td>
    <td style="padding-left:16px;" valign="top">
      <span style="font-size:14px;font-weight:bold;color:#2b2420;">{{full_name}}</span><br/>
      <span style="font-size:12px;color:#8a8074;">{{job_title}}</span><br/>
      <span style="font-size:12px;color:#2b2420;">
        <a href="tel:{{phone}}" style="color:#2b2420;text-decoration:none;">{{phone}}</a>
        &nbsp;|&nbsp;
        <a href="mailto:{{email}}" style="color:#2b2420;text-decoration:none;">{{email}}</a>
      </span><br/>
      <span style="font-size:12px;color:#8a8074;">{{centre}}, Clayworks Spaces &middot; <a href="https://www.clayworks.space" style="color:#b97134;text-decoration:none;">clayworks.space</a></span>
    </td>
  </tr>
</table>',
  true
);

-- ---------------------------------------------------------------------------
-- Helper: promote the first user you create to admin, e.g.
--   update public.profiles set role = ''admin'' where email = ''muzammil@clayworks.in'';
-- ---------------------------------------------------------------------------
