create or replace function private.qaaga_initialize_booking_service_fee()
returns trigger language plpgsql security definer set search_path=public,private,pg_temp
as $$ begin if new.service_fee_status is null or new.service_fee_status='not_required' then new.service_fee_status:='pending'; end if; return new; end; $$;
revoke all on function private.qaaga_initialize_booking_service_fee() from public,anon,authenticated;
drop trigger if exists qaaga_initialize_booking_service_fee on public.bookings;
create trigger qaaga_initialize_booking_service_fee before insert on public.bookings for each row execute function private.qaaga_initialize_booking_service_fee();