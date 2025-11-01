'use client';

import { Filter } from 'lucide-react';
import { useState } from 'react';

interface ApprovalFiltersProps {
  onFilterChange?: (filters: FilterState) => void;
}

export interface FilterState {
  status: string;
  approverLevel: string;
  slaState: string;
  department?: string;
  minValue?: number;
  maxValue?: number;
  dateFrom?: string;
  dateTo?: string;
}

export function ApprovalFilters({ onFilterChange }: ApprovalFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    status: 'all',
    approverLevel: 'all',
    slaState: 'all',
  });
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  return (
    <div className="bg-white border border-[#DFE2E4] rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-[#9DA5A8]" />
          <span className="text-sm font-medium text-[#31343A]">Filters</span>
        </div>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-xs text-[#005691] hover:text-[#004574]"
        >
          {showAdvanced ? 'Hide' : 'Show'} Advanced
        </button>
      </div>

      {/* Basic Filters Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
        {/* Status Filter */}
        <select
          value={filters.status}
          onChange={(e) => handleFilterChange('status', e.target.value)}
          className="px-3 py-1.5 text-sm border border-[#B6BBBE] rounded-lg text-[#31343A] bg-white"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="on-hold">On Hold</option>
          <option value="sent-back">Sent Back</option>
        </select>

        {/* Approver Level Filter */}
        <select
          value={filters.approverLevel}
          onChange={(e) => handleFilterChange('approverLevel', e.target.value)}
          className="px-3 py-1.5 text-sm border border-[#B6BBBE] rounded-lg text-[#31343A] bg-white"
        >
          <option value="all">All Levels</option>
          <option value="L1">L1 Manager</option>
          <option value="L2">L2 Manager</option>
          <option value="Head">Head</option>
          <option value="CFO">CFO</option>
        </select>

        {/* SLA State Filter */}
        <select
          value={filters.slaState}
          onChange={(e) => handleFilterChange('slaState', e.target.value)}
          className="px-3 py-1.5 text-sm border border-[#B6BBBE] rounded-lg text-[#31343A] bg-white"
        >
          <option value="all">All SLA</option>
          <option value="due-today">Due Today</option>
          <option value="breached">Breached</option>
          <option value="within-8h">Within 8h</option>
        </select>
      </div>

      {/* Advanced Filters Row - Shows on new line when enabled */}
      {showAdvanced && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 pt-3 border-t border-[#DFE2E4]">
          {/* Department Filter */}
          <select
            value={filters.department || 'all'}
            onChange={(e) => handleFilterChange('department', e.target.value === 'all' ? undefined : e.target.value)}
            className="px-3 py-1.5 text-sm border border-[#B6BBBE] rounded-lg text-[#31343A] bg-white"
          >
            <option value="all">All Departments</option>
            <option value="Powertrain Assembly">Powertrain</option>
            <option value="Body Shop">Body Shop</option>
            <option value="Electronics & Controls">Electronics</option>
            <option value="Chassis Assembly">Chassis</option>
          </select>

          {/* Value Range */}
          <div className="flex gap-2 col-span-2">
            <input
              type="number"
              placeholder="Min ₹"
              value={filters.minValue || ''}
              onChange={(e) => handleFilterChange('minValue', e.target.value ? parseFloat(e.target.value) : undefined)}
              className="px-3 py-1.5 text-sm border border-[#B6BBBE] rounded-lg text-[#31343A] bg-white w-full"
            />
            <input
              type="number"
              placeholder="Max ₹"
              value={filters.maxValue || ''}
              onChange={(e) => handleFilterChange('maxValue', e.target.value ? parseFloat(e.target.value) : undefined)}
              className="px-3 py-1.5 text-sm border border-[#B6BBBE] rounded-lg text-[#31343A] bg-white w-full"
            />
          </div>

          {/* Date Range */}
          <div className="flex gap-2 col-span-2">
            <input
              type="date"
              value={filters.dateFrom || ''}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              className="px-3 py-1.5 text-sm border border-[#B6BBBE] rounded-lg text-[#31343A] bg-white flex-1"
            />
            <input
              type="date"
              value={filters.dateTo || ''}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              className="px-3 py-1.5 text-sm border border-[#B6BBBE] rounded-lg text-[#31343A] bg-white flex-1"
            />
          </div>
        </div>
      )}

      {(filters.status !== 'all' || filters.approverLevel !== 'all' || filters.slaState !== 'all' || filters.department || filters.minValue || filters.maxValue) && (
        <button
          onClick={() => {
            const resetFilters = { status: 'all', approverLevel: 'all', slaState: 'all' };
            setFilters(resetFilters);
            onFilterChange?.(resetFilters);
          }}
          className="mt-3 text-xs text-[#E00420] hover:text-[#C0031A]"
        >
          Clear all filters
        </button>
      )}
    </div>
  );
}

