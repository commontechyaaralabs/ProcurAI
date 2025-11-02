'use client';

import { CheckCircle2, AlertTriangle, XCircle, Clock, Package, UserCheck } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface BudgetSummaryTilesProps {
  totalBudget: number;
  utilized: number;
  remaining: number;
  onBudgetPercent: number;
  activeIndents: number;
  avgApprovalTime: number; // in days
  underBudgetCount?: number;
  atLimitCount?: number;
  overBudgetCount?: number;
  pendingApprovalsCount?: number;
}

export function BudgetSummaryTiles({
  totalBudget,
  utilized,
  remaining,
  onBudgetPercent,
  activeIndents,
  avgApprovalTime,
  underBudgetCount = 0,
  atLimitCount = 0,
  overBudgetCount = 0,
  pendingApprovalsCount = 0,
}: BudgetSummaryTilesProps) {
  const utilizationPercent = (utilized / totalBudget) * 100;
  
  const tiles = [
    {
      icon: CheckCircle2,
      label: 'Under Budget Indents',
      value: underBudgetCount.toString(),
      color: 'bg-green-50 border-green-200',
      iconColor: 'text-green-600',
      description: 'Safe purchases',
    },
    {
      icon: AlertTriangle,
      label: 'At Limit',
      value: atLimitCount.toString(),
      color: 'bg-yellow-50 border-yellow-200',
      iconColor: 'text-yellow-600',
      description: 'Needs manager review',
    },
    {
      icon: XCircle,
      label: 'Over Budget',
      value: overBudgetCount.toString(),
      color: 'bg-[#E00420]/10 border-[#E00420]/20',
      iconColor: 'text-[#E00420]',
      description: 'Escalation required',
    },
    {
      icon: UserCheck,
      label: 'Pending Approvals',
      value: pendingApprovalsCount.toString(),
      color: 'bg-orange-50 border-orange-200',
      iconColor: 'text-orange-600',
      description: 'Awaiting decisions',
    },
    {
      icon: Package,
      label: 'Active Indents',
      value: activeIndents.toString(),
      color: 'bg-purple-50 border-purple-200',
      iconColor: 'text-purple-600',
      description: 'Total in workflow',
    },
    {
      icon: Clock,
      label: 'Avg Approval Time',
      value: `${avgApprovalTime} Days`,
      color: avgApprovalTime > 5 ? 'bg-orange-50 border-orange-200' : 'bg-blue-50 border-blue-200',
      iconColor: avgApprovalTime > 5 ? 'text-orange-600' : 'text-blue-600',
      description: 'Process performance',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {tiles.map((tile, idx) => {
        const Icon = tile.icon;
        return (
          <div
            key={idx}
            className={cn(
              'rounded-lg border p-4 transition-all hover:shadow-md',
              tile.color
            )}
          >
            <div className="flex items-start justify-between mb-2">
              <Icon className={cn('w-5 h-5', tile.iconColor)} />
            </div>
            <div className="text-xs font-medium text-[#9DA5A8] mb-1">{tile.label}</div>
            <div className="text-2xl font-bold text-[#31343A] mb-1">{tile.value}</div>
            <div className="text-[10px] text-[#9DA5A8]">{tile.description}</div>
          </div>
        );
      })}
    </div>
  );
}

