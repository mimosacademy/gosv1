import React from 'react';
import { Helmet } from 'react-helmet';
import { toast } from 'sonner';
import PageHeader from '@/components/PageHeader';
import StatCard from '@/components/StatCard';
import DataTable from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { participants } from '@/lib/mockData';
import { Building2, Download, Plus, UserCheck, Users } from 'lucide-react';

const demoAction = () => toast.info('Demo build — participant records are read-only mock data.');

export default function ParticipantsPage() {
  const attending = participants.filter((p) => p.status === 'Attending').length;
  const confirmed = participants.filter((p) => p.status === 'Confirmed').length;
  const companies = new Set(participants.map((p) => p.company)).size;

  const columns = [
    {
      key: 'name',
      label: 'Participant',
      render: (p) => (
        <div className="flex min-w-48 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-50 text-xs font-bold text-violet-700">
            {p.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}
          </div>
          <div>
            <p className="font-medium text-slate-800">{p.name}</p>
            <p className="text-xs text-slate-400">{p.email}</p>
          </div>
        </div>
      ),
    },
    { key: 'company', label: 'Company', className: 'whitespace-nowrap' },
    { key: 'programme', label: 'Programme', className: 'min-w-52' },
    { key: 'phone', label: 'Phone', className: 'whitespace-nowrap text-slate-500' },
    { key: 'status', label: 'Status', render: (p) => <StatusBadge status={p.status} /> },
  ];

  return (
    <div>
      <Helmet>
        <title>Participants — MIMOS Academy PMS</title>
        <meta name="description" content="Participant enrolment and attendance tracking for MIMOS Academy training programmes." />
      </Helmet>

      <PageHeader title="Participants" description="Enrolments across all training programmes.">
        <Button variant="outline" onClick={demoAction}>
          <Download className="mr-2 h-4 w-4" /> Export List
        </Button>
        <Button className="bg-violet-600 hover:bg-violet-700" onClick={demoAction}>
          <Plus className="mr-2 h-4 w-4" /> Register Participant
        </Button>
      </PageHeader>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Participants" value={participants.length} icon={Users} tone="violet" hint="on record" />
        <StatCard title="Attending" value={attending} icon={UserCheck} tone="blue" hint="in active sessions" />
        <StatCard title="Confirmed" value={confirmed} icon={UserCheck} tone="emerald" hint="for upcoming sessions" />
        <StatCard title="Companies" value={companies} icon={Building2} tone="amber" hint="represented" />
      </div>

      <DataTable
        columns={columns}
        data={participants}
        searchKeys={['name', 'email', 'company', 'programme']}
        searchPlaceholder="Search participants…"
        filters={[
          { key: 'status', label: 'Status', options: ['Confirmed', 'Attending', 'Completed', 'Waitlisted', 'Withdrawn'] },
          { key: 'programme', label: 'Programme', options: [...new Set(participants.map((p) => p.programme))] },
        ]}
        emptyTitle="No participants found"
        emptyDescription="No participants match your current search or filters."
      />
    </div>
  );
}
