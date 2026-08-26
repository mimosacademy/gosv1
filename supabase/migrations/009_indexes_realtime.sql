-- Phase 1 / 009: performance + realtime publication
create index if not exists idx_programme_pic on public.programme(pic_id);
create index if not exists idx_programme_account_manager on public.programme(account_manager_id);
create index if not exists idx_invoice_due_outstanding on public.invoice(due_date,amount_outstanding) where amount_outstanding>0;
create index if not exists idx_payment_reference on public.payment(payment_reference);
create index if not exists idx_opportunity_salesman on public.opportunity(salesman_id);
create index if not exists idx_action_item_due_status on public.action_item(due_date,action_item_status_id);
create index if not exists idx_participant_email on public.participant(email);
create index if not exists idx_import_status on public.import_batch(status);
create index if not exists idx_conflict_status on public.data_conflict(resolution);

-- Supabase Realtime. Publication membership is intentionally explicit.
alter publication supabase_realtime add table public.programme;
alter publication supabase_realtime add table public.opportunity;
alter publication supabase_realtime add table public.action_item;
alter publication supabase_realtime add table public.invoice;
alter publication supabase_realtime add table public.payment;
