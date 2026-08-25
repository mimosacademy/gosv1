import React from 'react';
import { Helmet } from 'react-helmet';
import { toast } from 'sonner';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import PageHeader from '@/components/PageHeader';
import StatCard from '@/components/StatCard';
import { Button } from '@/components/ui/button';
import {
  formatRM,
  formatRMCompact,
  invoices,
  monthlyFinancials,
  pipelineValue,
} from '@/lib/mockData';
import { Banknote, Download, HandCoins, Percent, Target } from 'lucide-react';

const STATUS_COLORS = {
  Paid: '#16a34a',
  Partial: '#d97706',
  Unpaid: '#94a3b8',
  Overdue: '#dc2626',
};

const chartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-white px-3 py-2 text-xs shadow-md">
      {label && <p className="mb-1 font-semibold text-slate-800">{label}</p>}
      {payload.map((p) => (
        <p key={p.dataKey ?? p.name} className="text-slate-600">
          <span className="mr-1 inline-block h-2 w-2 rounded-full" style={{ backgroundColor: p.color ?? p.payload?.fill }} />
          {p.name}: <span className="font-semibold text-slate-900">{formatRM(p.value)}</span>
        </p>
      ))}
    </div>
  );
};

export default function ReportsPage() {
  const ytdRevenue = monthlyFinancials.reduce((s, m) => s + m.revenue, 0);
  const ytdCollection = monthlyFinancials.reduce((s, m) => s + m.collection, 0);
  const collectionRate = Math.round((ytdCollection / ytdRevenue) * 100);

  const invoiceStatusData = ['Paid', 'Partial', 'Unpaid', 'Overdue'].map((status) => ({
    name: status,
    value: invoices.filter((i) => i.status === status).reduce((s, i) => s + (i.amount - i.paidAmount), 0) || invoices.filter((i) => i.status === status).length,
    count: invoices.filter((i) => i.status === status).length,
  }));

  const topClients = Object.entries(
    invoices.reduce((acc, i) => {
      acc[i.clientName] = (acc[i.clientName] ?? 0) + i.amount;
      return acc;
    }, {}),
  )
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);
  const maxClientValue = topClients[0]?.value ?? 1;

  const exportToast = () => toast.success('Report export queued — a download link will be emailed to you (demo).');

  return (
    <div>
      <Helmet>
        <title>Reports — MIMOS Academy PMS</title>
        <meta name="description" content="Management reporting for MIMOS Academy — revenue vs collection, receivables ageing and top clients." />
      </Helmet>

      <PageHeader title="Programme Reports" description="Programme revenue, collection and order-book analytics.">
        <Button variant="outline" onClick={exportToast}>
          <Download className="mr-2 h-4 w-4" /> Export PDF
        </Button>
        <Button className="bg-violet-600 hover:bg-violet-700" onClick={exportToast}>
          <Download className="mr-2 h-4 w-4" /> Export Excel
        </Button>
      </PageHeader>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="YTD Revenue" value={formatRMCompact(ytdRevenue)} icon={Banknote} tone="violet" hint="Jan – Aug 2026" />
        <StatCard title="YTD Collection" value={formatRMCompact(ytdCollection)} icon={HandCoins} tone="emerald" hint="Jan – Aug 2026" />
        <StatCard title="Collection Rate" value={`${collectionRate}%`} icon={Percent} tone="blue" hint="of billed revenue" />
        <StatCard title="Open Pipeline" value={formatRMCompact(pipelineValue)} icon={Target} tone="amber" hint="unweighted opportunities" />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <section className="rounded-xl border bg-white shadow-sm xl:col-span-2">
          <header className="border-b px-5 py-4">
            <h2 className="text-sm font-semibold text-slate-900">Revenue vs Collection</h2>
            <p className="mt-0.5 text-xs text-slate-400">Monthly billed revenue against payments collected, 2026</p>
          </header>
          <div className="h-80 p-5">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyFinancials} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} tickFormatter={(v) => `${Math.round(v / 1000)}K`} />
                <Tooltip content={chartTooltip} cursor={{ fill: '#f5f3ff' }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="revenue" name="Revenue" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                <Bar dataKey="collection" name="Collection" fill="#16a34a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-xl border bg-white shadow-sm">
          <header className="border-b px-5 py-4">
            <h2 className="text-sm font-semibold text-slate-900">Receivables by Status</h2>
            <p className="mt-0.5 text-xs text-slate-400">Invoice count by payment status</p>
          </header>
          <div className="h-80 p-5">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={invoiceStatusData}
                  dataKey="count"
                  nameKey="name"
                  innerRadius="55%"
                  outerRadius="80%"
                  paddingAngle={3}
                  strokeWidth={0}
                >
                  {invoiceStatusData.map((s) => (
                    <Cell key={s.name} fill={STATUS_COLORS[s.name]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [`${value} invoices`, name]}
                  contentStyle={{ borderRadius: 8, fontSize: 12 }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <section className="rounded-xl border bg-white shadow-sm">
          <header className="border-b px-5 py-4">
            <h2 className="text-sm font-semibold text-slate-900">Top Clients by Billed Value</h2>
            <p className="mt-0.5 text-xs text-slate-400">Based on invoices issued in 2026</p>
          </header>
          <ul className="space-y-4 p-5">
            {topClients.map((c) => (
              <li key={c.name}>
                <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
                  <span className="truncate font-medium text-slate-700">{c.name}</span>
                  <span className="shrink-0 font-semibold text-slate-900">{formatRMCompact(c.value)}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-violet-600" style={{ width: `${(c.value / maxClientValue) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="overflow-hidden rounded-xl border bg-white shadow-sm xl:col-span-2">
          <header className="border-b px-5 py-4">
            <h2 className="text-sm font-semibold text-slate-900">Monthly Breakdown</h2>
            <p className="mt-0.5 text-xs text-slate-400">Revenue, collection and variance by month</p>
          </header>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50/80 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3">Month</th>
                  <th className="px-5 py-3">Revenue</th>
                  <th className="px-5 py-3">Collection</th>
                  <th className="px-5 py-3">Variance</th>
                  <th className="px-5 py-3">Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {monthlyFinancials.map((m) => {
                  const rate = Math.round((m.collection / m.revenue) * 100);
                  return (
                    <tr key={m.month} className="hover:bg-violet-50/40">
                      <td className="px-5 py-3 font-medium text-slate-800">{m.month} 2026</td>
                      <td className="px-5 py-3 text-slate-600">{formatRM(m.revenue)}</td>
                      <td className="px-5 py-3 text-slate-600">{formatRM(m.collection)}</td>
                      <td className={`px-5 py-3 font-medium ${m.collection - m.revenue < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                        {formatRM(m.collection - m.revenue)}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${rate >= 95 ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' : rate >= 85 ? 'bg-amber-50 text-amber-700 ring-amber-200' : 'bg-red-50 text-red-700 ring-red-200'}`}>
                          {rate}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
