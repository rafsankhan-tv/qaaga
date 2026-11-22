create unique index if not exists idx_one_booking_service_fee_per_booking on public.service_fee_ledger(booking_id) where entry_type='booking_service_fee';
create or replace function private.qaaga_guard_booking_update() returns trigger language plpgsql security definer set search_path=public,private,pg_temp as $$
declare v_email text:=lower(coalesce(auth.jwt()->>'email',''));
begin
 if pg_trigger_depth()>1 then return new; end if;
 if private.qaaga_is_super_admin() then return new; end if;
 if new.status='Confirmed' and coalesce(new.service_fee_status,'pending') not in ('paid','not_required') then raise exception 'QAAGA service fee must be verified before booking confirmation.'; end if;
 if v_email=lower(old.customer_email) then
  if new.status<>'Cancelled' or (to_jsonb(new)-array['status','cancellation_reason','updated_at','cancelled_by','cancelled_at'])<>(to_jsonb(old)-array['status','cancellation_reason','updated_at','cancelled_by','cancelled_at']) then raise exception 'Customers may only cancel their own booking; booking details are immutable.'; end if;
  new.cancelled_by:='customer';new.cancelled_at:=coalesce(new.cancelled_at,now());return new;
 end if;
 if v_email=lower(old.host_email) or private.qaaga_can_manage_property(old.property_id) then
  if new.status not in ('Accepted','Confirmed','Rejected','Cancelled','Completed') or (to_jsonb(new)-array['status','cancellation_reason','updated_at','cancelled_by','cancelled_at'])<>(to_jsonb(old)-array['status','cancellation_reason','updated_at','cancelled_by','cancelled_at']) then raise exception 'Hosts and assigned staff may only update booking status and cancellation metadata.'; end if;
  if new.status='Cancelled' then new.cancelled_by:='host';new.cancelled_at:=coalesce(new.cancelled_at,now());end if;return new;
 end if;
 raise exception 'Not authorized to update this booking.';
end; $$;