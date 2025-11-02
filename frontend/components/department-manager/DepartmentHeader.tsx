'use client';

import { TrendingUp, TrendingDown, Minus, Calendar, Clock, User } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface DepartmentHeaderProps {
  departmentName: string;
  departmentCode: string;
  managerName: string;
  managerRole: string;
  financialYear: string;
  totalBudget: number;
  spent: number;
  remaining: number;
  lastUpdated?: string;
  nextReviewDate?: string;
  budgetTrend?: Array<{ month: string; value: number }>;
}

export function DepartmentHeader({
  departmentName,
  departmentCode,
  managerName,
  managerRole,
  financialYear,
  totalBudget,
  spent,
  remaining,
  lastUpdated = '2024-01-22T10:30:00Z',
  nextReviewDate = '2024-03-31',
  budgetTrend = [
    { month: 'Jul', value: 420000 },
    { month: 'Aug', value: 550000 },
    { month: 'Sep', value: 640000 },
    { month: 'Oct', value: 710000 },
    { month: 'Nov', value: 680000 },
    { month: 'Dec', value: 720000 },
  ],
}: DepartmentHeaderProps) {
  const utilization = (spent / totalBudget) * 100;
  const budgetHealth = utilization > 95 ? 'over-budget' : utilization > 80 ? 'pending-allocation' : 'under-budget';
  
  // Determine trend direction
  const recentTrend = budgetTrend.length >= 2 
    ? budgetTrend[budgetTrend.length - 1].value > budgetTrend[budgetTrend.length - 2].value 
      ? 'up' : 'down' 
    : 'neutral';

  return (
    <div className="sticky top-0 z-20 bg-white border-b border-[#DFE2E4] shadow-sm">
      <div className="p-4 space-y-4">
        {/* Top Row: Department Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-xl font-semibold text-[#31343A]">
                {departmentName} — <span className="text-[#005691]">{departmentCode}</span>
              </h1>
              <div className="flex items-center gap-4 mt-1 text-sm text-[#9DA5A8]">
                <div className="flex items-center gap-1.5">
                  <User className="w-4 h-4" />
                  <span>{managerName} • {managerRole}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  <span>FY: {financialYear}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <StatusBadge 
              status={budgetHealth} 
            />
          </div>
        </div>

        {/* Budget Summary Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Budget Overview */}
          <div className="md:col-span-2 flex items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-[#9DA5A8]">Total Budget</span>
                <span className="text-lg font-semibold text-[#31343A]">{formatCurrency(totalBudget)}</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-[#9DA5A8]">Spent</span>
                <span className="text-lg font-semibold text-[#31343A]">{formatCurrency(spent)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#9DA5A8]">Remaining</span>
                <span className="text-lg font-semibold text-[#005691]">{formatCurrency(remaining)}</span>
              </div>
            </div>
            <div className="flex-1">
              {/* Utilization Gauge */}
              <div className="relative w-24 h-24 mx-auto">
                <svg className="transform -rotate-90 w-24 h-24">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="#DFE2E4"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke={
                      utilization > 95 ? '#E00420' :
                      utilization > 80 ? '#F59E0B' :
                      '#10B981'
                    }
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${(utilization / 100) * 251.2} 251.2`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-lg font-bold text-[#31343A]">{utilization.toFixed(1)}%</div>
                    <div className="text-xs text-[#9DA5A8]">Used</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Budget Trend Sparkline */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="text-xs text-[#9DA5A8] mb-2">Budget Trend (6M)</div>
              <div className="h-12 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLineChart data={budgetTrend}>
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#005691"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #DFE2E4',
                        borderRadius: '4px',
                        fontSize: '10px',
                        padding: '4px 8px',
                      }}
                      formatter={(value: any) => formatCurrency(value)}
                    />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center gap-1 mt-1">
                {recentTrend === 'up' && <TrendingUp className="w-3 h-3 text-green-600" />}
                {recentTrend === 'down' && <TrendingDown className="w-3 h-3 text-[#E00420]" />}
                {recentTrend === 'neutral' && <Minus className="w-3 h-3 text-[#9DA5A8]" />}
                <span className="text-xs text-[#9DA5A8]">Last 6 months</span>
              </div>
            </div>
          </div>

          {/* Smart Add-ons */}
          <div className="space-y-2">
            <div className="text-xs text-[#9DA5A8]">Quick Info</div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs">
                <Clock className="w-3.5 h-3.5 text-[#9DA5A8]" />
                <span className="text-[#31343A]">
                  Last Updated: {new Date(lastUpdated).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Calendar className="w-3.5 h-3.5 text-[#9DA5A8]" />
                <span className="text-[#31343A]">
                  Next Review: {new Date(nextReviewDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

