'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { KPICard } from '@/components/ui/KPICard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { FileText, Plus, TrendingUp, Clock } from 'lucide-react';
import { mockRequests } from '@/lib/mockData';
import { formatCurrency } from '@/lib/utils';
import { Request } from '@/types';
import { LineChart } from '@/components/charts/LineChart';

export default function DepartmentManagerPage() {
  const pathname = usePathname();
  const router = useRouter();
  const [requests] = useState<Request[]>(mockRequests.filter(r => r.requester === 'John Smith'));
  
  // Determine active tab from URL
  const getActiveTab = (): 'requests' | 'new' | 'budget' | 'notifications' => {
    if (pathname === '/department-manager' || pathname === '/department-manager/') return 'requests';
    if (pathname === '/department-manager/new') return 'new';
    if (pathname === '/department-manager/budget') return 'budget';
    if (pathname === '/department-manager/notifications') return 'notifications';
    return 'requests';
  };

  const [activeTab, setActiveTab] = useState<'requests' | 'new' | 'budget' | 'notifications'>(getActiveTab());

  // Sync activeTab with URL changes
  useEffect(() => {
    const tab = pathname === '/department-manager' || pathname === '/department-manager/' ? 'requests' :
                pathname === '/department-manager/new' ? 'new' :
                pathname === '/department-manager/budget' ? 'budget' :
                pathname === '/department-manager/notifications' ? 'notifications' :
                'requests';
    setActiveTab(tab);
  }, [pathname]);

  const totalSpend = requests.reduce((sum, r) => sum + r.estimatedCost, 0);
  const approvedCount = requests.filter(r => r.status === 'approved' || r.status === 'po-issued').length;
  const pendingCount = requests.filter(r => r.status === 'pending' || r.status === 'in-review').length;

  const quarterlyData = [
    { month: 'Q1 2024', spend: 125000 },
    { month: 'Q2 2024', spend: 185000 },
    { month: 'Q3 2024', spend: 210000 },
    { month: 'Q4 2024', spend: totalSpend },
  ];

  const navItems = [
    { 
      label: 'My Requests', 
      href: '/department-manager', 
      icon: FileText,
    },
    { 
      label: 'Submit New Request', 
      href: '/department-manager/new', 
      icon: Plus,
    },
    { 
      label: 'Budget Overview', 
      href: '/department-manager/budget', 
      icon: TrendingUp,
    },
    { 
      label: 'Notifications', 
      href: '/department-manager/notifications', 
      icon: Clock,
    },
  ];

  const handleTabClick = (tab: 'requests' | 'new' | 'budget' | 'notifications') => {
    setActiveTab(tab);
    const routes = {
      requests: '/department-manager',
      new: '/department-manager/new',
      budget: '/department-manager/budget',
      notifications: '/department-manager/notifications',
    };
    router.push(routes[tab]);
  };

  return (
    <DashboardLayout navItems={navItems} role="department-manager" title={
      activeTab === 'requests' ? 'My Requests' :
      activeTab === 'new' ? 'Submit New Request' :
      activeTab === 'budget' ? 'Budget Overview' :
      'Notifications'
    }>
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <KPICard
            title="Total Requests"
            value={requests.length}
            icon={FileText}
          />
          <KPICard
            title="Total Spend"
            value={formatCurrency(totalSpend)}
            icon={TrendingUp}
          />
          <KPICard
            title="Approved"
            value={approvedCount}
            change={`${Math.round((approvedCount / requests.length) * 100)}% approval rate`}
            trend="up"
          />
          <KPICard
            title="Pending"
            value={pendingCount}
            icon={Clock}
          />
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg border border-[#DFE2E4]">
          <div className="border-b border-[#DFE2E4]">
            <nav className="flex -mb-px">
              {['requests', 'new', 'budget', 'notifications'].map((tab) => (
                <Link
                  key={tab}
                  href={tab === 'requests' ? '/department-manager' : `/department-manager/${tab}`}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab
                      ? 'border-[#005691] text-[#005691]'
                      : 'border-transparent text-[#9DA5A8] hover:text-[#31343A] hover:border-[#B6BBBE]'
                  }`}
                >
                  {tab === 'requests' ? 'My Requests' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                </Link>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'requests' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-[#31343A]">My Requests</h3>
                  <Link
                    href="/department-manager/new"
                    className="px-4 py-2 bg-[#005691] text-white rounded-lg text-sm font-medium hover:bg-[#004574] transition-colors inline-block"
                  >
                    New Request
                  </Link>
                </div>

                {/* Status Timeline */}
                <div className="bg-[#DFE2E4]/30 rounded-lg p-4 mb-6">
                  <p className="text-sm font-medium text-[#31343A] mb-3">Status Timeline Legend</p>
                  <div className="flex items-center gap-6 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#9DA5A8]"></div>
                      <span className="text-[#31343A]">Submitted</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                      <span className="text-[#31343A]">Under Review</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-purple-400"></div>
                      <span className="text-[#31343A]">Vendor Sourcing</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                      <span className="text-[#31343A]">Approved</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                      <span className="text-[#31343A]">PO Issued</span>
                    </div>
                  </div>
                </div>

                {/* Requests Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-[#DFE2E4]">
                    <thead className="bg-[#DFE2E4]/30">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#9DA5A8] uppercase tracking-wider">Request ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#9DA5A8] uppercase tracking-wider">Item</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#9DA5A8] uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#9DA5A8] uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#9DA5A8] uppercase tracking-wider">Budget</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#9DA5A8] uppercase tracking-wider">PM Assigned</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#9DA5A8] uppercase tracking-wider">Timeline</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-[#DFE2E4]">
                      {requests.map((request) => (
                        <tr key={request.id} className="hover:bg-[#DFE2E4]/30">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#31343A]">{request.id}</td>
                          <td className="px-6 py-4 text-sm text-[#31343A]">{request.itemName}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-[#31343A]">{formatCurrency(request.estimatedCost)}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <StatusBadge status={request.status} />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <StatusBadge status={request.budgetStatus} />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-[#9DA5A8]">{request.assignedProcurementManager || 'Pending'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-[#9DA5A8]">{request.expectedTimeline || 'TBD'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'new' && (
              <div className="max-w-2xl">
                <h3 className="text-lg font-semibold text-[#31343A] mb-6">Submit New Request</h3>
                <form className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-[#31343A] mb-2">Item/Material Name</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-[#B6BBBE] rounded-lg focus:ring-2 focus:ring-[#005691] focus:border-transparent text-[#31343A]"
                      placeholder="e.g., Industrial Bearings - SKF Series"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#31343A] mb-2">Quantity</label>
                      <input
                        type="number"
                        className="w-full px-4 py-2 border border-[#B6BBBE] rounded-lg focus:ring-2 focus:ring-[#005691] focus:border-transparent text-[#31343A]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#31343A] mb-2">Estimated Cost (USD)</label>
                      <input
                        type="number"
                        className="w-full px-4 py-2 border border-[#B6BBBE] rounded-lg focus:ring-2 focus:ring-[#005691] focus:border-transparent text-[#31343A]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#31343A] mb-2">Business Justification</label>
                    <textarea
                      rows={4}
                      className="w-full px-4 py-2 border border-[#B6BBBE] rounded-lg focus:ring-2 focus:ring-[#005691] focus:border-transparent text-[#31343A]"
                      placeholder="Explain the business need and urgency..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#31343A] mb-2">Urgency Level</label>
                    <select className="w-full px-4 py-2 border border-[#B6BBBE] rounded-lg focus:ring-2 focus:ring-[#005691] focus:border-transparent text-[#31343A]">
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                  <div className="flex gap-4">
                    <button
                      type="submit"
                      className="px-6 py-2 bg-[#005691] text-white rounded-lg font-medium hover:bg-[#004574] transition-colors"
                    >
                      Submit Request
                    </button>
                    <button
                      type="button"
                      className="px-6 py-2 border border-[#B6BBBE] text-[#31343A] rounded-lg font-medium hover:bg-[#DFE2E4] transition-colors"
                    >
                      Save as Draft
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'budget' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-[#31343A]">Budget Overview</h3>
                
                {/* Budget Alerts */}
                <div className="bg-[#E00420]/10 border border-[#E00420]/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-[#E00420] rounded-full"></div>
                    <h4 className="font-medium text-[#E00420]">Budget Alert</h4>
                  </div>
                  <p className="text-sm text-[#E00420]">1 request requires budget justification due to over-budget status.</p>
                </div>

                {/* Quarterly Spend Chart */}
                <div className="bg-white border border-[#DFE2E4] rounded-lg p-6">
                  <h4 className="text-sm font-medium text-[#31343A] mb-4">Quarterly Spend Trend</h4>
                  <LineChart data={quarterlyData} dataKey="spend" name="Spend (USD)" />
                </div>

                {/* Analytics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-[#DFE2E4]/30 rounded-lg p-4">
                    <p className="text-sm text-[#9DA5A8]">Average Processing Time</p>
                    <p className="text-2xl font-semibold text-[#31343A] mt-1">5.2 days</p>
                  </div>
                  <div className="bg-[#DFE2E4]/30 rounded-lg p-4">
                    <p className="text-sm text-[#9DA5A8]">Approval Rate</p>
                    <p className="text-2xl font-semibold text-[#31343A] mt-1">85%</p>
                  </div>
                  <div className="bg-[#DFE2E4]/30 rounded-lg p-4">
                    <p className="text-sm text-[#9DA5A8]">Average Spend per Request</p>
                    <p className="text-2xl font-semibold text-[#31343A] mt-1">{formatCurrency(totalSpend / requests.length)}</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-[#31343A]">Notifications</h3>
                <div className="space-y-3">
                  <div className="bg-[#005691]/10 border border-[#005691]/20 rounded-lg p-4">
                    <p className="text-sm font-medium text-[#31343A]">Request REQ-001 approved</p>
                    <p className="text-xs text-[#9DA5A8] mt-1">Your request for Industrial Bearings has been approved and moved to vendor sourcing.</p>
                  </div>
                  <div className="bg-[#DFE2E4]/30 border border-[#DFE2E4] rounded-lg p-4">
                    <p className="text-sm font-medium text-[#31343A]">Budget review required</p>
                    <p className="text-xs text-[#9DA5A8] mt-1">Request REQ-002 requires additional budget justification.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

