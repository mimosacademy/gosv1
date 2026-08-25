import React from 'react';
import { Helmet } from 'react-helmet';
import { toast } from 'sonner';
import PageHeader from '@/components/PageHeader';
import StatCard from '@/components/StatCard';
import StatusBadge from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { NAV_SECTIONS, ROLES } from '@/lib/roles';
import { Check, Minus, Plus, Settings, ShieldCheck, UserCog, Users } from 'lucide-react';

const STAFF_USERS = [
  { name: 'Aisha Rahman', email: 'superadmin@mimos.academy', role: 'super_admin', status: 'Active', lastLogin: '25 Aug 2026, 08:41' },
  { name: 'Daniel Lim', email: 'manager@mimos.academy', role: 'manager', status: 'Active', lastLogin: '25 Aug 2026, 09:02' },
  { name: 'Priya Nair', email: 'finance@mimos.academy', role: 'finance', status: 'Active', lastLogin: '24 Aug 2026, 17:15' },
  { name: 'Ahmad Faizal', email: 'sales@mimos.academy', role: 'sales', status: 'Active', lastLogin: '25 Aug 2026, 08:55' },
  { name: 'Sarah Tan', email: 'pic@mimos.academy', role: 'programme_pic', status: 'Active', lastLogin: '24 Aug 2026, 16:40' },
  { name: 'Dr. Kumar Selvam', email: 'trainer@mimos.academy', role: 'trainer', status: 'Active', lastLogin: '23 Aug 2026, 11:20' },
  { name: 'Michelle Wong', email: 'viewer@mimos.academy', role: 'viewer', status: 'Active', lastLogin: '22 Aug 2026, 14:05' },
];

const ROLE_BADGE_TONES = {
  super_admin: 'bg-violet-600 text-white',
  manager: 'bg-violet-100 text-violet-800',
  finance: 'bg-emerald-50 text-emerald-700',
  sales: 'bg-blue-50 text-blue-700',
  programme_pic: 'bg-amber-50 text-amber-700',
  trainer: 'bg-cyan-50 text-cyan-700',
  viewer: 'bg-slate-100 text-slate-600',
};

const MODULES = NAV_SECTIONS.flatMap((s) => s.items.map((i) => ({ label: i.label, roles: i.roles })));

export default function AdministrationPage() {
  const demoAction = () => toast.info('Demo build — administration changes are disabled.');

  return (
    <div>
      <Helmet>
        <title>Administration — MIMOS Academy PMS</title>
        <meta name="description" content="System administration for MIMOS Academy PMS — user accounts, role-based access control and module permissions." />
      </Helmet>

      <PageHeader title="Administration" description="User accounts, roles and system access control.">
        <Button className="bg-violet-600 hover:bg-violet-700" onClick={demoAction}>
          <Plus className="mr-2 h-4 w-4" /> Add User
        </Button>
      </PageHeader>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Staff Accounts" value={STAFF_USERS.length} icon={Users} tone="violet" hint="provisioned users" />
        <StatCard title="Roles Defined" value={Object.keys(ROLES).length} icon={ShieldCheck} tone="blue" hint="access profiles" />
        <StatCard title="Modules" value={MODULES.length} icon={Settings} tone="amber" hint="in the navigation" />
        <StatCard title="Active Sessions" value={STAFF_USERS.length} icon={UserCog} tone="emerald" hint="last 7 days" />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        {/* Users table */}
        <section className="overflow-hidden rounded-xl border bg-white shadow-sm xl:col-span-3">
          <header className="border-b px-5 py-4">
            <h2 className="text-sm font-semibold text-slate-900">User Accounts</h2>
            <p className="mt-0.5 text-xs text-slate-400">Staff with access to the PMS</p>
          </header>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50/80 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3">User</th>
                  <th className="px-5 py-3">Role</th>
                  <th className="px-5 py-3">Last Login</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {STAFF_USERS.map((u) => (
                  <tr key={u.email} className="hover:bg-violet-50/40">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-50 text-xs font-bold text-violet-700">
                          {u.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">{u.name}</p>
                          <p className="text-xs text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${ROLE_BADGE_TONES[u.role]}`}>
                        {ROLES[u.role]}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-slate-500">{u.lastLogin}</td>
                    <td className="px-5 py-3"><StatusBadge status={u.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Permission matrix */}
        <section className="overflow-hidden rounded-xl border bg-white shadow-sm xl:col-span-2">
          <header className="border-b px-5 py-4">
            <h2 className="text-sm font-semibold text-slate-900">Role Permission Matrix</h2>
            <p className="mt-0.5 text-xs text-slate-400">Module access by role</p>
          </header>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50/80 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3">Module</th>
                  {Object.values(ROLES).map((r) => (
                    <th key={r} className="px-2 py-3 text-center" title={r}>
                      {r.split(' ').map((w) => w[0]).join('')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {MODULES.map((m) => (
                  <tr key={m.label} className="hover:bg-violet-50/40">
                    <td className="whitespace-nowrap px-5 py-2.5 font-medium text-slate-700">{m.label}</td>
                    {Object.keys(ROLES).map((roleKey) => (
                      <td key={roleKey} className="px-2 py-2.5 text-center">
                        {m.roles.includes(roleKey) ? (
                          <Check className="mx-auto h-4 w-4 text-emerald-600" strokeWidth={2.2} />
                        ) : (
                          <Minus className="mx-auto h-4 w-4 text-slate-300" strokeWidth={2.2} />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="border-t px-5 py-3 text-xs text-slate-400">
            Column headers use role initials — hover a header to see the full role name.
          </p>
        </section>
      </div>
    </div>
  );
}
