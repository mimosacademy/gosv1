import React from 'react';
import { Helmet } from 'react-helmet';
import { toast } from 'sonner';
import PageHeader from '@/components/PageHeader';
import StatCard from '@/components/StatCard';
import DataTable from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { formatDate, formatRM, formatRMCompact, purchaseOrders, securedOrderBook } from '@/lib/mockData';
import { CheckCircle2, ClipboardList, Hourglass, Plus, Wallet } from 'lucide-react';

const demoAction = () => toast.info('Demo build — purchase order records are read-only mock data.');

export default function PurchaseOrdersPage() {
  const confirmed = purchaseOrders.filter((p) => p.status === 'Confirmed').length;
  const pending = purchaseOrders.filter((p) => p.status === 'Pending').length;
  const totalValue = purchaseOrders.reduce((s, p) => s + p.amount, 0);

  const columns = [
    { key: 'poNo', label: 'PO No.', className: 'whitespace-nowrap font-medium text-violet-700' },
    { key: 'clientName', label: 'Client', className: 'whitespace-nowrap' },
    {
      key: 'programmeTitle',
      label: 'Programme',
      render: (p) => (
        <div className="min-w-52">
          <p className="font-medium text-slate-800">{p.programmeTitle}</p>
          <p className="text-xs text-slate-400">{p.programmeCode}</p>
        </div>
      ),
    },
    { key: 'amount', label: 'Amount', className: 'whitespace-nowrap font-medium', render: (p) => formatRM(p.amount) },
    { key: 'issueDate', label: 'Issued', className: 'whitespace-nowrap text-slate-500', render: (p) => formatDate(p.issueDate) },
    {
      key: 'receivedDate',
      label: 'Received',
      className: 'whitespace-nowrap text-slate-500',
      render: (p) => (p.receivedDate ? formatDate(p.receivedDate) : '—'),
    },
    { key: 'status', label: 'Status', render: (p) => <StatusBadge status={p.status} /> },
  ];

  return (
    <div>
      <Helmet>
        <title>Purchase Orders — MIMOS Academy PMS</title>
        <meta
          name="description"
          content="Client purchase orders securing programme delivery for MIMOS Academy — confirmed order book and pending POs."
        />
      </Helmet>

      <PageHeader
        title="Purchase Orders"
        description="Client POs that secure programmes after quotation acceptance — next step before delivery."
      >
        <Button className="bg-violet-600 hover:bg-violet-700" onClick={demoAction}>
          <Plus className="mr-2 h-4 w-4" /> Record PO
        </Button>
      </PageHeader>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total POs" value={purchaseOrders.length} icon={ClipboardList} tone="violet" hint="on record" />
        <StatCard title="Confirmed" value={confirmed} icon={CheckCircle2} tone="emerald" hint="in order book" />
        <StatCard title="Pending" value={pending} icon={Hourglass} tone="amber" hint="awaiting confirmation" />
        <StatCard title="Secured Order Book" value={formatRMCompact(securedOrderBook)} icon={Wallet} tone="blue" hint={`of ${formatRMCompact(totalValue)} total PO value`} />
      </div>

      <DataTable
        columns={columns}
        data={purchaseOrders}
        searchKeys={['poNo', 'clientName', 'programmeTitle', 'programmeCode']}
        searchPlaceholder="Search purchase orders…"
        filters={[{ key: 'status', label: 'Status', options: ['Confirmed', 'Pending', 'Closed', 'On Hold'] }]}
        emptyTitle="No purchase orders found"
        emptyDescription="No purchase orders match your current search or filters."
      />
    </div>
  );
}
