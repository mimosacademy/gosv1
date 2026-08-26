import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { toast } from 'sonner';
import PageHeader from '@/components/PageHeader';
import StatCard from '@/components/StatCard';
import DataTable from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { list, subscribe } from '@/lib/pmsRepository';
import { formatDate, formatRM, formatRMCompact } from '@/lib/mockData';
import { CheckCircle2, FileText, Plus, Send } from 'lucide-react';

const mapQuotation = (q) => ({
  id: q.id,
  quoteNo: q.quotation_no,
  clientName: q.client?.company_name || '—',
  programme: q.project_title || q.programme?.title || '—',
  programmeCode: q.programme?.programme_code || '—',
  amount: Number(q.final_price ?? q.total_price_incl_tax ?? q.total_price_excl_tax ?? 0),
  issueDate: q.quotation_date,
  validUntil: q.valid_until,
  preparedBy: q.account_manager?.full_name || '—',
  status: q.quotation_status?.name || '—',
});

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState([]);
  const load = async () => {
    try {
      const { data } = await list('quotation', { select: '*,client(company_name),programme(title,programme_code),quotation_status(name),account_manager:account_manager_id(full_name)', pageSize: 500, orderBy: 'quotation_date', ascending: false });
      setQuotations(data.map(mapQuotation));
    } catch (error) { toast.error(`Unable to load quotations: ${error.message}`); }
  };
  useEffect(() => { load(); return subscribe('quotation', load); }, []);

  const sent = quotations.filter((q) => /sent/i.test(q.status)).length;
  const accepted = quotations.filter((q) => /accepted/i.test(q.status)).length;
  const totalValue = quotations.reduce((s, q) => s + q.amount, 0);
  const statuses = useMemo(() => [...new Set(quotations.map((q) => q.status).filter(Boolean))], [quotations]);
  const columns = [
    { key: 'quoteNo', label: 'Quote No.', className: 'whitespace-nowrap font-medium text-violet-700' },
    { key: 'clientName', label: 'Client', className: 'whitespace-nowrap' },
    { key: 'programme', label: 'Programme', render: (q) => <div className="min-w-52"><p className="font-medium text-slate-800">{q.programme}</p><p className="text-xs text-slate-400">{q.programmeCode}</p></div> },
    { key: 'amount', label: 'Amount', className: 'whitespace-nowrap font-medium', render: (q) => formatRM(q.amount) },
    { key: 'issueDate', label: 'Issued', className: 'whitespace-nowrap text-slate-500', render: (q) => formatDate(q.issueDate) },
    { key: 'validUntil', label: 'Valid Until', className: 'whitespace-nowrap text-slate-500', render: (q) => formatDate(q.validUntil) },
    { key: 'preparedBy', label: 'Prepared By', className: 'whitespace-nowrap' },
    { key: 'status', label: 'Status', render: (q) => <StatusBadge status={q.status} /> },
  ];

  return <div>
    <Helmet><title>Quotations — MIMOS Academy PMS</title></Helmet>
    <PageHeader title="Quotations" description="Live quotation records from Supabase."><Button className="bg-violet-600 hover:bg-violet-700" onClick={() => toast.info('New quotation uses the Supabase quotation CRUD endpoint.') }><Plus className="mr-2 h-4 w-4" /> New Quotation</Button></PageHeader>
    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard title="Total Quotations" value={quotations.length} icon={FileText} tone="violet" hint="live"/><StatCard title="Awaiting Response" value={sent} icon={Send} tone="blue" hint="sent"/><StatCard title="Accepted" value={accepted} icon={CheckCircle2} tone="emerald" hint="accepted"/><StatCard title="Total Quoted Value" value={formatRMCompact(totalValue)} icon={FileText} tone="amber" hint="live total"/></div>
    <DataTable columns={columns} data={quotations} searchKeys={['quoteNo','clientName','programme','preparedBy']} searchPlaceholder="Search quotations…" filters={[{key:'status',label:'Status',options:statuses}]} emptyTitle="No quotations found" emptyDescription="No live quotation records exist in Supabase yet." />
  </div>;
}
