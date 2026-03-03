'use client';
import { TaskFilters, TaskStatus, Priority } from '@/types';
import { Search, X } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';

interface Props {
  filters: TaskFilters;
  onChange: (filters: TaskFilters) => void;
  total: number;
}

export function TaskFiltersBar({ filters, onChange, total }: Props) {
  const [searchInput, setSearchInput] = useState(filters.search || '');

  const debouncedSearch = useDebouncedCallback((value: string) => {
    onChange({ ...filters, search: value, page: 1 });
  }, 400);

  const handleSearch = useCallback((v: string) => {
    setSearchInput(v);
    debouncedSearch(v);
  }, [debouncedSearch]);

  const handleStatus = (v: string) => onChange({ ...filters, status: v as TaskStatus | '', page: 1 });
  const handlePriority = (v: string) => onChange({ ...filters, priority: v as Priority | '', page: 1 });
  const clearFilters = () => { setSearchInput(''); onChange({ page: 1, limit: filters.limit }); };

  const hasFilters = filters.status || filters.priority || filters.search;

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={searchInput}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search tasks..."
            className="w-full pl-9 pr-4 py-2.5 bg-white/10 border border-white/10 rounded-lg text-sm text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition"
          />
        </div>

        {/* Status filter */}
        <select
          value={filters.status || ''}
          onChange={(e) => handleStatus(e.target.value)}
          className="px-3 py-2.5 bg-slate-800/80 border border-white/10 rounded-lg text-sm text-white outline-none focus:ring-2 focus:ring-primary-500/50 transition"
        >
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
        </select>

        {/* Priority filter */}
        <select
          value={filters.priority || ''}
          onChange={(e) => handlePriority(e.target.value)}
          className="px-3 py-2.5 bg-slate-800/80 border border-white/10 rounded-lg text-sm text-white outline-none focus:ring-2 focus:ring-primary-500/50 transition"
        >
          <option value="">All Priorities</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
        </select>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">{total} task{total !== 1 ? 's' : ''} found</p>
        {hasFilters && (
          <button onClick={clearFilters} className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white transition">
            <X className="w-3.5 h-3.5" /> Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
