import React, { useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import StatusBadge from '@/components/StatusBadge';
import {
  ArrowLeft,
  Building2,
  FileText,
  ClipboardList,
  Receipt,
  CreditCard,
  BarChart3,
  Users,
  CheckSquare,
  FolderOpen,
  History,
  Plus,
  Download,
  CalendarRange,
  GraduationCap,
  Mail,
  Phone,
  MapPin,
  TrendingUp,
  Star,
  CheckCircle2,
  Circle,
  ArrowRight,
} from 'lucide-react';
import {
  actionItems,
  auditHistory,
  clientContacts,
  clients,
  documents,
  formatDate,
  formatRM,
  invoices,
  payments,
  participants,
  programmes,
  purchaseOrders,
  quotations,
  trainingSessions,
  trainingStatistics,
  BUSINESS_FLOW,
} from '@/lib/mockData';

const demo = () => toast.info('Demo build — records are read-only mock data.');

function Th({ children, className }) {
  return <th className={`px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 ${className || ''}`}>{children}</th>;
}
function Td({ children, className }) {
  return <td className={`px-3 py-2.5 text-sm text-slate-700 ${className || ''}`}>{children}</td>;
}

function SimpleTable({ headers, rows, empty }) {
  if (!rows.length) return <p className="py-8 text-center text-sm text-slate-400">{empty || 'No records linked to this programme yet.'}</p>;
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="w-full text-sm">
        <thead className="border-b border-slate-200 bg-slate-50">
          <tr>{headers.map((h, i) => <Th key={i}>{h}</Th>)}</tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((r, i) => <tr key={i} className="hover:bg-slate-50/60">{r}</tr>)}
        </tbody>
      </table>
    </div>
  );
}

function MiniStat({ label, value, icon: Icon, tone }) {
  const tones = {
    violet: 'text-violet-600 bg-violet-50',
    blue: 'text-blue-600 bg-blue-50',
    emerald: 'text-emerald-600 bg-emerald-50',
    amber: 'text-amber-600 bg-amber-50',
    slate: 'text-slate-600 bg-slate-100',
  };
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-3">
        <div className={`flex h-9 w-9 items-center justify-center rounded-md ${tones[tone] || tones.slate}`}>
          <Icon className="h-4 w-4" strokeWidth={1.8} />
        </div>
        <div className="min-w-0">
          <p className="truncate text-lg font-bold text-slate-900">{value}</p>
          <p className="text-xs text-slate-500">{label}</p>
        </div>
      </div>
    </div>
  );
}

