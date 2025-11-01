'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { KPICard } from '@/components/ui/KPICard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { 
  LayoutDashboard, 
  Inbox, 
  Building2, 
  FileText as FileContract, 
  ShoppingCart, 
  CheckCircle2,
  TrendingUp,
  Users,
  FileText,
  AlertCircle
} from 'lucide-react';
import {
  enhancedRequests,
  enhancedPurchaseOrders,
  enhancedContracts,
  enhancedVendors,
  mockRFQs,
  mockApprovals,
  enhancedApprovals,
  mockActivityFeed,
  mockActionQueue,
  monthlySpendData,
} from '@/lib/mockData';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils';
import { LineChart } from '@/components/charts/LineChart';
import { BarChart } from '@/components/charts/BarChart';
import { ActionQueueSidebar } from '@/components/pm/ActionQueueSidebar';
import { PipelineFunnel } from '@/components/pm/PipelineFunnel';
import { SuggestedVendorsPanel } from '@/components/pm/SuggestedVendorsPanel';

// New widgets
import { RequestsAgingBuckets } from '@/components/pm/requests/RequestsAgingBuckets';
import { UrgencyBudgetMatrix } from '@/components/pm/requests/UrgencyBudgetMatrix';
import { RepeatingItems } from '@/components/pm/requests/RepeatingItems';

import { RFQResponseLadder } from '@/components/pm/rfq/RFQResponseLadder';
import { QuoteSpreadSpotlight } from '@/components/pm/rfq/QuoteSpreadSpotlight';

import { DeliveryRiskStrip } from '@/components/pm/orders/DeliveryRiskStrip';
import { ThreeWayMatchStatus } from '@/components/pm/orders/ThreeWayMatchStatus';

import { ContractsUtilizationLadder } from '@/components/pm/contracts/ContractsUtilizationLadder';
import { RenewalCalendarStrip } from '@/components/pm/contracts/RenewalCalendarStrip';

import { VendorScatter } from '@/components/pm/vendors/VendorScatter';
import { LeadTimeByCategory } from '@/components/pm/vendors/LeadTimeByCategory';

import { OffContractSpend } from '@/components/pm/governance/OffContractSpend';
import { DuplicateIndents } from '@/components/pm/governance/DuplicateIndents';
import { ToastContainer, type Toast } from '@/components/ui/Toast';
import { VendorProfileModal } from '@/components/pm/VendorProfileModal';
import { ContractDetailsModal } from '@/components/pm/ContractDetailsModal';
import { RequestDetailsModal } from '@/components/pm/RequestDetailsModal';
import { VendorComparisonModal } from '@/components/pm/VendorComparisonModal';
import { suggestVendorsForRequest } from '@/components/pm/vendorSuggestUtils';
import { EnhancedVendor, Approval, EnhancedRequest, EnhancedContract, EnhancedApproval } from '@/types';
import { ApprovalsTabs } from '@/components/pm/approvals/ApprovalsTabs';
import { ApprovalFilters, FilterState } from '@/components/pm/approvals/ApprovalFilters';
import { ApprovalDrawer } from '@/components/pm/approvals/ApprovalDrawer';
import { SLAChip } from '@/components/pm/approvals/SLAChip';

const getNavItems = (onClick: (href: string) => void, activeTab: string) => [
  { 
    label: 'Dashboard', 
    href: '/procurement-manager', 
    icon: LayoutDashboard, 
    onClick: () => onClick('/procurement-manager'),
    isActive: activeTab === 'dashboard'
  },
  { 
    label: 'Incoming Requests', 
    href: '/procurement-manager/requests', 
    icon: Inbox, 
    onClick: () => onClick('/procurement-manager/requests'),
    isActive: activeTab === 'requests'
  },
  { 
    label: 'Vendors', 
    href: '/procurement-manager/vendors', 
    icon: Building2, 
    onClick: () => onClick('/procurement-manager/vendors'),
    isActive: activeTab === 'vendors'
  },
  { 
    label: 'Contracts', 
    href: '/procurement-manager/contracts', 
    icon: FileContract, 
    onClick: () => onClick('/procurement-manager/contracts'),
    isActive: activeTab === 'contracts'
  },
  { 
    label: 'Orders', 
    href: '/procurement-manager/orders', 
    icon: ShoppingCart, 
    onClick: () => onClick('/procurement-manager/orders'),
    isActive: activeTab === 'orders'
  },
  { 
    label: 'Approvals', 
    href: '/procurement-manager/approvals', 
    icon: CheckCircle2, 
    onClick: () => onClick('/procurement-manager/approvals'),
    isActive: activeTab === 'approvals'
  },
];

