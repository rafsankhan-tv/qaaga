-- QAAGA role-aware operational permissions and booking update hardening.
create or replace function public.qaaga_has_property_role(p_property_id text,p_role text)
returns boolean language sql stable security definer set search_path=public,pg_temp
as $$ select public.qaaga_is_super_admin() or exists(select 1 from public.property_staff_assignments s where s.property_id=p_property_id and s.user_id=auth.uid() and s.role=p_role and s.is_active=true); $$;
grant execute on function public.qaaga_has_property_role(text,text) to authenticated;
drop policy if exists qaaga_properties_staff_read on public.properties;
create policy qaaga_properties_staff_read on public.properties for select to authenticated using(public.qaaga_can_manage_property(id));
drop policy if exists qaaga_properties_manager_update on public.properties;
create policy qaaga_properties_manager_update on public.properties for update to authenticated using(public.qaaga_has_property_role(id,'property_manager')) with check(public.qaaga_has_property_role(id,'property_manager'));
drop policy if exists qaaga_availability_staff_manage on public.property_availability;
create policy qaaga_availability_staff_manage on public.property_availability for all to authenticated using(public.qaaga_can_manage_property(property_id)) with check(public.qaaga_can_manage_property(property_id));
drop policy if exists qaaga_bookings_staff_read on public.bookings;
create policy qaaga_bookings_staff_read on public.bookings for select to authenticated using(public.qaaga_has_role('support') or public.qaaga_can_manage_property(property_id));
drop policy if exists qaaga_bookings_staff_update on public.bookings;
create policy qaaga_bookings_staff_update on public.bookings for update to authenticated using(public.qaaga_can_manage_property(property_id)) with check(public.qaaga_can_manage_property(property_id));
drop policy if exists qaaga_payment_finance_read on public.payment_records;
create policy qaaga_payment_finance_read on public.payment_records for select to authenticated using(public.qaaga_has_role('finance') or public.qaaga_is_super_admin());
drop policy if exists qaaga_identity_verification_read on public.identity_verifications;
create policy qaaga_identity_verification_read on public.identity_verifications for select to authenticated using(public.qaaga_has_role('verification') or public.qaaga_is_super_admin());
drop policy if exists qaaga_identity_verification_review on public.identity_verifications;
create policy qaaga_identity_verification_review on public.identity_verifications for update to authenticated using(public.qaaga_has_role('verification') or public.qaaga_is_super_admin()) with check(public.qaaga_has_role('verification') or public.qaaga_is_super_admin());
create or replace function public.qaaga_guard_booking_update()
returns trigger language plpgsql security definer set search_path=public,pg_temp
as $$
declare v_email text:=lower(coalesce(auth.jwt()->>'email',''));
begin
 if public.qaaga_is_super_admin() then return new; end if;
 if v_email=lower(old.customer_email) then
  if new.status<>'Cancelled' or (to_jsonb(new)-array['status','cancellation_reason','updated_at','cancelled_by','cancelled_at'])<>(to_jsonb(old)-array['status','cancellation_reason','updated_at','cancelled_by','cancelled_at']) then raise exception 'Customers may only cancel their own booking; booking details are immutable.'; end if;
  new.cancelled_by:='customer';new.cancelled_at:=coalesce(new.cancelled_at,now());return new;
 end if;
 if v_email=lower(old.host_email) or public.qaaga_can_manage_property(old.property_id) then
  if new.status not in ('Accepted','Confirmed','Rejected','Cancelled','Completed') or (to_jsonb(new)-array['status','cancellation_reason','updated_at','cancelled_by','cancelled_at'])<>(to_jsonb(old)-array['status','cancellation_reason','updated_at','cancelled_by','cancelled_at']) then raise exception 'Hosts and assigned property staff may only update booking status and cancellation metadata.'; end if;
  if new.status='Cancelled' then new.cancelled_by:='host';new.cancelled_at:=coalesce(new.cancelled_at,now());end if;return new;
 end if;
 raise exception 'Not authorized to update this booking.';
end; $$;
drop trigger if exists qaaga_guard_booking_update on public.bookings;
create trigger qaaga_guard_booking_update before update on public.bookings for each row execute function public.qaaga_guard_booking_update();
comment on function public.qaaga_guard_booking_update() is 'Restricts booking updates to permitted status transitions by customer, host, assigned staff, or admin.';
