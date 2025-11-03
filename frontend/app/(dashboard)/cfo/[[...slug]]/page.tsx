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
  FileDown,
  DollarSign,
  Clock,
  FileCheck,
  Zap
} from 'lucide-react';
import { monthlySpendData, categorySpendData, topVendorsData, mockVendors, mockRequests } from '@/lib/mockData';
import { formatCurrency } from '@/lib/utils';
import { LineChart } from '@/components/charts/LineChart';
import { BarChart } from '@/components/charts/BarChart';
import { PieChart } from '@/components/charts/PieChart';
import { MultiLineChart } from '@/components/charts/MultiLineChart';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Line, Area, AreaChart, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, ComposedChart, ScatterChart, Scatter, ReferenceLine } from 'recharts';

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

  // CFO Finance Cockpit Data
  const ytdBudget = 12800000;
  const ytdSpend = 9984000; // 78% utilization
  const ytdVariance = ytdSpend - ytdBudget;
  const ytdVariancePct = ((ytdVariance / ytdBudget) * 100).toFixed(1);
  
  const runRate = 1050000; // Last 30 days annualized / 12
  const committedNotInvoiced = 2450000; // Open POs
  const agingPayables = {
    '≤30': 3200000,
    '31-60': 1450000,
    '61-90': 650000,
    '90+': 280000
  };
  
  const top3Overruns = [
    { dept: 'IT', category: 'Software', variance: 12.5, amount: 350000 },
    { dept: 'Production', category: 'Raw Materials', variance: 8.3, amount: 265000 },
    { dept: 'Manufacturing', category: 'Equipment', variance: 6.2, amount: 180000 },
  ];

  // Liquidity & Cash Discipline Data
  const cnirAging = {
    '≤30': 1800000,
    '31-60': 450000,
    '61-90': 150000,
    '90+': 50000
  };
  const discountCaptureRate = 68.5; // %
  const lostDiscounts = 125000; // ₹
  const discountAPR = 24.5; // %
  
  // 13-week cash calendar (Base / Early-pay / Stretch scenarios)
  const cashCalendar = Array.from({ length: 13 }, (_, i) => ({
    week: `W${i + 1}`,
    base: 3200000 + (i * 150000),
    earlyPay: 2800000 + (i * 130000),
    stretch: 3600000 + (i * 170000),
  }));

  // Price-Volume-Mix Bridge Data
  const pvmBridge = {
    priceVar: 1250000,
    volumeVar: -820000,
    mixVar: 310000,
    fxVar: 90000,
    oneOffs: -140000,
    total: 690000
  };

  // Should-Cost Gap Data
  const shouldCostGaps = [
    { category: 'Steel & Raw Materials', vendorPrice: 450000, shouldCost: 420000, gap: 7.1, atRisk: 30000, beta: 0.95, r2: 0.92 },
    { category: 'Engine Components', vendorPrice: 320000, shouldCost: 310000, gap: 3.2, atRisk: 10000, beta: 0.88, r2: 0.89 },
  ];

  // Vendor Concentration Data
  const vendorConcentration = [
    { category: 'Steel & Raw Materials', hhi: 2850, top3Pct: 72, singleSourcePct: 15, risk: 'High' },
    { category: 'Electronics & Sensors', hhi: 3420, top3Pct: 78, singleSourcePct: 22, risk: 'High' },
    { category: 'Engine Components', hhi: 1950, top3Pct: 58, singleSourcePct: 8, risk: 'Medium' },
  ];

  // FY Projection from Run-Rate
  const fyProjection = runRate * 12;
  const fyProjectionVariance = ((fyProjection - ytdBudget) / ytdBudget) * 100;

  // Data Quality Metrics
  const dataConfidence = 87.5; // %
  const threeWayMatched = 92.3; // %
  const classifiedSpend = 94.1; // %
  const maverickSpendPct = 5.2; // %
  const contractedSpendCoverage = 78.5; // %

  // Extended department data for league table
  const departmentLeagueTable = [
    { 
      dept: 'Production', 
      fyBudget: 3200000, 
      committed: 3100000, 
      invoiced: 2950000, 
      paid: 2850000, 
      varianceAbs: -350000, 
      variancePct: -10.9, 
      runRatePerMonth: 305000, 
      momDeltaPct: 2.3, 
      yoyDeltaPct: 5.1, 
      indentCount: 142, 
      avgApprovalHours: 48 
    },
    { 
      dept: 'Manufacturing', 
      fyBudget: 4500000, 
      committed: 4200000, 
      invoiced: 4000000, 
      paid: 3850000, 
      varianceAbs: -650000, 
      variancePct: -14.4, 
      runRatePerMonth: 420000, 
      momDeltaPct: 1.8, 
      yoyDeltaPct: 3.2, 
      indentCount: 218, 
      avgApprovalHours: 52 
    },
    { 
      dept: 'IT', 
      fyBudget: 2500000, 
      committed: 2800000, 
      invoiced: 2650000, 
      paid: 2550000, 
      varianceAbs: 50000, 
      variancePct: 2.0, 
      runRatePerMonth: 280000, 
      momDeltaPct: 8.5, 
      yoyDeltaPct: 12.3, 
      indentCount: 89, 
      avgApprovalHours: 36 
    },
    { 
      dept: 'Logistics', 
      fyBudget: 1800000, 
      committed: 1650000, 
      invoiced: 1580000, 
      paid: 1520000, 
      varianceAbs: -280000, 
      variancePct: -15.6, 
      runRatePerMonth: 165000, 
      momDeltaPct: -1.2, 
      yoyDeltaPct: 2.5, 
      indentCount: 76, 
      avgApprovalHours: 42 
    },
    { 
      dept: 'Services', 
      fyBudget: 800000, 
      committed: 750000, 
      invoiced: 720000, 
      paid: 700000, 
      varianceAbs: -100000, 
      variancePct: -12.5, 
      runRatePerMonth: 75000, 
      momDeltaPct: 0.5, 
      yoyDeltaPct: -1.2, 
      indentCount: 45, 
      avgApprovalHours: 38 
    },
  ];

  // Department Spend Trends Data (12 months for full view)
  const departmentSpendTrends = [
    { month: 'Jan', Manufacturing: 300000, Production: 240000, IT: 180000, Logistics: 130000, Services: 58000, budget: 1120000 },
    { month: 'Feb', Manufacturing: 315000, Production: 250000, IT: 190000, Logistics: 135000, Services: 60000, budget: 1120000 },
    { month: 'Mar', Manufacturing: 330000, Production: 260000, IT: 200000, Logistics: 138000, Services: 62000, budget: 1120000 },
    { month: 'Apr', Manufacturing: 340000, Production: 265000, IT: 205000, Logistics: 140000, Services: 63000, budget: 1120000 },
    { month: 'May', Manufacturing: 350000, Production: 270000, IT: 210000, Logistics: 142000, Services: 65000, budget: 1120000 },
    { month: 'Jun', Manufacturing: 345000, Production: 268000, IT: 208000, Logistics: 141000, Services: 64000, budget: 1120000 },
    { month: 'Jul', Manufacturing: 340000, Production: 260000, IT: 210000, Logistics: 140000, Services: 62000, budget: 1120000 },
    { month: 'Aug', Manufacturing: 365000, Production: 275000, IT: 225000, Logistics: 145000, Services: 68000, budget: 1120000 },
    { month: 'Sep', Manufacturing: 380000, Production: 290000, IT: 240000, Logistics: 150000, Services: 72000, budget: 1120000 },
    { month: 'Oct', Manufacturing: 395000, Production: 300000, IT: 255000, Logistics: 158000, Services: 75000, budget: 1120000 },
    { month: 'Nov', Manufacturing: 410000, Production: 305000, IT: 270000, Logistics: 162000, Services: 78000, budget: 1120000 },
    { month: 'Dec', Manufacturing: 420000, Production: 310000, IT: 280000, Logistics: 165000, Services: 75000, budget: 1120000 },
  ];

  // Category Spend Trends Data (6 months)
  const categorySpendTrends = [
    { month: 'Jul', 'Steel & Raw Materials': 400000, 'Engine Components': 265000, 'Electronics & Sensors': 183000, 'Tires & Wheels': 125000, 'Paint & Coatings': 71000 },
    { month: 'Aug', 'Steel & Raw Materials': 420000, 'Engine Components': 280000, 'Electronics & Sensors': 192000, 'Tires & Wheels': 130000, 'Paint & Coatings': 74000 },
    { month: 'Sep', 'Steel & Raw Materials': 435000, 'Engine Components': 290000, 'Electronics & Sensors': 200000, 'Tires & Wheels': 135000, 'Paint & Coatings': 77000 },
    { month: 'Oct', 'Steel & Raw Materials': 450000, 'Engine Components': 300000, 'Electronics & Sensors': 208000, 'Tires & Wheels': 140000, 'Paint & Coatings': 80000 },
    { month: 'Nov', 'Steel & Raw Materials': 465000, 'Engine Components': 310000, 'Electronics & Sensors': 215000, 'Tires & Wheels': 145000, 'Paint & Coatings': 82000 },
    { month: 'Dec', 'Steel & Raw Materials': 480000, 'Engine Components': 320000, 'Electronics & Sensors': 220000, 'Tires & Wheels': 150000, 'Paint & Coatings': 85000 },
  ];

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
            {/* CFO Finance Cockpit - Top Strip KPIs */}
            <div className="space-y-4">
              {/* Primary KPIs Row */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="bg-white rounded-lg border border-[#DFE2E4] p-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-start justify-between mb-2">
                  <div className="p-2 bg-[#005691]/10 rounded-lg">
                    <DollarSign className="h-5 w-5 text-[#005691]" />
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded ${parseFloat(ytdVariancePct) > 0 ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                    {parseFloat(ytdVariancePct) > 0 ? '+' : ''}{ytdVariancePct}%
                  </span>
                </div>
                <h3 className="text-xs text-[#9DA5A8] mb-1">YTD Spend vs Budget</h3>
                <p className="text-lg font-bold text-[#31343A]">{formatCurrency(ytdSpend)}</p>
                <p className="text-xs text-[#9DA5A8] mt-1">of {formatCurrency(ytdBudget)}</p>
              </div>

              <div className="bg-white rounded-lg border border-[#DFE2E4] p-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-start justify-between mb-2">
                  <div className="p-2 bg-[#005691]/10 rounded-lg">
                    <Zap className="h-5 w-5 text-[#005691]" />
                  </div>
                </div>
                <h3 className="text-xs text-[#9DA5A8] mb-1">Run-rate (Monthly)</h3>
                <p className="text-lg font-bold text-[#31343A]">{formatCurrency(runRate)}</p>
                <p className="text-xs text-[#9DA5A8] mt-1">Last 30d annualized</p>
              </div>

              <div className="bg-white rounded-lg border border-[#DFE2E4] p-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-start justify-between mb-2">
                  <div className="p-2 bg-amber-50 rounded-lg">
                    <FileCheck className="h-5 w-5 text-amber-600" />
                  </div>
                </div>
                <h3 className="text-xs text-[#9DA5A8] mb-1">Committed Not Invoiced</h3>
                <p className="text-lg font-bold text-[#31343A]">{formatCurrency(committedNotInvoiced)}</p>
                <p className="text-xs text-[#9DA5A8] mt-1">Open POs</p>
              </div>

              <div className="bg-white rounded-lg border border-[#DFE2E4] p-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-start justify-between mb-2">
                  <div className="p-2 bg-[#005691]/10 rounded-lg">
                    <Clock className="h-5 w-5 text-[#005691]" />
                  </div>
                </div>
                <h3 className="text-xs text-[#9DA5A8] mb-1">Aging Payables</h3>
                <p className="text-lg font-bold text-[#31343A]">{formatCurrency(Object.values(agingPayables).reduce((a, b) => a + b, 0))}</p>
                <div className="flex gap-1 mt-2 text-xs">
                  <span className="text-green-600">≤30: {formatCurrency(agingPayables['≤30'])}</span>
                  <span className="text-amber-600">31-60: {formatCurrency(agingPayables['31-60'])}</span>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-[#DFE2E4] p-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-start justify-between mb-2">
                  <div className="p-2 bg-red-50 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  </div>
                </div>
                <h3 className="text-xs text-[#9DA5A8] mb-1">Top 3 Overruns</h3>
                <div className="space-y-1 mt-2">
                  {top3Overruns.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <span className="text-[#31343A]">{item.dept}/{item.category}</span>
                      <span className="font-semibold text-red-600">+{item.variance}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

              {/* Micro-KPIs Row */}
              <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                <div className="bg-white rounded-lg border border-[#DFE2E4] p-3">
                  <p className="text-xs text-[#9DA5A8] mb-1">FY Projection</p>
                  <p className="text-sm font-bold text-[#31343A]">{formatCurrency(fyProjection)}</p>
                  <p className={`text-xs mt-1 ${fyProjectionVariance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {fyProjectionVariance > 0 ? '+' : ''}{fyProjectionVariance.toFixed(1)}% vs budget
                  </p>
                </div>
                <div className="bg-white rounded-lg border border-[#DFE2E4] p-3">
                  <p className="text-xs text-[#9DA5A8] mb-1">Discount Capture</p>
                  <p className="text-sm font-bold text-[#31343A]">{discountCaptureRate.toFixed(1)}%</p>
                  <p className="text-xs text-red-600 mt-1">Lost: {formatCurrency(lostDiscounts)}</p>
                </div>
                <div className="bg-white rounded-lg border border-[#DFE2E4] p-3">
                  <p className="text-xs text-[#9DA5A8] mb-1">Cash at Risk</p>
                  <p className="text-sm font-bold text-[#31343A]">{formatCurrency(cnirAging['90+'])}</p>
                  <p className="text-xs text-[#9DA5A8] mt-1">90+ days CNIR</p>
                </div>
                <div className="bg-white rounded-lg border border-[#DFE2E4] p-3">
                  <p className="text-xs text-[#9DA5A8] mb-1">Maverick Spend</p>
                  <p className="text-sm font-bold text-[#31343A]">{maverickSpendPct.toFixed(1)}%</p>
                  <p className="text-xs text-amber-600 mt-1">Policy drift</p>
                </div>
                <div className="bg-white rounded-lg border border-[#DFE2E4] p-3">
                  <p className="text-xs text-[#9DA5A8] mb-1">Contracted Coverage</p>
                  <p className="text-sm font-bold text-[#31343A]">{contractedSpendCoverage.toFixed(1)}%</p>
                  <p className="text-xs text-[#9DA5A8] mt-1">Under contract</p>
                </div>
                <div className="bg-white rounded-lg border border-[#DFE2E4] p-3">
                  <p className="text-xs text-[#9DA5A8] mb-1">Data Confidence</p>
                  <p className="text-sm font-bold text-[#31343A]">{dataConfidence.toFixed(1)}%</p>
                  <p className="text-xs text-[#9DA5A8] mt-1">3-way: {threeWayMatched.toFixed(1)}%</p>
                </div>
              </div>
            </div>

            {/* Liquidity & Cash Discipline Section */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-[#31343A]">Liquidity & Cash Discipline</h2>
              
              {/* 13-Week AP Cash-Out Calendar */}
              <div className="bg-white rounded-lg border border-[#DFE2E4] p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-[#31343A] mb-1">13-Week AP Cash-Out Calendar</h3>
                    <p className="text-sm text-[#9DA5A8]">Cash outflow forecast by week</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 text-sm border border-[#B6BBBE] rounded-lg hover:bg-[#DFE2E4]/30">Base</button>
                    <button className="px-3 py-1 text-sm bg-[#005691] text-white rounded-lg">Early-pay</button>
                    <button className="px-3 py-1 text-sm border border-[#B6BBBE] rounded-lg hover:bg-[#DFE2E4]/30">Stretch</button>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={cashCalendar}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#DFE2E4" />
                    <XAxis dataKey="week" tick={{ fill: '#9DA5A8', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#9DA5A8', fontSize: 11 }} label={{ value: '₹ (thousands)', angle: -90, position: 'insideLeft', style: { fill: '#9DA5A8', fontSize: 11 } }} />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend />
                    <Bar dataKey="base" fill="#005691" name="Base Terms" />
                    <Bar dataKey="earlyPay" fill="#E00420" name="Early-pay" />
                    <Bar dataKey="stretch" fill="#31343A" name="Stretch Terms" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              {/* CNIR Aging & Discount Metrics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg border border-[#DFE2E4] p-6">
                  <h3 className="text-lg font-semibold text-[#31343A] mb-4">Committed-Not-Invoiced Aging</h3>
                  <div className="space-y-3">
                    {Object.entries(cnirAging).map(([bucket, amount]) => (
                      <div key={bucket} className="flex items-center justify-between p-3 bg-[#DFE2E4]/20 rounded-lg">
                        <span className="text-sm font-medium text-[#31343A]">{bucket} days</span>
                        <span className="text-sm font-bold text-[#31343A]">{formatCurrency(amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white rounded-lg border border-[#DFE2E4] p-6">
                  <h3 className="text-lg font-semibold text-[#31343A] mb-4">Discount Capture & ROI</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-[#9DA5A8]">Capture Rate</span>
                        <span className="text-lg font-bold text-[#31343A]">{discountCaptureRate.toFixed(1)}%</span>
                      </div>
                      <div className="h-2 bg-[#DFE2E4] rounded-full">
                        <div className="h-2 bg-[#005691] rounded-full" style={{ width: `${discountCaptureRate}%` }}></div>
                      </div>
                    </div>
                    <div className="pt-3 border-t border-[#DFE2E4]">
                      <p className="text-sm text-[#9DA5A8] mb-1">Lost Discounts (Last 30d)</p>
                      <p className="text-2xl font-bold text-red-600">{formatCurrency(lostDiscounts)}</p>
                    </div>
                    <div className="pt-3 border-t border-[#DFE2E4]">
                      <p className="text-sm text-[#9DA5A8] mb-1">Dynamic Discount APR</p>
                      <p className="text-2xl font-bold text-[#31343A]">{discountAPR.toFixed(1)}%</p>
                    </div>
                  </div>
                </div>
              </div>
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

            {/* 1) Spends by Department — with trends */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-[#31343A]">Spends by Department with Trends</h2>
              
              {/* Stacked Area Chart (12 months) */}
              <div className="bg-white rounded-lg border border-[#DFE2E4] p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-[#31343A] mb-1">Monthly Spend by Department</h3>
                    <p className="text-sm text-[#9DA5A8]">12-month stacked area showing seasonality and mix-shift</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 text-sm border border-[#B6BBBE] rounded-lg hover:bg-[#DFE2E4]/30">
                      ₹
                    </button>
                    <button className="px-3 py-1 text-sm bg-[#005691] text-white rounded-lg">
                      %
                    </button>
                    <button className="p-2 text-[#9DA5A8] hover:text-[#9DA5A8]">
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={400}>
                  <ComposedChart data={departmentSpendTrends.map((d: any) => ({ ...d, Manufacturing: d.Manufacturing / 1000, Production: d.Production / 1000, IT: d.IT / 1000, Logistics: d.Logistics / 1000, Services: d.Services / 1000, budget: d.budget / 1000 }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#DFE2E4" />
                    <XAxis dataKey="month" tick={{ fill: '#9DA5A8', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#9DA5A8', fontSize: 12 }} label={{ value: 'Spend (thousands)', angle: -90, position: 'insideLeft', style: { fill: '#9DA5A8', fontSize: 12 } }} />
                    <Tooltip 
                      formatter={(value: number) => `₹${value.toLocaleString('en-IN')}K`}
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #DFE2E4', borderRadius: '6px' }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Area type="monotone" dataKey="Manufacturing" stackId="1" stroke="#005691" fill="#005691" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="Production" stackId="1" stroke="#0066a3" fill="#0066a3" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="IT" stackId="1" stroke="#E00420" fill="#E00420" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="Logistics" stackId="1" stroke="#31343A" fill="#31343A" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="Services" stackId="1" stroke="#4A4E56" fill="#4A4E56" fillOpacity={0.6} />
                    <Line type="monotone" dataKey="budget" stroke="#E00420" strokeDasharray="5 5" strokeWidth={2} dot={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              {/* Department League Table */}
              <div className="bg-white rounded-lg border border-[#DFE2E4] p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-[#31343A]">Department League Table</h3>
                  <button className="p-2 text-[#9DA5A8] hover:text-[#9DA5A8]">
                    <Download className="h-4 w-4" />
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#DFE2E4]">
                        <th className="text-left py-3 px-4 text-[#9DA5A8] font-medium">Dept</th>
                        <th className="text-right py-3 px-4 text-[#9DA5A8] font-medium">FY Budget</th>
                        <th className="text-right py-3 px-4 text-[#9DA5A8] font-medium">Committed</th>
                        <th className="text-right py-3 px-4 text-[#9DA5A8] font-medium">Invoiced</th>
                        <th className="text-right py-3 px-4 text-[#9DA5A8] font-medium">Paid</th>
                        <th className="text-right py-3 px-4 text-[#9DA5A8] font-medium">Variance</th>
                        <th className="text-right py-3 px-4 text-[#9DA5A8] font-medium">Run-rate</th>
                        <th className="text-right py-3 px-4 text-[#9DA5A8] font-medium">MoM Δ</th>
                        <th className="text-right py-3 px-4 text-[#9DA5A8] font-medium">YoY Δ</th>
                        <th className="text-right py-3 px-4 text-[#9DA5A8] font-medium">#Indents</th>
                        <th className="text-right py-3 px-4 text-[#9DA5A8] font-medium">Avg Approval</th>
                      </tr>
                    </thead>
                    <tbody>
                      {departmentLeagueTable.map((dept, idx) => {
                        const committedPaidGap = dept.committed - dept.paid;
                        const committedPaidDays = Math.round((committedPaidGap / dept.committed) * 60); // Estimated days
                        const dpo = 35 + (idx * 3); // Mock DPO
                        const top3VendorPct = 65 + (idx * 5);
                        const exceptions = idx % 3 === 0 ? 12 : idx % 3 === 1 ? 5 : 2;
                        const dataQuality = 90 + (idx % 3);
                        return (
                          <tr key={idx} className="border-b border-[#DFE2E4]/50 hover:bg-[#DFE2E4]/30 cursor-pointer">
                            <td className="py-3 px-4 font-medium text-[#31343A]">{dept.dept}</td>
                            <td className="py-3 px-4 text-right text-[#31343A]">{formatCurrency(dept.fyBudget)}</td>
                            <td className="py-3 px-4 text-right text-[#31343A]">{formatCurrency(dept.committed)}</td>
                            <td className="py-3 px-4 text-right text-[#31343A]">{formatCurrency(dept.invoiced)}</td>
                            <td className="py-3 px-4 text-right text-[#31343A]">{formatCurrency(dept.paid)}</td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex flex-col items-end">
                                <span className="text-xs text-[#31343A]">{formatCurrency(committedPaidGap)}</span>
                                <span className="text-xs text-[#9DA5A8]">{committedPaidDays}d</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex flex-col items-end">
                                <span className="text-xs text-[#31343A]">{dpo}d</span>
                                <span className="text-xs text-[#9DA5A8]">Policy: 30d</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <span className={`text-xs font-semibold ${
                                top3VendorPct > 70 ? 'text-red-600' :
                                top3VendorPct > 60 ? 'text-amber-600' :
                                'text-green-600'
                              }`}>
                                {top3VendorPct.toFixed(0)}%
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                dept.variancePct > 10 ? 'bg-red-50 text-red-700' :
                                dept.variancePct > 0 ? 'bg-amber-50 text-amber-700' :
                                'bg-green-50 text-green-700'
                              }`}>
                                {dept.variancePct > 0 ? '+' : ''}{dept.variancePct.toFixed(1)}%
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right text-[#31343A]">{formatCurrency(dept.runRatePerMonth)}</td>
                            <td className="py-3 px-4 text-right">
                              <span className={`text-xs font-semibold ${
                                dept.momDeltaPct > 5 ? 'text-red-600' :
                                dept.momDeltaPct > 0 ? 'text-amber-600' :
                                'text-green-600'
                              }`}>
                                {dept.momDeltaPct > 0 ? '+' : ''}{dept.momDeltaPct.toFixed(1)}%
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <span className={`text-xs font-semibold ${
                                exceptions > 8 ? 'text-red-600' :
                                exceptions > 3 ? 'text-amber-600' :
                                'text-green-600'
                              }`}>
                                {exceptions}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <span className={`text-xs font-semibold ${
                                dataQuality > 95 ? 'text-green-600' :
                                dataQuality > 90 ? 'text-amber-600' :
                                'text-red-600'
                              }`}>
                                {dataQuality.toFixed(0)}%
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Price-Volume-Mix Bridge */}
              <div className="bg-white rounded-lg border border-[#DFE2E4] p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-[#31343A] mb-1">Price-Volume-Mix Bridge</h3>
                    <p className="text-sm text-[#9DA5A8]">IT up ₹3.1M MoM: Price +₹1.25M, Volume −₹0.82M, Mix +₹0.31M; FX +₹0.09M</p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                  <RechartsBarChart data={[
                    { label: 'Price Δ', value: pvmBridge.priceVar / 1000, fill: '#E00420' },
                    { label: 'Volume Δ', value: pvmBridge.volumeVar / 1000, fill: '#0066a3' },
                    { label: 'Mix Δ', value: pvmBridge.mixVar / 1000, fill: '#005691' },
                    { label: 'FX', value: pvmBridge.fxVar / 1000, fill: '#4A4E56' },
                    { label: 'One-offs', value: pvmBridge.oneOffs / 1000, fill: '#9DA5A8' },
                    { label: 'Net Variance', value: pvmBridge.total / 1000, fill: '#31343A' },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#DFE2E4" />
                    <XAxis dataKey="label" tick={{ fill: '#9DA5A8', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#9DA5A8', fontSize: 11 }} label={{ value: '₹ (thousands)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip formatter={(value: number) => `₹${value.toLocaleString('en-IN')}K`} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {[
                        { fill: '#E00420' },
                        { fill: '#0066a3' },
                        { fill: '#005691' },
                        { fill: '#4A4E56' },
                        { fill: '#9DA5A8' },
                        { fill: '#31343A' },
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>

              {/* Should-Cost Gap & Indexation */}
              <div className="bg-white rounded-lg border border-[#DFE2E4] p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-[#31343A]">Should-Cost Gap & Indexation IQ</h3>
                  <button className="p-2 text-[#9DA5A8] hover:text-[#9DA5A8]">
                    <Download className="h-4 w-4" />
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#DFE2E4]">
                        <th className="text-left py-3 px-4 text-[#9DA5A8] font-medium">Category</th>
                        <th className="text-right py-3 px-4 text-[#9DA5A8] font-medium">Vendor Price</th>
                        <th className="text-right py-3 px-4 text-[#9DA5A8] font-medium">Should-Cost</th>
                        <th className="text-right py-3 px-4 text-[#9DA5A8] font-medium">Gap %</th>
                        <th className="text-right py-3 px-4 text-[#9DA5A8] font-medium">At-Risk ₹</th>
                        <th className="text-right py-3 px-4 text-[#9DA5A8] font-medium">β to Index</th>
                        <th className="text-right py-3 px-4 text-[#9DA5A8] font-medium">R²</th>
                      </tr>
                    </thead>
                    <tbody>
                      {shouldCostGaps.map((item, idx) => (
                        <tr key={idx} className="border-b border-[#DFE2E4]/50 hover:bg-[#DFE2E4]/30">
                          <td className="py-3 px-4 font-medium text-[#31343A]">{item.category}</td>
                          <td className="py-3 px-4 text-right text-[#31343A]">{formatCurrency(item.vendorPrice)}</td>
                          <td className="py-3 px-4 text-right text-[#31343A]">{formatCurrency(item.shouldCost)}</td>
                          <td className="py-3 px-4 text-right">
                            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                              item.gap > 5 ? 'bg-red-50 text-red-700' :
                              item.gap > 2 ? 'bg-amber-50 text-amber-700' :
                              'bg-green-50 text-green-700'
                            }`}>
                              {item.gap > 0 ? '+' : ''}{item.gap.toFixed(1)}%
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right text-red-600 font-semibold">{formatCurrency(item.atRisk)}</td>
                          <td className="py-3 px-4 text-right text-[#31343A]">{item.beta.toFixed(2)}</td>
                          <td className="py-3 px-4 text-right text-[#31343A]">{item.r2.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Vendor Concentration Risk */}
              <div className="bg-white rounded-lg border border-[#DFE2E4] p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-[#31343A]">Vendor Concentration Risk (HHI)</h3>
                  <button className="p-2 text-[#9DA5A8] hover:text-[#9DA5A8]">
                    <Download className="h-4 w-4" />
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#DFE2E4]">
                        <th className="text-left py-3 px-4 text-[#9DA5A8] font-medium">Category</th>
                        <th className="text-right py-3 px-4 text-[#9DA5A8] font-medium">HHI</th>
                        <th className="text-right py-3 px-4 text-[#9DA5A8] font-medium">Top-3 %</th>
                        <th className="text-right py-3 px-4 text-[#9DA5A8] font-medium">Single-Source %</th>
                        <th className="text-right py-3 px-4 text-[#9DA5A8] font-medium">Risk</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vendorConcentration.map((item, idx) => (
                        <tr key={idx} className="border-b border-[#DFE2E4]/50 hover:bg-[#DFE2E4]/30">
                          <td className="py-3 px-4 font-medium text-[#31343A]">{item.category}</td>
                          <td className="py-3 px-4 text-right">
                            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                              item.hhi > 2500 ? 'bg-red-50 text-red-700' :
                              item.hhi > 1500 ? 'bg-amber-50 text-amber-700' :
                              'bg-green-50 text-green-700'
                            }`}>
                              {item.hhi}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right text-[#31343A]">{item.top3Pct}%</td>
                          <td className="py-3 px-4 text-right text-[#31343A]">{item.singleSourcePct}%</td>
                          <td className="py-3 px-4 text-right">
                            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                              item.risk === 'High' ? 'bg-red-50 text-red-700' :
                              item.risk === 'Medium' ? 'bg-amber-50 text-amber-700' :
                              'bg-green-50 text-green-700'
                            }`}>
                              {item.risk}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Waterfall Chart: Budget → Committed → Invoiced → Paid */}
              <div className="bg-white rounded-lg border border-[#DFE2E4] p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-[#31343A]">Budget Flow: Budget → Committed → Invoiced → Paid</h3>
                  <button className="p-2 text-[#9DA5A8] hover:text-[#9DA5A8]">
                    <Download className="h-4 w-4" />
                  </button>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsBarChart 
                    data={[
                      { stage: 'FY Budget', value: 12800000, fill: '#005691' },
                      { stage: 'Committed', value: 12200000, fill: '#0066a3' },
                      { stage: 'Invoiced', value: 11500000, fill: '#E00420' },
                      { stage: 'Paid', value: 9984000, fill: '#31343A' },
                    ]}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#DFE2E4" />
                    <XAxis type="number" tick={{ fill: '#9DA5A8', fontSize: 12 }} />
                    <YAxis dataKey="stage" type="category" tick={{ fill: '#9DA5A8', fontSize: 12 }} />
                    <Tooltip 
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #DFE2E4', borderRadius: '6px' }}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {[
                        { stage: 'FY Budget', value: 12800000, fill: '#005691' },
                        { stage: 'Committed', value: 12200000, fill: '#0066a3' },
                        { stage: 'Invoiced', value: 11500000, fill: '#E00420' },
                        { stage: 'Paid', value: 9984000, fill: '#31343A' },
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 2) Spends by Category — with trends */}
            <div className="space-y-6 mt-8">
              <h2 className="text-xl font-bold text-[#31343A]">Spends by Category with Trends</h2>
              
              {/* Stacked Column Chart with Budget Line */}
              <div className="bg-white rounded-lg border border-[#DFE2E4] p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-[#31343A] mb-1">Monthly Spend by Category</h3>
                    <p className="text-sm text-[#9DA5A8]">Stacked columns with budget overlay</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 text-sm border border-[#B6BBBE] rounded-lg hover:bg-[#DFE2E4]/30">
                      YTD
                    </button>
                    <button className="px-3 py-1 text-sm bg-[#005691] text-white rounded-lg">
                      Monthly
                    </button>
                    <button className="p-2 text-[#9DA5A8] hover:text-[#9DA5A8]">
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={400}>
                  <ComposedChart data={categorySpendTrends.map((d: any) => ({ 
                    ...d, 
                    'Steel & Raw Materials': d['Steel & Raw Materials'] / 1000,
                    'Engine Components': d['Engine Components'] / 1000,
                    'Electronics & Sensors': d['Electronics & Sensors'] / 1000,
                    'Tires & Wheels': d['Tires & Wheels'] / 1000,
                    'Paint & Coatings': d['Paint & Coatings'] / 1000
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#DFE2E4" />
                    <XAxis dataKey="month" tick={{ fill: '#9DA5A8', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#9DA5A8', fontSize: 12 }} label={{ value: 'Spend (thousands)', angle: -90, position: 'insideLeft', style: { fill: '#9DA5A8', fontSize: 12 } }} />
                    <Tooltip 
                      formatter={(value: number) => `₹${value.toLocaleString('en-IN')}K`}
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #DFE2E4', borderRadius: '6px' }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Bar dataKey="Steel & Raw Materials" stackId="a" fill="#005691" />
                    <Bar dataKey="Engine Components" stackId="a" fill="#0066a3" />
                    <Bar dataKey="Electronics & Sensors" stackId="a" fill="#E00420" />
                    <Bar dataKey="Tires & Wheels" stackId="a" fill="#31343A" />
                    <Bar dataKey="Paint & Coatings" stackId="a" fill="#4A4E56" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              {/* Category Summary Table */}
              <div className="bg-white rounded-lg border border-[#DFE2E4] p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-[#31343A]">Category Summary (YTD)</h3>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 text-sm border border-[#B6BBBE] rounded-lg hover:bg-[#DFE2E4]/30 text-xs">
                      Normalize by Volume
                    </button>
                    <button className="p-2 text-[#9DA5A8] hover:text-[#9DA5A8]">
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#DFE2E4]">
                        <th className="text-left py-3 px-4 text-[#9DA5A8] font-medium">Category</th>
                        <th className="text-right py-3 px-4 text-[#9DA5A8] font-medium">Allocated</th>
                        <th className="text-right py-3 px-4 text-[#9DA5A8] font-medium">Committed</th>
                        <th className="text-right py-3 px-4 text-[#9DA5A8] font-medium">Invoiced</th>
                        <th className="text-right py-3 px-4 text-[#9DA5A8] font-medium">Paid</th>
                        <th className="text-right py-3 px-4 text-[#9DA5A8] font-medium">Utilization</th>
                        <th className="text-right py-3 px-4 text-[#9DA5A8] font-medium">Should-Cost Gap</th>
                        <th className="text-right py-3 px-4 text-[#9DA5A8] font-medium">Indexation Coverage</th>
                        <th className="text-right py-3 px-4 text-[#9DA5A8] font-medium">Volume-Normalized</th>
                        <th className="text-right py-3 px-4 text-[#9DA5A8] font-medium">Lead Time</th>
                        <th className="text-right py-3 px-4 text-[#9DA5A8] font-medium">Top 3 Vendors</th>
                        <th className="text-right py-3 px-4 text-[#9DA5A8] font-medium">Price Δ</th>
                        <th className="text-right py-3 px-4 text-[#9DA5A8] font-medium">Price Elasticity β</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categorySpendData.map((cat, idx) => {
                        const allocated = cat.spend / (cat.percentage / 100);
                        const committed = cat.spend * 0.95;
                        const invoiced = cat.spend * 0.90;
                        const paid = cat.spend * 0.85;
                        const utilization = (paid / allocated) * 100;
                        const shouldCostGap = shouldCostGaps.find(s => s.category === cat.category);
                        const shouldCostGapPct = shouldCostGap ? shouldCostGap.gap : (idx % 3 === 0 ? 5.2 : idx % 3 === 1 ? 2.1 : -0.5);
                        const indexationCoverage = idx % 3 === 0 ? 85 : idx % 3 === 1 ? 72 : 45;
                        const volumeNormalized = idx === 0 ? '₹45/kg' : idx === 1 ? '₹1.2K/unit' : idx === 2 ? '₹12K/license' : '₹850/unit';
                        const leadTime = 18 + idx * 2;
                        const top3Pct = (65 + idx * 5);
                        const priceDelta = idx % 3 === 0 ? 3.5 : idx % 3 === 1 ? 1.2 : -0.8;
                        const priceElasticity = idx % 3 === 0 ? 0.95 : idx % 3 === 1 ? 0.88 : 0.72;
                        return (
                          <tr key={idx} className="border-b border-[#DFE2E4]/50 hover:bg-[#DFE2E4]/30 cursor-pointer">
                            <td className="py-3 px-4 font-medium text-[#31343A]">{cat.category}</td>
                            <td className="py-3 px-4 text-right text-[#31343A]">{formatCurrency(allocated)}</td>
                            <td className="py-3 px-4 text-right text-[#31343A]">{formatCurrency(committed)}</td>
                            <td className="py-3 px-4 text-right text-[#31343A]">{formatCurrency(invoiced)}</td>
                            <td className="py-3 px-4 text-right text-[#31343A]">{formatCurrency(paid)}</td>
                            <td className="py-3 px-4 text-right">
                              <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                utilization > 95 ? 'bg-red-50 text-red-700' :
                                utilization > 85 ? 'bg-amber-50 text-amber-700' :
                                'bg-green-50 text-green-700'
                              }`}>
                                {utilization.toFixed(1)}%
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                shouldCostGapPct > 5 ? 'bg-red-50 text-red-700' :
                                shouldCostGapPct > 2 ? 'bg-amber-50 text-amber-700' :
                                'bg-green-50 text-green-700'
                              }`}>
                                {shouldCostGapPct > 0 ? '+' : ''}{shouldCostGapPct.toFixed(1)}%
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right text-[#31343A]">{indexationCoverage}%</td>
                            <td className="py-3 px-4 text-right text-[#31343A] text-xs">{volumeNormalized}</td>
                            <td className="py-3 px-4 text-right text-[#31343A]">{leadTime} days</td>
                            <td className="py-3 px-4 text-right text-[#31343A]">{top3Pct.toFixed(0)}%</td>
                            <td className="py-3 px-4 text-right">
                              <span className={`text-xs font-semibold ${
                                priceDelta > 2 ? 'text-red-600' : priceDelta > 0 ? 'text-amber-600' : 'text-green-600'
                              }`}>
                                {priceDelta > 0 ? '+' : ''}{priceDelta.toFixed(1)}%
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right text-[#31343A]">{priceElasticity.toFixed(2)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Working Capital Unlocks */}
              <div className="bg-white rounded-lg border border-[#DFE2E4] p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-[#31343A]">Working Capital Unlocks</h3>
                  <button className="p-2 text-[#9DA5A8] hover:text-[#9DA5A8]">
                    <Download className="h-4 w-4" />
                  </button>
                </div>
                <div className="space-y-4">
                  {/* DPO Ladder */}
                  <div>
                    <h4 className="text-sm font-medium text-[#31343A] mb-3">DPO Ladder by Vendor</h4>
                    <div className="space-y-2">
                      {[
                        { vendor: 'SKF Automotive Bearings', currentDays: 30, peerMedian: 45, dailySpend: 320000, potentialDays: 15, cashUnlock: 4800000 },
                        { vendor: 'ArcelorMittal Steel', currentDays: 25, peerMedian: 40, dailySpend: 280000, potentialDays: 15, cashUnlock: 4200000 },
                        { vendor: 'Bosch Electronics', currentDays: 35, peerMedian: 38, dailySpend: 240000, potentialDays: 3, cashUnlock: 720000 },
                      ].map((item, idx) => (
                        <div key={idx} className="p-3 bg-[#DFE2E4]/20 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-[#31343A]">{item.vendor}</span>
                            <span className="text-xs text-[#9DA5A8]">Daily: {formatCurrency(item.dailySpend)}</span>
                          </div>
                          <div className="flex items-center gap-4 text-xs">
                            <span className="text-[#9DA5A8]">Current: {item.currentDays}d</span>
                            <span className="text-[#9DA5A8]">Peer: {item.peerMedian}d</span>
                            <span className="text-[#005691] font-semibold">→ {item.currentDays + item.potentialDays}d</span>
                            <span className="ml-auto text-[#005691] font-bold">Unlock: {formatCurrency(item.cashUnlock)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Dynamic Discounting Candidates */}
                  <div className="pt-4 border-t border-[#DFE2E4]">
                    <h4 className="text-sm font-medium text-[#31343A] mb-3">Dynamic Discounting Candidates (APR &gt; 15%)</h4>
                    <div className="space-y-2">
                      {[
                        { vendor: 'TechCorp Solutions', amount: 450000, discountPct: 2.5, apr: 28.5, savings: 11250 },
                        { vendor: 'Logistics Pro', amount: 320000, discountPct: 2.0, apr: 24.3, savings: 6400 },
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                          <div>
                            <p className="text-sm font-medium text-[#31343A]">{item.vendor}</p>
                            <p className="text-xs text-[#9DA5A8]">{item.discountPct}% discount → {item.apr.toFixed(1)}% APR</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-[#005691]">{formatCurrency(item.savings)}</p>
                            <p className="text-xs text-[#9DA5A8]">on {formatCurrency(item.amount)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Contract Renewal Radar */}
              <div className="bg-white rounded-lg border border-[#DFE2E4] p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-[#31343A]">Contract Renewal Radar</h3>
                  <button className="p-2 text-[#9DA5A8] hover:text-[#9DA5A8]">
                    <Download className="h-4 w-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-xs text-red-600 font-medium mb-1">NOW (≤30 days)</p>
                    <p className="text-2xl font-bold text-red-700">2 contracts</p>
                    <p className="text-xs text-red-600 mt-1">Renegotiate to 36-month, -11–14% expected</p>
                  </div>
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-xs text-amber-600 font-medium mb-1">30–60 days</p>
                    <p className="text-2xl font-bold text-amber-700">5 contracts</p>
                    <p className="text-xs text-amber-600 mt-1">Prepare negotiation strategy</p>
                  </div>
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-blue-600 font-medium mb-1">60–90 days</p>
                    <p className="text-2xl font-bold text-blue-700">12 contracts</p>
                    <p className="text-xs text-blue-600 mt-1">Review utilization & performance</p>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#DFE2E4]">
                        <th className="text-left py-3 px-4 text-[#9DA5A8] font-medium">Vendor/Category</th>
                        <th className="text-right py-3 px-4 text-[#9DA5A8] font-medium">Renewal Date</th>
                        <th className="text-right py-3 px-4 text-[#9DA5A8] font-medium">Min Take-or-Pay Util</th>
                        <th className="text-right py-3 px-4 text-[#9DA5A8] font-medium">Unused Commit ₹</th>
                        <th className="text-right py-3 px-4 text-[#9DA5A8] font-medium">Indexation Terms</th>
                        <th className="text-right py-3 px-4 text-[#9DA5A8] font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { vendor: 'SKF Bearings', category: 'Components', renewalDate: '2025-01-15', utilization: 78, unusedCommit: 450000, indexation: 'Steel Index, Qtrly', penaltyRisk: 125000 },
                        { vendor: 'TechCorp', category: 'Software', renewalDate: '2025-01-28', utilization: 95, unusedCommit: 0, indexation: 'CPI, Annually', penaltyRisk: 0 },
                        { vendor: 'Logistics Pro', category: 'Freight', renewalDate: '2025-02-10', utilization: 82, unusedCommit: 180000, indexation: 'Fuel Index, Monthly', penaltyRisk: 85000 },
                      ].map((item, idx) => (
                        <tr key={idx} className="border-b border-[#DFE2E4]/50 hover:bg-[#DFE2E4]/30">
                          <td className="py-3 px-4 font-medium text-[#31343A]">{item.vendor}<br/><span className="text-xs text-[#9DA5A8]">{item.category}</span></td>
                          <td className="py-3 px-4 text-right text-[#31343A]">{item.renewalDate}</td>
                          <td className="py-3 px-4 text-right">
                            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                              item.utilization < 80 ? 'bg-red-50 text-red-700' :
                              item.utilization < 90 ? 'bg-amber-50 text-amber-700' :
                              'bg-green-50 text-green-700'
                            }`}>
                              {item.utilization}%
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right text-[#31343A]">{formatCurrency(item.unusedCommit)}</td>
                          <td className="py-3 px-4 text-right text-xs text-[#31343A]">{item.indexation}</td>
                          <td className="py-3 px-4 text-right">
                            <button className="px-3 py-1 text-xs bg-[#005691] text-white rounded-lg hover:bg-[#004574]">
                              Start Renegotiation
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Monthly Trend */}
            <div className="bg-white rounded-lg border border-[#DFE2E4] p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[#31343A]">Total Monthly Spend Trend</h3>
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

            {/* AI-Powered Insights - Prominent Section */}
            <div className="bg-gradient-to-r from-[#31343A] via-[#4A4E56] to-[#31343A] rounded-lg p-8 text-white shadow-lg border border-[#DFE2E4]">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-white bg-opacity-90 rounded-lg">
                      <Lightbulb className="h-6 w-6 text-[#005691]" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold mb-1">AI-Powered Insights</h3>
                      <p className="text-gray-200 text-sm">Predictive analysis for next quarter procurement needs</p>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => window.location.href = '/cfo/insights'}
                  className="px-4 py-2 bg-[#005691] hover:bg-[#004574] rounded-lg text-sm font-medium text-white transition-all shadow-md"
                >
                  View All Insights →
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#E00420] bg-opacity-20 backdrop-blur-sm rounded-lg p-5 border border-[#E00420] border-opacity-40 hover:bg-opacity-25 transition-all cursor-pointer">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 bg-[#E00420] bg-opacity-50 rounded-lg flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-red-100" />
                    </div>
                    <span className="text-xs font-medium bg-[#E00420] bg-opacity-60 px-2 py-1 rounded text-white">Spend Pattern</span>
                  </div>
                  <p className="text-sm font-semibold mb-2 text-white">Software Category Increase Detected</p>
                  <p className="text-red-50 text-xs leading-relaxed">Q4 shows 15% increase in software category spend. Consider multi-year licensing for cost optimization.</p>
                  <div className="mt-3 pt-3 border-t border-[#E00420] border-opacity-30">
                    <p className="text-xs text-red-100">
                      <span className="font-semibold">Potential Savings:</span> {formatCurrency(450000)}
                    </p>
                  </div>
                </div>
                <div className="bg-[#E00420] bg-opacity-20 backdrop-blur-sm rounded-lg p-5 border border-[#E00420] border-opacity-40 hover:bg-opacity-25 transition-all cursor-pointer">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 bg-[#E00420] bg-opacity-50 rounded-lg flex items-center justify-center">
                      <AlertTriangle className="h-5 w-5 text-red-100" />
                    </div>
                    <span className="text-xs font-medium bg-[#E00420] bg-opacity-60 px-2 py-1 rounded text-white">Cost Trend</span>
                  </div>
                  <p className="text-sm font-semibold mb-2 text-white">Logistics Costs Trending Upward</p>
                  <p className="text-red-50 text-xs leading-relaxed">Logistics costs trending upward. Evaluate consolidation opportunities with top 3 vendors.</p>
                  <div className="mt-3 pt-3 border-t border-[#E00420] border-opacity-30">
                    <p className="text-xs text-red-100">
                      <span className="font-semibold">Action:</span> Vendor consolidation recommended
                    </p>
                  </div>
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
          <div className="space-y-6" id="strategic-insights-report">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-[#31343A]">Strategic Insights</h2>
              <button 
                onClick={async () => {
                  try {
                    const { jsPDF } = await import('jspdf');
                    const doc = new jsPDF('p', 'mm', 'a4');
                    const pageWidth = doc.internal.pageSize.getWidth();
                    const pageHeight = doc.internal.pageSize.getHeight();
                    let yPos = 20;
                    
                    // Add header
                    doc.setFillColor(49, 52, 58); // #31343A
                    doc.rect(0, 0, pageWidth, 30, 'F');
                    doc.setTextColor(255, 255, 255);
                    doc.setFontSize(20);
                    doc.setFont('helvetica', 'bold');
                    doc.text('Strategic Insights Report', pageWidth / 2, 20, { align: 'center' });
                    
                    const date = new Date().toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    });
                    doc.setFontSize(10);
                    doc.setFont('helvetica', 'normal');
                    doc.text(`Generated on: ${date}`, pageWidth / 2, 27, { align: 'center' });
                    
                    yPos = 40;
                    doc.setTextColor(0, 0, 0);
                    
                    // AI-Powered Insights Section
                    doc.setFontSize(16);
                    doc.setFont('helvetica', 'bold');
                    doc.setFillColor(224, 4, 32); // #E00420
                    doc.rect(10, yPos - 5, pageWidth - 20, 8, 'F');
                    doc.setTextColor(255, 255, 255);
                    doc.text('AI-Powered Predictive Analysis', 15, yPos + 2);
                    yPos += 15;
                    
                    doc.setTextColor(0, 0, 0);
                    doc.setFontSize(10);
                    doc.setFont('helvetica', 'normal');
                    doc.text('Advanced analytics for next-quarter procurement needs and optimization opportunities', 15, yPos);
                    yPos += 10;
                    
                    // Metrics
                    doc.setFontSize(12);
                    doc.setFont('helvetica', 'bold');
                    doc.text('Predicted Q1 2025 Spend:', 15, yPos);
                    doc.text(formatCurrency(3200000), 100, yPos);
                    yPos += 8;
                    
                    doc.text('Optimization Potential:', 15, yPos);
                    doc.text(formatCurrency(770000), 100, yPos);
                    yPos += 8;
                    
                    doc.text('Risk Level:', 15, yPos);
                    doc.text('Medium (2 high-risk vendor contracts)', 100, yPos);
                    yPos += 15;
                    
                    // Spend Pattern Insights
                    doc.setFontSize(16);
                    doc.setFont('helvetica', 'bold');
                    doc.setFillColor(49, 52, 58);
                    doc.rect(10, yPos - 5, pageWidth - 20, 8, 'F');
                    doc.setTextColor(255, 255, 255);
                    doc.text('Spend Pattern Insights', 15, yPos + 2);
                    yPos += 15;
                    
                    doc.setTextColor(0, 0, 0);
                    doc.setFontSize(11);
                    doc.setFont('helvetica', 'bold');
                    doc.text('Q4 Software Category Increase', 15, yPos);
                    yPos += 7;
                    doc.setFont('helvetica', 'normal');
                    doc.setFontSize(10);
                    const softwareText = '15% increase in software category spend detected. This trend is expected to continue.';
                    const softwareLines = doc.splitTextToSize(softwareText, pageWidth - 30);
                    doc.text(softwareLines, 15, yPos);
                    yPos += softwareLines.length * 5 + 5;
                    doc.text(`Recommendation: Consider multi-year licensing agreements for cost optimization (potential savings: ${formatCurrency(450000)})`, 15, yPos, { maxWidth: pageWidth - 30 });
                    yPos += 12;
                    
                    doc.setFont('helvetica', 'bold');
                    doc.text('Logistics Cost Trend', 15, yPos);
                    yPos += 7;
                    doc.setFont('helvetica', 'normal');
                    doc.text('Logistics costs trending upward (+8% month-over-month). Evaluate consolidation opportunities.', 15, yPos, { maxWidth: pageWidth - 30 });
                    yPos += 8;
                    doc.text('Recommendation: Consolidate with top 3 vendors for better negotiation leverage', 15, yPos, { maxWidth: pageWidth - 30 });
                    yPos += 12;
                    
                    doc.setFont('helvetica', 'bold');
                    doc.text('Manufacturing Efficiency', 15, yPos);
                    yPos += 7;
                    doc.setFont('helvetica', 'normal');
                    doc.text('Manufacturing department consistently operating under budget (-7% average variance).', 15, yPos, { maxWidth: pageWidth - 30 });
                    yPos += 8;
                    doc.text('Recommendation: Consider allocating saved budget to critical infrastructure upgrades', 15, yPos, { maxWidth: pageWidth - 30 });
                    yPos += 15;
                    
                    // Check if we need a new page
                    if (yPos > pageHeight - 40) {
                      doc.addPage();
                      yPos = 20;
                    }
                    
                    // Procurement Efficiency Metrics
                    doc.setFontSize(16);
                    doc.setFont('helvetica', 'bold');
                    doc.setFillColor(49, 52, 58);
                    doc.rect(10, yPos - 5, pageWidth - 20, 8, 'F');
                    doc.setTextColor(255, 255, 255);
                    doc.text('Procurement Efficiency Metrics', 15, yPos + 2);
                    yPos += 15;
                    
                    doc.setTextColor(0, 0, 0);
                    doc.setFontSize(11);
                    doc.setFont('helvetica', 'normal');
                    doc.text('Average Time-to-PO: 5.2 days (↓ 0.8 days vs last quarter)', 15, yPos);
                    yPos += 8;
                    doc.text('Approval Cycle Time: 2.4 days (↓ 1.2 days vs last quarter)', 15, yPos);
                    yPos += 8;
                    doc.text('Vendor Onboarding Time: 12 days (+2 days vs last quarter)', 15, yPos);
                    yPos += 15;
                    
                    if (yPos > pageHeight - 40) {
                      doc.addPage();
                      yPos = 20;
                    }
                    
                    // Risk Indicators
                    doc.setFontSize(16);
                    doc.setFont('helvetica', 'bold');
                    doc.setFillColor(49, 52, 58);
                    doc.rect(10, yPos - 5, pageWidth - 20, 8, 'F');
                    doc.setTextColor(255, 255, 255);
                    doc.text('Risk Indicators & Opportunities', 15, yPos + 2);
                    yPos += 15;
                    
                    doc.setTextColor(0, 0, 0);
                    doc.setFontSize(11);
                    doc.setFont('helvetica', 'bold');
                    doc.text('High-Risk Areas:', 15, yPos);
                    yPos += 8;
                    doc.setFont('helvetica', 'normal');
                    doc.setFontSize(10);
                    doc.text('• High-risk vendors: 2', 20, yPos);
                    yPos += 6;
                    doc.text('• Delayed deliveries: 5', 20, yPos);
                    yPos += 6;
                    doc.text('• Contracts expiring soon: 7', 20, yPos);
                    yPos += 10;
                    
                    doc.setFont('helvetica', 'bold');
                    doc.text('Opportunities:', 15, yPos);
                    yPos += 8;
                    doc.setFont('helvetica', 'normal');
                    doc.text(`• Cost optimization potential: ${formatCurrency(770000)}`, 20, yPos);
                    yPos += 6;
                    doc.text('• Vendor consolidation: 3 vendors', 20, yPos);
                    yPos += 6;
                    doc.text('• Process improvement: On track', 20, yPos);
                    yPos += 15;
                    
                    if (yPos > pageHeight - 40) {
                      doc.addPage();
                      yPos = 20;
                    }
                    
                    // Predictive Analysis
                    doc.setFontSize(16);
                    doc.setFont('helvetica', 'bold');
                    doc.setFillColor(224, 4, 32);
                    doc.rect(10, yPos - 5, pageWidth - 20, 8, 'F');
                    doc.setTextColor(255, 255, 255);
                    doc.text('Predictive Analysis for Next Quarter', 15, yPos + 2);
                    yPos += 15;
                    
                    doc.setTextColor(0, 0, 0);
                    doc.setFontSize(11);
                    doc.setFont('helvetica', 'bold');
                    doc.text('Expected Procurement Volume:', 15, yPos);
                    yPos += 8;
                    doc.setFont('helvetica', 'normal');
                    doc.setFontSize(10);
                    doc.text(`• Raw Materials: ${formatCurrency(1150000)}`, 20, yPos);
                    yPos += 6;
                    doc.text(`• Software: ${formatCurrency(850000)}`, 20, yPos);
                    yPos += 6;
                    doc.text(`• Equipment: ${formatCurrency(650000)}`, 20, yPos);
                    yPos += 6;
                    doc.text(`• Services: ${formatCurrency(550000)}`, 20, yPos);
                    yPos += 10;
                    
                    doc.setFont('helvetica', 'bold');
                    doc.text('Recommended Actions:', 15, yPos);
                    yPos += 8;
                    doc.setFont('helvetica', 'normal');
                    doc.text('• Initiate contract renewal discussions with 3 high-value vendors', 20, yPos, { maxWidth: pageWidth - 40 });
                    yPos += 6;
                    doc.text('• Review and optimize software licensing agreements', 20, yPos, { maxWidth: pageWidth - 40 });
                    yPos += 6;
                    doc.text('• Consider bulk purchasing for raw materials Q1 2025', 20, yPos, { maxWidth: pageWidth - 40 });
                    yPos += 6;
                    doc.text('• Evaluate new vendor partnerships for logistics consolidation', 20, yPos, { maxWidth: pageWidth - 40 });
                    
                    // Footer
                    const totalPages = doc.internal.pages.length - 1; // Subtract 1 because pages array is 0-indexed internally
                    for (let i = 1; i <= totalPages; i++) {
                      doc.setPage(i);
                      doc.setFontSize(8);
                      doc.setTextColor(128, 128, 128);
                      doc.text(
                        `Page ${i} of ${totalPages} | ProcurAI Strategic Insights Report`,
                        pageWidth / 2,
                        pageHeight - 10,
                        { align: 'center' }
                      );
                    }
                    
                    // Save the PDF
                    const fileName = `Strategic_Insights_Report_${new Date().toISOString().split('T')[0]}.pdf`;
                    doc.save(fileName);
                  } catch (error) {
                    console.error('Error generating PDF:', error);
                    alert('Failed to generate PDF. Please try again.');
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 bg-[#005691] text-white rounded-lg hover:bg-[#004574] transition-colors"
              >
                <FileDown className="h-4 w-4" />
                Export Report
              </button>
            </div>

            {/* AI-Powered Insights Hero */}
            <div className="bg-gradient-to-r from-[#31343A] via-[#4A4E56] to-[#31343A] rounded-lg p-8 text-white shadow-lg border border-[#DFE2E4]">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-semibold mb-2">AI-Powered Predictive Analysis</h3>
                  <p className="text-gray-200">Advanced analytics for next-quarter procurement needs and optimization opportunities</p>
                </div>
                <div className="p-2 bg-white bg-opacity-90 rounded-lg">
                  <Lightbulb className="h-10 w-10 text-[#005691]" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#E00420] bg-opacity-30 rounded-lg p-4 border border-[#E00420] border-opacity-50">
                  <p className="text-sm font-medium mb-2 text-white">Predicted Q1 2025 Spend</p>
                  <p className="text-2xl font-bold text-white">{formatCurrency(3200000)}</p>
                  <p className="text-xs text-red-100 mt-1">+5% vs Q4 2024 forecast</p>
                </div>
                <div className="bg-[#E00420] bg-opacity-30 rounded-lg p-4 border border-[#E00420] border-opacity-50">
                  <p className="text-sm font-medium mb-2 text-white">Optimization Potential</p>
                  <p className="text-2xl font-bold text-white">{formatCurrency(770000)}</p>
                  <p className="text-xs text-red-100 mt-1">Identified savings opportunities</p>
                </div>
                <div className="bg-[#E00420] bg-opacity-30 rounded-lg p-4 border border-[#E00420] border-opacity-50">
                  <p className="text-sm font-medium mb-2 text-white">Risk Level</p>
                  <p className="text-2xl font-bold text-white">Medium</p>
                  <p className="text-xs text-red-100 mt-1">2 high-risk vendor contracts</p>
                </div>
              </div>
            </div>

            {/* Spend Pattern Insights */}
            <div className="bg-white rounded-lg border border-[#DFE2E4] p-6">
              <h3 className="text-lg font-semibold text-[#31343A] mb-4">Spend Pattern Insights</h3>
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-5 border border-[#DFE2E4]">
                  <div className="border-l-4 border-[#005691] pl-4">
                    <h4 className="font-medium text-[#31343A] mb-1">Q4 Software Category Increase</h4>
                    <p className="text-sm text-[#31343A] mb-2">15% increase in software category spend detected. This trend is expected to continue.</p>
                    <p className="text-xs text-[#31343A]"><strong>Recommendation:</strong> Consider multi-year licensing agreements for cost optimization (potential savings: {formatCurrency(450000)})</p>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-5 border border-[#DFE2E4]">
                  <div className="border-l-4 border-[#005691] pl-4">
                    <h4 className="font-medium text-[#31343A] mb-1">Logistics Cost Trend</h4>
                    <p className="text-sm text-[#31343A] mb-2">Logistics costs trending upward (+8% month-over-month). Evaluate consolidation opportunities.</p>
                    <p className="text-xs text-[#31343A]"><strong>Recommendation:</strong> Consolidate with top 3 vendors for better negotiation leverage</p>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-5 border border-[#DFE2E4]">
                  <div className="border-l-4 border-[#005691] pl-4">
                    <h4 className="font-medium text-[#31343A] mb-1">Manufacturing Efficiency</h4>
                    <p className="text-sm text-[#31343A] mb-2">Manufacturing department consistently operating under budget (-7% average variance).</p>
                    <p className="text-xs text-[#31343A]"><strong>Recommendation:</strong> Consider allocating saved budget to critical infrastructure upgrades</p>
                  </div>
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
            <div className="bg-gradient-to-r from-[#31343A] via-[#4A4E56] to-[#31343A] rounded-lg border border-[#DFE2E4] p-6 text-white">
              <h3 className="text-lg font-semibold mb-4">Predictive Analysis for Next Quarter</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#E00420] bg-opacity-30 rounded-lg p-4 border border-[#E00420] border-opacity-50">
                  <h4 className="font-medium mb-2 text-white">Expected Procurement Volume</h4>
                  <p className="text-sm text-red-100 mb-3">Based on historical patterns and current order pipeline</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-red-100">Raw Materials</span>
                      <span className="text-sm font-semibold text-white">{formatCurrency(1150000)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-red-100">Software</span>
                      <span className="text-sm font-semibold text-white">{formatCurrency(850000)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-red-100">Equipment</span>
                      <span className="text-sm font-semibold text-white">{formatCurrency(650000)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-red-100">Services</span>
                      <span className="text-sm font-semibold text-white">{formatCurrency(550000)}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-[#E00420] bg-opacity-30 rounded-lg p-4 border border-[#E00420] border-opacity-50">
                  <h4 className="font-medium mb-2 text-white">Recommended Actions</h4>
                  <ul className="space-y-2 text-sm text-red-100">
                    <li className="flex items-start gap-2">
                      <span className="text-white mt-1">•</span>
                      <span>Initiate contract renewal discussions with 3 high-value vendors</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-white mt-1">•</span>
                      <span>Review and optimize software licensing agreements</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-white mt-1">•</span>
                      <span>Consider bulk purchasing for raw materials Q1 2025</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-white mt-1">•</span>
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



