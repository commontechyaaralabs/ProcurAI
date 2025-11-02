'use client';

import { Wallet, TrendingUp, TrendingDown, Target, Package, Clock } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface BudgetSummaryTilesProps {
  totalBudget: number;
  utilized: number;
  remaining: number;
  onBudgetPercent: number;
  activeIndents: number;
  avgApprovalTime: number; // in days
}

export function BudgetSummaryTiles({
  totalBudget,
  utilized,
  remaining,
  onBudgetPercent,
  activeIndents,
  avgApprovalTime,
}: BudgetSummaryTilesProps) {
  const utilizationPercent = (utilized / totalBudget) * 100;
  
  const tiles = [
    {
      icon: Wallet,
      label: 'Total Budget',
      value: formatCurrency(totalBudget),
      color: 'bg-[#005691]/10 border-[#005691]/20',
      iconColor: 'text-[#005691]',
    },
    {
      icon: TrendingUp,
      label: 'Utilized',
      value: formatCurrency(utilized),
      color: utilizationPercent > 90 ? 'bg-[#E00420]/10 border-[#E00420]/20' : utilizationPercent > 75 ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200',
      iconColor: utilizationPercent > 90 ? 'text-[#E00420]' : utilizationPercent > 75 ? 'text-yellow-600' : 'text-green-600',
      trend: utilizationPercent > 90 ? 'high' : 'normal',
    },
    {
      icon: TrendingDown,
      label: 'Remaining',
      value: formatCurrency(remaining),
      color: remaining < totalBudget * 0.1 ? 'bg-[#E00420]/10 border-[#E00420]/20' : 'bg-blue-50 border-blue-200',
      iconColor: remaining < totalBudget * 0.1 ? 'text-[#E00420]' : 'text-blue-600',
    },
    {
      icon: Target,
      label: 'Utilization %',
      value: `${utilizationPercent.toFixed(1)}%`,
      color: 
        utilizationPercent > 90 ? 'bg-[#E00420]/10 border-[#E00420]/20' :
        utilizationPercent > 75 ? 'bg-yellow-50 border-yellow-200' :
        'bg-green-50 border-green-200',
      iconColor: 
        utilizationPercent > 90 ? 'text-[#E00420]' :
        utilizationPercent > 75 ? 'text-yellow-600' :
        'text-green-600',
    },
    {
      icon: Package,
      label: 'Active Indents',
      value: activeIndents.toString(),
      color: 'bg-purple-50 border-purple-200',
      iconColor: 'text-purple-600',
    },
    {
      icon: Clock,
      label: 'Avg Approval Time',
      value: `${avgApprovalTime} Days`,
      color: avgApprovalTime > 5 ? 'bg-orange-50 border-orange-200' : 'bg-green-50 border-green-200',
      iconColor: avgApprovalTime > 5 ? 'text-orange-600' : 'text-green-600',
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
              {(tile.trend === 'high' || tile.label === 'Remaining' && remaining < totalBudget * 0.1) && (
                <span className="text-xs font-semibold text-[#E00420]">!</span>
              )}
            </div>
            <div className="text-xs font-medium text-[#9DA5A8] mb-1">{tile.label}</div>
            <div className="text-xl font-bold text-[#31343A]">{tile.value}</div>
          </div>
        );
      })}
    </div>
  );
}

