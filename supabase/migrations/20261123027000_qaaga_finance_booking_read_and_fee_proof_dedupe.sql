drop policy if exists qaaga_bookings_finance_read on public.bookings;
create policy qaaga_bookings_finance_read on public.bookings for select to authenticated using((select private.qaaga_has_role('finance')) or (select private.qaaga_is_super_admin()));
create unique index if not exists idx_one_pending_fee_proof_per_ledger on public.service_fee_payment_proofs(ledger_id) where status='pending';