export default function ProcurementManagerDashboard() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'requests' | 'vendors' | 'contracts' | 'orders' | 'approvals'>('dashboard');
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [selectedPriority, setSelectedPriority] = useState<string>('All Priority');
  const [selectedBudget, setSelectedBudget] = useState<string>('All Budget Status');
  
  // State management for dynamic data
  const [approvals, setApprovals] = useState<Approval[]>(mockApprovals);
  const [enhancedApprovalsState, setEnhancedApprovalsState] = useState<EnhancedApproval[]>(enhancedApprovals);
  const [requests, setRequests] = useState<EnhancedRequest[]>(enhancedRequests);
  const [selectedVendor, setSelectedVendor] = useState<EnhancedVendor | null>(null);
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<EnhancedContract | null>(null);
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [selectedRequestForView, setSelectedRequestForView] = useState<EnhancedRequest | null>(null);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [vendorsToCompare, setVendorsToCompare] = useState<EnhancedVendor[]>([]);
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);
  const [currentRequestForRFQ, setCurrentRequestForRFQ] = useState<string | null>(null);
  
  // Approvals hub state
  const [approvalsTab, setApprovalsTab] = useState<'INDENT' | 'QUOTE' | 'PO'>('INDENT');
  const [selectedApproval, setSelectedApproval] = useState<EnhancedApproval | null>(null);
  const [isApprovalDrawerOpen, setIsApprovalDrawerOpen] = useState(false);
  const [approvalFilters, setApprovalFilters] = useState<FilterState>({
    status: 'all',
    approverLevel: 'all',
    slaState: 'all',
  });

  const showToast = (message: string, type: Toast['type'] = 'info') => {
    const id = Math.random().toString(36).substring(7);
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const closeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleValidate = (requestId: string) => {
    setRequests(prev => prev.map(r => 
      r.id === requestId ? { ...r, validationStatus: 'validated' } : r
    ));
    showToast(`Request ${requestId} validated successfully`, 'success');
  };

  const handleSendToRFQ = (requestId: string) => {
    setRequests(prev => prev.map(r => 
      r.id === requestId ? { ...r, status: 'vendor-sourcing', validationStatus: 'validated' } : r
    ));
    showToast(`Request ${requestId} sent to RFQ`, 'success');
  };

  const handleHold = (requestId: string) => {
    setRequests(prev => prev.map(r => 
      r.id === requestId ? { ...r, status: 'in-review' } : r
    ));
    showToast(`Request ${requestId} placed on hold`, 'info');
  };

  const handleCompareRFQ = (rfqId: string) => {
    showToast(`Opening comparison view for ${rfqId}`, 'info');
  };

  const handleRemindRFQ = (rfqId: string) => {
    showToast(`Reminder sent for ${rfqId}`, 'success');
  };

  const handleInviteToRFQ = (vendorId: string, requestId?: string) => {
    if (!vendorId) {
      showToast('Vendor ID is missing', 'error');
      return;
    }
    
    const vendor = enhancedVendors.find(v => v.id === vendorId);
    const request = requestId ? requests.find(r => r.id === requestId) : selectedRequestForView;
    
    if (vendor && request) {
      // In a real app, this would create an RFQ or add vendor to existing RFQ
      showToast(
        `Invitation sent to ${vendor.name} for ${request.itemName} (${request.id})`,
        'success'
      );
      
      // Update request status if not already in vendor-sourcing
      if (request.status !== 'vendor-sourcing') {
        setRequests(prev => prev.map(r => 
          r.id === request.id 
            ? { ...r, status: 'vendor-sourcing', validationStatus: 'validated' }
            : r
        ));
      }
    } else if (vendor) {
      showToast(`Invitation sent to ${vendor.name}`, 'success');
    } else {
      showToast(`Vendor not found (ID: ${vendorId})`, 'error');
    }
  };

  const handleViewVendor = (vendorId: string) => {
    const vendor = enhancedVendors.find(v => v.id === vendorId);
    if (vendor) {
      setSelectedVendor(vendor);
      setIsVendorModalOpen(true);
    }
  };

  const handleViewContract = (contractId: string) => {
    const contract = enhancedContracts.find(c => c.id === contractId);
    if (contract) {
      setSelectedContract(contract);
      setIsContractModalOpen(true);
    }
  };

  const handleRenewContract = (contractId: string) => {
    showToast(`Initiating renewal process for ${contractId}`, 'info');
  };

  const handleApprove = (approvalId: string, reference: string) => {
    setApprovals(prev => prev.filter(a => a.id !== approvalId));
    setEnhancedApprovalsState(prev => prev.filter(a => a.id !== approvalId));
    showToast(`${reference} approved successfully`, 'success');
  };

  const handleReject = (approvalId: string, reference: string) => {
    setApprovals(prev => prev.filter(a => a.id !== approvalId));
    setEnhancedApprovalsState(prev => prev.filter(a => a.id !== approvalId));
    showToast(`${reference} rejected`, 'info');
  };

  // Enhanced approval handlers
  const handleEnhancedApprove = (approvalId: string, comment?: string, metadata?: any) => {
    setEnhancedApprovalsState(prev => prev.map(a => 
      a.id === approvalId ? { ...a, status: 'approved' } : a
    ));
    const approval = enhancedApprovalsState.find(a => a.id === approvalId);
    showToast(`${approval?.referenceNumber || approvalId} approved successfully`, 'success');
    setIsApprovalDrawerOpen(false);
    setSelectedApproval(null);
  };

  const handleEnhancedReject = (approvalId: string, reason: string) => {
    setEnhancedApprovalsState(prev => prev.map(a => 
      a.id === approvalId ? { ...a, status: 'rejected' } : a
    ));
    const approval = enhancedApprovalsState.find(a => a.id === approvalId);
    showToast(`${approval?.referenceNumber || approvalId} rejected: ${reason}`, 'info');
    setIsApprovalDrawerOpen(false);
    setSelectedApproval(null);
  };

  const handleEnhancedSendBack = (approvalId: string, reason: string) => {
    setEnhancedApprovalsState(prev => prev.map(a => 
      a.id === approvalId ? { ...a, status: 'sent-back' } : a
    ));
    const approval = enhancedApprovalsState.find(a => a.id === approvalId);
    showToast(`${approval?.referenceNumber || approvalId} sent back: ${reason}`, 'info');
    setIsApprovalDrawerOpen(false);
    setSelectedApproval(null);
  };

  const handleViewApproval = (approval: EnhancedApproval) => {
    setSelectedApproval(approval);
    setIsApprovalDrawerOpen(true);
  };

  const handleCreateRFQ = () => {
    showToast('Creating new RFQ...', 'info');
  };

  const handleCreatePO = () => {
    showToast('Creating new Purchase Order...', 'info');
  };

  const handleUploadContract = () => {
    showToast('Opening contract upload dialog...', 'info');
  };

  const handleSupplierChat = () => {
    showToast('Opening supplier chat...', 'info');
  };

  const handleActionQueue = (itemId: string, action: string) => {
    showToast(`Action taken: ${action}`, 'success');
  };

  const handleCompareVendor = (vendorId: string, requestId?: string) => {
    const vendor = enhancedVendors.find(v => v.id === vendorId);
    const request = requestId ? requests.find(r => r.id === requestId) : selectedRequestForView;
    
    if (vendor) {
      // Get suggested vendors for the current request (if available)
      if (request) {
        const suggestions = suggestVendorsForRequest({
          itemName: request.itemName,
          department: request.department,
          topN: 3,
        });
        
        // Get all suggested vendor IDs
        const suggestedVendorIds: string[] = suggestions.map((s) => s.vendorId);
        
        // Include the clicked vendor if not already in suggestions
        const vendorIdsToCompare = suggestedVendorIds.includes(vendorId)
          ? suggestedVendorIds
          : [vendorId, ...suggestedVendorIds.slice(0, 2)];
        
        // Get full vendor objects
        const vendorsToCompareList: EnhancedVendor[] = vendorIdsToCompare
          .map((id) => enhancedVendors.find((v) => v.id === id))
          .filter((v): v is EnhancedVendor => v !== undefined);
        
        if (vendorsToCompareList.length > 0) {
          setVendorsToCompare(vendorsToCompareList);
          setIsComparisonModalOpen(true);
        } else {
          showToast('No vendors to compare', 'error');
        }
      } else {
        // Compare with top 3 similar vendors
        const similarVendors = enhancedVendors
          .filter(v => v.category === vendor.category && v.id !== vendor.id)
          .slice(0, 2);
        
        setVendorsToCompare([vendor, ...similarVendors]);
        setIsComparisonModalOpen(true);
      }
    } else {
      showToast('Vendor not found', 'error');
    }
  };

  const handleViewProfile = (vendorId: string) => {
    console.log('handleViewProfile called with vendorId:', vendorId);
    if (!vendorId) {
      showToast('Vendor ID is missing', 'error');
      return;
    }
    
    const vendor = enhancedVendors.find(v => v.id === vendorId);
    console.log('Found vendor:', vendor);
    if (vendor) {
      setSelectedVendor(vendor);
      setIsVendorModalOpen(true);
      showToast(`Opening profile for ${vendor.name}`, 'info');
      console.log('Vendor modal state set:', vendor, true);
    } else {
      showToast(`Vendor not found (ID: ${vendorId})`, 'error');
      console.error('Vendor not found in enhancedVendors:', enhancedVendors.map(v => v.id));
    }
  };

  const handleActivityAction = (actionLabel: string, activityId: string) => {
    // Parse action label to extract entity ID and type
    const actionLower = actionLabel.toLowerCase();
    
    // Handle "View Request REQ-001"
    if (actionLower.includes('view request')) {
      const reqIdMatch = actionLabel.match(/REQ-[0-9]+/i);
      if (reqIdMatch) {
        const reqId = reqIdMatch[0];
        const request = requests.find(r => r.id === reqId);
        if (request) {
          setSelectedRequestForView(request);
          setIsRequestModalOpen(true);
          // Switch to requests tab if not already there
          if (activeTab !== 'requests') {
            setActiveTab('requests');
          }
          showToast(`Opening request ${reqId}`, 'info');
        } else {
          showToast(`Request ${reqId} not found`, 'error');
        }
      }
    }
    // Handle "Review Quality Report"
    else if (actionLabel.includes('Review Quality Report') || actionLabel.includes('Quality Report')) {
      showToast('Opening Quality Report...', 'info');
      // Could open a quality report modal here
    }
    // Handle "Review Contract" or contract-related
    else if (actionLower.includes('review contract') || actionLower.includes('contract')) {
      const contractMatch = actionLabel.match(/CNT-[0-9]+/i);
      if (contractMatch) {
        const contractId = contractMatch[0];
        const contract = enhancedContracts.find(c => c.id === contractId);
        if (contract) {
          setSelectedContract(contract);
          setIsContractModalOpen(true);
        } else {
          showToast(`Contract ${contractId} not found`, 'error');
        }
      } else {
        showToast('Opening contract review...', 'info');
      }
    }
    // Handle "Schedule Meeting"
    else if (actionLower.includes('schedule meeting') || actionLower.includes('meeting')) {
      showToast('Opening calendar to schedule meeting...', 'info');
    }
    // Handle "View Details" or vendor-related
    else if (actionLower.includes('view details') || actionLower.includes('vendor')) {
      // Extract vendor name or ID if possible
      const vendorMatch = actionLabel.match(/vendor:?\s*([A-Za-z\s]+)/i);
      if (vendorMatch) {
        const vendorName = vendorMatch[1].trim();
        const vendor = enhancedVendors.find(v => v.name.toLowerCase().includes(vendorName.toLowerCase()));
        if (vendor) {
          setSelectedVendor(vendor);
          setIsVendorModalOpen(true);
        } else {
          showToast('Opening vendor details...', 'info');
        }
      } else {
        showToast('Opening details...', 'info');
      }
    }
    // Handle RFQ-related actions
    else if (actionLower.includes('rfq') || actionLower.includes('review quotes')) {
      const rfqMatch = actionLabel.match(/RFQ-[0-9]+/i);
      if (rfqMatch) {
        const rfqNumber = rfqMatch[0];
        showToast(`Opening ${rfqNumber} details...`, 'info');
        // Switch to appropriate tab if needed
      } else {
        showToast('Opening RFQ details...', 'info');
      }
    }
    // Handle "Send Reminder"
    else if (actionLower.includes('reminder') || actionLower.includes('send')) {
      showToast('Sending reminder...', 'info');
    }
    // Default action
    else {
      showToast(`Executing: ${actionLabel}`, 'info');
    }
  };

  // Handle sidebar navigation
  const handleNavClick = (href: string) => {
    if (href === '/procurement-manager') {
      setActiveTab('dashboard');
    } else {
      const tab = href.split('/').pop() || 'dashboard';
      setActiveTab(tab as any);
    }
  };

  // DERIVED METRICS with enhanced data
  const vendorsCount = enhancedVendors.length;

  const activeContracts = enhancedContracts.filter(c => c.status === 'executed').length;
  const expiringSoon = enhancedContracts.filter(c => c.daysToExpiry !== undefined && c.daysToExpiry <= 30).length;

  const posPending = enhancedPurchaseOrders.filter(po => po.status === 'pending').length;
  const posApproved = enhancedPurchaseOrders.filter(po => po.status === 'approved').length;
  const posDelivered = enhancedPurchaseOrders.filter(po => po.status === 'delivered').length;

  const avgMonthlySpend = Math.round(
    monthlySpendData.reduce((s, d) => s + d.spend, 0) / monthlySpendData.length
  );

  // Simple operational "cycle proxy": avg age of POs not delivered yet
  const inFlightPOs = enhancedPurchaseOrders.filter(po => po.status !== 'delivered');
  const avgPOAge = inFlightPOs.length
    ? Math.round(inFlightPOs.reduce((s, po) => s + (po.age || 0), 0) / inFlightPOs.length)
    : 0;

  // Pipeline counts (based on your statuses)
  const pipelineStages = [
    { name: 'Indents Received', count: requests.length },
    { name: 'Validated', count: requests.filter(r => r.validationStatus === 'validated').length },
    { name: 'RFQs Sent', count: mockRFQs.length },
    { name: 'Quotes Received', count: mockRFQs.filter(r => r.status === 'quotes-received').length },
    { name: 'POs Created', count: enhancedPurchaseOrders.length },
    { name: 'Delivered', count: enhancedPurchaseOrders.filter(po => po.status === 'delivered').length },
  ];

  const navItems = getNavItems(handleNavClick, activeTab);

  return (
    <DashboardLayout navItems={navItems} role="procurement-manager" title={
      activeTab === 'dashboard' ? 'Dashboard' :
      activeTab === 'requests' ? 'Incoming Requests' :
      activeTab === 'vendors' ? 'Vendors' :
      activeTab === 'contracts' ? 'Contracts' :
      activeTab === 'orders' ? 'Orders' :
      'Approvals'
    }>
      <div className="space-y-6">
        {activeTab === 'dashboard' && (
          <>
            {/* KPI Cards — more operational */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              <KPICard 
                title="Vendors" 
                value={vendorsCount} 
                icon={Users} 
                onClick={() => { setActiveTab('vendors'); showToast('Opening Vendors tab', 'info'); }}
              />
              <KPICard 
                title="Active Contracts" 
                value={activeContracts} 
                icon={FileContract} 
                onClick={() => { setActiveTab('contracts'); showToast('Opening Contracts tab', 'info'); }}
              />
              <KPICard 
                title="Pending POs" 
                value={posPending} 
                icon={ShoppingCart} 
                onClick={() => { setActiveTab('orders'); showToast('Opening Orders tab', 'info'); }}
              />
              <KPICard 
                title="Avg PO Age (days)" 
                value={avgPOAge} 
                icon={AlertCircle} 
                onClick={() => { setActiveTab('orders'); showToast('Viewing PO age details', 'info'); }}
              />
              <KPICard 
                title="Avg Monthly Spend" 
                value={formatCurrency(avgMonthlySpend)} 
                icon={TrendingUp} 
                change="+12% MoM" 
                trend="up"
                onClick={() => showToast('Viewing spend analytics', 'info')}
              />
            </div>

            {/* Workspace two-column + sticky sidebar */}
            <div className="grid grid-cols-1 xl:grid-cols-9 gap-6">
              <div className="xl:col-span-6 space-y-6">
                {/* Pipeline */}
                <PipelineFunnel stages={pipelineStages} />

                {/* Spend trends + mini donut */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg border border-[#DFE2E4] p-6">
                    <h3 className="text-lg font-semibold text-[#31343A] mb-4">Spend Trends</h3>
                    <LineChart
                      data={monthlySpendData.map(d => ({ ...d, spend: d.spend / 1000 }))}
                      dataKey="spend"
                      name="Spend (thousands)"
                    />
                  </div>
                  <div className="bg-white rounded-lg border border-[#DFE2E4] p-6">
                    <h3 className="text-lg font-semibold text-[#31343A] mb-4">Activity & Alerts</h3>
                    <div className="space-y-3 max-h-[320px] overflow-auto pr-1">
                      {mockActivityFeed.map(a => (
                        <div key={a.id} className="border border-[#DFE2E4] rounded-lg p-3">
                          <div className="flex items-start gap-3">
                            <div className={`w-2.5 h-2.5 rounded-full mt-1.5 ${
                              a.priority === 'critical' ? 'bg-[#E00420]' : 
                              a.priority === 'high' ? 'bg-orange-500' : 
                              a.priority === 'medium' ? 'bg-yellow-500' : 
                              'bg-[#9DA5A8]'
                            }`} />
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h4 className="text-sm font-medium text-[#31343A]">{a.title}</h4>
                                <span className="text-[11px] text-[#9DA5A8]">{formatDateTime(a.timestamp)}</span>
                              </div>
                              <p className="text-xs text-[#9DA5A8] mt-1">{a.description}</p>
                              {a.actionLabel && (
                                <div className="mt-2">
                                  <button 
                                    onClick={() => handleActivityAction(a.actionLabel || '', a.id)}
                                    className="text-xs px-2 py-1 bg-[#005691] text-white rounded hover:bg-[#004574]"
                                  >
                                    {a.actionLabel}
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Quick recent RFQs snapshot */}
                <div className="bg-white rounded-lg border border-[#DFE2E4] overflow-hidden">
                  <div className="p-4 border-b border-[#DFE2E4] flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-[#31343A]">Active RFQs</h3>
                    <span className="text-xs text-[#9DA5A8]">
                      {mockRFQs.filter(r => r.status !== 'closed').length} open
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-[#DFE2E4]">
                      <thead className="bg-[#DFE2E4]/30">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#9DA5A8] uppercase">RFQ</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#9DA5A8] uppercase">Item / Category</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#9DA5A8] uppercase">Invited</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#9DA5A8] uppercase">Responded</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#9DA5A8] uppercase">Lowest Quote</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#9DA5A8] uppercase">Due</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#9DA5A8] uppercase">Status</th>
                          <th className="px-6 py-3"></th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-[#DFE2E4]">
                        {mockRFQs.map(r => (
                          <tr key={r.id} className="hover:bg-[#DFE2E4]/30">
                            <td className="px-6 py-4 text-sm font-medium text-[#31343A]">{r.rfqNumber}</td>
                            <td className="px-6 py-4 text-sm text-[#31343A]">{r.itemName} • {r.category}</td>
                            <td className="px-6 py-4 text-sm">{r.suppliersInvited}</td>
                            <td className="px-6 py-4 text-sm">{r.suppliersResponded} <span className="text-[#9DA5A8]">/ {r.suppliersInvited}</span></td>
                            <td className="px-6 py-4 text-sm font-medium">{formatCurrency(r.lowestQuote)}</td>
                            <td className="px-6 py-4 text-sm text-[#9DA5A8]">{formatDate(r.dueDate)}</td>
                            <td className="px-6 py-4 text-sm">
                              <StatusBadge status={r.status} />
                            </td>
                            <td className="px-6 py-4 text-sm">
                              <div className="flex gap-2">
                                <button onClick={() => handleCompareRFQ(r.rfqNumber)} className="text-[#005691] hover:text-[#004574]">Compare</button>
                                <button onClick={() => handleRemindRFQ(r.rfqNumber)} className="text-[#9DA5A8] hover:text-[#31343A]">Remind</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Right sticky action queue */}
              <ActionQueueSidebar 
                items={mockActionQueue} 
                onOpen={(id) => showToast(`Opening ${id}`, 'info')}
                onTakeAction={(id, type) => handleActionQueue(id, type)}
              />
            </div>

            {/* New two-up: Requests aging + RFQ ladder */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RequestsAgingBuckets />
              <RFQResponseLadder />
            </div>

            {/* New two-up: Delivery risk + 3-way match */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DeliveryRiskStrip />
              <ThreeWayMatchStatus />
            </div>

            {/* Vendors scatter (full width) */}
            <VendorScatter />

          </>
        )}

        {activeTab === 'requests' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <UrgencyBudgetMatrix />
              <RepeatingItems />
              <div className="lg:col-span-1">
                <QuoteSpreadSpotlight />
              </div>
            </div>

            {/* Requests Table */}
            <div className="bg-white rounded-lg border border-[#DFE2E4] overflow-hidden">
              <div className="p-4 border-b border-[#DFE2E4] flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[#31343A]">Incoming Requests</h3>
                <div className="flex gap-2">
                  <select value={selectedPriority} onChange={(e) => setSelectedPriority(e.target.value)} className="px-3 py-2 border border-[#B6BBBE] rounded-lg text-sm focus:ring-2 focus:ring-[#005691] text-[#31343A]">
                    <option>All Priority</option>
                    <option>Critical</option><option>High</option><option>Medium</option><option>Low</option>
                  </select>
                  <select value={selectedBudget} onChange={(e) => setSelectedBudget(e.target.value)} className="px-3 py-2 border border-[#B6BBBE] rounded-lg text-sm focus:ring-2 focus:ring-[#005691] text-[#31343A]">
                    <option>All Budget Status</option>
                    <option>Under Budget</option><option>Over Budget</option><option>Pending Allocation</option>
                  </select>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-[#DFE2E4]">
                  <thead className="bg-[#DFE2E4]/30">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#9DA5A8] uppercase">Req</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#9DA5A8] uppercase">Dept</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#9DA5A8] uppercase">Item</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#9DA5A8] uppercase">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#9DA5A8] uppercase">Required By</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#9DA5A8] uppercase">Age (d)</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#9DA5A8] uppercase">Budget</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#9DA5A8] uppercase">Validation</th>
                      <th className="px-6 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-[#DFE2E4]">
                    {requests
                      .filter(r => selectedPriority === 'All Priority' || r.urgency === selectedPriority.toLowerCase())
                      .filter(r => selectedBudget === 'All Budget Status' || r.budgetStatus === selectedBudget.toLowerCase().replace(' ', '-'))
                      .map(r => (
                      <tr key={r.id} className="hover:bg-[#DFE2E4]/30">
                        <td className="px-6 py-4 text-sm font-medium text-[#31343A]">{r.id}</td>
                        <td className="px-6 py-4 text-sm text-[#9DA5A8]">{r.department}</td>
                        <td className="px-6 py-4 text-sm text-[#31343A]">{r.itemName}</td>
                        <td className="px-6 py-4 text-sm font-medium">{formatCurrency(r.estimatedCost)}</td>
                        <td className="px-6 py-4 text-sm text-[#9DA5A8]">{r.requiredDate}</td>
                        <td className="px-6 py-4 text-sm">{r.indentAge}</td>
                        <td className="px-6 py-4 text-sm"><StatusBadge status={r.budgetStatus} /></td>
                        <td className="px-6 py-4 text-sm">
                          <span className="px-2 py-1 text-xs rounded bg-[#DFE2E4] text-[#31343A]">{r.validationStatus}</span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex gap-2">
                            <button 
                              className="text-[#005691] hover:text-[#004574] font-medium"
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                setSelectedRequestForView(r);
                                setIsRequestModalOpen(true);
                              }}
                            >
                              View
                            </button>
                            <button onClick={() => handleValidate(r.id)} className="text-[#9DA5A8] hover:text-[#31343A]">Validate</button>
                            <button onClick={() => handleSendToRFQ(r.id)} className="text-[#9DA5A8] hover:text-[#31343A]">Send to RFQ</button>
                            <button onClick={() => handleHold(r.id)} className="text-[#9DA5A8] hover:text-[#31343A]">Hold</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* AI Suggested Vendors Panel */}
            {selectedRequest && (
              <SuggestedVendorsPanel
                requestId={selectedRequest}
                onClose={() => setSelectedRequest(null)}
                onInviteToRFQ={(vendorId) => handleInviteToRFQ(vendorId)}
                onCompare={(vendorId) => handleCompareVendor(vendorId)}
                onViewProfile={(vendorId) => handleViewProfile(vendorId)}
              />
            )}
          </div>
        )}

        {activeTab === 'vendors' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#31343A]">Vendor Directory</h3>
              <button className="px-4 py-2 bg-[#005691] text-white rounded-lg text-sm font-medium hover:bg-[#004574]">
                Add Vendor
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <VendorScatter showQuadrantView={false} />
              <LeadTimeByCategory />
            </div>

            <div className="bg-white rounded-lg border border-[#DFE2E4] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-[#DFE2E4]">
                  <thead className="bg-[#DFE2E4]/30">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#9DA5A8] uppercase">Vendor Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#9DA5A8] uppercase">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#9DA5A8] uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#9DA5A8] uppercase">Active Contracts</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#9DA5A8] uppercase">Performance</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#9DA5A8] uppercase">Total Spend</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#9DA5A8] uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-[#DFE2E4]">
                    {enhancedVendors.map((v) => (
                      <tr key={v.id} className="hover:bg-[#DFE2E4]/30">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#31343A]">{v.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#9DA5A8] capitalize">{v.category}</td>
                        <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={v.status} /></td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{v.activeContracts}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="text-xs text-[#9DA5A8]">On-time {v.onTimeDeliveryPercent}% • Quality {v.qualityPercent}% • Lead {v.avgLeadTimeDays}d</div>
                          <div className="mt-1 flex items-center gap-2">
                            <span className={`text-[11px] px-2 py-0.5 rounded ${v.healthStatus === 'green' ? 'bg-green-100 text-green-800' : v.healthStatus === 'amber' ? 'bg-yellow-100 text-yellow-800' : 'bg-[#E00420]/10 text-[#E00420]'}`}>
                              {v.healthStatus.toUpperCase()} • {v.healthScore}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{formatCurrency(v.totalSpend)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button onClick={() => handleViewVendor(v.id)} className="text-[#005691] hover:text-[#004574] font-medium mr-4">View</button>
                          <button onClick={() => handleInviteToRFQ(v.id)} className="text-[#9DA5A8] hover:text-[#31343A]">Invite to RFQ</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'contracts' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <KPICard title="Active Contracts" value={activeContracts} />
              <KPICard title="Expiring Soon" value={expiringSoon} />
              <KPICard title="Overdue Renewals" value={0} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ContractsUtilizationLadder />
              <RenewalCalendarStrip />
            </div>

            <div className="bg-white rounded-lg border border-[#DFE2E4] overflow-hidden">
              <div className="p-4 border-b border-[#DFE2E4] flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[#31343A]">Contract Pipeline</h3>
                <button className="px-4 py-2 bg-[#005691] text-white rounded-lg text-sm font-medium hover:bg-[#004574]">
                  New Contract
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-[#DFE2E4]">
                  <thead className="bg-[#DFE2E4]/30">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#9DA5A8] uppercase">Contract Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#9DA5A8] uppercase">Vendor</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#9DA5A8] uppercase">Value</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#9DA5A8] uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#9DA5A8] uppercase">End Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#9DA5A8] uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-[#DFE2E4]">
                    {enhancedContracts.map(c => (
                      <tr key={c.id} className="hover:bg-[#DFE2E4]/30">
                        <td className="px-6 py-4 text-sm font-medium text-[#31343A]">{c.name}</td>
                        <td className="px-6 py-4 text-sm text-[#31343A]">{c.vendor}</td>
                        <td className="px-6 py-4 text-sm">{formatCurrency(c.value)}</td>
                        <td className="px-6 py-4">
                          <div className="text-xs text-[#9DA5A8] mb-1">Utilized {c.utilizedPercent}%</div>
                          <div className="w-40 bg-[#DFE2E4] rounded-full h-2">
                            <div className="bg-[#005691] h-2 rounded-full" style={{ width: `${c.utilizedPercent}%` }} />
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-[#9DA5A8]">
                          {formatDate(c.endDate)}
                          <div className="text-[11px] text-[#9DA5A8]">{c.daysToExpiry} days left</div>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex gap-2">
                            <button onClick={() => handleViewContract(c.id)} className="text-[#005691] hover:text-[#004574]">View</button>
                            <button onClick={() => handleRenewContract(c.id)} className="text-[#9DA5A8] hover:text-[#31343A]">Renew</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <KPICard title="Total Orders" value={enhancedPurchaseOrders.length} />
              <KPICard title="Pending" value={posPending} />
              <KPICard title="Approved" value={posApproved} />
              <KPICard title="Delivered" value={posDelivered} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DeliveryRiskStrip />
              <ThreeWayMatchStatus />
            </div>

            <div className="bg-white rounded-lg border border-[#DFE2E4] overflow-hidden">
              <div className="p-4 border-b border-[#DFE2E4]">
                <h3 className="text-lg font-semibold text-[#31343A]">Recent Purchase Orders</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-[#DFE2E4]">
                  <thead className="bg-[#DFE2E4]/30">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#9DA5A8] uppercase">PO Number</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#9DA5A8] uppercase">Vendor</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#9DA5A8] uppercase">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#9DA5A8] uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#9DA5A8] uppercase">Created Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#9DA5A8] uppercase">Assigned To</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#9DA5A8] uppercase">Details</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-[#DFE2E4]">
                    {enhancedPurchaseOrders.map((po) => (
                      <tr key={po.id} className="hover:bg-[#DFE2E4]/30">
                        <td className="px-6 py-4 text-sm font-medium text-[#31343A]">{po.poNumber}</td>
                        <td className="px-6 py-4 text-sm text-[#31343A]">{po.vendor}</td>
                        <td className="px-6 py-4 text-sm">{formatCurrency(po.amount)}</td>
                        <td className="px-6 py-4"><StatusBadge status={po.status} /></td>
                        <td className="px-6 py-4 text-sm text-[#9DA5A8]">{formatDate(po.createdAt)}</td>
                        <td className="px-6 py-4 text-sm text-[#9DA5A8]">{po.assignedTo}</td>
                        <td className="px-6 py-4 text-xs text-[#9DA5A8]">
                          GRN: <b>{po.grnStatus}</b> • Invoice: <b>{po.invoiceStatus}</b> • Age: <b>{po.age}d</b>
                          <div className="text-[11px]">Cost Center: {po.costCenter} • Budget: {po.budgetCode}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Budget Status Tracker */}
            <div className="bg-white rounded-lg border border-[#DFE2E4] p-6">
              <h3 className="text-lg font-semibold text-[#31343A] mb-4">Budget Status Tracker</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-[#31343A]">Q4 Budget</span>
                    <span className="text-sm font-semibold text-[#31343A]">{formatCurrency(5000000)}</span>
                  </div>
                  <div className="w-full bg-[#DFE2E4] rounded-full h-2">
                    <div className="bg-[#005691] h-2 rounded-full" style={{ width: '65%' }}></div>
                  </div>
                  <div className="flex items-center justify-between mt-2 text-xs text-[#9DA5A8]">
                    <span>Used: {formatCurrency(3250000)}</span>
                    <span>Remaining: {formatCurrency(1750000)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'approvals' && (() => {
          // Calculate KPIs
          const pendingApprovals = enhancedApprovalsState.filter(a => a.status === 'pending');
          const now = new Date();
          const valueInQueue = pendingApprovals.reduce((sum, a) => sum + (a.value || 0), 0);
          
          const dueToday = pendingApprovals.filter(a => {
            const submitted = new Date(a.submittedAt);
            const elapsedHours = Math.floor((now.getTime() - submitted.getTime()) / (1000 * 60 * 60));
            const remainingHours = a.slaTargetHours - (a.slaElapsedHours ?? elapsedHours);
            return remainingHours <= 8 && remainingHours > 0;
          }).length;
          
          const breached = pendingApprovals.filter(a => {
            const submitted = new Date(a.submittedAt);
            const elapsedHours = Math.floor((now.getTime() - submitted.getTime()) / (1000 * 60 * 60));
            const remainingHours = a.slaTargetHours - (a.slaElapsedHours ?? elapsedHours);
            return remainingHours < 0;
          }).length;

          // Filter approvals by tab and filters
          let filteredApprovals = enhancedApprovalsState.filter(a => 
            a.approvalType === approvalsTab && a.status === 'pending'
          );

          if (approvalFilters.status !== 'all') {
            filteredApprovals = filteredApprovals.filter(a => a.status === approvalFilters.status);
          }
          if (approvalFilters.approverLevel !== 'all') {
            filteredApprovals = filteredApprovals.filter(a => a.approverLevel === approvalFilters.approverLevel);
          }
          if (approvalFilters.slaState === 'due-today') {
            filteredApprovals = filteredApprovals.filter(a => {
              const submitted = new Date(a.submittedAt);
              const elapsedHours = Math.floor((now.getTime() - submitted.getTime()) / (1000 * 60 * 60));
              const remainingHours = a.slaTargetHours - (a.slaElapsedHours ?? elapsedHours);
              return remainingHours <= 8 && remainingHours > 0;
            });
          } else if (approvalFilters.slaState === 'breached') {
            filteredApprovals = filteredApprovals.filter(a => {
              const submitted = new Date(a.submittedAt);
              const elapsedHours = Math.floor((now.getTime() - submitted.getTime()) / (1000 * 60 * 60));
              const remainingHours = a.slaTargetHours - (a.slaElapsedHours ?? elapsedHours);
              return remainingHours < 0;
            });
          }

          return (
            <div className="space-y-6">
              {/* Header KPIs */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                <KPICard 
                  title="My Pending" 
                  value={pendingApprovals.length}
                  onClick={() => setApprovalFilters({ ...approvalFilters, status: 'pending' })}
                />
                <KPICard 
                  title="Value in Queue" 
                  value={formatCurrency(valueInQueue)}
                  onClick={() => {}}
                />
                <KPICard 
                  title="Due Today" 
                  value={dueToday}
                  onClick={() => setApprovalFilters({ ...approvalFilters, slaState: 'due-today' })}
                />
                <KPICard 
                  title="Breached SLA" 
                  value={breached}
                  onClick={() => setApprovalFilters({ ...approvalFilters, slaState: 'breached' })}
                />
                <KPICard 
                  title="By Type" 
                  value={`${enhancedApprovalsState.filter(a => a.approvalType === 'INDENT' && a.status === 'pending').length} / ${enhancedApprovalsState.filter(a => a.approvalType === 'QUOTE' && a.status === 'pending').length} / ${enhancedApprovalsState.filter(a => a.approvalType === 'PO' && a.status === 'pending').length}`}
                  change="Indents / Quotes / POs"
                />
              </div>

              {/* Tab Navigation */}
              <ApprovalsTabs tab={approvalsTab} setTab={setApprovalsTab} />

              {/* Filter Bar */}
              <ApprovalFilters onFilterChange={setApprovalFilters} />

              {/* Approval Tables */}
              <div className="bg-white rounded-lg border border-[#DFE2E4] overflow-hidden">
                <div className="overflow-x-auto">
                  {approvalsTab === 'INDENT' && (
                    <table className="min-w-full divide-y divide-[#DFE2E4]">
                      <thead className="bg-[#DFE2E4]/30">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#9DA5A8] uppercase">Req</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#9DA5A8] uppercase">Dept</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#9DA5A8] uppercase">Item</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#9DA5A8] uppercase">Value</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#9DA5A8] uppercase">Urgency</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#9DA5A8] uppercase">Budget</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#9DA5A8] uppercase">Age (h)</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#9DA5A8] uppercase">Created At</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#9DA5A8] uppercase">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#9DA5A8] uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-[#DFE2E4]">
                        {filteredApprovals.filter((a): a is import('@/types').IndentApproval => a.approvalType === 'INDENT').map((a) => {
                          const elapsedHours = Math.floor((now.getTime() - new Date(a.submittedAt).getTime()) / (1000 * 60 * 60));
                          return (
                            <tr key={a.id} className="hover:bg-[#DFE2E4]/30">
                              <td className="px-6 py-4 text-sm font-medium text-[#31343A]">{a.referenceNumber}</td>
                              <td className="px-6 py-4 text-sm text-[#31343A]">{a.dept}</td>
                              <td className="px-6 py-4 text-sm text-[#31343A]">{a.itemName}</td>
                              <td className="px-6 py-4 text-sm">{formatCurrency(a.estimatedCost)}</td>
                              <td className="px-6 py-4"><StatusBadge status={a.urgency === 'critical' ? 'critical' : a.urgency === 'high' ? 'pending' : 'active'} /></td>
                              <td className="px-6 py-4"><StatusBadge status={a.budgetStatus === 'under-budget' ? 'active' : a.budgetStatus === 'over-budget' ? 'inactive' : 'pending'} /></td>
                              <td className="px-6 py-4 text-sm text-[#31343A]">{elapsedHours}h</td>
                              <td className="px-6 py-4 text-sm text-[#9DA5A8]">{formatDate(a.submittedAt)}</td>
                              <td className="px-6 py-4"><StatusBadge status={a.status === 'pending' ? 'pending' : 'active'} /></td>
                              <td className="px-6 py-4">
                                <div className="flex gap-2">
                                  <button onClick={() => handleViewApproval(a)} className="text-[#005691] hover:text-[#004574] text-sm">View</button>
                                  <button onClick={() => handleEnhancedApprove(a.id)} className="text-green-600 hover:text-green-700 text-sm">Approve</button>
                                  <button onClick={() => handleEnhancedReject(a.id, '')} className="text-[#E00420] hover:text-[#C0031A] text-sm">Reject</button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}

                  {approvalsTab === 'QUOTE' && (
                    <table className="min-w-full divide-y divide-[#DFE2E4]">
                      <thead className="bg-[#DFE2E4]/30">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#9DA5A8] uppercase">RFQ</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#9DA5A8] uppercase">Item</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#9DA5A8] uppercase">Responses</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#9DA5A8] uppercase">Lowest Quote</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#9DA5A8] uppercase">Variance %</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#9DA5A8] uppercase">Recommended</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#9DA5A8] uppercase">Created At</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#9DA5A8] uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-[#DFE2E4]">
                        {filteredApprovals.filter((a): a is import('@/types').QuoteApproval => a.approvalType === 'QUOTE').map((a) => {
                          const lowest = a.suppliers.reduce((min, s) => s.quoteAmount < min.quoteAmount ? s : min, a.suppliers[0]);
                          return (
                            <tr key={a.id} className="hover:bg-[#DFE2E4]/30">
                              <td className="px-6 py-4 text-sm font-medium text-[#31343A]">{a.rfqId}</td>
                              <td className="px-6 py-4 text-sm text-[#31343A]">{a.itemName}</td>
                              <td className="px-6 py-4 text-sm text-[#31343A]">{a.suppliers.length}</td>
                              <td className="px-6 py-4 text-sm font-semibold text-[#31343A]">{formatCurrency(lowest.quoteAmount)}</td>
                              <td className="px-6 py-4 text-sm text-[#31343A]">{a.quoteVariancePct?.toFixed(1)}%</td>
                              <td className="px-6 py-4 text-sm text-[#31343A]">{a.suppliers.find(s => s.vendorId === a.recommendedVendorId)?.vendorName}</td>
                              <td className="px-6 py-4 text-sm text-[#9DA5A8]">{formatDate(a.submittedAt)}</td>
                              <td className="px-6 py-4">
                                <div className="flex gap-2">
                                  <button onClick={() => handleViewApproval(a)} className="text-[#005691] hover:text-[#004574] text-sm">View</button>
                                  <button onClick={() => handleEnhancedApprove(a.id)} className="text-green-600 hover:text-green-700 text-sm">Approve</button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}

                  {approvalsTab === 'PO' && (
                    <table className="min-w-full divide-y divide-[#DFE2E4]">
                      <thead className="bg-[#DFE2E4]/30">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#9DA5A8] uppercase">PO</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#9DA5A8] uppercase">Vendor</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#9DA5A8] uppercase">Amount</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#9DA5A8] uppercase">Cost Center</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#9DA5A8] uppercase">GRN</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#9DA5A8] uppercase">Invoice</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#9DA5A8] uppercase">Age (h)</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#9DA5A8] uppercase">Created At</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#9DA5A8] uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-[#DFE2E4]">
                        {filteredApprovals.filter((a): a is import('@/types').POApproval => a.approvalType === 'PO').map((a) => {
                          const elapsedHours = Math.floor((now.getTime() - new Date(a.submittedAt).getTime()) / (1000 * 60 * 60));
                          return (
                            <tr key={a.id} className="hover:bg-[#DFE2E4]/30">
                              <td className="px-6 py-4 text-sm font-medium text-[#31343A]">{a.poId}</td>
                              <td className="px-6 py-4 text-sm text-[#31343A]">
                                {a.vendorName}
                                {a.isOffContract && <span className="ml-2 px-2 py-0.5 bg-[#E00420]/10 text-[#E00420] text-xs rounded-full">Off Contract</span>}
                              </td>
                              <td className="px-6 py-4 text-sm">{formatCurrency(a.amount)}</td>
                              <td className="px-6 py-4 text-sm text-[#31343A]">{a.costCenter || '—'}</td>
                              <td className="px-6 py-4"><StatusBadge status={a.grnStatus === 'received' ? 'active' : 'pending'} /></td>
                              <td className="px-6 py-4"><StatusBadge status={a.invoiceStatus === 'received' ? 'active' : 'pending'} /></td>
                              <td className="px-6 py-4 text-sm text-[#31343A]">{elapsedHours}h</td>
                              <td className="px-6 py-4 text-sm text-[#9DA5A8]">{formatDate(a.submittedAt)}</td>
                              <td className="px-6 py-4">
                                <div className="flex gap-2">
                                  <button onClick={() => handleViewApproval(a)} className="text-[#005691] hover:text-[#004574] text-sm">View</button>
                                  <button onClick={() => handleEnhancedApprove(a.id)} className="text-green-600 hover:text-green-700 text-sm">Approve</button>
                                  <button onClick={() => handleEnhancedReject(a.id, '')} className="text-[#E00420] hover:text-[#C0031A] text-sm">Reject</button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          );
        })()}
      </div>
      <ToastContainer toasts={toasts} onClose={closeToast} />
      <VendorProfileModal
        vendor={selectedVendor}
        isOpen={isVendorModalOpen}
        onClose={() => { setIsVendorModalOpen(false); setSelectedVendor(null); }}
        onInviteToRFQ={() => handleInviteToRFQ(selectedVendor?.id || '')}
      />
      <ContractDetailsModal
        contract={selectedContract}
        isOpen={isContractModalOpen}
        onClose={() => { setIsContractModalOpen(false); setSelectedContract(null); }}
        onRenew={() => handleRenewContract(selectedContract?.id || '')}
      />
      <RequestDetailsModal
        request={selectedRequestForView}
        isOpen={isRequestModalOpen}
        onClose={() => { setIsRequestModalOpen(false); setSelectedRequestForView(null); }}
        onValidate={() => { 
          if (selectedRequestForView) {
            handleValidate(selectedRequestForView.id);
            setRequests(prev => prev.map(r => 
              r.id === selectedRequestForView.id ? { ...r, validationStatus: 'validated' } : r
            ));
          }
        }}
        onSendToRFQ={() => { 
          if (selectedRequestForView) {
            handleSendToRFQ(selectedRequestForView.id);
            setRequests(prev => prev.map(r => 
              r.id === selectedRequestForView.id ? { ...r, status: 'vendor-sourcing', validationStatus: 'validated' } : r
            ));
          }
        }}
        onHold={() => { 
          if (selectedRequestForView) {
            handleHold(selectedRequestForView.id);
            setRequests(prev => prev.map(r => 
              r.id === selectedRequestForView.id ? { ...r, status: 'in-review' } : r
            ));
          }
        }}
        onInviteToRFQ={(vendorId) => handleInviteToRFQ(vendorId, selectedRequestForView?.id)}
        onCompare={(vendorId) => handleCompareVendor(vendorId, selectedRequestForView?.id)}
        onViewProfile={(vendorId) => handleViewProfile(vendorId)}
      />
      
      <VendorComparisonModal
        vendors={vendorsToCompare}
        isOpen={isComparisonModalOpen}
        onClose={() => {
          setIsComparisonModalOpen(false);
          setVendorsToCompare([]);
        }}
      />
      <ApprovalDrawer
        approval={selectedApproval}
        isOpen={isApprovalDrawerOpen}
        onClose={() => {
          setIsApprovalDrawerOpen(false);
          setSelectedApproval(null);
        }}
        onApprove={handleEnhancedApprove}
        onReject={handleEnhancedReject}
        onSendBack={handleEnhancedSendBack}
      />
    </DashboardLayout>
  );
}

