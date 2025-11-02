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
  sparklineData?: number[];
}

export function KPICard({ title, value, change, trend, icon: Icon, className, onClick, sparklineData }: KPICardProps) {
  return (
    <div 
      className={cn('bg-white rounded-lg border border-[#DFE2E4] p-6 shadow-sm', onClick && 'cursor-pointer hover:shadow-md transition-shadow', className)}
      onClick={onClick}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[#9DA5A8]">{title}</p>
            <p className="mt-2 text-2xl font-semibold text-[#31343A] leading-tight">{value}</p>
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
            <Icon className="h-8 w-8 text-[#005691] opacity-60 flex-shrink-0" />
          )}
        </div>
        {sparklineData && sparklineData.length > 0 && (
          <div className="mt-2">
            <SparklineSvg data={sparklineData} />
          </div>
        )}
      </div>
    </div>
  );
}

// Inline Sparkline component
function SparklineSvg({ data }: { data: number[] }) {
  if (!data || data.length === 0) return null;
  
  const max = Math.max(...data, 1);
  const w = 140, h = 48, pad = 6;
  const step = data.length > 1 ? (w - pad * 2) / (data.length - 1) : 0;

  const pts = data.map((v, i) => {
    const x = pad + i * step;
    const y = h - pad - (v / max) * (h - pad * 2);
    return `${x},${y}`;
  }).join(' ');
  
  // Last point for the dot
  const lastX = pad + (data.length - 1) * step;
  const lastY = h - pad - (data[data.length - 1] / max) * (h - pad * 2);

  return (
    <div className="w-full overflow-hidden">
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="max-w-full h-auto" preserveAspectRatio="xMidYMid meet">
        <polyline fill="none" stroke="#005691" strokeWidth="2.5" points={pts} />
        <circle cx={lastX} cy={lastY} r="3.5" fill="#005691" />
      </svg>
    </div>
  );
}



