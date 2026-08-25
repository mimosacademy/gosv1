import React from 'react';
import { Helmet } from 'react-helmet';
import { toast } from 'sonner';
import PageHeader from '@/components/PageHeader';
import StatCard from '@/components/StatCard';
import DataTable from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { formatDate, formatRM, formatRMCompact, quotations } from '@/lib/mockData';
import { CheckCircle2, FileText, Plus, Send } from 'lucide-react';

const demoAction = () => toast.info('Demo build — quotation records are read-only mock data.');

export default function QuotationsPage() {
  const sent = quotations.filter((q) => q.status === 'Sent').length;
  const accepted = quotations.filter((q) => q.status === 'Accepted').length;
  const totalValue = quotations.reduce((s, q) => s + q.amount, 0);

  const columns = [
    { key: 'quoteNo', label: 'Quote No.', className: 'whitespace-nowrap font-medium text-violet-700' },
    { key: 'clientName', label: 'Client', className: 'whitespace-nowrap' },
    {
      key: 'programme',
      label: 'Programme',
      render: (q) => (
        <div className="min-w-52">
          <p className="font-medium text-slate-800">{q.programme}</p>
          <p className="text-xs text-slate-400">{q.programmeCode || '—'}</p>
        </div>
      ),
    },
    { key: 'amount', label: 'Amount', className: 'whitespace-nowrap font-medium', render: (q) => formatRM(q.amount) },
    { key: 'issueDate', label: 'Issued', className: 'whitespace-nowrap text-slate-500', render: (q) => formatDate(q.issueDate) },
    { key: 'validUntil', label: 'Valid Until', className: 'whitespace-nowrap text-slate-500', render: (q) => formatDate(q.validUntil) },
    { key: 'preparedBy', label: 'Prepared By', className: 'whitespace-nowrap' },
    { key: 'status', label: 'Status', render: (q) => <StatusBadge status={q.status} /> },
  ];

  return (
    <div>
      <Helmet>
        <title>Quotations — MIMOS Academy PMS</title>
        <meta name="description" content="Quotation management for MIMOS Academy training programmes — drafts, sent, accepted and expired quotes." />
      </Helmet>

      <PageHeader title="Quotations" description="Programme pricing after opportunity — precedes client purchase order.">
        <Button className="bg-violet-600 hover:bg-violet-700" onClick={demoAction}>
          <Plus className="mr-2 h-4 w-4" /> New Quotation
        </Button>
      </PageHeader>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Quotations" value={quotations.length} icon={FileText} tone="violet" hint="issued YTD" />
        <StatCard title="Awaiting Response" value={sent} icon={Send} tone="blue" hint="sent to clients" />
        <StatCard title="Accepted" value={accepted} icon={CheckCircle2} tone="emerald" hint="converted to sales" />
        <StatCard title="Total Quoted Value" value={formatRMCompact(totalValue)} icon={FileText} tone="amber" hint="across all quotations" />
      </div>

      <DataTable
        columns={columns}
        data={quotations}
        searchKeys={['quoteNo', 'clientName', 'programme', 'preparedBy']}
        searchPlaceholder="Search quotations…"
        filters={[
          { key: 'status', label: 'Status', options: ['Draft', 'Sent', 'Accepted', 'Rejected', 'Expired'] },
        ]}
        emptyTitle="No quotations found"
        emptyDescription="No quotations match your current search or filters."
      />
    </div>
  );
}
