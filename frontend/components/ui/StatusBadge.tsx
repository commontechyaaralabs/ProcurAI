'use client';

import { cn } from '@/lib/utils';
import { BudgetStatus, RequestStatus } from '@/types';

interface StatusBadgeProps {
  status: BudgetStatus | RequestStatus | string;
  variant?: 'budget' | 'request' | 'default';
  className?: string;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  // Budget statuses
  'under-budget': { label: 'Under Budget', color: 'bg-green-100 text-green-800 border-green-200' },
  'over-budget': { label: 'Over Budget', color: 'bg-[#E00420]/10 text-[#E00420] border-[#E00420]/20' },
  'pending-allocation': { label: 'Pending Allocation', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  
  // Request statuses
  'draft': { label: 'Draft', color: 'bg-[#DFE2E4] text-[#31343A] border-[#B6BBBE]' },
  'pending': { label: 'Pending', color: 'bg-[#005691]/10 text-[#005691] border-[#005691]/20' },
  'approved': { label: 'Approved', color: 'bg-green-100 text-green-800 border-green-200' },
  'rejected': { label: 'Rejected', color: 'bg-[#E00420]/10 text-[#E00420] border-[#E00420]/20' },
  'in-review': { label: 'Under Review', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  'vendor-sourcing': { label: 'Vendor Sourcing', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  'po-issued': { label: 'PO Issued', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  
  // RFQ statuses
  'sent': { label: 'Sent', color: 'bg-[#005691]/10 text-[#005691] border-[#005691]/20' },
  'quotes-received': { label: 'Quotes Received', color: 'bg-green-100 text-green-800 border-green-200' },
  'closed': { label: 'Closed', color: 'bg-[#DFE2E4] text-[#31343A] border-[#B6BBBE]' },
  
  // Default
  'active': { label: 'Active', color: 'bg-green-100 text-green-800 border-green-200' },
  'inactive': { label: 'Inactive', color: 'bg-[#DFE2E4] text-[#31343A] border-[#B6BBBE]' },
  'executed': { label: 'Executed', color: 'bg-[#005691]/10 text-[#005691] border-[#005691]/20' },
  'expired': { label: 'Expired', color: 'bg-[#E00420]/10 text-[#E00420] border-[#E00420]/20' },
  'delivered': { label: 'Delivered', color: 'bg-green-100 text-green-800 border-green-200' },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || { label: status, color: 'bg-[#DFE2E4] text-[#31343A] border-[#B6BBBE]' };
  
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        config.color,
        className
      )}
    >
      {config.label}
    </span>
  );
}


