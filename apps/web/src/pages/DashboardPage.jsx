import React from 'react';
import { Helmet } from 'react-helmet';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import PageHeader from '@/components/PageHeader';
import StatCard from '@/components/StatCard';
import StatusBadge from '@/components/StatusBadge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { ROLES } from '@/lib/roles';
import {
  BUSINESS_FLOW,
  actionItems,
  formatDate,
  formatRM,
  formatRMCompact,
  funnelByStage,
  isOverdue,
  openOpportunities,
  pipelineValue,
  programmeCompletenessAvg,
  programmes,
  securedOrderBook,
  totals,
  trainingSessions,
  weightedPipelineValue,
} from '@/lib/mockData';
import {
  AlarmClock,
  Banknote,
  BookOpenCheck,
  ClipboardCheck,
  HandCoins,
  Hourglass,
  Target,
} from 'lucide-react';

function Widget({ title, subtitle, action, children, className = '' }) {
  return (
    <section className={`rounded-xl border bg-white shadow-sm ${className}`}>
      <header className="flex items-center justify-between border-b px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
          {subtitle && <p className="mt-0.5 text-xs text-slate-400">{subtitle}</p>}
        </div>
        {action}
      </header>
      <div className="p-5">{children}</div>
    </section>
  );
}

const rmTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-white px-3 py-2 text-xs shadow-md">
      <p className="font-semibold text-slate-800">{label}</p>
      <p className="mt-0.5 text-violet-700">{formatRM(payload[0].value)}</p>
    </div>
  );
};

