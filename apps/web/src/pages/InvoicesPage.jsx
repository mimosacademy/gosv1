import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { toast } from 'sonner';
import PageHeader from '@/components/PageHeader';
import StatCard from '@/components/StatCard';
import DataTable from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { formatDate, formatRM, formatRMCompact } from '@/lib/mockData';
import { dashboards, subscribe } from '@/lib/pmsRepository';
import { AlarmClock, HandCoins, Hourglass, Plus, Receipt } from 'lucide-react';

const mapInvoice = (i) => ({ id:i.invoice_id, invoiceNo:i.invoice_no, clientName:i.client_name||'—', programmeCode:i.programme_code||'—', description:i.programme_title||'—', amount:Number(i.total_incl_tax??0), paidAmount:Number(i.amount_collected??0), balance:Number(i.amount_outstanding??0), issueDate:i.invoice_date, dueDate:i.due_date, status:i.payment_status_name||i.payment_status_code||'—' });

export default function InvoicesPage(){
 const [invoices,setInvoices]=useState([]);
 const load=async()=>{try{const data=await dashboards.r1();setInvoices((data||[]).map(mapInvoice));}catch(e){toast.error(`Unable to load invoices: ${e.message}`);}};
 useEffect(()=>{load();return subscribe('invoice',load);},[]);
 const totals=useMemo(()=>({revenue:invoices.reduce((s,i)=>s+i.amount,0),collected:invoices.reduce((s,i)=>s+i.paidAmount,0),outstanding:invoices.reduce((s,i)=>s+i.balance,0),overdue:invoices.filter(i=>i.balance>0 && /overdue/i.test(i.status)).reduce((s,i)=>s+i.balance,0)}),[invoices]);
 const overdueCount=invoices.filter(i=>i.balance>0 && /overdue/i.test(i.status)).length;
 const statuses=useMemo(()=>[...new Set(invoices.map(i=>i.status).filter(Boolean))],[invoices]);
 const columns=[
  {key:'invoiceNo',label:'Invoice No.',className:'whitespace-nowrap font-medium text-violet-700'},
  {key:'clientName',label:'Client',className:'whitespace-nowrap'},
  {key:'programmeCode',label:'Programme',className:'whitespace-nowrap font-medium text-violet-700'},
  {key:'description',label:'Description',className:'min-w-56 text-slate-500'},
  {key:'amount',label:'Amount',className:'whitespace-nowrap font-medium',render:i=>formatRM(i.amount)},
  {key:'paidAmount',label:'Paid',className:'whitespace-nowrap text-emerald-700',render:i=>formatRM(i.paidAmount)},
  {key:'balance',label:'Balance',className:'whitespace-nowrap font-medium',render:i=><span className={i.balance>0?'text-red-600':'text-slate-400'}>{formatRM(i.balance)}</span>},
  {key:'issueDate',label:'Issued',className:'whitespace-nowrap text-slate-500',render:i=>formatDate(i.issueDate)},
  {key:'dueDate',label:'Due',className:'whitespace-nowrap text-slate-500',render:i=>formatDate(i.dueDate)},
  {key:'status',label:'Status',render:i=><StatusBadge status={i.status}/>},
 ];
 return <div><Helmet><title>Invoices — MIMOS Academy PMS</title></Helmet><PageHeader title='Invoices' description='Live invoice and collection records from the R1 PostgreSQL reporting view.'><Button className='bg-violet-600 hover:bg-violet-700' onClick={()=>toast.info('New invoice uses the Supabase invoice CRUD repository.') }><Plus className='mr-2 h-4 w-4'/> New Invoice</Button></PageHeader><div className='mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4'><StatCard title='Total Invoiced' value={formatRMCompact(totals.revenue)} icon={Receipt} tone='violet' hint={`${invoices.length} invoices`}/><StatCard title='Collected' value={formatRMCompact(totals.collected)} icon={HandCoins} tone='emerald' hint={totals.revenue?`${Math.round((totals.collected/totals.revenue)*100)}% collection rate`:'—'}/><StatCard title='Outstanding' value={formatRMCompact(totals.outstanding)} icon={Hourglass} tone='amber' hint='awaiting payment'/><StatCard title='Overdue' value={formatRMCompact(totals.overdue)} icon={AlarmClock} tone='red' delta={`${overdueCount} invoices`} deltaDirection='down' hint='past due date'/></div><DataTable columns={columns} data={invoices} searchKeys={['invoiceNo','clientName','description']} searchPlaceholder='Search invoices…' filters={[{key:'status',label:'Status',options:statuses}]} emptyTitle='No invoices found' emptyDescription='No live invoice records exist in Supabase yet.'/></div>;
}
