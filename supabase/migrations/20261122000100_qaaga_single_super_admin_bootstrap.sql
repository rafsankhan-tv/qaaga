-- QAAGA: bootstrap the single, explicitly approved Super Admin.
-- The role is granted only after Supabase Auth confirms ownership of this exact email.
-- Never derive admin privileges from user_metadata or a browser-provided value.

create or replace function public.qaaga_bootstrap_super_admin()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if lower(coalesce(new.email, '')) = 'rafsankhan.tv@gmail.com'
     and new.email_confirmed_at is not null then
    new.raw_app_meta_data :=
      coalesce(new.raw_app_meta_data, '{}'::jsonb)
      || jsonb_build_object('role', 'admin', 'platform_admin', true);
  elsif tg_op = 'UPDATE'
        and lower(coalesce(old.email, '')) = 'rafsankhan.tv@gmail.com' then
    new.raw_app_meta_data :=
      coalesce(new.raw_app_meta_data, '{}'::jsonb)
      - 'role'
      - 'platform_admin';
  end if;

  return new;
end;
$$;

revoke all on function public.qaaga_bootstrap_super_admin() from public, anon, authenticated;

drop trigger if exists qaaga_bootstrap_super_admin_before_auth_user_write on auth.users;
create trigger qaaga_bootstrap_super_admin_before_auth_user_write
before insert or update of email, email_confirmed_at
on auth.users
for each row
execute function public.qaaga_bootstrap_super_admin();

create or replace function public.qaaga_sync_super_admin_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if lower(coalesce(new.email, '')) = 'rafsankhan.tv@gmail.com'
     and new.email_confirmed_at is not null then
    insert into public.profiles (
      id,
      email,
      full_name,
      role,
      status,
      verified,
      identity_status,
      created_at,
      updated_at
    )
    values (
      new.id,
      lower(new.email),
      coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), 'QAAGA Super Admin'),
      'admin',
      'active',
      false,
      'unverified',
      timezone('utc', now()),
      timezone('utc', now())
    )
    on conflict (email) do update
      set id = excluded.id,
          role = 'admin',
          updated_at = timezone('utc', now());
  elsif tg_op = 'UPDATE'
        and lower(coalesce(old.email, '')) = 'rafsankhan.tv@gmail.com' then
    update public.profiles
       set role = 'guest',
           updated_at = timezone('utc', now())
     where id = old.id
       and lower(email) = 'rafsankhan.tv@gmail.com';
  end if;

  return new;
end;
$$;

revoke all on function public.qaaga_sync_super_admin_profile() from public, anon, authenticated;

drop trigger if exists qaaga_sync_super_admin_profile_after_auth_user_write on auth.users;
create trigger qaaga_sync_super_admin_profile_after_auth_user_write
after insert or update of email, email_confirmed_at
on auth.users
for each row
execute function public.qaaga_sync_super_admin_profile();
