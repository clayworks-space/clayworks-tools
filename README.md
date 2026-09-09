# Clayworks Tools

Internal tools for Clayworks Spaces. The first module is an **Email Signature
Generator**: employees sign in, fill in their details, and copy or download
an Outlook-ready HTML signature. Built to grow — add more tools as new routes
under `src/app/(app)/`.

Stack: Next.js 16 (App Router) + TypeScript + Tailwind v4 + Supabase
(Postgres + Auth), deployed on Vercel.

## How it works

- **Employees** sign in at `/login` and land on `/dashboard`, where they fill
  in their name, title, phone, department and centre, see a live preview of
  the active signature template, and copy or download it.
- **Admins** get an `/admin` section to manage **users** (create accounts,
  reset passwords, remove access, promote/demote admins), **templates**
  (HTML signature layouts with `{{placeholder}}` fields, one marked active at
  a time), and **branding** (the logo + promotional banner shown at the
  bottom of every signature — only admins can upload/replace these; regular
  employees just fill in their own fields).
- There is no public sign-up. Only an admin can create an account, from
  `/admin/users`. Login is email + password.

## 1. Create the Supabase project

1. Go to [supabase.com](https://supabase.com) → New project.
2. Once it's up, open **SQL Editor** and run, in order:
   1. [`supabase/migrations/0001_init.sql`](./supabase/migrations/0001_init.sql) —
      creates the `profiles` and `signature_templates` tables, Row Level
      Security policies, and seeds one default Clayworks-branded template.
   2. [`supabase/migrations/0002_branding.sql`](./supabase/migrations/0002_branding.sql) —
      adds the `app_settings` table (org-wide logo/banner), a public
      `signature-assets` storage bucket admins upload those images to, and
      updates the default template to the current design.
3. Go to **Project Settings → API** and copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (keep this secret —
     it's only ever used server-side, in the admin actions that create
     users, delete users, and reset passwords)

## 2. Run it locally

```bash
cp .env.example .env.local   # fill in the three values from step 1
npm install
npm run dev
```

Open http://localhost:3000 — you'll be redirected to `/login`. There's no
account yet, so create the first one directly in Supabase:

1. In the Supabase dashboard, go to **Authentication → Users → Add user**,
   create yourself with your `@clayworks.in` email and a password.
2. In **SQL Editor**, run:
   ```sql
   update public.profiles set full_name = 'Your Name', role = 'admin'
   where email = 'you@clayworks.in';
   ```
   (The trigger that creates a `profiles` row runs on the app's own
   "create user" flow — since this first user was created directly in
   Supabase, insert the row yourself if the `update` above finds nothing:
   `insert into public.profiles (id, email, full_name, role) select id, email, 'Your Name', 'admin' from auth.users where email = 'you@clayworks.in';`)
3. Sign in at `/login`. You'll see **Admin** in the nav — from there, create
   every other employee's account (§ Admin → Users), no more direct SQL
   needed.

## 3. Deploy to Vercel

1. Push this repo to GitHub (see below).
2. In Vercel: **New Project** → import the repo.
3. Add the same three environment variables from `.env.local` in
   **Settings → Environment Variables**.
4. Deploy. Point a subdomain like `tools.clayworks.in` or
   `signature.clayworks.space` at it from **Settings → Domains**.

```bash
git init   # if not already
git add .
git commit -m "Clayworks Tools: email signature generator"
git remote add origin <your-repo-url>
git push -u origin main
```

## Editing the signature design

The active template's HTML lives in the database, not in code — edit it any
time from **Admin → Templates** with a live preview, no redeploy needed.
Available placeholders: `{{full_name}}`, `{{job_title}}`, `{{phone}}`,
`{{email}}`, `{{department}}`, `{{centre}}`, `{{logo_url}}`, and
`{{banner_url}}`. Keep templates as a single HTML `<table>` with inline
styles (no external CSS, no `<style>` blocks) — that's what survives being
pasted into Outlook's signature editor intact.

To match an existing reference design pixel-for-pixel, paste its HTML
(exported from Outlook or hand-built) into the template editor and swap the
static text for the placeholders above.

## Branding (logo + banner)

`{{logo_url}}` and `{{banner_url}}` don't come from an employee's profile —
they come from **Admin → Branding**, a single admin-only image upload for
each. Only an admin sees that page and can upload/replace the images
(enforced both in the UI and by Row Level Security, so an employee can't
write to it even by calling the action directly); everyone else just sees
whatever the admin last uploaded, baked into their own signature
automatically. Images are stored in the public `signature-assets` Supabase
Storage bucket so Outlook can load them from a plain HTTPS URL.

## Project structure

```
src/app/
  login/                 sign-in page + server actions
  (app)/                 authenticated shell (nav, sign-out)
    dashboard/           employee signature builder
    admin/                admin-only section (guarded in layout.tsx)
      users/              create/delete/reset-password
      templates/          list + per-template editor
src/components/          client components (forms, preview, copy/download)
src/lib/
  supabase/               browser / server / admin (service-role) clients
  signature.ts            {{placeholder}} → value rendering
  database.types.ts        hand-written DB types (swap for `supabase gen types` later)
supabase/migrations/      SQL schema + RLS + seed template
```
