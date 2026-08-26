import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { toast } from 'sonner';
import PageHeader from '@/components/PageHeader';
import StatCard from '@/components/StatCard';
import DataTable from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { formatDate, formatRM, formatRMCompact } from '@/lib/mockData';
import { list, subscribe } from '@/lib/pmsRepository';
import { CreditCard, HandCoins, Hourglass, Plus, Receipt } from 'lucide-react';

const mapPayment=p=>({id:p.id,paymentNo:p.payment_reference||`PAY-${p.id}`,invoiceNo:p.invoice?.invoice_no||'—',clientName:p.client?.company_name||'—',programmeCode:p.programme?.programme_code||'—',amount:Number(p.total_amount??p.amount??0),method:p.payment_method?.name||'—',date:p.payment_date,reference:p.bank_reference||p.transaction_id||p.cheque_no||'—',status:p.payment_status?.name||'—'});
export default function PaymentsPage(){
 const [rows,setRows]=useState([]);
 const load=async()=>{try{const {data}=await list('payment',{select:'*,invoice(invoice_no),client(company_name),programme(programme_code),payment_method(name),payment_status(name)',pageSize:500,orderBy:'payment_date',ascending:false});setRows(data.map(mapPayment));}catch(e){toast.error(`Unable to load payments: ${e.message}`);}};
 useEffect(()=>{load();return subscribe('payment',load);},[]);
 const completed=rows.filter(p=>/completed|paid|received/i.test(p.status)); const pending=rows.filter(p=>/pending|processing/i.test(p.status)); const collected=completed.reduce((s,p)=>s+p.amount,0); const pendingTotal=pending.reduce((s,p)=>s+p.amount,0); const thisMonth=completed.filter(p=>String(p.date||'').startsWith('2026-08')).reduce((s,p)=>s+p.amount,0); const statuses=useMemo(()=>[...new Set(rows.map(p=>p.status).filter(Boolean))],[rows]); const methods=useMemo(()=>[...new Set(rows.map(p=>p.method).filter(Boolean))],[rows]);
 const columns=[{key:'paymentNo',label:'Payment No.',className:'whitespace-nowrap font-medium text-violet-700'},{key:'invoiceNo',label:'Invoice',className:'whitespace-nowrap text-slate-500'},{key:'clientName',label:'Client',className:'whitespace-nowrap'},{key:'programmeCode',label:'Programme',className:'whitespace-nowrap font-medium text-violet-700'},{key:'amount',label:'Amount',className:'whitespace-nowrap font-medium',render:p=>formatRM(p.amount)},{key:'method',label:'Method',className:'whitespace-nowrap'},{key:'date',label:'Date',className:'whitespace-nowrap text-slate-500',render:p=>formatDate(p.date)},{key:'reference',label:'Reference',className:'whitespace-nowrap text-slate-500'},{key:'status',label:'Status',render:p=><StatusBadge status={p.status}/> }];
 return <div><Helmet><title>Payments — MIMOS Academy PMS</title></Helmet><PageHeader title='Payment Collection' description='Live payment records reconciled against invoices.'><Button className='bg-violet-600 hover:bg-violet-700' onClick={()=>toast.info('Payment creation uses the Supabase payment CRUD repository.') }><Plus className='mr-2 h-4 w-4'/> Record Payment</Button></PageHeader><div className='mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4'><StatCard title='Total Collected' value={formatRMCompact(collected)} icon={HandCoins} tone='emerald' hint={`${completed.length} confirmed`}/><StatCard title='Collected in Aug' value={formatRMCompact(thisMonth)} icon={CreditCard} tone='violet' hint='current month'/><StatCard title='Pending Clearance' value={formatRMCompact(pendingTotal)} icon={Hourglass} tone='amber' hint={`${pending.length} pending`}/><StatCard title='Transactions' value={rows.length} icon={Receipt} tone='blue' hint='live records'/></div><DataTable columns={columns} data={rows} searchKeys={['paymentNo','invoiceNo','clientName','reference']} searchPlaceholder='Search payments…' filters={[{key:'status',label:'Status',options:statuses},{key:'method',label:'Method',options:methods}]} emptyTitle='No payments found' emptyDescription='No live payment records exist in Supabase yet.'/></div>;
}
