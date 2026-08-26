import { pms } from './pmsRepository'
import { money, required } from './validation'

export async function createQuotation(payload) {
  return pms.quotations.create({
    ...payload,
    client_id: required(payload.client_id, 'Client'),
    quotation_no: required(payload.quotation_no, 'Quotation number'),
    total_amount: money(payload.total_amount, 'Quotation amount'),
  })
}

export async function createInvoice(payload) {
  return pms.invoices.create({
    ...payload,
    programme_id: required(payload.programme_id, 'Programme'),
    invoice_no: required(payload.invoice_no, 'Invoice number'),
    total_amount: money(payload.total_amount, 'Invoice amount'),
  })
}

export async function recordPayment(payload) {
  return pms.payments.create({
    ...payload,
    invoice_id: required(payload.invoice_id, 'Invoice'),
    amount: money(payload.amount, 'Payment amount'),
  })
}

export async function createOpportunity(payload) {
  return pms.opportunities.create({
    ...payload,
    opportunity_name: required(payload.opportunity_name, 'Opportunity name'),
  })
}

export async function createActionItem(payload) {
  return pms.actionItems.create({
    ...payload,
    title: required(payload.title, 'Action item title'),
  })
}
