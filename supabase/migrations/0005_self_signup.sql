-- Self-service signup: anyone can create their own "employee" account
-- through /signup, but only with an @clayworks.in email address. Enforced
-- twice: once in the signup server action before calling supabase.auth.signUp,
-- and again here at the database level so it can't be bypassed by calling
-- the Supabase Auth API directly.
--
-- This also fires for accounts created via the admin panel (Admin → Users →
-- Add user uses the same auth.users insert under the hood), so the domain
-- rule is enforced consistently everywhere.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.email !~* '^[^@]+@clayworks\.in$' then
    raise exception 'Only @clayworks.in email addresses can sign up for Clayworks Tools.';
  end if;

  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', '')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
