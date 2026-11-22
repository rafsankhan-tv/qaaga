create or replace function private.qaaga_sync_identity_status() returns trigger language plpgsql security definer set search_path=public,private,pg_temp as $$
begin
 if new.status is distinct from old.status then
  update public.profiles set verified=(new.status='approved'),identity_status=case when new.status='approved' then 'verified' when new.status='rejected' then 'rejected' else 'pending' end,updated_at=now()
  where lower(email)=lower(new.user_email);
 end if;
 return new;
end; $$;
revoke all on function private.qaaga_sync_identity_status() from public,anon,authenticated;
drop trigger if exists qaaga_sync_identity_status on public.identity_verifications;
create trigger qaaga_sync_identity_status after update of status on public.identity_verifications for each row execute function private.qaaga_sync_identity_status();