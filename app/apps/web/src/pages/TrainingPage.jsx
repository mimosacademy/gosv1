import React from 'react';
import { Helmet } from 'react-helmet';
import { toast } from 'sonner';
import PageHeader from '@/components/PageHeader';
import StatCard from '@/components/StatCard';
import DataTable from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { formatDate, trainingSessions } from '@/lib/mockData';
import { CalendarCheck, CalendarClock, Plus, UserCheck, XCircle } from 'lucide-react';

const demoAction = () => toast.info('Demo build — training sessions are read-only mock data.');

export default function TrainingPage() {
  const scheduled = trainingSessions.filter((t) => t.status === 'Scheduled').length;
  const completed = trainingSessions.filter((t) => t.status === 'Completed').length;
  const cancelled = trainingSessions.filter((t) => t.status === 'Cancelled').length;
  const trainers = new Set(trainingSessions.map((t) => t.trainer)).size;

  const columns = [
    {
      key: 'title',
      label: 'Session',
      render: (t) => (
        <div className="min-w-56">
          <p className="font-medium text-slate-800">{t.title}</p>
          <p className="text-xs text-slate-400">{t.programme} · {t.programmeCode}</p>
        </div>
      ),
    },
    { key: 'date', label: 'Date', className: 'whitespace-nowrap text-slate-500', render: (t) => formatDate(t.date) },
    { key: 'time', label: 'Time', className: 'whitespace-nowrap text-slate-500' },
    { key: 'trainer', label: 'Trainer', className: 'whitespace-nowrap' },
    { key: 'venue', label: 'Venue', className: 'whitespace-nowrap text-slate-500' },
    { key: 'mode', label: 'Mode', render: (t) => <StatusBadge status={t.mode} /> },
    { key: 'status', label: 'Status', render: (t) => <StatusBadge status={t.status} /> },
  ];

  return (
    <div>
      <Helmet>
        <title>Training Delivery — MIMOS Academy PMS</title>
        <meta name="description" content="Training session scheduling for MIMOS Academy — sessions, trainers, venues and delivery modes." />
      </Helmet>

      <PageHeader title="Training Delivery" description="Session delivery under each secured programme.">
        <Button className="bg-violet-600 hover:bg-violet-700" onClick={demoAction}>
          <Plus className="mr-2 h-4 w-4" /> Schedule Session
        </Button>
      </PageHeader>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Scheduled Sessions" value={scheduled} icon={CalendarClock} tone="violet" hint="upcoming deliveries" />
        <StatCard title="Completed" value={completed} icon={CalendarCheck} tone="emerald" hint="this term" />
        <StatCard title="Active Trainers" value={trainers} icon={UserCheck} tone="blue" hint="assigned to sessions" />
        <StatCard title="Cancelled" value={cancelled} icon={XCircle} tone="red" hint="requires rescheduling" />
      </div>

      <DataTable
        columns={columns}
        data={trainingSessions}
        searchKeys={['title', 'programme', 'programmeCode', 'trainer', 'venue']}
        searchPlaceholder="Search sessions…"
        filters={[
          { key: 'status', label: 'Status', options: ['Scheduled', 'Completed', 'Cancelled'] },
          { key: 'mode', label: 'Mode', options: ['In-Person', 'Virtual', 'Hybrid'] },
        ]}
        emptyTitle="No sessions found"
        emptyDescription="No training sessions match your current search or filters."
      />
    </div>
  );
}
