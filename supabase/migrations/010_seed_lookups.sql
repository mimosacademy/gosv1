-- Phase 1 / 010: safe seed values; exact source seed data remains authoritative from readme SQL.
insert into public.programme_status(code,name) values ('PLANNED','Planned'),('ONGOING','Ongoing'),('DELIVERED','Delivered'),('COMPLETED','Completed'),('CANCELLED','Cancelled'),('ON_HOLD','On Hold') on conflict(code) do nothing;
insert into public.opportunity_status(code,name) values ('LEAD','Lead'),('QUALIFIED','Qualified'),('PROPOSAL','Proposal'),('NEGOTIATION','Negotiation'),('CONTRACT_SIGNED','Contract Signed'),('WON','Won'),('LOST','Lost') on conflict(code) do nothing;
insert into public.payment_status(code,name) values ('UNPAID','Unpaid'),('PARTIAL','Partial'),('PAID','Paid'),('OVERDUE','Overdue'),('PENDING','Pending'),('COMPLETED','Completed'),('FAILED','Failed') on conflict(code) do nothing;
insert into public.payment_method(code,name) values ('BANK_TRANSFER','Bank Transfer'),('CHEQUE','Cheque'),('CARD','Card'),('CASH','Cash'),('OTHER','Other') on conflict(code) do nothing;
insert into public.quotation_status(code,name) values ('DRAFT','Draft'),('SENT','Sent'),('ACCEPTED','Accepted'),('REJECTED','Rejected'),('EXPIRED','Expired') on conflict(code) do nothing;
insert into public.quotation_type(code,name) values ('TRAINING','Training'),('CONSULTING','Consulting'),('OTHER','Other') on conflict(code) do nothing;
insert into public.action_item_status(code,name) values ('OPEN','Open'),('IN_PROGRESS','In Progress'),('COMPLETED','Completed'),('CANCELLED','Cancelled') on conflict(code) do nothing;
insert into public.programme_category(code,name) values ('PUBLIC','Public Training'),('INHOUSE','In-House'),('CUSTOM','Custom Programme'),('INTERNAL','Internal') on conflict(code) do nothing;
insert into public.service_type(code,name) values ('TRAINING','Training'),('CONSULTING','Consulting'),('WORKSHOP','Workshop'),('OTHER','Other') on conflict(code) do nothing;
insert into public.revenue_type(code,name) values ('TRAINING','Training Revenue'),('CONSULTING','Consulting Revenue'),('OTHER','Other Revenue') on conflict(code) do nothing;
insert into public.payment_terms(code,name,days) values ('COD','Cash on Delivery',0),('NET30','30 Days',30),('NET60','60 Days',60),('NET90','90 Days',90) on conflict(code) do nothing;
