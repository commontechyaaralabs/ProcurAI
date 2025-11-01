'use client';

import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KPICardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: LucideIcon;
  className?: string;
  onClick?: () => void;
}

export function KPICard({ title, value, change, trend, icon: Icon, className, onClick }: KPICardProps) {
  return (
    <div 
      className={cn('bg-white rounded-lg border border-[#DFE2E4] p-6 shadow-sm', onClick && 'cursor-pointer hover:shadow-md transition-shadow', className)}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-[#9DA5A8]">{title}</p>
          <p className="mt-2 text-3xl font-semibold text-[#31343A]">{value}</p>
          {change && (
            <div className="mt-2 flex items-center gap-1">
              {trend === 'up' && <TrendingUp className="h-4 w-4 text-green-600" />}
              {trend === 'down' && <TrendingDown className="h-4 w-4 text-[#E00420]" />}
              <span
                className={cn(
                  'text-sm font-medium',
                  trend === 'up' && 'text-green-600',
                  trend === 'down' && 'text-[#E00420]',
                  trend === 'neutral' && 'text-[#9DA5A8]'
                )}
              >
                {change}
              </span>
            </div>
          )}
        </div>
        {Icon && (
          <Icon className="h-8 w-8 text-[#005691] opacity-60" />
        )}
      </div>
    </div>
  );
}