export default function DashboardPage() {
  const { user } = useAuth();
  const firstName = (user?.name ?? 'there').split(' ')[0];

  const maxFunnelValue = Math.max(...funnelByStage.map((s) => s.value), 1);
  const inProgress = programmes.filter((p) => p.status === 'In Progress');
  const openActions = actionItems
    .filter((a) => a.status !== 'Completed')
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  const upcoming = trainingSessions
    .filter((t) => t.status === 'Scheduled')
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 5);

  return (
    <div>
      <Helmet>
        <title>Dashboard — MIMOS Academy PMS</title>
        <meta
          name="description"
          content="Programme-centric dashboard for MIMOS Academy: revenue, collection, forecast funnel, secured order book and programme completeness."
        />
      </Helmet>

      <PageHeader
        title={`Welcome back, ${firstName}`}
        description={`Signed in as ${ROLES[user?.role] ?? 'Viewer'} — programme lifecycle at a glance.`}
      />

      <div className="mb-6 overflow-x-auto rounded-xl border bg-white px-4 py-3 shadow-sm">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-slate-400">Programme business flow</p>
        <ol className="flex min-w-max items-center gap-1 text-xs font-medium text-slate-600">
          {BUSINESS_FLOW.map((step, i) => (
            <li key={step} className="flex items-center gap-1">
              <span className="rounded-full bg-violet-50 px-2.5 py-1 text-violet-800 ring-1 ring-inset ring-violet-100">{step}</span>
              {i < BUSINESS_FLOW.length - 1 && <span className="px-1 text-slate-300">→</span>}
            </li>
          ))}
        </ol>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Revenue" value={formatRMCompact(totals.revenue)} icon={Banknote} tone="violet" delta="+12.4%" hint="vs last quarter" />
        <StatCard title="Collection" value={formatRMCompact(totals.collected)} icon={HandCoins} tone="emerald" delta="+8.1%" hint="vs last quarter" />
        <StatCard title="Outstanding" value={formatRMCompact(totals.outstanding)} icon={Hourglass} tone="amber" hint={`${Math.round((totals.outstanding / totals.revenue) * 100)}% of billed revenue`} />
        <StatCard title="Overdue" value={formatRMCompact(totals.overdue)} icon={AlarmClock} tone="red" delta="3 invoices" deltaDirection="down" hint="require follow-up" />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Forecast Funnel" value={formatRMCompact(pipelineValue)} icon={Target} tone="blue" hint={`${openOpportunities.length} open opportunities`} />
        <StatCard title="Weighted Funnel" value={formatRMCompact(weightedPipelineValue)} icon={Target} tone="violet" hint="probability-adjusted" />
        <StatCard title="Secured Order Book" value={formatRMCompact(securedOrderBook)} icon={ClipboardCheck} tone="emerald" hint="confirmed client POs" />
        <StatCard title="Programme Completeness" value={`${programmeCompletenessAvg}%`} icon={BookOpenCheck} tone="amber" hint="avg delivery progress" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Widget
          title="Forecast Funnel"
          subtitle="Open opportunity value by stage"
          className="xl:col-span-2"
          action={
            <span className="inline-flex items-center gap-1 text-xs font-medium text-violet-600">
              <Target className="h-3.5 w-3.5" /> {openOpportunities.length} open
            </span>
          }
        >
          <div className="space-y-4">
            {funnelByStage.map((s) => (
              <div key={s.stage}>
                <div className="mb-1.5 flex items-baseline justify-between text-sm">
                  <span className="font-medium text-slate-700">
                    {s.stage}
                    <span className="ml-2 text-xs text-slate-400">{s.count} deals</span>
                  </span>
                  <span className="font-semibold text-slate-900">{formatRMCompact(s.value)}</span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${Math.max((s.value / maxFunnelValue) * 100, 4)}%`, backgroundColor: s.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Widget>

        <Widget title="Secured Order Book" subtitle="Top confirmed purchase orders">
          <p className="text-3xl font-bold tracking-tight text-slate-900">{formatRMCompact(securedOrderBook)}</p>
          <p className="mt-1 text-sm text-slate-500">Locked programme contract value</p>
          <ul className="mt-5 space-y-3">
            {programmes
              .filter((p) => p.contractValue)
              .sort((a, b) => b.contractValue - a.contractValue)
              .slice(0, 4)
              .map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-800">{p.code}</p>
                    <p className="truncate text-xs text-slate-400">{p.clientName}</p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-slate-900">{formatRMCompact(p.contractValue)}</span>
                </li>
              ))}
          </ul>
        </Widget>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Widget title="Weighted Funnel" subtitle={`Probability-adjusted — ${formatRMCompact(weightedPipelineValue)}`}>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelByStage} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="stage" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `${Math.round(v / 1000)}K`}
                />
                <Tooltip content={rmTooltip} cursor={{ fill: '#f5f3ff' }} />
                <Bar dataKey="weighted" radius={[6, 6, 0, 0]}>
                  {funnelByStage.map((s) => (
                    <Cell key={s.stage} fill={s.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Widget>

        <Widget title="Programme Completeness" subtitle={`${inProgress.length} programmes in delivery`}>
          <ul className="space-y-5">
            {inProgress.map((p) => (
              <li key={p.id}>
                <div className="mb-1.5 flex items-baseline justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-800">{p.title}</p>
                    <p className="text-xs text-slate-400">
                      {p.clientName} · {p.sessionsDelivered}/{p.sessionsPlanned} sessions
                    </p>
                  </div>
                  <span className="shrink-0 text-xs font-semibold text-violet-700">{p.progress}%</span>
                </div>
                <Progress value={p.progress} className="h-2 bg-slate-100 [&>div]:bg-violet-600" />
              </li>
            ))}
          </ul>
        </Widget>

        <Widget title="Upcoming Training Delivery" subtitle="Next scheduled sessions">
          <ul className="space-y-4">
            {upcoming.map((t) => (
              <li key={t.id} className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-lg bg-violet-50 text-violet-700">
                  <span className="text-sm font-bold leading-none">{new Date(t.date).getDate()}</span>
                  <span className="text-[9px] font-semibold uppercase">
                    {new Date(t.date).toLocaleDateString('en-MY', { month: 'short' })}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-800">{t.title}</p>
                  <p className="truncate text-xs text-slate-400">
                    {t.programmeCode} · {t.trainer}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Widget>
      </div>

      <Widget
        title="Open Action Items"
        subtitle={`${openActions.length} programme follow-ups`}
        className="mt-6"
      >
        <ul className="divide-y">
          {openActions.slice(0, 6).map((a) => {
            const overdue = isOverdue(a.dueDate, a.status);
            return (
              <li key={a.id} className="flex flex-wrap items-center gap-3 py-3 first:pt-0 last:pb-0">
                <StatusBadge status={a.priority} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-800">{a.title}</p>
                  <p className="truncate text-xs text-slate-400">
                    {a.programmeCode ? `${a.programmeCode} · ` : ''}
                    {a.relatedTo} · {a.owner}
                  </p>
                </div>
                <span className={`text-xs font-medium ${overdue ? 'text-red-600' : 'text-slate-500'}`}>
                  {overdue ? 'Overdue · ' : ''}
                  {formatDate(a.dueDate)}
                </span>
              </li>
            );
          })}
        </ul>
      </Widget>
    </div>
  );
}
