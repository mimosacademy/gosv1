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
import { CheckCircle2, ClipboardList, Hourglass, Plus, Wallet } from 'lucide-react';

const mapPO = (p) => ({ id:p.id, poNo:p.po_no, clientName:p.client?.company_name||'—', programmeTitle:p.programme?.title||'—', programmeCode:p.programme?.programme_code||'—', amount:Number(p.po_value_incl_tax??p.po_value_excl_tax??0), issueDate:p.po_date, receivedDate:p.created_at, status:p.po_status||'—' });

export default function PurchaseOrdersPage(){
 const [rows,setRows]=useState([]);
 const load=async()=>{try{const {data}=await list('purchase_order',{select:'*,client(company_name),programme(title,programme_code)',pageSize:500,orderBy:'po_date',ascending:false});setRows(data.map(mapPO));}catch(e){toast.error(`Unable to load purchase orders: ${e.message}`);}};
 useEffect(()=>{load();return subscribe('purchase_order',load);},[]);
 const confirmed=rows.filter(p=>/confirmed|approved/i.test(p.status)).length; const pending=rows.filter(p=>/pending/i.test(p.status)).length; const total=rows.reduce((s,p)=>s+p.amount,0); const statuses=useMemo(()=>[...new Set(rows.map(p=>p.status).filter(Boolean))],[rows]);
 const columns=[
  {key:'poNo',label:'PO No.',className:'whitespace-nowrap font-medium text-violet-700'},
  {key:'clientName',label:'Client',className:'whitespace-nowrap'},
  {key:'programmeTitle',label:'Programme',render:p=><div className='min-w-52'><p className='font-medium text-slate-800'>{p.programmeTitle}</p><p className='text-xs text-slate-400'>{p.programmeCode}</p></div>},
  {key:'amount',label:'Amount',className:'whitespace-nowrap font-medium',render:p=>formatRM(p.amount)},
  {key:'issueDate',label:'Issued',className:'whitespace-nowrap text-slate-500',render:p=>formatDate(p.issueDate)},
  {key:'receivedDate',label:'Recorded',className:'whitespace-nowrap text-slate-500',render:p=>formatDate(p.receivedDate)},
  {key:'status',label:'Status',render:p=><StatusBadge status={p.status}/>},
 ];
 return <div><Helmet><title>Purchase Orders — MIMOS Academy PMS</title></Helmet><PageHeader title='Purchase Orders' description='Live client purchase orders from Supabase.'><Button className='bg-violet-600 hover:bg-violet-700' onClick={()=>toast.info('PO creation uses the Supabase CRUD repository.') }><Plus className='mr-2 h-4 w-4'/> Record PO</Button></PageHeader><div className='mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4'><StatCard title='Total POs' value={rows.length} icon={ClipboardList} tone='violet' hint='live'/><StatCard title='Confirmed' value={confirmed} icon={CheckCircle2} tone='emerald' hint='secured'/><StatCard title='Pending' value={pending} icon={Hourglass} tone='amber' hint='awaiting confirmation'/><StatCard title='Order Book' value={formatRMCompact(total)} icon={Wallet} tone='blue' hint='live total'/></div><DataTable columns={columns} data={rows} searchKeys={['poNo','clientName','programmeTitle','programmeCode']} searchPlaceholder='Search purchase orders…' filters={[{key:'status',label:'Status',options:statuses}]} emptyTitle='No purchase orders found' emptyDescription='No live PO records exist in Supabase yet.'/></div>;
}
