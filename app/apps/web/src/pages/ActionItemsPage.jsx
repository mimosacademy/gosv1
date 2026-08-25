import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { toast } from 'sonner';
import PageHeader from '@/components/PageHeader';
import StatCard from '@/components/StatCard';
import DataTable from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { actionItems as seedItems, formatDate, isOverdue } from '@/lib/mockData';
import { AlarmClock, CheckCircle2, CheckSquare, ListTodo, Plus } from 'lucide-react';

export default function ActionItemsPage() {
  const [items, setItems] = useState(seedItems);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: '', relatedTo: '', owner: '', dueDate: '', priority: 'Medium' });

  const openCount = items.filter((a) => a.status !== 'Completed').length;
  const overdueCount = items.filter((a) => isOverdue(a.dueDate, a.status)).length;
  const completedCount = items.filter((a) => a.status === 'Completed').length;
  const dueThisWeek = items.filter((a) => {
    if (a.status === 'Completed') return false;
    const due = new Date(a.dueDate);
    const week = new Date('2026-08-31T23:59:59');
    return due <= week;
  }).length;

  const handleCreate = (e) => {
    e.preventDefault();
    const newItem = {
      id: `a${Date.now()}`,
      title: form.title.trim(),
      relatedTo: form.relatedTo.trim() || 'General',
      owner: form.owner.trim() || 'Unassigned',
      dueDate: form.dueDate,
      priority: form.priority,
      status: 'Open',
    };
    setItems((prev) => [newItem, ...prev]);
    setForm({ title: '', relatedTo: '', owner: '', dueDate: '', priority: 'Medium' });
    setOpen(false);
    toast.success('Action item created.');
  };

  const markDone = (id) => {
    setItems((prev) => prev.map((a) => (a.id === id ? { ...a, status: 'Completed' } : a)));
    toast.success('Action item marked as completed.');
  };

  const columns = [
    {
      key: 'title',
      label: 'Action Item',
      render: (a) => (
        <div className="min-w-56">
          <p className={`font-medium ${a.status === 'Completed' ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{a.title}</p>
          <p className="text-xs text-slate-400">{a.relatedTo}</p>
        </div>
      ),
    },
    { key: 'programmeCode', label: 'Programme', className: 'whitespace-nowrap font-medium text-violet-700', render: (a) => a.programmeCode || '—' },
    { key: 'owner', label: 'Owner', className: 'whitespace-nowrap' },
    {
      key: 'dueDate',
      label: 'Due Date',
      className: 'whitespace-nowrap',
      render: (a) => (
        <span className={isOverdue(a.dueDate, a.status) ? 'font-medium text-red-600' : 'text-slate-500'}>
          {formatDate(a.dueDate)}
          {isOverdue(a.dueDate, a.status) && ' · overdue'}
        </span>
      ),
    },
    { key: 'priority', label: 'Priority', render: (a) => <StatusBadge status={a.priority} /> },
    { key: 'status', label: 'Status', render: (a) => <StatusBadge status={a.status} /> },
    {
      key: 'actions',
      label: '',
      render: (a) =>
        a.status !== 'Completed' ? (
          <Button variant="ghost" size="sm" className="text-violet-700" onClick={() => markDone(a.id)}>
            <CheckCircle2 className="mr-1.5 h-4 w-4" /> Done
          </Button>
        ) : null,
    },
  ];

  return (
    <div>
      <Helmet>
        <title>Action Items — MIMOS Academy PMS</title>
        <meta name="description" content="Team action items and follow-ups across sales, finance and programme delivery at MIMOS Academy." />
      </Helmet>

      <PageHeader title="Action Items" description="Follow-ups and tasks across the team.">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-violet-600 hover:bg-violet-700">
              <Plus className="mr-2 h-4 w-4" /> New Action Item
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>New action item</DialogTitle>
              <DialogDescription>Add a follow-up task for the team.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ai-title">Title</Label>
                <Input
                  id="ai-title"
                  required
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Follow up with client on quotation"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ai-related">Related to</Label>
                <Input
                  id="ai-related"
                  value={form.relatedTo}
                  onChange={(e) => setForm((f) => ({ ...f, relatedTo: e.target.value }))}
                  placeholder="e.g. Quotation QTN-2026-0142"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ai-owner">Owner</Label>
                  <Input
                    id="ai-owner"
                    value={form.owner}
                    onChange={(e) => setForm((f) => ({ ...f, owner: e.target.value }))}
                    placeholder="e.g. Sarah Tan"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ai-due">Due date</Label>
                  <Input
                    id="ai-due"
                    type="date"
                    required
                    value={form.dueDate}
                    onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={form.priority} onValueChange={(v) => setForm((f) => ({ ...f, priority: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="submit" className="bg-violet-600 hover:bg-violet-700">
                  Create item
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Open Items" value={openCount} icon={ListTodo} tone="violet" hint="need attention" />
        <StatCard title="Overdue" value={overdueCount} icon={AlarmClock} tone="red" deltaDirection="down" delta={overdueCount > 0 ? 'Act now' : undefined} hint="past due date" />
        <StatCard title="Due This Week" value={dueThisWeek} icon={CheckSquare} tone="amber" hint="by 31 Aug 2026" />
        <StatCard title="Completed" value={completedCount} icon={CheckCircle2} tone="emerald" hint="closed items" />
      </div>

      <DataTable
        columns={columns}
        data={items}
        searchKeys={['title', 'relatedTo', 'owner']}
        searchPlaceholder="Search action items…"
        filters={[
          { key: 'status', label: 'Status', options: ['Open', 'In Progress', 'Completed'] },
          { key: 'priority', label: 'Priority', options: ['High', 'Medium', 'Low'] },
        ]}
        emptyTitle="No action items found"
        emptyDescription="No action items match your current search or filters."
      />
    </div>
  );
}
