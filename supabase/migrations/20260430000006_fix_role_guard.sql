-- Allow postgres/service_role (no JWT context) to change roles freely.
-- The guard only applies to authenticated app users.
create or replace function public.guard_profile_role_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then return new; end if;
  if new.role is distinct from old.role and not public.is_admin() then
    raise exception 'Role changes require admin privileges';
  end if;
  return new;
end;
$$;
