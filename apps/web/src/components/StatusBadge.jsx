import React from 'react';

const STYLES = {
  // generic
  Active: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  Inactive: 'bg-slate-100 text-slate-600 ring-slate-200',
  Prospect: 'bg-amber-50 text-amber-700 ring-amber-200',
  // programme / session
  'In Progress': 'bg-blue-50 text-blue-700 ring-blue-200',
  Scheduled: 'bg-violet-50 text-violet-700 ring-violet-200',
  Completed: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  'On Hold': 'bg-amber-50 text-amber-700 ring-amber-200',
  Cancelled: 'bg-red-50 text-red-700 ring-red-200',
  // quotation
  Draft: 'bg-slate-100 text-slate-600 ring-slate-200',
  Sent: 'bg-blue-50 text-blue-700 ring-blue-200',
  Accepted: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  Rejected: 'bg-red-50 text-red-700 ring-red-200',
  Expired: 'bg-amber-50 text-amber-700 ring-amber-200',
  // invoice / payment
  Paid: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  Partial: 'bg-amber-50 text-amber-700 ring-amber-200',
  Unpaid: 'bg-slate-100 text-slate-600 ring-slate-200',
  Overdue: 'bg-red-50 text-red-700 ring-red-200',
  Pending: 'bg-amber-50 text-amber-700 ring-amber-200',
  Confirmed: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  Closed: 'bg-slate-100 text-slate-600 ring-slate-200',
  // opportunity stages
  Lead: 'bg-violet-50 text-violet-600 ring-violet-200',
  Qualified: 'bg-violet-50 text-violet-700 ring-violet-200',
  Proposal: 'bg-violet-100 text-violet-800 ring-violet-300',
  Negotiation: 'bg-violet-200 text-violet-900 ring-violet-400',
  Won: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  Lost: 'bg-red-50 text-red-700 ring-red-200',
  // participants
  Attending: 'bg-blue-50 text-blue-700 ring-blue-200',
  Waitlisted: 'bg-amber-50 text-amber-700 ring-amber-200',
  Withdrawn: 'bg-slate-100 text-slate-600 ring-slate-200',
  // action items
  Open: 'bg-blue-50 text-blue-700 ring-blue-200',
  High: 'bg-red-50 text-red-700 ring-red-200',
  Medium: 'bg-amber-50 text-amber-700 ring-amber-200',
  Low: 'bg-slate-100 text-slate-600 ring-slate-200',
};

export default function StatusBadge({ status }) {
  const style = STYLES[status] ?? 'bg-slate-100 text-slate-600 ring-slate-200';
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${style}`}
    >
      {status}
    </span>
  );
}
