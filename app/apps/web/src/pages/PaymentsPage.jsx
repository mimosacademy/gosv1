import React from 'react';
import { Helmet } from 'react-helmet';
import { toast } from 'sonner';
import PageHeader from '@/components/PageHeader';
import StatCard from '@/components/StatCard';
import DataTable from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { formatDate, formatRM, formatRMCompact, payments } from '@/lib/mockData';
import { CreditCard, HandCoins, Hourglass, Plus, Receipt } from 'lucide-react';

const demoAction = () => toast.info('Demo build — payment records are read-only mock data.');

export default function PaymentsPage() {
  const completed = payments.filter((p) => p.status === 'Completed');
  const pending = payments.filter((p) => p.status === 'Pending');
  const collectedTotal = completed.reduce((s, p) => s + p.amount, 0);
  const pendingTotal = pending.reduce((s, p) => s + p.amount, 0);
  const thisMonth = completed
    .filter((p) => p.date.startsWith('2026-08'))
    .reduce((s, p) => s + p.amount, 0);

  const columns = [
    { key: 'paymentNo', label: 'Payment No.', className: 'whitespace-nowrap font-medium text-violet-700' },
    { key: 'invoiceNo', label: 'Invoice', className: 'whitespace-nowrap text-slate-500' },
    { key: 'clientName', label: 'Client', className: 'whitespace-nowrap' },
    { key: 'programmeCode', label: 'Programme', className: 'whitespace-nowrap font-medium text-violet-700' },
    { key: 'amount', label: 'Amount', className: 'whitespace-nowrap font-medium', render: (p) => formatRM(p.amount) },
    { key: 'method', label: 'Method', className: 'whitespace-nowrap' },
    { key: 'date', label: 'Date', className: 'whitespace-nowrap text-slate-500', render: (p) => formatDate(p.date) },
    { key: 'reference', label: 'Reference', className: 'whitespace-nowrap text-slate-500' },
    { key: 'status', label: 'Status', render: (p) => <StatusBadge status={p.status} /> },
  ];

  return (
    <div>
      <Helmet>
        <title>Payments — MIMOS Academy PMS</title>
        <meta name="description" content="Payment collection records for MIMOS Academy — receipts, methods, references and reconciliation status." />
      </Helmet>

      <PageHeader title="Payment Collection" description="Final step in the programme flow — collections against programme invoices.">
        <Button className="bg-violet-600 hover:bg-violet-700" onClick={demoAction}>
          <Plus className="mr-2 h-4 w-4" /> Record Payment
        </Button>
      </PageHeader>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Collected" value={formatRMCompact(collectedTotal)} icon={HandCoins} tone="emerald" hint={`${completed.length} confirmed payments`} />
        <StatCard title="Collected in Aug" value={formatRMCompact(thisMonth)} icon={CreditCard} tone="violet" hint="current month" />
        <StatCard title="Pending Clearance" value={formatRMCompact(pendingTotal)} icon={Hourglass} tone="amber" hint={`${pending.length} payments clearing`} />
        <StatCard title="Transactions" value={payments.length} icon={Receipt} tone="blue" hint="recorded YTD" />
      </div>

      <DataTable
        columns={columns}
        data={payments}
        searchKeys={['paymentNo', 'invoiceNo', 'clientName', 'reference']}
        searchPlaceholder="Search payments…"
        filters={[
          { key: 'status', label: 'Status', options: ['Completed', 'Pending'] },
          { key: 'method', label: 'Method', options: ['Bank Transfer', 'Cheque', 'Online Banking'] },
        ]}
        emptyTitle="No payments found"
        emptyDescription="No payments match your current search or filters."
      />
    </div>
  );
}
