import React from 'react';
import { Helmet } from 'react-helmet';
import { toast } from 'sonner';
import PageHeader from '@/components/PageHeader';
import StatCard from '@/components/StatCard';
import DataTable from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { formatDate, formatRM, formatRMCompact, invoices, totals } from '@/lib/mockData';
import { AlarmClock, HandCoins, Hourglass, Plus, Receipt } from 'lucide-react';

const demoAction = () => toast.info('Demo build — invoice records are read-only mock data.');

export default function InvoicesPage() {
  const overdueCount = invoices.filter((i) => i.status === 'Overdue').length;

  const columns = [
    { key: 'invoiceNo', label: 'Invoice No.', className: 'whitespace-nowrap font-medium text-violet-700' },
    { key: 'clientName', label: 'Client', className: 'whitespace-nowrap' },
    { key: 'programmeCode', label: 'Programme', className: 'whitespace-nowrap font-medium text-violet-700' },
    { key: 'description', label: 'Description', className: 'min-w-56 text-slate-500' },
    { key: 'amount', label: 'Amount', className: 'whitespace-nowrap font-medium', render: (i) => formatRM(i.amount) },
    { key: 'paidAmount', label: 'Paid', className: 'whitespace-nowrap text-emerald-700', render: (i) => formatRM(i.paidAmount) },
    {
      key: 'balance',
      label: 'Balance',
      className: 'whitespace-nowrap font-medium',
      render: (i) => <span className={i.amount - i.paidAmount > 0 ? 'text-red-600' : 'text-slate-400'}>{formatRM(i.amount - i.paidAmount)}</span>,
    },
    { key: 'issueDate', label: 'Issued', className: 'whitespace-nowrap text-slate-500', render: (i) => formatDate(i.issueDate) },
    { key: 'dueDate', label: 'Due', className: 'whitespace-nowrap text-slate-500', render: (i) => formatDate(i.dueDate) },
    { key: 'status', label: 'Status', render: (i) => <StatusBadge status={i.status} /> },
  ];

  return (
    <div>
      <Helmet>
        <title>Invoices — MIMOS Academy PMS</title>
        <meta name="description" content="Invoice tracking for MIMOS Academy — billed amounts, balances, due dates and overdue follow-up." />
      </Helmet>

      <PageHeader title="Invoices" description="Programme billing after training delivery milestones.">
        <Button className="bg-violet-600 hover:bg-violet-700" onClick={demoAction}>
          <Plus className="mr-2 h-4 w-4" /> New Invoice
        </Button>
      </PageHeader>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Invoiced" value={formatRMCompact(totals.revenue)} icon={Receipt} tone="violet" hint={`${invoices.length} invoices issued`} />
        <StatCard title="Collected" value={formatRMCompact(totals.collected)} icon={HandCoins} tone="emerald" hint={`${Math.round((totals.collected / totals.revenue) * 100)}% collection rate`} />
        <StatCard title="Outstanding" value={formatRMCompact(totals.outstanding)} icon={Hourglass} tone="amber" hint="awaiting payment" />
        <StatCard title="Overdue" value={formatRMCompact(totals.overdue)} icon={AlarmClock} tone="red" delta={`${overdueCount} invoices`} deltaDirection="down" hint="past due date" />
      </div>

      <DataTable
        columns={columns}
        data={invoices}
        searchKeys={['invoiceNo', 'clientName', 'description']}
        searchPlaceholder="Search invoices…"
        filters={[
          { key: 'status', label: 'Status', options: ['Paid', 'Partial', 'Unpaid', 'Overdue'] },
        ]}
        emptyTitle="No invoices found"
        emptyDescription="No invoices match your current search or filters."
      />
    </div>
  );
}
