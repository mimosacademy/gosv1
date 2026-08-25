import React from 'react';
import { Helmet } from 'react-helmet';
import { toast } from 'sonner';
import PageHeader from '@/components/PageHeader';
import StatCard from '@/components/StatCard';
import DataTable from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import {
  formatDate,
  formatRM,
  formatRMCompact,
  openOpportunities,
  opportunities,
  pipelineValue,
  weightedPipelineValue,
} from '@/lib/mockData';
import { Download, Percent, Plus, Target, TrendingUp } from 'lucide-react';

const demoAction = () => toast.info('Demo build — opportunity records are read-only mock data.');

export default function OpportunitiesPage() {
  const won = opportunities.filter((o) => o.stage === 'Contract signed/PO issued').length;
  const lost = opportunities.filter((o) => o.stage === 'Lost/No-go').length;
  const winRate = won + lost > 0 ? Math.round((won / (won + lost)) * 100) : 0;

  const columns = [
    {
      key: 'title',
      label: 'Opportunity',
      render: (o) => (
        <div className="min-w-52">
          <p className="font-medium text-slate-800">{o.title}</p>
          <p className="text-xs text-slate-400">Sector: {o.sector}</p>
        </div>
      ),
    },
    { key: 'clientName', label: 'Client', className: 'whitespace-nowrap' },
    { key: 'sector', label: 'Sector', className: 'whitespace-nowrap' },
    { key: 'value', label: 'Forecast', className: 'whitespace-nowrap font-medium', render: (o) => formatRM(o.value) },
    { key: 'weighted', label: 'Weighted', className: 'whitespace-nowrap font-medium text-emerald-700', render: (o) => formatRM(o.weighted) },
    { key: 'stage', label: 'Status', render: (o) => <StatusBadge status={o.stage} /> },
    {
      key: 'probability',
      label: 'Probability',
      render: (o) => (
        <div className="flex w-24 items-center gap-2">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-violet-600" style={{ width: `${o.probability}%` }} />
          </div>
          <span className="text-xs font-medium text-slate-500">{o.probability}%</span>
        </div>
      ),
    },
    { key: 'expectedClose', label: 'Expected Close', className: 'whitespace-nowrap text-slate-500', render: (o) => formatDate(o.expectedClose) },
    { key: 'accountManager', label: 'Account Manager', className: 'whitespace-nowrap' },
  ];

  return (
    <div>
      <Helmet>
        <title>Opportunities — MIMOS Academy PMS</title>
        <meta name="description" content="Sales pipeline and opportunity tracking for MIMOS Academy training business." />
      </Helmet>

      <PageHeader title="Opportunities" description="First step in the programme flow — qualify demand before quotation.">
        <Button variant="outline" onClick={demoAction}>
          <Download className="mr-2 h-4 w-4" /> Export
        </Button>
        <Button className="bg-violet-600 hover:bg-violet-700" onClick={demoAction}>
          <Plus className="mr-2 h-4 w-4" /> New Opportunity
        </Button>
      </PageHeader>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Open Opportunities" value={openOpportunities.length} icon={Target} tone="violet" hint="in active pipeline" />
        <StatCard title="Pipeline Value" value={formatRMCompact(pipelineValue)} icon={TrendingUp} tone="blue" hint="unweighted total" />
        <StatCard title="Weighted Value" value={formatRMCompact(weightedPipelineValue)} icon={Percent} tone="emerald" hint="probability-adjusted" />
        <StatCard title="Win Rate" value={`${winRate}%`} icon={TrendingUp} tone="amber" hint={`${won} won · ${lost} lost YTD`} />
      </div>

      <DataTable
        columns={columns}
        data={opportunities}
        searchKeys={['title', 'clientName', 'accountManager', 'sector']}
        searchPlaceholder="Search opportunities…"
        filters={[
          { key: 'stage', label: 'Status', options: ['Early engagement', 'Qualified lead/Tender in progress', 'Proposal/Tender submitted', 'Negotiation stage', 'Verbal commitment', 'Contract signed/PO issued', 'Lost/No-go'] },
          { key: 'sector', label: 'Sector', options: ['Government', 'Private'] },
          { key: 'accountManager', label: 'Account Manager', options: [...new Set(opportunities.map((o) => o.accountManager))] },
        ]}
        emptyTitle="No opportunities found"
        emptyDescription="No opportunities match your current search or filters."
      />
    </div>
  );
}
