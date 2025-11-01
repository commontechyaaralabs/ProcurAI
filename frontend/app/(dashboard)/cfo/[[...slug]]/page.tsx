'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { KPICard } from '@/components/ui/KPICard';
import { 
  BarChart3, 
  TrendingUp, 
  AlertTriangle, 
  Lightbulb,
  Building2,
  Download,
  FileDown
} from 'lucide-react';
import { monthlySpendData, categorySpendData, topVendorsData, mockVendors, mockRequests } from '@/lib/mockData';
import { formatCurrency } from '@/lib/utils';
import { LineChart } from '@/components/charts/LineChart';
import { BarChart } from '@/components/charts/BarChart';
import { PieChart } from '@/components/charts/PieChart';
import { StatusBadge } from '@/components/ui/StatusBadge';

const navItems = [
  { label: 'Executive Overview', href: '/cfo', icon: BarChart3 },
  { label: 'Budget Analysis', href: '/cfo/budget', icon: TrendingUp },
  { label: 'Vendor Performance', href: '/cfo/vendors', icon: Building2 },
  { label: 'Exception Reports', href: '/cfo/exceptions', icon: AlertTriangle },
  { label: 'Strategic Insights', href: '/cfo/insights', icon: Lightbulb },
];

export default function CFODashboard() {
  const pathname = usePathname();

  // Determine active view from URL
  const getActiveView = (): 'overview' | 'budget' | 'vendors' | 'exceptions' | 'insights' => {
    if (pathname === '/cfo' || pathname === '/cfo/') return 'overview';
    if (pathname === '/cfo/budget') return 'budget';
    if (pathname === '/cfo/vendors') return 'vendors';
    if (pathname === '/cfo/exceptions') return 'exceptions';
    if (pathname === '/cfo/insights') return 'insights';
    return 'overview';
  };

  const activeView = getActiveView();

  const totalAnnualSpend = 12800000;
  const budgetUtilization = 78;
  const activeVendorCount = 45;
  const costSavings = 1250000;

  // Budget Analysis Data
  const budgetByDepartment = [
    { department: 'Manufacturing', budget: 4500000, actual: 4200000, percentage: 93 },
    { department: 'Production', budget: 3200000, actual: 3100000, percentage: 97 },
    { department: 'IT', budget: 2500000, actual: 2800000, percentage: 112 },
    { department: 'Logistics', budget: 1800000, actual: 1650000, percentage: 92 },
    { department: 'Services', budget: 800000, actual: 750000, percentage: 94 },
  ];

  const overBudgetRequests = mockRequests.filter(r => r.budgetStatus === 'over-budget');
  const vendorPerformance = mockVendors.sort((a, b) => b.performanceRating - a.performanceRating);

  return (
    <DashboardLayout 
      navItems={navItems} 
      role="cfo" 
      title={
        activeView === 'overview' ? 'Executive Overview' :
        activeView === 'budget' ? 'Budget Analysis' :
        activeView === 'vendors' ? 'Vendor Performance' :
        activeView === 'exceptions' ? 'Exception Reports' :
        'Strategic Insights'
      }
    >
      <div className="space-y-6">
        {activeView === 'overview' && (
          <>
            {/* High-level KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <KPICard
                title="Total Annual Spend"
                value={formatCurrency(totalAnnualSpend)}
                change="+8.2% YoY"
                trend="up"
                icon={TrendingUp}
              />
              <KPICard
                title="Budget Utilization"
                value={`${budgetUtilization}%`}
                change="On track"
                trend="neutral"
                icon={BarChart3}
              />
              <KPICard
                title="Active Vendors"
                value={activeVendorCount}
                change="-3 this quarter"
                trend="down"
                icon={Building2}
              />
              <KPICard
                title="Cost Savings Identified"
                value={formatCurrency(costSavings)}
                change="AI-recommended"
                trend="up"
                icon={Lightbulb}
              />
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg border border-[#DFE2E4] p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-[#31343A]">Category Breakdown</h3>
                  <button className="p-2 text-[#9DA5A8] hover:text-[#9DA5A8]">
                    <Download className="h-4 w-4" />
                  </button>
                </div>
                <PieChart 
                  data={categorySpendData.map(cat => ({ 
                    name: cat.category, 
                    value: cat.percentage 
                  }))} 
                />
              </div>

              <div className="bg-white rounded-lg border border-[#DFE2E4] p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-[#31343A]">Top Vendors by Spend</h3>
                  <button className="p-2 text-[#9DA5A8] hover:text-[#9DA5A8]">
                    <Download className="h-4 w-4" />
                  </button>
                </div>
                <BarChart 
                  data={topVendorsData.map(v => ({ 
                    name: v.name.replace(' ', '\n'), 
                    spend: v.spend / 1000 
                  }))} 
                  dataKey="spend" 
                  nameKey="name"
                  name="Spend (thousands)" 
                />
              </div>
            </div>

            {/* Monthly Trend */}
            <div className="bg-white rounded-lg border border-[#DFE2E4] p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[#31343A]">Monthly Spend Trend</h3>
                <div className="flex gap-2">
                  <button className="px-3 py-1 text-sm border border-[#B6BBBE] rounded-lg hover:bg-[#DFE2E4]/30">
                    This Year
                  </button>
                  <button className="px-3 py-1 text-sm bg-[#005691] text-white rounded-lg">
                    YoY Comparison
                  </button>
                  <button className="p-2 text-[#9DA5A8] hover:text-[#9DA5A8]">
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <LineChart 
                data={monthlySpendData.map(d => ({ ...d, spend: d.spend / 1000 }))} 
                dataKey="spend" 
                name="Spend (thousands)" 
              />
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg border border-[#DFE2E4] p-6">
                <h4 className="text-sm font-medium text-[#31343A] mb-4">Over-Budget Alerts</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#9DA5A8]">Raw Materials</span>
                    <span className="text-sm font-semibold text-red-600">12 requests</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#9DA5A8]">Software</span>
                    <span className="text-sm font-semibold text-red-600">3 requests</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#9DA5A8]">Equipment</span>
                    <span className="text-sm font-semibold text-amber-600">5 requests</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-[#DFE2E4] p-6">
                <h4 className="text-sm font-medium text-[#31343A] mb-4">Contract Renewal Pipeline</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#9DA5A8]">This Month</span>
                    <span className="text-sm font-semibold text-[#31343A]">2 contracts</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#9DA5A8]">Next Month</span>
                    <span className="text-sm font-semibold text-[#31343A]">5 contracts</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#9DA5A8]">Next Quarter</span>
                    <span className="text-sm font-semibold text-[#31343A]">12 contracts</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-[#DFE2E4] p-6">
                <h4 className="text-sm font-medium text-[#31343A] mb-4">Compliance Status</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#9DA5A8]">Vendors Meeting Standards</span>
                    <span className="text-sm font-semibold text-green-600">94%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#9DA5A8]">Policy Violations</span>
                    <span className="text-sm font-semibold text-red-600">3 instances</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#9DA5A8]">Pending Reviews</span>
                    <span className="text-sm font-semibold text-amber-600">7 vendors</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Strategic Insights */}
            <div className="bg-gradient-to-r from-[#005691] to-[#0066a3] rounded-lg p-6 text-white">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold mb-2">AI-Powered Insights</h3>
                  <p className="text-blue-100 text-sm">Predictive analysis for next quarter procurement needs</p>
                </div>
                <Lightbulb className="h-8 w-8 text-blue-200" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white bg-opacity-10 rounded-lg p-4">
                  <p className="text-sm font-medium mb-2">Spend Pattern Insight</p>
                  <p className="text-blue-100 text-xs">Q4 shows 15% increase in software category spend. Consider multi-year licensing for cost optimization.</p>
                </div>
                <div className="bg-white bg-opacity-10 rounded-lg p-4">
                  <p className="text-sm font-medium mb-2">Logistics Cost Trend</p>
                  <p className="text-blue-100 text-xs">Logistics costs trending upward. Evaluate consolidation opportunities with top 3 vendors.</p>
                </div>
              </div>
            </div>

            {/* Efficiency Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg border border-[#DFE2E4] p-6">
                <h4 className="text-sm font-medium text-[#31343A] mb-2">Average Time-to-PO</h4>
                <p className="text-3xl font-semibold text-[#31343A]">5.2 days</p>
                <p className="text-xs text-green-600 mt-2">↓ 0.8 days vs last quarter</p>
              </div>
              <div className="bg-white rounded-lg border border-[#DFE2E4] p-6">
                <h4 className="text-sm font-medium text-[#31343A] mb-2">Approval Cycle Time</h4>
                <p className="text-3xl font-semibold text-[#31343A]">2.4 days</p>
                <p className="text-xs text-green-600 mt-2">↓ 1.2 days vs last quarter</p>
              </div>
              <div className="bg-white rounded-lg border border-[#DFE2E4] p-6">
                <h4 className="text-sm font-medium text-[#31343A] mb-2">Risk Indicators</h4>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#9DA5A8]">High-risk vendors</span>
                    <span className="text-xs font-semibold text-amber-600">2</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#9DA5A8]">Delayed deliveries</span>
                    <span className="text-xs font-semibold text-red-600">5</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {activeView === 'budget' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-[#31343A]">Budget Analysis</h2>
              <button className="flex items-center gap-2 px-4 py-2 bg-[#005691] text-white rounded-lg hover:bg-[#004574] transition-colors">
                <FileDown className="h-4 w-4" />
                Export Report
              </button>
            </div>

            {/* Budget KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <KPICard title="Total Budget" value={formatCurrency(12800000)} />
              <KPICard title="Utilized" value={formatCurrency(10000000)} />
              <KPICard title="Remaining" value={formatCurrency(2800000)} />
              <KPICard title="Utilization Rate" value="78%" change="+2% vs last month" trend="up" />
            </div>

            {/* Budget vs Actual by Department */}
            <div className="bg-white rounded-lg border border-[#DFE2E4] p-6">
              <h3 className="text-lg font-semibold text-[#31343A] mb-4">Budget vs. Actual by Department</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-[#DFE2E4]">
                  <thead className="bg-[#DFE2E4]/30">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#9DA5A8] uppercase">Department</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#9DA5A8] uppercase">Budget</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#9DA5A8] uppercase">Actual</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#9DA5A8] uppercase">Variance</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#9DA5A8] uppercase">% Used</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-[#DFE2E4]">
                    {budgetByDepartment.map((dept) => (
                      <tr key={dept.department} className="hover:bg-[#DFE2E4]/30">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#31343A]">{dept.department}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#31343A]">{formatCurrency(dept.budget)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#31343A]">{formatCurrency(dept.actual)}</td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                          dept.actual > dept.budget ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {dept.actual > dept.budget ? '+' : ''}{formatCurrency(dept.actual - dept.budget)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 w-32 bg-[#DFE2E4] rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  dept.percentage > 100 ? 'bg-red-500' : 
                                  dept.percentage > 90 ? 'bg-amber-500' : 'bg-green-500'
                                }`}
                                style={{ width: `${Math.min(dept.percentage, 100)}%` }}
                              ></div>
                            </div>
                            <span className={`text-sm font-medium ${
                              dept.percentage > 100 ? 'text-red-600' : 
                              dept.percentage > 90 ? 'text-amber-600' : 'text-[#31343A]'
                            }`}>
                              {dept.percentage}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Over-Budget Alerts */}
            <div className="bg-white rounded-lg border border-[#DFE2E4] p-6">
              <h3 className="text-lg font-semibold text-[#31343A] mb-4">Over-Budget Alerts</h3>
              <div className="space-y-4">
                {overBudgetRequests.map((request) => (
                  <div key={request.id} className="border border-red-200 bg-red-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-red-900">{request.itemName}</h4>
                        <p className="text-sm text-red-700 mt-1">{request.department} • {formatCurrency(request.estimatedCost)}</p>
                      </div>
                      <StatusBadge status={request.budgetStatus} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Forecast */}
            <div className="bg-white rounded-lg border border-[#DFE2E4] p-6">
              <h3 className="text-lg font-semibold text-[#31343A] mb-4">Forecast Spend for Next Quarter</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-900">Q1 2025 Forecast</span>
                  <span className="text-lg font-bold text-blue-900">{formatCurrency(3200000)}</span>
                </div>
                <p className="text-xs text-blue-700">Based on historical patterns and current trend analysis</p>
              </div>
            </div>

            {/* Savings Opportunities */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[#31343A]">AI-Identified Savings Opportunities</h3>
                <Lightbulb className="h-6 w-6 text-green-600" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <h4 className="font-medium text-[#31343A] mb-2">Multi-year Contract Negotiation</h4>
                  <p className="text-sm text-[#9DA5A8] mb-2">Potential savings: {formatCurrency(450000)}</p>
                  <p className="text-xs text-[#9DA5A8]">Negotiate 3-year contracts with top 5 vendors for 12% discount</p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <h4 className="font-medium text-[#31343A] mb-2">Vendor Consolidation</h4>
                  <p className="text-sm text-[#9DA5A8] mb-2">Potential savings: {formatCurrency(320000)}</p>
                  <p className="text-xs text-[#9DA5A8]">Consolidate logistics vendors from 8 to 3 primary partners</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeView === 'vendors' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-[#31343A]">Vendor Performance</h2>
              <button className="flex items-center gap-2 px-4 py-2 bg-[#005691] text-white rounded-lg hover:bg-[#004574] transition-colors">
                <FileDown className="h-4 w-4" />
                Export Report
              </button>
            </div>

            {/* Vendor Performance KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <KPICard title="Total Vendors" value={activeVendorCount} />
              <KPICard title="High Performers" value={12} />
              <KPICard title="At Risk" value={3} />
              <KPICard title="Avg Performance" value="4.3/5" />
            </div>

            {/* Vendor Efficiency Matrix */}
            <div className="bg-white rounded-lg border border-[#DFE2E4] p-6">
              <h3 className="text-lg font-semibold text-[#31343A] mb-4">Vendor Efficiency Matrix</h3>
              <p className="text-sm text-[#9DA5A8] mb-4">Cost vs. Delivery Performance Analysis</p>
              <div className="h-64 flex items-center justify-center bg-[#DFE2E4]/30 rounded-lg border border-[#DFE2E4]">
                <p className="text-[#9DA5A8]">Efficiency Matrix Visualization</p>
              </div>
            </div>

            {/* Top Performing Vendors */}
            <div className="bg-white rounded-lg border border-[#DFE2E4] p-6">
              <h3 className="text-lg font-semibold text-[#31343A] mb-4">Top Performing Vendors</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-[#DFE2E4]">
                  <thead className="bg-[#DFE2E4]/30">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#9DA5A8] uppercase">Vendor</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#9DA5A8] uppercase">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#9DA5A8] uppercase">Performance</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#9DA5A8] uppercase">Total Spend</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#9DA5A8] uppercase">Active Contracts</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-[#DFE2E4]">
                    {vendorPerformance.slice(0, 10).map((vendor) => (
                      <tr key={vendor.id} className="hover:bg-[#DFE2E4]/30">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#31343A]">{vendor.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#9DA5A8] capitalize">{vendor.category}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-[#31343A]">{vendor.performanceRating}/5</span>
                            <div className="flex-1 w-20 bg-[#DFE2E4] rounded-full h-2">
                              <div 
                                className="bg-green-500 h-2 rounded-full" 
                                style={{ width: `${(vendor.performanceRating / 5) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#31343A]">{formatCurrency(vendor.totalSpend)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#31343A]">{vendor.activeContracts}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Contract Renewal Pipeline */}
            <div className="bg-white rounded-lg border border-[#DFE2E4] p-6">
              <h3 className="text-lg font-semibold text-[#31343A] mb-4">Contract Renewal Pipeline</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-700 mb-1">This Month</p>
                  <p className="text-2xl font-bold text-blue-900">2</p>
                  <p className="text-xs text-blue-600 mt-1">contracts expiring</p>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-sm text-amber-700 mb-1">Next Month</p>
                  <p className="text-2xl font-bold text-amber-900">5</p>
                  <p className="text-xs text-amber-600 mt-1">contracts expiring</p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-700 mb-1">Next Quarter</p>
                  <p className="text-2xl font-bold text-green-900">12</p>
                  <p className="text-xs text-green-600 mt-1">contracts expiring</p>
                </div>
              </div>
            </div>

            {/* Compliance Status */}
            <div className="bg-white rounded-lg border border-[#DFE2E4] p-6">
              <h3 className="text-lg font-semibold text-[#31343A] mb-4">Compliance Status Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-[#9DA5A8] mb-2">Vendors Meeting Standards</p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-[#DFE2E4] rounded-full h-3">
                      <div className="bg-green-500 h-3 rounded-full" style={{ width: '94%' }}></div>
                    </div>
                    <span className="text-lg font-bold text-green-600">94%</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-[#9DA5A8] mb-2">Policy Compliance</p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-[#DFE2E4] rounded-full h-3">
                      <div className="bg-blue-500 h-3 rounded-full" style={{ width: '91%' }}></div>
                    </div>
                    <span className="text-lg font-bold text-blue-600">91%</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-[#9DA5A8] mb-2">Quality Standards</p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-[#DFE2E4] rounded-full h-3">
                      <div className="bg-emerald-500 h-3 rounded-full" style={{ width: '96%' }}></div>
                    </div>
                    <span className="text-lg font-bold text-emerald-600">96%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeView === 'exceptions' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-[#31343A]">Exception Reports</h2>
              <button className="flex items-center gap-2 px-4 py-2 bg-[#005691] text-white rounded-lg hover:bg-[#004574] transition-colors">
                <FileDown className="h-4 w-4" />
                Export Report
              </button>
            </div>

            {/* Exception Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <KPICard title="Policy Violations" value={3} icon={AlertTriangle} />
              <KPICard title="Delayed Approvals" value={12} />
              <KPICard title="Unapproved Vendors" value={2} />
              <KPICard title="Budget Overruns" value={overBudgetRequests.length} />
            </div>

            {/* Policy Violations */}
            <div className="bg-white rounded-lg border border-[#DFE2E4] p-6">
              <h3 className="text-lg font-semibold text-[#31343A] mb-4">Policy Violations Summary</h3>
              <div className="space-y-4">
                <div className="border border-red-200 bg-red-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-red-900">Unauthorized Vendor Usage</h4>
                      <p className="text-sm text-red-700 mt-1">Purchase made from non-approved vendor list (2 instances)</p>
                    </div>
                    <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-medium rounded">Critical</span>
                  </div>
                </div>
                <div className="border border-amber-200 bg-amber-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-amber-900">Missing Approval Documentation</h4>
                      <p className="text-sm text-amber-700 mt-1">1 request processed without required CFO approval signature</p>
                    </div>
                    <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded">High</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Delayed Approvals */}
            <div className="bg-white rounded-lg border border-[#DFE2E4] p-6">
              <h3 className="text-lg font-semibold text-[#31343A] mb-4">Delayed Approvals by Department</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-[#DFE2E4]">
                  <thead className="bg-[#DFE2E4]/30">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#9DA5A8] uppercase">Department</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#9DA5A8] uppercase">Delayed Count</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#9DA5A8] uppercase">Avg Delay (days)</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#9DA5A8] uppercase">Total Value</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-[#DFE2E4]">
                    <tr className="hover:bg-[#DFE2E4]/30">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#31343A]">IT</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#31343A]">5</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#31343A]">3.2</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#31343A]">{formatCurrency(450000)}</td>
                    </tr>
                    <tr className="hover:bg-[#DFE2E4]/30">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#31343A]">Manufacturing</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#31343A]">4</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#31343A]">2.8</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#31343A]">{formatCurrency(320000)}</td>
                    </tr>
                    <tr className="hover:bg-[#DFE2E4]/30">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#31343A]">Production</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#31343A]">3</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#31343A]">2.1</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#31343A]">{formatCurrency(280000)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Budget Overrun Categories */}
            <div className="bg-white rounded-lg border border-[#DFE2E4] p-6">
              <h3 className="text-lg font-semibold text-[#31343A] mb-4">Budget Overrun Categories</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-[#DFE2E4]/30 rounded-lg">
                  <span className="text-sm font-medium text-[#31343A]">Raw Materials</span>
                  <span className="text-sm font-semibold text-red-600">12 requests • {formatCurrency(1250000)} over budget</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#DFE2E4]/30 rounded-lg">
                  <span className="text-sm font-medium text-[#31343A]">Software</span>
                  <span className="text-sm font-semibold text-red-600">3 requests • {formatCurrency(250000)} over budget</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#DFE2E4]/30 rounded-lg">
                  <span className="text-sm font-medium text-[#31343A]">Equipment</span>
                  <span className="text-sm font-semibold text-amber-600">5 requests • {formatCurrency(180000)} over budget</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeView === 'insights' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-[#31343A]">Strategic Insights</h2>
              <button className="flex items-center gap-2 px-4 py-2 bg-[#005691] text-white rounded-lg hover:bg-[#004574] transition-colors">
                <FileDown className="h-4 w-4" />
                Export Report
              </button>
            </div>

            {/* AI-Powered Insights Hero */}
            <div className="bg-gradient-to-r from-[#005691] to-[#0066a3] rounded-lg p-8 text-white">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-semibold mb-2">AI-Powered Predictive Analysis</h3>
                  <p className="text-blue-100">Advanced analytics for next-quarter procurement needs and optimization opportunities</p>
                </div>
                <Lightbulb className="h-10 w-10 text-blue-200" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white bg-opacity-10 rounded-lg p-4">
                  <p className="text-sm font-medium mb-2">Predicted Q1 2025 Spend</p>
                  <p className="text-2xl font-bold">{formatCurrency(3200000)}</p>
                  <p className="text-xs text-blue-100 mt-1">+5% vs Q4 2024 forecast</p>
                </div>
                <div className="bg-white bg-opacity-10 rounded-lg p-4">
                  <p className="text-sm font-medium mb-2">Optimization Potential</p>
                  <p className="text-2xl font-bold">{formatCurrency(770000)}</p>
                  <p className="text-xs text-blue-100 mt-1">Identified savings opportunities</p>
                </div>
                <div className="bg-white bg-opacity-10 rounded-lg p-4">
                  <p className="text-sm font-medium mb-2">Risk Level</p>
                  <p className="text-2xl font-bold">Medium</p>
                  <p className="text-xs text-blue-100 mt-1">2 high-risk vendor contracts</p>
                </div>
              </div>
            </div>

            {/* Spend Pattern Insights */}
            <div className="bg-white rounded-lg border border-[#DFE2E4] p-6">
              <h3 className="text-lg font-semibold text-[#31343A] mb-4">Spend Pattern Insights</h3>
              <div className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-medium text-[#31343A] mb-1">Q4 Software Category Increase</h4>
                  <p className="text-sm text-[#9DA5A8] mb-2">15% increase in software category spend detected. This trend is expected to continue.</p>
                  <p className="text-xs text-[#9DA5A8]"><strong>Recommendation:</strong> Consider multi-year licensing agreements for cost optimization (potential savings: {formatCurrency(450000)})</p>
                </div>
                <div className="border-l-4 border-amber-500 pl-4">
                  <h4 className="font-medium text-[#31343A] mb-1">Logistics Cost Trend</h4>
                  <p className="text-sm text-[#9DA5A8] mb-2">Logistics costs trending upward (+8% month-over-month). Evaluate consolidation opportunities.</p>
                  <p className="text-xs text-[#9DA5A8]"><strong>Recommendation:</strong> Consolidate with top 3 vendors for better negotiation leverage</p>
                </div>
                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-medium text-[#31343A] mb-1">Manufacturing Efficiency</h4>
                  <p className="text-sm text-[#9DA5A8] mb-2">Manufacturing department consistently operating under budget (-7% average variance).</p>
                  <p className="text-xs text-[#9DA5A8]"><strong>Recommendation:</strong> Consider allocating saved budget to critical infrastructure upgrades</p>
                </div>
              </div>
            </div>

            {/* Procurement Efficiency Metrics */}
            <div className="bg-white rounded-lg border border-[#DFE2E4] p-6">
              <h3 className="text-lg font-semibold text-[#31343A] mb-4">Procurement Efficiency Metrics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-[#9DA5A8] mb-2">Average Time-to-PO</p>
                  <p className="text-3xl font-semibold text-[#31343A]">5.2 days</p>
                  <p className="text-xs text-green-600 mt-2">↓ 0.8 days vs last quarter</p>
                  <div className="mt-4 h-2 bg-[#DFE2E4] rounded-full">
                    <div className="h-2 bg-green-500 rounded-full" style={{ width: '78%' }}></div>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-[#9DA5A8] mb-2">Approval Cycle Time</p>
                  <p className="text-3xl font-semibold text-[#31343A]">2.4 days</p>
                  <p className="text-xs text-green-600 mt-2">↓ 1.2 days vs last quarter</p>
                  <div className="mt-4 h-2 bg-[#DFE2E4] rounded-full">
                    <div className="h-2 bg-blue-500 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-[#9DA5A8] mb-2">Vendor Onboarding Time</p>
                  <p className="text-3xl font-semibold text-[#31343A]">12 days</p>
                  <p className="text-xs text-amber-600 mt-2">+2 days vs last quarter</p>
                  <div className="mt-4 h-2 bg-[#DFE2E4] rounded-full">
                    <div className="h-2 bg-amber-500 rounded-full" style={{ width: '65%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Risk Indicators Dashboard */}
            <div className="bg-white rounded-lg border border-[#DFE2E4] p-6">
              <h3 className="text-lg font-semibold text-[#31343A] mb-4">Risk Indicators Dashboard</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-[#31343A] mb-3">High-Risk Areas</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                      <span className="text-sm text-[#31343A]">High-risk vendors</span>
                      <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-medium rounded">2</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <span className="text-sm text-[#31343A]">Delayed deliveries</span>
                      <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded">5</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <span className="text-sm text-[#31343A]">Contract expiring soon</span>
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">7</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-[#31343A] mb-3">Opportunities</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                      <span className="text-sm text-[#31343A]">Cost optimization potential</span>
                      <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">{formatCurrency(770000)}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <span className="text-sm text-[#31343A]">Vendor consolidation</span>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">3 vendors</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                      <span className="text-sm text-[#31343A]">Process improvement</span>
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-medium rounded">On track</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Predictive Analysis */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200 p-6">
              <h3 className="text-lg font-semibold text-[#31343A] mb-4">Predictive Analysis for Next Quarter</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg p-4 border border-purple-200">
                  <h4 className="font-medium text-[#31343A] mb-2">Expected Procurement Volume</h4>
                  <p className="text-sm text-[#9DA5A8] mb-3">Based on historical patterns and current order pipeline</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#9DA5A8]">Raw Materials</span>
                      <span className="text-sm font-semibold text-[#31343A]">{formatCurrency(1150000)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#9DA5A8]">Software</span>
                      <span className="text-sm font-semibold text-[#31343A]">{formatCurrency(850000)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#9DA5A8]">Equipment</span>
                      <span className="text-sm font-semibold text-[#31343A]">{formatCurrency(650000)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#9DA5A8]">Services</span>
                      <span className="text-sm font-semibold text-[#31343A]">{formatCurrency(550000)}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-purple-200">
                  <h4 className="font-medium text-[#31343A] mb-2">Recommended Actions</h4>
                  <ul className="space-y-2 text-sm text-[#9DA5A8]">
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500 mt-1">•</span>
                      <span>Initiate contract renewal discussions with 3 high-value vendors</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500 mt-1">•</span>
                      <span>Review and optimize software licensing agreements</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500 mt-1">•</span>
                      <span>Consider bulk purchasing for raw materials Q1 2025</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500 mt-1">•</span>
                      <span>Evaluate new vendor partnerships for logistics consolidation</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}



