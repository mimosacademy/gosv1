import React, { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Inbox, Search } from 'lucide-react';

export default function DataTable({
  columns,
  data,
  searchKeys = [],
  searchPlaceholder = 'Search…',
  filters = [],
  emptyTitle = 'No records found',
  emptyDescription = 'Try adjusting your search or filter criteria.',
}) {
  const [query, setQuery] = useState('');
  const [filterState, setFilterState] = useState(() =>
    Object.fromEntries(filters.map((f) => [f.key, 'all'])),
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return data.filter((row) => {
      if (q && !searchKeys.some((k) => String(row[k] ?? '').toLowerCase().includes(q))) {
        return false;
      }
      for (const f of filters) {
        const v = filterState[f.key];
        if (v && v !== 'all' && String(row[f.key]) !== v) return false;
      }
      return true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, query, filterState]);

  return (
    <div className="space-y-4">
      {(searchKeys.length > 0 || filters.length > 0) && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {searchKeys.length > 0 && (
            <div className="relative w-full sm:max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" strokeWidth={1.8} />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="h-9 bg-white pl-9 text-sm"
              />
            </div>
          )}
          {filters.map((f) => (
            <Select
              key={f.key}
              value={filterState[f.key]}
              onValueChange={(v) => setFilterState((prev) => ({ ...prev, [f.key]: v }))}
            >
              <SelectTrigger className="h-9 w-full bg-white text-sm sm:w-44">
                <SelectValue placeholder={f.label} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All {f.label}</SelectItem>
                {f.options.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
                {columns.map((col) => (
                  <TableHead
                    key={col.key}
                    className={`whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-slate-500 ${col.className ?? ''}`}
                  >
                    {col.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((row) => (
                <TableRow key={row.id} className="hover:bg-violet-50/40">
                  {columns.map((col) => (
                    <TableCell key={col.key} className={`text-sm ${col.className ?? ''}`}>
                      {col.render ? col.render(row) : row[col.key]}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-50">
              <Inbox className="h-6 w-6 text-violet-400" strokeWidth={1.8} />
            </div>
            <p className="mt-4 text-sm font-semibold text-slate-800">{emptyTitle}</p>
            <p className="mt-1 max-w-sm text-sm text-slate-500">{emptyDescription}</p>
          </div>
        )}
      </div>

      <p className="text-xs text-slate-400">
        Showing {filtered.length} of {data.length} records
      </p>
    </div>
  );
}
