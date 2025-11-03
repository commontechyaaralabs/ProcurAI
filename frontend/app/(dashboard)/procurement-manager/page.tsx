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
  AlertCircle,
  DollarSign
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
import { PieChart } from '@/components/charts/PieChart';
import { AreaChart, Area, Bar, BarChart as RechartsBarChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Cell } from 'recharts';
import { ActionQueueSidebar } from '@/components/pm/ActionQueueSidebar';
import { PipelineFunnel } from '@/components/pm/PipelineFunnel';
import { SuggestedVendorsPanel } from '@/components/pm/SuggestedVendorsPanel';

// New widgets
import { RequestsAgingBuckets } from '@/components/pm/requests/RequestsAgingBuckets';
import { UrgencyBudgetMatrix } from '@/components/pm/requests/UrgencyBudgetMatrix';
import { RepeatingItems } from '@/components/pm/requests/RepeatingItems';
import { CategoryTreemap } from '@/components/pm/requests/CategoryTreemap';

import { RFQResponseLadder } from '@/components/pm/rfq/RFQResponseLadder';
import { QuoteSpreadSpotlight } from '@/components/pm/rfq/QuoteSpreadSpotlight';

import { DeliveryRiskStrip } from '@/components/pm/orders/DeliveryRiskStrip';
import { ThreeWayMatchStatus } from '@/components/pm/orders/ThreeWayMatchStatus';

import { ContractsUtilizationLadder } from '@/components/pm/contracts/ContractsUtilizationLadder';
import { RenewalCalendarStrip } from '@/components/pm/contracts/RenewalCalendarStrip';

import { VendorScatter } from '@/components/pm/vendors/VendorScatter';
import { LeadTimeByCategory } from '@/components/pm/vendors/LeadTimeByCategory';
import { VendorDiscountSpendChart } from '@/components/pm/vendors/VendorDiscountSpendChart';

import { OffContractSpend } from '@/components/pm/governance/OffContractSpend';
import { DuplicateIndents } from '@/components/pm/governance/DuplicateIndents';
import { ToastContainer, type Toast } from '@/components/ui/Toast';
import { VendorProfileModal } from '@/components/pm/VendorProfileModal';
import { ContractDetailsModal } from '@/components/pm/ContractDetailsModal';
import { RequestDetailsModal } from '@/components/pm/RequestDetailsModal';
import { VendorComparisonModal } from '@/components/pm/VendorComparisonModal';
import { RFQComparisonModal } from '@/components/pm/RFQComparisonModal';
import { suggestVendorsForRequest } from '@/components/pm/vendorSuggestUtils';
import { EnhancedVendor, Approval, EnhancedRequest, EnhancedContract, EnhancedApproval, QuoteApproval } from '@/types';
import { ApprovalsTabs } from '@/components/pm/approvals/ApprovalsTabs';
import { ApprovalFilters, FilterState } from '@/components/pm/approvals/ApprovalFilters';
import { ApprovalDrawer } from '@/components/pm/approvals/ApprovalDrawer';
import { SLAChip } from '@/components/pm/approvals/SLAChip';

// Inline Sparkline component for KPI cards - aligned with progress bars at bottom
function SparklineSvg({ data, color = '#0891b2' }: { data: number[]; color?: string }) {
  if (!data || data.length === 0) return null;
  
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const w = 140, h = 24, pad = 2; // Taller height to show variations, bottom-aligned
  const step = data.length > 1 ? (w - pad * 2) / (data.length - 1) : 0;

  const pts = data.map((v, i) => {
    const x = pad + i * step;
    // Normalize to show full range with some padding
    const normalized = (v - min) / range;
    const y = h - pad - (normalized * (h - pad * 2));
    return `${x},${y}`;
  }).join(' ');
  
  // Last point for the dot
  const lastX = pad + (data.length - 1) * step;
  const lastNormalized = (data[data.length - 1] - min) / range;
  const lastY = h - pad - (lastNormalized * (h - pad * 2));

  return (
    <div className="w-full overflow-hidden h-6 flex items-end">
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="max-w-full" preserveAspectRatio="xMidYMid meet">
        <polyline fill="none" stroke={color} strokeWidth="2" points={pts} />
        <circle cx={lastX} cy={lastY} r="2.5" fill={color} />
      </svg>
    </div>
  );
}

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
    label: 'Approvals', 
    href: '/procurement-manager/approvals', 
    icon: CheckCircle2, 
    onClick: () => onClick('/procurement-manager/approvals'),
    isActive: activeTab === 'approvals'
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
    label: 'Cost Savings', 
    href: '/procurement-manager/savings', 
    icon: DollarSign, 
    onClick: () => onClick('/procurement-manager/savings'),
    isActive: activeTab === 'savings'
  },
];

