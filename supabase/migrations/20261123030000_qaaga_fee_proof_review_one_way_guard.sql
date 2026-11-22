create or replace function private.qaaga_guard_fee_proof_update()
returns trigger language plpgsql security definer set search_path=public,private,pg_temp
as $$
begin
 if private.qaaga_is_super_admin() then return new; end if;
 if not private.qaaga_has_role('finance') then raise exception 'Finance role required.'; end if;
 if old.status<>'pending' then raise exception 'Only pending payment proofs can be reviewed.'; end if;
 if new.status not in ('verified','rejected') then raise exception 'Unsupported payment review decision.'; end if;
 if (to_jsonb(new)-array['status','finance_notes','reviewed_by','reviewed_at','updated_at'])<>(to_jsonb(old)-array['status','finance_notes','reviewed_by','reviewed_at','updated_at']) then raise exception 'Finance staff may only update review status and notes.'; end if;
 return new;
end; $$;