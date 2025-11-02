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
    <div className="bg-white border-b border-[#DFE2E4] shadow-sm">
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

        {/* Budget Summary Row - Enhanced with Progress Bar */}
        <div className="bg-[#DFE2E4]/10 rounded-lg p-4 border border-[#DFE2E4]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-6">
              <div>
                <span className="text-xs text-[#9DA5A8]">Allocated</span>
                <div className="text-lg font-semibold text-[#31343A]">{formatCurrency(totalBudget)}</div>
              </div>
              <div>
                <span className="text-xs text-[#9DA5A8]">Utilized</span>
                <div className="text-lg font-semibold text-[#31343A]">{formatCurrency(spent)}</div>
              </div>
              <div>
                <span className="text-xs text-[#9DA5A8]">Remaining</span>
                <div className="text-lg font-semibold text-[#005691]">{formatCurrency(remaining)}</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-lg font-bold text-[#31343A]">{utilization.toFixed(1)}% Utilized</div>
                <div className="text-xs text-[#9DA5A8]">Budget Utilization</div>
              </div>
              {utilization > 95 && (
                <span className="px-3 py-1 bg-[#E00420]/10 text-[#E00420] rounded-full text-xs font-semibold">
                  Near Limit
                </span>
              )}
              {utilization > 80 && utilization <= 95 && (
                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
                  At Limit
                </span>
              )}
            </div>
          </div>
          {/* Progress Bar */}
          <div className="relative">
            <div className="h-6 bg-[#DFE2E4]/50 rounded-full overflow-hidden border border-[#DFE2E4]">
              <div 
                className={`h-full rounded-full transition-all flex items-center justify-center ${
                  utilization > 95 ? 'bg-[#E00420]' :
                  utilization > 80 ? 'bg-yellow-500' :
                  'bg-[#005691]'
                }`}
                style={{ width: `${Math.min(utilization, 100)}%` }}
              >
                {utilization > 10 && (
                  <span className="text-xs font-semibold text-white px-2">
                    {utilization.toFixed(1)}%
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">

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
          <div className="space-y-2 md:col-span-2">
            <div className="text-xs text-[#9DA5A8]">Quick Info</div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs">
                <Clock className="w-3.5 h-3.5 text-[#9DA5A8]" />
                <span className="text-[#31343A]">
                  Last Updated: {new Date(lastUpdated).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}, {new Date(lastUpdated).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Calendar className="w-3.5 h-3.5 text-[#9DA5A8]" />
                <span className="text-[#31343A]">
                  Next Review: {new Date(nextReviewDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

