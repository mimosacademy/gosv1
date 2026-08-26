import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { toast } from 'sonner';
import PageHeader from '@/components/PageHeader';
import StatCard from '@/components/StatCard';
import DataTable from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { list, subscribe } from '@/lib/pmsRepository';
import { Building2, Download, Plus, UserCheck, Users } from 'lucide-react';

const mapClient = (c) => {
  const contact = (c.client_contact || [])[0] || {};
  return {
    id: c.id,
    name: c.company_name || 'Unnamed client',
    location: c.address || '—',
    since: c.created_at ? new Date(c.created_at).getFullYear() : '—',
    industry: c.sector?.name || '—',
    contactPerson: contact.full_name || '—',
    email: contact.email || '—',
    phone: contact.phone || '—',
    status: c.is_active ? 'Active' : 'Inactive',
  };
};

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const result = await list('client', { select: '*,sector(name),client_contact(*)', pageSize: 500, orderBy: 'company_name', ascending: true });
      setClients(result.data.map(mapClient));
    } catch (error) {
      toast.error(`Unable to load clients: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    return subscribe('client', load);
  }, []);

  const industries = useMemo(() => new Set(clients.map((c) => c.industry).filter(Boolean)).size, [clients]);
  const active = clients.filter((c) => c.status === 'Active').length;

  const columns = [
    { key: 'name', label: 'Client', render: (c) => <div><p className="font-medium text-slate-800">{c.name}</p><p className="text-xs text-slate-400">{c.location} · since {c.since}</p></div> },
    { key: 'industry', label: 'Industry', className: 'whitespace-nowrap' },
    { key: 'contactPerson', label: 'Contact Person', className: 'whitespace-nowrap' },
    { key: 'email', label: 'Email', className: 'whitespace-nowrap text-slate-500' },
    { key: 'phone', label: 'Phone', className: 'whitespace-nowrap text-slate-500' },
    { key: 'status', label: 'Status', render: (c) => <StatusBadge status={c.status} /> },
  ];

  return <div>
    <Helmet><title>Clients — MIMOS Academy PMS</title><meta name="description" content="Live client records from Supabase." /></Helmet>
    <PageHeader title="Clients" description="Corporate client accounts and key contacts.">
      <Button variant="outline" onClick={() => toast.info('Export is available through the reporting layer.')}><Download className="mr-2 h-4 w-4" /> Export</Button>
      <Button className="bg-violet-600 hover:bg-violet-700" onClick={() => toast.info('Client creation form will use the Supabase CRUD repository.')}><Plus className="mr-2 h-4 w-4" /> Add Client</Button>
    </PageHeader>
    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard title="Total Clients" value={clients.length} icon={Building2} tone="violet" hint={loading ? 'loading…' : 'live'} />
      <StatCard title="Active Accounts" value={active} icon={UserCheck} tone="emerald" hint="active" />
      <StatCard title="Inactive" value={clients.length - active} icon={Users} tone="amber" hint="not active" />
      <StatCard title="Industries" value={industries} icon={Building2} tone="blue" hint="sectors covered" />
    </div>
    <DataTable columns={columns} data={clients} searchKeys={['name','contactPerson','email','industry']} searchPlaceholder="Search clients…" filters={[{key:'status',label:'Status',options:['Active','Inactive']},{key:'industry',label:'Industry',options:[...new Set(clients.map(c=>c.industry).filter(Boolean))]}]} emptyTitle="No clients found" emptyDescription="No client records exist in Supabase yet." />
  </div>;
}
