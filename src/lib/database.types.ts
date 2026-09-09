// Minimal hand-written types matching supabase/migrations/0001_init.sql.
// If you use the Supabase CLI, you can replace this file by running:
//   supabase gen types typescript --project-id <ref> > src/lib/database.types.ts
//
// Note: these must be `type` aliases, not `interface`s — supabase-js checks
// each table against `Record<string, unknown>`, and TypeScript only grants
// interfaces an implicit index signature match when they're written as
// object-literal type aliases.

export type Role = "admin" | "employee";

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  job_title: string | null;
  phone: string | null;
  department: string | null;
  centre: string | null;
  linkedin_url: string | null;
  role: Role;
  created_at: string;
};

export type SignatureTemplate = {
  id: string;
  name: string;
  html: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

// Singleton row (id = 1) holding org-wide branding assets — the logo and
// promotional banner shown in every employee's signature. Only an admin can
// write this row; every signed-in user can read it.
export type AppSettings = {
  id: number;
  logo_url: string | null;
  banner_url: string | null;
  updated_at: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string; email: string; full_name: string };
        Update: Partial<Profile>;
        Relationships: [];
      };
      signature_templates: {
        Row: SignatureTemplate;
        Insert: Partial<SignatureTemplate> & { name: string; html: string };
        Update: Partial<SignatureTemplate>;
        Relationships: [];
      };
      app_settings: {
        Row: AppSettings;
        Insert: Partial<AppSettings> & { id: number };
        Update: Partial<AppSettings>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