function FlowStep({ label, active }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`flex h-7 w-7 items-center justify-center rounded-full ${active ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
        {active ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-3.5 w-3.5" />}
      </div>
      <span className={`text-xs font-medium ${active ? 'text-slate-800' : 'text-slate-400'}`}>{label}</span>
    </div>
  );
}

function SectionCard({ title, action, children }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wide text-slate-700">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}

export default function ProgrammeDetailPage() {
  const { id } = useParams();
  const programme = programmes.find((p) => p.id === id);

  const data = useMemo(() => {
    if (!programme) return null;
    const client = clients.find((c) => c.id === programme.client) ?? null;
    const contacts = clientContacts.filter((c) => c.client === programme.client);
    const quotes = quotations.filter((q) => q.programmeId === programme.id);
    const pos = purchaseOrders.filter((p) => p.programmeId === programme.id);
    const invs = invoices.filter((i) => i.programmeId === programme.id);
    const pays = payments.filter((p) => p.programmeId === programme.id);
    const sessions = trainingSessions.filter((t) => t.programmeId === programme.id);
    const stats = trainingStatistics.find((s) => s.programmeId === programme.id) ?? null;
    const pax = participants.filter((p) => p.programmeId === programme.id);
    const actions = actionItems.filter((a) => a.programmeId === programme.id);
    const docs = documents.filter((d) => d.programmeId === programme.id);
    const audit = auditHistory.filter((a) => a.programmeId === programme.id);
    const opportunity = programme.opportunityId
      ? quotations.find((q) => q.id === programme.quotationId)
      : null;
    return { client, contacts, quotes, pos, invs, pays, sessions, stats, pax, actions, docs, audit, opportunity };
  }, [programme]);

  if (!programme || !data) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <GraduationCap className="h-10 w-10 text-slate-300" strokeWidth={1.5} />
        <h2 className="mt-4 text-xl font-bold text-slate-900">Programme not found</h2>
        <p className="mt-2 text-sm text-slate-500">The programme you are looking for does not exist or has been removed.</p>
        <Button asChild className="mt-6 bg-violet-600 hover:bg-violet-700">
          <Link to="/programmes">Back to Programmes</Link>
        </Button>
      </div>
    );
  }

  const collected = data.pays.filter((p) => p.status === 'Completed').reduce((s, p) => s + p.amount, 0);
  const invoiced = data.invs.reduce((s, i) => s + i.amount, 0);
  const openActions = data.actions.filter((a) => a.status !== 'Completed').length;

  // Business flow progression
  const flowState = {
    Opportunity: !!programme.opportunityId,
    Quotation: data.quotes.length > 0,
    'Purchase Order': data.pos.length > 0,
    Programme: true,
    'Training Delivery': data.sessions.length > 0,
    Invoice: data.invs.length > 0,
    'Payment Collection': data.pays.length > 0,
  };

  return (
    <div>
      <Helmet>
        <title>{programme.code} — Programme Hub · MIMOS Academy PMS</title>
        <meta name="description" content={`${programme.title} — programme detail with client, quotations, POs, invoices, payments, training, participants, documents and audit history.`} />
      </Helmet>

      {/* Header */}
      <div className="mb-6">
        <Link to="/programmes" className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-violet-700">
          <ArrowLeft className="h-4 w-4" /> Back to Programmes
        </Link>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="rounded-md bg-violet-100 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-violet-700">{programme.code}</span>
              <StatusBadge status={programme.status} />
            </div>
            <h1 className="mt-2 text-2xl font-bold text-slate-900">{programme.title}</h1>
            <p className="mt-1 text-sm text-slate-500">
              {programme.category} · <Link to="/clients" className="text-violet-700 hover:underline">{programme.clientName}</Link> · PIC {programme.pic} · Trainer {programme.trainer}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={demo}>
              <Download className="mr-2 h-4 w-4" /> Export
            </Button>
            <Button className="bg-violet-600 hover:bg-violet-700" onClick={demo}>
              <Plus className="mr-2 h-4 w-4" /> Add Record
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="flex h-auto w-full flex-wrap gap-1 bg-slate-100 p-1">
          <TabsTrigger value="overview" className="data-[state=active]:bg-white">Overview</TabsTrigger>
          <TabsTrigger value="client" className="data-[state=active]:bg-white">Client</TabsTrigger>
          <TabsTrigger value="quotations" className="data-[state=active]:bg-white">Quotations</TabsTrigger>
          <TabsTrigger value="purchase-orders" className="data-[state=active]:bg-white">Purchase Orders</TabsTrigger>
          <TabsTrigger value="invoices" className="data-[state=active]:bg-white">Invoices</TabsTrigger>
          <TabsTrigger value="payments" className="data-[state=active]:bg-white">Payments</TabsTrigger>
          <TabsTrigger value="training" className="data-[state=active]:bg-white">Training Statistics</TabsTrigger>
          <TabsTrigger value="participants" className="data-[state=active]:bg-white">Participants</TabsTrigger>
          <TabsTrigger value="action-items" className="data-[state=active]:bg-white">Action Items</TabsTrigger>
          <TabsTrigger value="documents" className="data-[state=active]:bg-white">Documents</TabsTrigger>
          <TabsTrigger value="audit" className="data-[state=active]:bg-white">Audit History</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="mt-6 space-y-6">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <MiniStat label="Contract Value" value={formatRM(programme.contractValue)} icon={ClipboardList} tone="violet" />
            <MiniStat label="Invoiced" value={formatRM(invoiced)} icon={Receipt} tone="blue" />
            <MiniStat label="Collected" value={formatRM(collected)} icon={CreditCard} tone="emerald" />
            <MiniStat label="Open Action Items" value={openActions} icon={CheckSquare} tone="amber" />
          </div>

          <SectionCard title="Business Flow Progression">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-4">
              {BUSINESS_FLOW.map((step, i) => (
                <React.Fragment key={step}>
                  <FlowStep label={step} active={flowState[step]} />
                  {i < BUSINESS_FLOW.length - 1 && <ArrowRight className="h-4 w-4 text-slate-300" />}
                </React.Fragment>
              ))}
            </div>
          </SectionCard>

          <div className="grid gap-6 lg:grid-cols-3">
            <SectionCard title="Programme Details">
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between"><dt className="text-slate-500">Code</dt><dd className="font-medium text-slate-800">{programme.code}</dd></div>
                <div className="flex justify-between"><dt className="text-slate-500">Category</dt><dd className="font-medium text-slate-800">{programme.category}</dd></div>
                <div className="flex justify-between"><dt className="text-slate-500">Venue</dt><dd className="font-medium text-slate-800">{programme.venue}</dd></div>
                <div className="flex justify-between"><dt className="text-slate-500">Schedule</dt><dd className="font-medium text-slate-800">{formatDate(programme.startDate)} – {formatDate(programme.endDate)}</dd></div>
                <div className="flex justify-between"><dt className="text-slate-500">PIC</dt><dd className="font-medium text-slate-800">{programme.pic}</dd></div>
                <div className="flex justify-between"><dt className="text-slate-500">Trainer</dt><dd className="font-medium text-slate-800">{programme.trainer}</dd></div>
                <div className="flex justify-between"><dt className="text-slate-500">Participants</dt><dd className="font-medium text-slate-800">{programme.participants}</dd></div>
              </dl>
            </SectionCard>

            <SectionCard title="Delivery Completeness">
              <div className="space-y-4">
                <div>
                  <div className="mb-1.5 flex justify-between text-sm">
                    <span className="text-slate-500">Programme progress</span>
                    <span className="font-semibold text-slate-800">{programme.progress}%</span>
                  </div>
                  <Progress value={programme.progress} className="h-2.5 bg-slate-100 [&>div]:bg-violet-600" />
                </div>
                <div>
                  <div className="mb-1.5 flex justify-between text-sm">
                    <span className="text-slate-500">Sessions delivered</span>
                    <span className="font-semibold text-slate-800">{programme.sessionsDelivered} / {programme.sessionsPlanned}</span>
                  </div>
                  <Progress value={(programme.sessionsDelivered / programme.sessionsPlanned) * 100} className="h-2.5 bg-slate-100 [&>div]:bg-blue-500" />
                </div>
                {data.stats && (
                  <div>
                    <div className="mb-1.5 flex justify-between text-sm">
                      <span className="text-slate-500">Attendance rate</span>
                      <span className="font-semibold text-slate-800">{data.stats.attendanceRate}%</span>
                    </div>
                    <Progress value={data.stats.attendanceRate} className="h-2.5 bg-slate-100 [&>div]:bg-emerald-500" />
                  </div>
                )}
              </div>
            </SectionCard>

            <SectionCard title="Linked Records">
              <ul className="space-y-2.5 text-sm">
                <li className="flex items-center justify-between"><span className="flex items-center gap-2 text-slate-600"><FileText className="h-4 w-4 text-slate-400" /> Quotations</span><span className="font-semibold text-slate-800">{data.quotes.length}</span></li>
                <li className="flex items-center justify-between"><span className="flex items-center gap-2 text-slate-600"><ClipboardList className="h-4 w-4 text-slate-400" /> Purchase Orders</span><span className="font-semibold text-slate-800">{data.pos.length}</span></li>
                <li className="flex items-center justify-between"><span className="flex items-center gap-2 text-slate-600"><Receipt className="h-4 w-4 text-slate-400" /> Invoices</span><span className="font-semibold text-slate-800">{data.invs.length}</span></li>
                <li className="flex items-center justify-between"><span className="flex items-center gap-2 text-slate-600"><CreditCard className="h-4 w-4 text-slate-400" /> Payments</span><span className="font-semibold text-slate-800">{data.pays.length}</span></li>
                <li className="flex items-center justify-between"><span className="flex items-center gap-2 text-slate-600"><CalendarRange className="h-4 w-4 text-slate-400" /> Training Sessions</span><span className="font-semibold text-slate-800">{data.sessions.length}</span></li>
                <li className="flex items-center justify-between"><span className="flex items-center gap-2 text-slate-600"><Users className="h-4 w-4 text-slate-400" /> Participants</span><span className="font-semibold text-slate-800">{data.pax.length}</span></li>
                <li className="flex items-center justify-between"><span className="flex items-center gap-2 text-slate-600"><FolderOpen className="h-4 w-4 text-slate-400" /> Documents</span><span className="font-semibold text-slate-800">{data.docs.length}</span></li>
              </ul>
            </SectionCard>
          </div>
        </TabsContent>

        {/* Client */}
        <TabsContent value="client" className="mt-6">
          {data.client ? (
            <div className="grid gap-6 lg:grid-cols-2">
              <SectionCard title="Client Profile" action={<Button asChild variant="ghost" size="sm" className="text-violet-700"><Link to="/clients">View Directory</Link></Button>}>
                <dl className="space-y-3 text-sm">
                  <div className="flex items-center gap-2"><Building2 className="h-4 w-4 text-slate-400" /><span className="font-bold text-slate-900">{data.client.name}</span></div>
                  <div className="flex items-center gap-2 text-slate-600"><span className="text-slate-400">Industry</span><span className="font-medium">{data.client.industry}</span></div>
                  <div className="flex items-center gap-2 text-slate-600"><MapPin className="h-4 w-4 text-slate-400" />{data.client.location}</div>
                  <div className="flex items-center gap-2 text-slate-600"><Mail className="h-4 w-4 text-slate-400" />{data.client.email}</div>
                  <div className="flex items-center gap-2 text-slate-600"><Phone className="h-4 w-4 text-slate-400" />{data.client.phone}</div>
                  <div className="flex items-center gap-2 text-slate-600"><span className="text-slate-400">Client since</span><span className="font-medium">{data.client.since}</span></div>
                  <div className="pt-1"><StatusBadge status={data.client.status} /></div>
                </dl>
              </SectionCard>
              <SectionCard title="Client Contacts" action={<Button variant="ghost" size="sm" onClick={demo} className="text-violet-700"><Plus className="mr-1 h-3.5 w-3.5" /> Add</Button>}>
                <SimpleTable
                  headers={['Name', 'Title', 'Email', 'Primary']}
                  empty="No contacts recorded for this client."
                  rows={data.contacts.map((c) => [
                    <Td key="n"><span className="font-medium text-slate-800">{c.name}</span></Td>,
                    <Td key="t">{c.title}</Td>,
                    <Td key="e">{c.email}</Td>,
                    <Td key="p">{c.isPrimary ? <span className="rounded bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-700">Primary</span> : <span className="text-slate-400">—</span>}</Td>,
                  ])}
                />
              </SectionCard>
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-slate-400">No client linked to this programme.</p>
          )}
        </TabsContent>

        {/* Quotations */}
        <TabsContent value="quotations" className="mt-6">
          <SectionCard title="Quotations" action={<Button variant="ghost" size="sm" onClick={demo} className="text-violet-700"><Plus className="mr-1 h-3.5 w-3.5" /> New Quotation</Button>}>
            <SimpleTable
              headers={['Quote No', 'Amount', 'Status', 'Issued', 'Valid Until', 'Prepared By']}
              empty="No quotations linked to this programme yet."
              rows={data.quotes.map((q) => [
                <Td key="n"><span className="font-medium text-violet-700">{q.quoteNo}</span></Td>,
                <Td key="a" className="font-medium">{formatRM(q.amount)}</Td>,
                <Td key="s"><StatusBadge status={q.status} /></Td>,
                <Td key="i">{formatDate(q.issueDate)}</Td>,
                <Td key="v">{formatDate(q.validUntil)}</Td>,
                <Td key="p">{q.preparedBy}</Td>,
              ])}
            />
          </SectionCard>
        </TabsContent>

        {/* Purchase Orders */}
        <TabsContent value="purchase-orders" className="mt-6">
          <SectionCard title="Purchase Orders" action={<Button variant="ghost" size="sm" onClick={demo} className="text-violet-700"><Plus className="mr-1 h-3.5 w-3.5" /> New PO</Button>}>
            <SimpleTable
              headers={['PO No', 'Amount', 'Status', 'Issued', 'Received']}
              empty="No purchase orders linked to this programme yet."
              rows={data.pos.map((p) => [
                <Td key="n"><span className="font-medium text-violet-700">{p.poNo}</span></Td>,
                <Td key="a" className="font-medium">{formatRM(p.amount)}</Td>,
                <Td key="s"><StatusBadge status={p.status} /></Td>,
                <Td key="i">{formatDate(p.issueDate)}</Td>,
                <Td key="r">{p.receivedDate ? formatDate(p.receivedDate) : <span className="text-slate-400">Pending</span>}</Td>,
              ])}
            />
          </SectionCard>
        </TabsContent>

        {/* Invoices */}
        <TabsContent value="invoices" className="mt-6">
          <SectionCard title="Invoices" action={<Button variant="ghost" size="sm" onClick={demo} className="text-violet-700"><Plus className="mr-1 h-3.5 w-3.5" /> New Invoice</Button>}>
            <SimpleTable
              headers={['Invoice No', 'Description', 'Amount', 'Paid', 'Due Date', 'Status']}
              empty="No invoices raised against this programme yet."
              rows={data.invs.map((i) => [
                <Td key="n"><span className="font-medium text-violet-700">{i.invoiceNo}</span></Td>,
                <Td key="d" className="max-w-xs"><span className="line-clamp-1">{i.description}</span></Td>,
                <Td key="a" className="font-medium">{formatRM(i.amount)}</Td>,
                <Td key="p">{formatRM(i.paidAmount)}</Td>,
                <Td key="du">{formatDate(i.dueDate)}</Td>,
                <Td key="s"><StatusBadge status={i.status} /></Td>,
              ])}
            />
          </SectionCard>
        </TabsContent>

        {/* Payments */}
        <TabsContent value="payments" className="mt-6">
          <SectionCard title="Payment Collections" action={<Button variant="ghost" size="sm" onClick={demo} className="text-violet-700"><Plus className="mr-1 h-3.5 w-3.5" /> Record Payment</Button>}>
            <SimpleTable
              headers={['Payment No', 'Invoice', 'Amount', 'Method', 'Date', 'Reference', 'Status']}
              empty="No payments collected for this programme yet."
              rows={data.pays.map((p) => [
                <Td key="n"><span className="font-medium text-violet-700">{p.paymentNo}</span></Td>,
                <Td key="i">{p.invoiceNo}</Td>,
                <Td key="a" className="font-medium">{formatRM(p.amount)}</Td>,
                <Td key="m">{p.method}</Td>,
                <Td key="d">{formatDate(p.date)}</Td>,
                <Td key="r" className="font-mono text-xs">{p.reference}</Td>,
                <Td key="s"><StatusBadge status={p.status} /></Td>,
              ])}
            />
          </SectionCard>
        </TabsContent>

        {/* Training Statistics */}
        <TabsContent value="training" className="mt-6 space-y-6">
          {data.stats ? (
            <>
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <MiniStat label="Sessions Delivered" value={`${data.stats.sessionsDelivered}/${data.stats.sessionsPlanned}`} icon={CalendarRange} tone="violet" />
                <MiniStat label="Attendance Rate" value={`${data.stats.attendanceRate}%`} icon={Users} tone="blue" />
                <MiniStat label="Avg. Trainer Score" value={data.stats.avgScore ? data.stats.avgScore.toFixed(1) : '—'} icon={Star} tone="amber" />
                <MiniStat label="NPS" value={data.stats.npsScore || '—'} icon={TrendingUp} tone="emerald" />
              </div>
              <SectionCard title="Delivery Sessions">
                <SimpleTable
                  headers={['Session', 'Date', 'Time', 'Trainer', 'Mode', 'Status']}
                  empty="No training sessions scheduled."
                  rows={data.sessions.map((s) => [
                    <Td key="t"><span className="font-medium text-slate-800">{s.title}</span></Td>,
                    <Td key="d">{formatDate(s.date)}</Td>,
                    <Td key="ti">{s.time}</Td>,
                    <Td key="tr">{s.trainer}</Td>,
                    <Td key="m">{s.mode}</Td>,
                    <Td key="s"><StatusBadge status={s.status} /></Td>,
                  ])}
                />
              </SectionCard>
            </>
          ) : (
            <SectionCard title="Training Statistics">
              <p className="py-8 text-center text-sm text-slate-400">No training statistics recorded for this programme yet.</p>
            </SectionCard>
          )}
        </TabsContent>

        {/* Participants */}
        <TabsContent value="participants" className="mt-6">
          <SectionCard title="Participants" action={<Button variant="ghost" size="sm" onClick={demo} className="text-violet-700"><Plus className="mr-1 h-3.5 w-3.5" /> Enroll</Button>}>
            <SimpleTable
              headers={['Name', 'Email', 'Phone', 'Status']}
              empty="No participants enrolled in this programme yet."
              rows={data.pax.map((p) => [
                <Td key="n"><span className="font-medium text-slate-800">{p.name}</span></Td>,
                <Td key="e">{p.email}</Td>,
                <Td key="p">{p.phone}</Td>,
                <Td key="s"><StatusBadge status={p.status} /></Td>,
              ])}
            />
          </SectionCard>
        </TabsContent>

        {/* Action Items */}
        <TabsContent value="action-items" className="mt-6">
          <SectionCard title="Action Items" action={<Button variant="ghost" size="sm" onClick={demo} className="text-violet-700"><Plus className="mr-1 h-3.5 w-3.5" /> New Task</Button>}>
            <SimpleTable
              headers={['Task', 'Owner', 'Due', 'Priority', 'Status']}
              empty="No action items linked to this programme."
              rows={data.actions.map((a) => [
                <Td key="t"><span className="font-medium text-slate-800">{a.title}</span></Td>,
                <Td key="o">{a.owner}</Td>,
                <Td key="d">{formatDate(a.dueDate)}</Td>,
                <Td key="pr"><span className={`rounded px-2 py-0.5 text-xs font-medium ${a.priority === 'High' ? 'bg-red-100 text-red-700' : a.priority === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>{a.priority}</span></Td>,
                <Td key="s"><StatusBadge status={a.status} /></Td>,
              ])}
            />
          </SectionCard>
        </TabsContent>

        {/* Documents */}
        <TabsContent value="documents" className="mt-6">
          <SectionCard title="Documents" action={<Button variant="ghost" size="sm" onClick={demo} className="text-violet-700"><Plus className="mr-1 h-3.5 w-3.5" /> Upload</Button>}>
            <SimpleTable
              headers={['Name', 'Type', 'Uploaded By', 'Date', 'Size']}
              empty="No documents uploaded for this programme yet."
              rows={data.docs.map((d) => [
                <Td key="n"><span className="flex items-center gap-2 font-medium text-slate-800"><FileText className="h-4 w-4 text-slate-400" />{d.name}</span></Td>,
                <Td key="t"><span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">{d.type}</span></Td>,
                <Td key="u">{d.uploadedBy}</Td>,
                <Td key="d">{formatDate(d.date)}</Td>,
                <Td key="s" className="text-slate-500">{d.size}</Td>,
              ])}
            />
          </SectionCard>
        </TabsContent>

        {/* Audit History */}
        <TabsContent value="audit" className="mt-6">
          <SectionCard title="Audit History">
            {data.audit.length ? (
              <ol className="relative space-y-5 border-l border-slate-200 pl-6">
                {data.audit.map((a) => (
                  <li key={a.id} className="relative">
                    <span className="absolute -left-[27px] flex h-4 w-4 items-center justify-center rounded-full border-2 border-violet-200 bg-white">
                      <span className="h-1.5 w-1.5 rounded-full bg-violet-600" />
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded bg-violet-50 px-2 py-0.5 text-xs font-semibold text-violet-700">{a.action}</span>
                      <span className="text-xs font-medium uppercase tracking-wide text-slate-400">{a.entity}</span>
                      <span className="ml-auto text-xs text-slate-400">{new Date(a.timestamp).toLocaleString('en-MY', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                    </div>
                    <p className="mt-1 text-sm text-slate-700">{a.description}</p>
                    <p className="mt-0.5 text-xs text-slate-400">by {a.user}</p>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="py-8 text-center text-sm text-slate-400">No audit events recorded for this programme yet.</p>
            )}
          </SectionCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}
