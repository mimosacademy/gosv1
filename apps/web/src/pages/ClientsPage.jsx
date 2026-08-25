import React from 'react';
import { Helmet } from 'react-helmet';
import { toast } from 'sonner';
import PageHeader from '@/components/PageHeader';
import StatCard from '@/components/StatCard';
import DataTable from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { clients } from '@/lib/mockData';
import { Building2, Download, Plus, UserCheck, Users } from 'lucide-react';

const demoAction = () => toast.info('Demo build — client records are read-only mock data.');

export default function ClientsPage() {
  const active = clients.filter((c) => c.status === 'Active').length;
  const prospects = clients.filter((c) => c.status === 'Prospect').length;
  const industries = new Set(clients.map((c) => c.industry)).size;

  const columns = [
    {
      key: 'name',
      label: 'Client',
      render: (c) => (
        <div className="flex min-w-52 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-xs font-bold text-violet-700">
            {c.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}
          </div>
          <div>
            <p className="font-medium text-slate-800">{c.name}</p>
            <p className="text-xs text-slate-400">{c.location} · since {c.since}</p>
          </div>
        </div>
      ),
    },
    { key: 'industry', label: 'Industry', className: 'whitespace-nowrap' },
    { key: 'contactPerson', label: 'Contact Person', className: 'whitespace-nowrap' },
    { key: 'email', label: 'Email', className: 'whitespace-nowrap text-slate-500' },
    { key: 'phone', label: 'Phone', className: 'whitespace-nowrap text-slate-500' },
    { key: 'status', label: 'Status', render: (c) => <StatusBadge status={c.status} /> },
  ];

  return (
    <div>
      <Helmet>
        <title>Clients — MIMOS Academy PMS</title>
        <meta name="description" content="Client directory and engagement records for MIMOS Academy corporate training accounts." />
      </Helmet>

      <PageHeader title="Clients" description="Corporate client accounts and key contacts.">
        <Button variant="outline" onClick={demoAction}>
          <Download className="mr-2 h-4 w-4" /> Export
        </Button>
        <Button className="bg-violet-600 hover:bg-violet-700" onClick={demoAction}>
          <Plus className="mr-2 h-4 w-4" /> Add Client
        </Button>
      </PageHeader>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Clients" value={clients.length} icon={Building2} tone="violet" hint="on record" />
        <StatCard title="Active Accounts" value={active} icon={UserCheck} tone="emerald" hint="with engagements" />
        <StatCard title="Prospects" value={prospects} icon={Users} tone="amber" hint="in qualification" />
        <StatCard title="Industries" value={industries} icon={Building2} tone="blue" hint="sectors covered" />
      </div>

      <DataTable
        columns={columns}
        data={clients}
        searchKeys={['name', 'contactPerson', 'email', 'industry']}
        searchPlaceholder="Search clients…"
        filters={[
          { key: 'status', label: 'Status', options: ['Active', 'Prospect', 'Inactive'] },
          { key: 'industry', label: 'Industry', options: [...new Set(clients.map((c) => c.industry))] },
        ]}
        emptyTitle="No clients found"
        emptyDescription="No client accounts match your current search or filters."
      />
    </div>
  );
}