export default function ProcurementManagerDashboard() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'requests' | 'vendors' | 'contracts' | 'orders' | 'savings' | 'approvals'>('dashboard');
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
  const [selectedRFQForComparison, setSelectedRFQForComparison] = useState<{
    rfqId: string;
    rfqNumber: string;
    itemName: string;
    category: string;
    quotes: Array<{
      vendorId: string;
      vendorName: string;
      quoteAmount: number;
      leadTimeDays?: number;
      onTimePct?: number;
      qualityScore?: number;
      submittedAt?: string;
      notes?: string;
    }>;
  } | null>(null);
  const [isRFQComparisonModalOpen, setIsRFQComparisonModalOpen] = useState(false);
  
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

  const handleCompareRFQ = (rfqNumber: string) => {
    // Find the RFQ in mockRFQs
    const rfq = mockRFQs.find(r => r.rfqNumber === rfqNumber);
    if (!rfq) {
      showToast(`RFQ ${rfqNumber} not found`, 'error');
      return;
    }

    // Find quote approval for this RFQ to get vendor quotes
    const quoteApproval = enhancedApprovalsState.find(
      (a): a is QuoteApproval => 
        a.approvalType === 'QUOTE' && 
        (a.referenceId === rfqNumber || a.referenceNumber === rfqNumber || (a as QuoteApproval).rfqId === rfq.id)
    );

    if (quoteApproval && quoteApproval.suppliers && quoteApproval.suppliers.length > 0) {
      // Use quotes from approval
      setSelectedRFQForComparison({
        rfqId: rfq.id,
        rfqNumber: rfq.rfqNumber,
        itemName: rfq.itemName,
        category: rfq.category,
        quotes: quoteApproval.suppliers.map(s => ({
          vendorId: s.vendorId,
          vendorName: s.vendorName,
          quoteAmount: s.quoteAmount,
          leadTimeDays: s.leadTimeDays,
          onTimePct: s.onTimePct,
          qualityScore: s.qualityScore ? (s.qualityScore / 5) * 100 : undefined, // Convert 0-5 scale to percentage
        })),
      });
      setIsRFQComparisonModalOpen(true);
    } else {
      // Generate mock quotes from vendors for RFQ if no approval exists
      const matchingVendors = enhancedVendors
        .filter(v => v.category.toLowerCase() === rfq.category.toLowerCase() || 
                    rfq.itemName.toLowerCase().includes(v.name.toLowerCase().split(' ')[0].toLowerCase()))
        .slice(0, Math.min(4, rfq.suppliersResponded || 3));

      if (matchingVendors.length === 0) {
        showToast(`No quotes available for ${rfqNumber}`, 'info');
        return;
      }

      // Generate mock quotes with variation
      const baseQuote = rfq.lowestQuote;
      const quotes = matchingVendors.map((v, idx) => ({
        vendorId: v.id,
        vendorName: v.name,
        quoteAmount: baseQuote + (idx * 50000) + Math.floor(Math.random() * 50000),
        leadTimeDays: v.avgLeadTimeDays || 10 + idx * 2,
        onTimePct: v.onTimeDeliveryPercent,
        qualityScore: v.qualityPercent, // Already a percentage (0-100)
      })).sort((a, b) => a.quoteAmount - b.quoteAmount);

      setSelectedRFQForComparison({
        rfqId: rfq.id,
        rfqNumber: rfq.rfqNumber,
        itemName: rfq.itemName,
        category: rfq.category,
        quotes,
      });
      setIsRFQComparisonModalOpen(true);
    }
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

  // Helper function to get budget info for indent approvals
  const getBudgetInfoForIndent = (dept: string, budgetHead?: string, currentCost: number = 0) => {
    // Map departments to budget codes (similar to department-manager logic)
    const deptCodeMap: Record<string, string> = {
      'Powertrain Assembly': 'PROD-201',
      'Chassis Assembly': 'CHS-301',
      'Brake Systems': 'BRK-401',
      'Electronics & Controls': 'ELEC-501',
      'Body Shop': 'BOD-601',
    };
    
    const baseCode = deptCodeMap[dept] || 'GEN-001';
    
    // Create budget code from budget head if available
    let budgetCode = baseCode;
    let budgetName = budgetHead || dept;
    
    // Map budget heads to budget categories for better matching
    const budgetHeadMap: Record<string, string> = {
      'Chassis Components': 'Chassis',
      'Transmission Systems': 'Powertrain',
      'Engine Components': 'Powertrain',
      'Brake Components': 'Brake Components',
      'Battery Systems': 'Electronics',
      'Wiring Systems': 'Electronics',
      'Exhaust Systems': 'Powertrain',
      'Fuel Systems': 'Powertrain',
      'Cooling Systems': 'Powertrain',
      'Safety Components': 'Interior',
      'Forced Induction': 'Powertrain',
      'Lighting Systems': 'Exterior',
      'Lubrication Systems': 'Powertrain',
      'Electronics': 'Electronics',
    };
    
    // Determine category from budget head
    const category = budgetHead ? (budgetHeadMap[budgetHead] || budgetHead.split(' ')[0]) : 
                     (dept.includes('Powertrain') ? 'Powertrain' :
                      dept.includes('Chassis') ? 'Chassis' :
                      dept.includes('Electronics') ? 'Electronics' :
                      dept.includes('Body') ? 'Body-in-White' : 'Powertrain');
    
    if (budgetHead) {
      // Extract category prefix from budget head (e.g., "Chassis Components" -> "CHAS")
      const categoryPrefix = budgetHead
        .split(' ')
        .map(w => w.substring(0, 3).toUpperCase())
        .join('')
        .substring(0, 4);
      budgetCode = `${baseCode}-${categoryPrefix}`;
      budgetName = budgetHead;
    } else {
      budgetName = category;
    }
    
    // Budget allocation map (matching department-manager categories)
    const budgetMap: Record<string, number> = {
      'Powertrain': 8500000,
      'Chassis': 6200000,
      'Body-in-White': 4800000,
      'Electronics': 3500000,
      'Interior': 2800000,
      'Exterior': 2200000,
      'Tooling': 5000000,
      'Raw Materials': 3800000,
      'Logistics': 1800000,
      'Brake Components': 2000000,
      'Transmission Systems': 4000000,
      'Engine Components': 4500000,
      'Battery Systems': 3000000,
      'Wiring Systems': 1500000,
      'Exhaust Systems': 1800000,
      'Fuel Systems': 2200000,
      'Cooling Systems': 1200000,
      'Safety Components': 2500000,
      'Forced Induction': 3500000,
      'Lighting Systems': 1600000,
      'Lubrication Systems': 800000,
    };
    
    // Get total budget for this category
    const totalBudget = budgetMap[category] || 
                       budgetMap[budgetName] ||
                       budgetMap[budgetName.split(' ')[0]] || 
                       (category.includes('Powertrain') || dept.includes('Powertrain') ? 8500000 :
                        category.includes('Chassis') || dept.includes('Chassis') ? 6200000 :
                        category.includes('Electronics') || dept.includes('Electronics') ? 3500000 :
                        category.includes('Body') || dept.includes('Body') ? 4800000 :
                        2000000); // Default
    
    // Calculate base spent from approved/committed requests matching this budget category
    const baseSpent = requests
      .filter(r => {
        const rCategory = r.department.includes('Powertrain') ? 'Powertrain' :
                         r.department.includes('Chassis') ? 'Chassis' :
                         r.department.includes('Electronics') ? 'Electronics' :
                         r.department.includes('Body') ? 'Body-in-White' : 'Powertrain';
        return (rCategory === category || r.department === dept) &&
               (r.status === 'approved' || r.status === 'po-issued');
      })
      .reduce((sum, r) => sum + r.estimatedCost, 0);
    
    // Add current approval cost and some variance to ensure realistic percentages
    // Use a deterministic approach based on cost to ensure ~75% have meaningful data (30%+ used)
    const costHash = currentCost.toString().split('').reduce((acc, char) => acc + parseInt(char) || 0, 0);
    const basePercentage = (costHash % 70) + 25; // Target percentage between 25% and 95%
    const targetSpent = (totalBudget * basePercentage) / 100;
    
    // If baseSpent is too low, add variance to reach target percentage
    const variance = Math.max(0, targetSpent - baseSpent - currentCost);
    const varianceAmount = variance > 0 ? variance : (costHash % 400000) + 150000; // Fallback variance
    
    const spent = baseSpent + currentCost + varianceAmount;
    
    const percentUsed = totalBudget > 0 ? Math.min((spent / totalBudget) * 100, 98) : 0; // Cap at 98%
    
    return { code: budgetCode, name: budgetName, total: totalBudget, spent, percentUsed };
  };

  const navItems = getNavItems(handleNavClick, activeTab);

  return (
    <DashboardLayout navItems={navItems} role="procurement-manager" title={
      activeTab === 'dashboard' ? 'Dashboard' :
      activeTab === 'requests' ? 'Incoming Requests' :
      activeTab === 'vendors' ? 'Vendors' :
      activeTab === 'contracts' ? 'Contracts' :
      activeTab === 'orders' ? 'Orders' :
      activeTab === 'savings' ? 'Cost Savings' :
      'Approvals'
    }>
      <div className="space-y-6">
        {activeTab === 'dashboard' && (
          <>
            {/* Enhanced KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <div 
                className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 p-6 cursor-pointer hover:shadow-lg transition-all flex flex-col h-full"
                onClick={() => { setActiveTab('vendors'); showToast('Opening Vendors tab', 'info'); }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium text-blue-800">Total Vendors</div>
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-blue-900 mb-1">{vendorsCount}</div>
                <div className="text-xs text-blue-700 mb-4">Active vendor relationships</div>
                <div className="mt-auto bg-blue-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 rounded-full h-2 transition-all" 
                    style={{ width: `${Math.min((vendorsCount / 100) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>

              <div 
                className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200 p-6 cursor-pointer hover:shadow-lg transition-all flex flex-col h-full"
                onClick={() => { setActiveTab('contracts'); showToast('Opening Contracts tab', 'info'); }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium text-green-800">Active Contracts</div>
                  <FileContract className="h-5 w-5 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-green-900 mb-1">{activeContracts}</div>
                <div className="text-xs text-green-700 mb-4">{expiringSoon} expiring within 30 days</div>
                <div className="mt-auto bg-green-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 rounded-full h-2 transition-all" 
                    style={{ width: `${Math.min((activeContracts / enhancedContracts.length) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>

              <div 
                className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200 p-6 cursor-pointer hover:shadow-lg transition-all flex flex-col h-full"
                onClick={() => { setActiveTab('orders'); showToast('Opening Orders tab', 'info'); }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium text-orange-800">Pending POs</div>
                  <ShoppingCart className="h-5 w-5 text-orange-600" />
                </div>
                <div className="text-2xl font-bold text-orange-900 mb-1">{posPending}</div>
                <div className="text-xs text-orange-700 mb-4">Awaiting approval</div>
                <div className="mt-auto bg-orange-200 rounded-full h-2">
                  <div 
                    className="bg-orange-600 rounded-full h-2 transition-all" 
                    style={{ width: `${enhancedPurchaseOrders.length > 0 ? (posPending / enhancedPurchaseOrders.length) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>

              <div 
                className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200 p-6 cursor-pointer hover:shadow-lg transition-all flex flex-col h-full"
                onClick={() => { setActiveTab('orders'); showToast('Viewing PO age details', 'info'); }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium text-purple-800">Avg PO Age</div>
                  <AlertCircle className="h-5 w-5 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-purple-900 mb-1">{avgPOAge} days</div>
                <div className="text-xs text-purple-700 mb-4">Average processing time</div>
                <div className="mt-auto">
                  {(() => {
                    // Performance thresholds: < 5 days = Excellent, < 10 = Good, < 15 = Fair, >= 15 = Needs Attention
                    let status = '';
                    let statusColor = '';
                    let progressPercent = 0;
                    
                    if (avgPOAge < 5) {
                      status = 'Excellent';
                      statusColor = 'green';
                      progressPercent = (avgPOAge / 5) * 100;
                    } else if (avgPOAge < 10) {
                      status = 'Good';
                      statusColor = 'blue';
                      progressPercent = 75 + ((avgPOAge - 5) / 5) * 5;
                    } else if (avgPOAge < 15) {
                      status = 'Fair';
                      statusColor = 'yellow';
                      progressPercent = 50 + ((avgPOAge - 10) / 5) * 25;
                    } else {
                      status = 'Needs Attention';
                      statusColor = 'red';
                      progressPercent = Math.min(50 + ((avgPOAge - 15) / 10) * 50, 100);
                    }
                    
                    return (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-semibold ${
                            statusColor === 'green' ? 'text-green-700' :
                            statusColor === 'blue' ? 'text-blue-700' :
                            statusColor === 'yellow' ? 'text-yellow-700' :
                            'text-red-700'
                          }`}>
                            {status}
                          </span>
                          <span className="text-xs text-purple-600">
                            Target: {'<'} 5 days
                          </span>
                        </div>
                        <div className={`rounded-full h-2 ${
                          statusColor === 'green' ? 'bg-green-200' :
                          statusColor === 'blue' ? 'bg-blue-200' :
                          statusColor === 'yellow' ? 'bg-yellow-200' :
                          'bg-red-200'
                        }`}>
                          <div 
                            className={`rounded-full h-2 transition-all ${
                              statusColor === 'green' ? 'bg-green-600' :
                              statusColor === 'blue' ? 'bg-blue-600' :
                              statusColor === 'yellow' ? 'bg-yellow-600' :
                              'bg-red-600'
                            }`}
                            style={{ width: `${100 - progressPercent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              <div 
                className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg border border-teal-200 p-6 cursor-pointer hover:shadow-lg transition-all flex flex-col h-full"
                onClick={() => showToast('Viewing spend analytics', 'info')}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium text-teal-800">Avg Monthly Spend</div>
                  <TrendingUp className="h-5 w-5 text-teal-600" />
                </div>
                <div className="text-2xl font-bold text-teal-900 mb-1">{formatCurrency(avgMonthlySpend)}</div>
                <div className="text-xs text-teal-700 mb-4">+12% month-over-month</div>
                <div className="mt-auto">
                  {monthlySpendData && monthlySpendData.length > 0 && (
                    <SparklineSvg data={monthlySpendData.map(d => d.spend)} color="#0891b2" />
                  )}
                </div>
              </div>
            </div>

            {/* Workspace two-column + sticky sidebar */}
            <div className="grid grid-cols-1 xl:grid-cols-9 gap-6">
              <div className="xl:col-span-6 space-y-6">
                {/* Pipeline */}
                <PipelineFunnel stages={pipelineStages} />

                {/* Spend trends + mini donut */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg border border-[#DFE2E4] p-6">
                    <h3 className="text-lg font-semibold text-[#31343A] mb-4">Spends - PO Value</h3>
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

            {/* New two-up: Delivery risk + 3-way match with Category Treemap */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DeliveryRiskStrip />
              <div className="space-y-6">
                <ThreeWayMatchStatus />
                <CategoryTreemap requests={requests} />
              </div>
            </div>

            {/* Quadrant View: Chart + Quadrant Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Chart Column */}
              <VendorScatter showQuadrantView={false} />
              
              {/* Quadrant Details Column */}
              <div className="bg-white rounded-lg border border-[#DFE2E4] p-6">
                <div className="text-lg font-semibold text-[#31343A] mb-4">Quadrant Details</div>
                
                <div className="space-y-4 mb-6">
                  <div className="border-l-4 border-[#E00420] pl-4 py-3 bg-[#E00420]/5 rounded-r">
                    <div className="font-semibold text-[#31343A] text-sm mb-1">Star Performers</div>
                    <p className="text-[#9DA5A8] text-xs leading-relaxed">High On-time • High Quality</p>
                    <p className="text-[#9DA5A8] text-xs mt-2">Best vendors - expand relationships and prioritize for future contracts</p>
                  </div>
                  
                  <div className="border-l-4 border-[#005691] pl-4 py-3 bg-[#005691]/5 rounded-r">
                    <div className="font-semibold text-[#31343A] text-sm mb-1">Quality Focus</div>
                    <p className="text-[#9DA5A8] text-xs leading-relaxed">Low On-time • High Quality</p>
                    <p className="text-[#9DA5A8] text-xs mt-2">Work on logistics & lead times. Quality is good but delivery needs improvement</p>
                  </div>
                  
                  <div className="border-l-4 border-[#DFE2E4] pl-4 py-3 bg-[#DFE2E4]/30 rounded-r">
                    <div className="font-semibold text-[#31343A] text-sm mb-1">Timely Risky</div>
                    <p className="text-[#9DA5A8] text-xs leading-relaxed">High On-time • Low Quality</p>
                    <p className="text-[#9DA5A8] text-xs mt-2">Review QC processes. They deliver on time but quality issues need attention</p>
                  </div>
                  
                  <div className="border-l-4 border-[#DFE2E4] pl-4 py-3 bg-[#DFE2E4]/30 rounded-r">
                    <div className="font-semibold text-[#31343A] text-sm mb-1">At-Risk</div>
                    <p className="text-[#9DA5A8] text-xs leading-relaxed">Low On-time • Low Quality</p>
                    <p className="text-[#9DA5A8] text-xs mt-2">Consider alternatives. Both delivery and quality need significant improvement</p>
                  </div>
                </div>
                
                {/* Average Thresholds */}
                <div className="pt-4 border-t border-[#DFE2E4]">
                  <div className="text-sm text-[#9DA5A8] mb-3 font-semibold">Average Thresholds</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-[#9DA5A8]">On-time Delivery:</span>
                      <span className="text-[#31343A] font-semibold">
                        {Math.round(enhancedVendors.reduce((sum, v) => sum + (v.onTimeDeliveryPercent || 0), 0) / enhancedVendors.filter(v => v.onTimeDeliveryPercent != null).length)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#9DA5A8]">Quality Score:</span>
                      <span className="text-[#31343A] font-semibold">
                        {Math.round(enhancedVendors.reduce((sum, v) => sum + (v.qualityPercent || 0), 0) / enhancedVendors.filter(v => v.qualityPercent != null).length)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

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

            {/* New layout: Discount vs Spend (Left) and On-time vs Quality (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <VendorDiscountSpendChart />
              <VendorScatter showQuadrantView={false} />
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

            {/* Lead Time by Category - moved to bottom */}
            <LeadTimeByCategory />
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

        {activeTab === 'savings' && (() => {
          // Calculate savings: Compare initial quote (from RFQ or request estimatedCost) vs final PO amount
          // Note: In a real app, POs would have referenceId linking to RFQ or Request
          const savingsData = (() => {
            const savings = enhancedPurchaseOrders
              .filter(po => po.status !== 'cancelled')
              .map(po => {
                // Try to find matching RFQ by checking if any RFQ has a similar amount or by PO number pattern
                // In a real app, PO would have rfqId or requestId reference
                const matchingRFQ = mockRFQs.find(rfq => {
                  // Match by amount similarity (within 30% variance)
                  const amountDiff = Math.abs(rfq.lowestQuote - po.amount);
                  return amountDiff < rfq.lowestQuote * 0.3 || amountDiff < po.amount * 0.3;
                });

                // Try to find matching request by amount similarity (within 30% variance)
                const matchingRequest = enhancedRequests.find(req => 
                  Math.abs(req.estimatedCost - po.amount) < Math.max(req.estimatedCost, po.amount) * 0.3 &&
                  (req.status === 'po-issued' || req.status === 'approved')
                );

                // Use RFQ lowestQuote if available, otherwise use request estimatedCost
                // If no match found, skip this PO (don't assume savings)
                if (!matchingRFQ && !matchingRequest) {
                  return null;
                }

                const initialQuote = matchingRFQ?.lowestQuote || matchingRequest?.estimatedCost || po.amount;
                const finalAmount = po.amount;
                
                // Only calculate if we actually have a lower initial quote
                if (initialQuote <= finalAmount) {
                  return null;
                }

                const savingsAmount = initialQuote - finalAmount;
                const savingsPercent = initialQuote > 0 ? (savingsAmount / initialQuote) * 100 : 0;

                return {
                  poId: po.id,
                  poNumber: po.poNumber,
                  itemName: matchingRFQ?.itemName || matchingRequest?.itemName || 'Item',
                  category: matchingRFQ?.category || 'General',
                  vendor: po.vendor,
                  initialQuote,
                  finalAmount,
                  savingsAmount,
                  savingsPercent,
                  createdAt: po.createdAt,
                  rfqNumber: matchingRFQ?.rfqNumber,
                  requestId: matchingRequest?.id,
                };
              })
              .filter((item): item is NonNullable<typeof item> => item !== null && item.initialQuote > item.finalAmount); // Only show actual savings

            return savings;
          })();

          const totalSavings = savingsData.reduce((sum, s) => sum + s.savingsAmount, 0);
          const totalInitialValue = savingsData.reduce((sum, s) => sum + s.initialQuote, 0);
          const avgSavingsPercent = totalInitialValue > 0 ? (totalSavings / totalInitialValue) * 100 : 0;
          const savingsCount = savingsData.length;

          // Category-wise savings
          const categorySavings = savingsData.reduce((acc, s) => {
            const cat = s.category;
            if (!acc[cat]) {
              acc[cat] = { totalSavings: 0, totalInitial: 0, count: 0 };
            }
            acc[cat].totalSavings += s.savingsAmount;
            acc[cat].totalInitial += s.initialQuote;
            acc[cat].count += 1;
            return acc;
          }, {} as Record<string, { totalSavings: number; totalInitial: number; count: number }>);

          // Monthly savings trend
          const monthlySavings = savingsData.reduce((acc, s) => {
            const month = new Date(s.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
            if (!acc[month]) {
              acc[month] = 0;
            }
            acc[month] += s.savingsAmount;
            return acc;
          }, {} as Record<string, number>);

          const savingsTrendData = Object.entries(monthlySavings)
            .map(([month, savings]) => ({ month, savings }))
            .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());

          // Vendor-wise savings
          const vendorSavings = savingsData.reduce((acc, s) => {
            if (!acc[s.vendor]) {
              acc[s.vendor] = { totalSavings: 0, totalInitial: 0, count: 0, avgPercent: 0 };
            }
            acc[s.vendor].totalSavings += s.savingsAmount;
            acc[s.vendor].totalInitial += s.initialQuote;
            acc[s.vendor].count += 1;
            acc[s.vendor].avgPercent = (acc[s.vendor].totalSavings / acc[s.vendor].totalInitial) * 100;
            return acc;
          }, {} as Record<string, { totalSavings: number; totalInitial: number; count: number; avgPercent: number }>);

          // Top savings opportunities (highest savings %)
          const topSavings = [...savingsData].sort((a, b) => b.savingsPercent - a.savingsPercent).slice(0, 5);

          // Savings distribution by percentage ranges
          const savingsDistribution = savingsData.reduce((acc, s) => {
            let range = '';
            if (s.savingsPercent >= 15) range = '15%+ (Excellent)';
            else if (s.savingsPercent >= 10) range = '10-15% (Great)';
            else if (s.savingsPercent >= 5) range = '5-10% (Good)';
            else range = '0-5% (Fair)';
            
            if (!acc[range]) {
              acc[range] = { count: 0, totalSavings: 0 };
            }
            acc[range].count += 1;
            acc[range].totalSavings += s.savingsAmount;
            return acc;
          }, {} as Record<string, { count: number; totalSavings: number }>);

          // Calculate savings rate (savings instances / total POs)
          const totalPOs = enhancedPurchaseOrders.filter(po => po.status !== 'cancelled').length;
          const savingsRate = totalPOs > 0 ? (savingsCount / totalPOs) * 100 : 0;

          // Category efficiency (savings per PO)
          const categoryEfficiency = Object.entries(categorySavings).map(([cat, data]) => ({
            category: cat,
            totalSavings: data.totalSavings,
            count: data.count,
            avgSavingsPerPO: data.totalSavings / data.count,
            avgPercent: (data.totalSavings / data.totalInitial) * 100,
            initialValue: data.totalInitial,
            finalValue: data.totalInitial - data.totalSavings,
          }));

          // Cumulative savings over time
          const cumulativeData = savingsTrendData.map((item, index) => ({
            ...item,
            cumulative: savingsTrendData.slice(0, index + 1).reduce((sum, d) => sum + d.savings, 0),
          }));

          // Comparison: Initial vs Final (Stacked chart)
          const comparisonData = categoryEfficiency.map(cat => ({
            category: cat.category.length > 12 ? cat.category.substring(0, 12) + '...' : cat.category,
            initial: cat.initialValue / 1000,
            final: cat.finalValue / 1000,
            savings: cat.totalSavings / 1000,
          }));

          return (
            <div className="space-y-6">
              {/* Enhanced KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200 p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium text-green-800">Total Savings</div>
                    <DollarSign className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="text-2xl font-bold text-green-900">{formatCurrency(totalSavings)}</div>
                  <div className="text-xs text-green-700 mt-2">{avgSavingsPercent.toFixed(1)}% average savings rate</div>
                  <div className="mt-3 bg-green-200 rounded-full h-2">
                    <div className="bg-green-600 rounded-full h-2" style={{ width: `${Math.min(avgSavingsPercent * 5, 100)}%` }}></div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium text-blue-800">Savings Rate</div>
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-blue-900">{savingsRate.toFixed(1)}%</div>
                  <div className="text-xs text-blue-700 mt-2">{savingsCount} of {totalPOs} POs achieved savings</div>
                  <div className="mt-3 bg-blue-200 rounded-full h-2">
                    <div className="bg-blue-600 rounded-full h-2" style={{ width: `${savingsRate}%` }}></div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200 p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium text-purple-800">Avg Savings %</div>
                    <FileText className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="text-2xl font-bold text-purple-900">{avgSavingsPercent.toFixed(1)}%</div>
                  <div className="text-xs text-purple-700 mt-2">Per negotiation instance</div>
                  <div className="mt-3 flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <div
                        key={star}
                        className={`h-2 w-2 rounded-full ${
                          star <= Math.ceil(avgSavingsPercent / 3) ? 'bg-purple-600' : 'bg-purple-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200 p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium text-orange-800">Total Negotiated</div>
                    <CheckCircle2 className="h-5 w-5 text-orange-600" />
                  </div>
                  <div className="text-2xl font-bold text-orange-900">{formatCurrency(totalInitialValue)}</div>
                  <div className="text-xs text-orange-700 mt-2">Initial quote value</div>
                  <div className="mt-3 text-xs text-orange-600">
                    Final: {formatCurrency(totalInitialValue - totalSavings)}
                  </div>
                </div>
              </div>

              {/* Enhanced Charts - First Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Savings Trend with Cumulative */}
                <div className="bg-white rounded-lg border border-[#DFE2E4] p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-[#31343A]">Monthly Savings Trend</h3>
                      <p className="text-xs text-[#9DA5A8] mt-1">Tracking savings performance over time</p>
                    </div>
                  </div>
                  {cumulativeData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <ComposedChart data={cumulativeData.map(d => ({ ...d, savings: d.savings / 1000, cumulative: d.cumulative / 1000 }))}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#DFE2E4" />
                        <XAxis dataKey="month" stroke="#9DA5A8" fontSize={12} />
                        <YAxis stroke="#9DA5A8" fontSize={12} label={{ value: 'Amount (thousands)', angle: -90, position: 'insideLeft' }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #DFE2E4',
                            borderRadius: '8px',
                          }}
                          formatter={(value: any) => formatCurrency(Number(value) * 1000)}
                        />
                        <Legend />
                        <Bar dataKey="savings" name="Monthly Savings" fill="#10b981" radius={[4, 4, 0, 0]} />
                        <Area
                          type="monotone"
                          dataKey="cumulative"
                          name="Cumulative Savings"
                          fill="#005691"
                          fillOpacity={0.3}
                          stroke="#005691"
                          strokeWidth={2}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-center py-8 text-[#9DA5A8]">No savings data available</div>
                  )}
                </div>

                {/* Savings Distribution */}
                <div className="bg-white rounded-lg border border-[#DFE2E4] p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-[#31343A]">Savings Distribution</h3>
                      <p className="text-xs text-[#9DA5A8] mt-1">Performance by savings percentage range</p>
                    </div>
                  </div>
                  {Object.keys(savingsDistribution).length > 0 ? (
                    <div className="space-y-4">
                      {Object.entries(savingsDistribution).map(([range, data]) => {
                        const totalInRange = Object.values(savingsDistribution).reduce((sum, d) => sum + d.count, 0);
                        const percentage = (data.count / totalInRange) * 100;
                        const colorClass = range.includes('Excellent') ? 'bg-green-600' :
                                         range.includes('Great') ? 'bg-blue-600' :
                                         range.includes('Good') ? 'bg-yellow-500' : 'bg-orange-500';
                        return (
                          <div key={range}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-[#31343A]">{range}</span>
                              <span className="text-xs text-[#9DA5A8]">{data.count} POs • {formatCurrency(data.totalSavings)}</span>
                            </div>
                            <div className="bg-[#DFE2E4] rounded-full h-3 overflow-hidden">
                              <div
                                className={`${colorClass} h-3 rounded-full transition-all`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                      <div className="mt-4 pt-4 border-t border-[#DFE2E4]">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-[#9DA5A8]">Total Instances</span>
                          <span className="font-semibold text-[#31343A]">{savingsCount}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-[#9DA5A8]">No distribution data available</div>
                  )}
                </div>
              </div>

              {/* Top Performers & Vendor Analysis */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Savings Opportunities */}
                <div className="bg-white rounded-lg border border-[#DFE2E4] p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-[#31343A]">Top 5 Savings Achievements</h3>
                      <p className="text-xs text-[#9DA5A8] mt-1">Highest savings percentage instances</p>
                    </div>
                  </div>
                  {topSavings.length > 0 ? (
                    <div className="space-y-3">
                      {topSavings.map((s, index) => (
                        <div key={s.poId} className="border border-[#DFE2E4] rounded-lg p-4 hover:bg-[#DFE2E4]/30 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-800 text-xs font-bold">
                                  #{index + 1}
                                </span>
                                <span className="text-sm font-medium text-[#31343A]">{s.poNumber}</span>
                              </div>
                              <div className="text-xs text-[#9DA5A8] ml-8">{s.itemName}</div>
                              <div className="flex items-center gap-4 mt-2 ml-8">
                                <div className="text-xs">
                                  <span className="text-[#9DA5A8]">Initial: </span>
                                  <span className="font-medium text-[#31343A]">{formatCurrency(s.initialQuote)}</span>
                                </div>
                                <div className="text-xs">
                                  <span className="text-[#9DA5A8]">Final: </span>
                                  <span className="font-medium text-[#31343A]">{formatCurrency(s.finalAmount)}</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-green-600">{s.savingsPercent.toFixed(1)}%</div>
                              <div className="text-xs text-green-600">{formatCurrency(s.savingsAmount)}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-[#9DA5A8]">No top savings data available</div>
                  )}
                </div>

                {/* Vendor Performance */}
                <div className="bg-white rounded-lg border border-[#DFE2E4] p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-[#31343A]">Vendor Savings Performance</h3>
                      <p className="text-xs text-[#9DA5A8] mt-1">Top vendors by total savings achieved</p>
                    </div>
                  </div>
                  {Object.keys(vendorSavings).length > 0 ? (
                    <div className="space-y-3 max-h-[400px] overflow-y-auto">
                      {Object.entries(vendorSavings)
                        .sort((a, b) => b[1].totalSavings - a[1].totalSavings)
                        .slice(0, 8)
                        .map(([vendor, data]) => {
                          const vendorPercentage = (data.totalSavings / totalSavings) * 100;
                          return (
                            <div key={vendor} className="border border-[#DFE2E4] rounded-lg p-3 hover:bg-[#DFE2E4]/30 transition-colors">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-[#31343A] truncate">{vendor}</span>
                                <span className="text-xs font-semibold text-green-600">{data.avgPercent.toFixed(1)}% avg</span>
                              </div>
                              <div className="flex items-center gap-2 mb-2">
                                <div className="flex-1 bg-[#DFE2E4] rounded-full h-2">
                                  <div
                                    className="bg-green-600 rounded-full h-2 transition-all"
                                    style={{ width: `${vendorPercentage}%` }}
                                  />
                                </div>
                                <span className="text-xs text-[#9DA5A8] whitespace-nowrap">{formatCurrency(data.totalSavings)}</span>
                              </div>
                              <div className="flex items-center justify-between text-xs text-[#9DA5A8]">
                                <span>{data.count} POs</span>
                                <span>{vendorPercentage.toFixed(1)}% of total</span>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-[#9DA5A8]">No vendor data available</div>
                  )}
                </div>
              </div>

              {/* Savings Table */}
              <div className="bg-white rounded-lg border border-[#DFE2E4] overflow-hidden">
                <div className="p-4 border-b border-[#DFE2E4]">
                  <h3 className="text-lg font-semibold text-[#31343A]">Savings Breakdown</h3>
                  <p className="text-sm text-[#9DA5A8] mt-1">Detailed view of savings from initial quotes to final PO amounts</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-[#DFE2E4]">
                    <thead className="bg-[#DFE2E4]/30">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#9DA5A8] uppercase">PO Number</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#9DA5A8] uppercase">Item</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#9DA5A8] uppercase">Category</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#9DA5A8] uppercase">Vendor</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#9DA5A8] uppercase">Initial Quote</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#9DA5A8] uppercase">Final PO</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#9DA5A8] uppercase">Savings</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#9DA5A8] uppercase">Savings %</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#9DA5A8] uppercase">RFQ</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-[#DFE2E4]">
                      {savingsData.length > 0 ? (
                        savingsData.map((s) => (
                          <tr key={s.poId} className="hover:bg-[#DFE2E4]/30">
                            <td className="px-6 py-4 text-sm font-medium text-[#31343A]">{s.poNumber}</td>
                            <td className="px-6 py-4 text-sm text-[#31343A]">{s.itemName}</td>
                            <td className="px-6 py-4 text-sm text-[#9DA5A8]">{s.category}</td>
                            <td className="px-6 py-4 text-sm text-[#31343A]">{s.vendor}</td>
                            <td className="px-6 py-4 text-sm text-[#31343A]">{formatCurrency(s.initialQuote)}</td>
                            <td className="px-6 py-4 text-sm font-medium text-[#31343A]">{formatCurrency(s.finalAmount)}</td>
                            <td className="px-6 py-4 text-sm font-semibold text-green-600">{formatCurrency(s.savingsAmount)}</td>
                            <td className="px-6 py-4 text-sm font-semibold text-green-600">{s.savingsPercent.toFixed(1)}%</td>
                            <td className="px-6 py-4 text-sm text-[#9DA5A8]">{s.rfqNumber || '-'}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={9} className="px-6 py-8 text-center text-[#9DA5A8]">
                            No savings data available. Savings will appear here once POs are issued with negotiated amounts lower than initial quotes.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          );
        })()}

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
                          const budgetInfo = getBudgetInfoForIndent(a.dept, a.budgetHead, a.estimatedCost);
                          return (
                            <tr key={a.id} className="hover:bg-[#DFE2E4]/30">
                              <td className="px-6 py-4 text-sm font-medium text-[#31343A]">{a.referenceNumber}</td>
                              <td className="px-6 py-4 text-sm text-[#31343A]">{a.dept}</td>
                              <td className="px-6 py-4 text-sm text-[#31343A]">{a.itemName}</td>
                              <td className="px-6 py-4 text-sm">{formatCurrency(a.estimatedCost)}</td>
                              <td className="px-6 py-4"><StatusBadge status={a.urgency === 'critical' ? 'critical' : a.urgency === 'high' ? 'pending' : 'active'} /></td>
                              <td className="px-6 py-4">
                                <div className="flex flex-col">
                                  <div className="text-sm font-medium text-[#005691]">{budgetInfo.code}</div>
                                  <div className="text-xs text-[#31343A] mt-0.5">{budgetInfo.name}</div>
                                  <div className="text-xs text-[#9DA5A8] mt-1">{budgetInfo.percentUsed.toFixed(1)}% used</div>
                                </div>
                              </td>
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
      {selectedRFQForComparison && (
        <RFQComparisonModal
          rfqId={selectedRFQForComparison.rfqId}
          rfqNumber={selectedRFQForComparison.rfqNumber}
          itemName={selectedRFQForComparison.itemName}
          category={selectedRFQForComparison.category}
          quotes={selectedRFQForComparison.quotes}
          isOpen={isRFQComparisonModalOpen}
          onClose={() => {
            setIsRFQComparisonModalOpen(false);
            setSelectedRFQForComparison(null);
          }}
          onSelectQuote={(vendorId) => {
            showToast(`Selected quote from ${selectedRFQForComparison.quotes.find(q => q.vendorId === vendorId)?.vendorName}`, 'success');
            setIsRFQComparisonModalOpen(false);
            setSelectedRFQForComparison(null);
          }}
        />
      )}
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

