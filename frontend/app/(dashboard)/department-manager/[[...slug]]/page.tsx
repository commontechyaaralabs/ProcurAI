'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { KPICard } from '@/components/ui/KPICard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Modal } from '@/components/ui/Modal';
import { IndentDetail } from '@/components/department-manager/IndentDetail';
import { DepartmentHeader } from '@/components/department-manager/DepartmentHeader';
import { BudgetSummaryTiles } from '@/components/department-manager/BudgetSummaryTiles';
import { ApprovalWorkflowMap } from '@/components/department-manager/ApprovalWorkflowMap';
import { SmartInsights } from '@/components/department-manager/SmartInsights';
import { AlertsCenter } from '@/components/department-manager/AlertsCenter';
import { ColumnChooser, ColumnConfig } from '@/components/department-manager/ColumnChooser';
import { PipelineFunnel } from '@/components/pm/PipelineFunnel';
import { RequestsAgingBuckets } from '@/components/pm/requests/RequestsAgingBuckets';
import { UrgencyBudgetMatrix } from '@/components/pm/requests/UrgencyBudgetMatrix';
import { RepeatingItems } from '@/components/pm/requests/RepeatingItems';
import { FileText, TrendingUp, Clock, AlertTriangle, Search, Filter, X, BarChart3, PieChart as PieChartIcon, List, Grid, LayoutGrid, Download, FileDown, Calendar, CheckCircle2, FileCheck } from 'lucide-react';
import { mockRequests, mockActivityFeed, mockRFQs, enhancedVendors } from '@/lib/mockData';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils';
import { Request } from '@/types';
import { RFQComparisonModal } from '@/components/pm/RFQComparisonModal';
import { MultiLineChart } from '@/components/charts/MultiLineChart';
import { BarChart } from '@/components/charts/BarChart';
import { PieChart } from '@/components/charts/PieChart';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Extended Request interface with automotive fields
interface ExtendedRequest extends Request {
  plant?: string;
  program?: string;
  partNumber?: string;
      commodity?: string;
      category?: string;
      subcategory?: string;
      costType?: string;
  compliance?: {
    iatfSupplier?: boolean;
    ppapRequired?: boolean;
    imdsRequired?: boolean;
  };
  lineStopRisk?: boolean;
  riskReason?: string;
  requiredBy?: string;
  indentAge?: number;
  approvedAmount?: number;
  approver?: string;
  remarks?: string;
  workflowStages?: Array<{
    id: string;
    name: string;
    status: 'completed' | 'in-progress' | 'pending' | 'rejected';
    timestamp?: string;
    approver?: string;
    remarks?: string;
  }>;
}

// Automotive Department Configuration
const AUTOMOTIVE_DEPARTMENTS = [
  { code: 'PROD-201', name: 'Production', manager: 'Rajesh Kumar' },
  { code: 'MAINT-301', name: 'Maintenance', manager: 'Amit Patel' },
  { code: 'TOOL-401', name: 'Tooling', manager: 'Deepak Verma' },
  { code: 'LOG-501', name: 'Logistics', manager: 'Priya Sharma' },
  { code: 'QTY-601', name: 'Quality', manager: 'Vikram Singh' },
];

// Current department (can be selected/dynamic)
// For now, using 'Production' which should match requests
// In a real app, this would come from user context/auth
const DEPARTMENT_CONFIG = AUTOMOTIVE_DEPARTMENTS[0];
const DEPARTMENT_BUDGET_CODE = DEPARTMENT_CONFIG.code;
const DEPARTMENT_NAME = DEPARTMENT_CONFIG.name; // 'Production'

// Map department names for flexibility (to match both 'Production' and related departments)
const DEPARTMENT_ALIASES = [
  DEPARTMENT_NAME,
  'Powertrain Assembly', // Related production department
  'Body Shop', // Related production department
];

// Automotive Categories
const AUTOMOTIVE_CATEGORIES = {
  'Powertrain': ['Engine Components', 'Transmission Parts', 'Exhaust Systems', 'Cooling Systems'],
  'Chassis': ['Suspension', 'Steering', 'Brakes', 'Wheels & Tires'],
  'Body-in-White': ['Body Panels', 'Structural Components', 'Welding Materials', 'Fasteners'],
  'Electronics': ['ECU Sensors', 'Wire Harness', 'Displays', 'Connectivity Modules'],
  'Interior': ['Seats', 'Instrument Panel', 'Trim', 'HVAC Components'],
  'Exterior': ['Lights', 'Mirrors', 'Bumpers', 'Glass'],
  'Tooling': ['Molds & Dies', 'Jigs & Fixtures', 'Gauges', 'Cutting Tools'],
  'Raw Materials': ['Steel Coils', 'Aluminum Sheets', 'Plastics', 'Rubber Compounds'],
  'Logistics': ['Freight', 'Warehousing', 'Packaging', 'Expedited Shipping'],
};

// Automotive Programs
const AUTOMOTIVE_PROGRAMS = ['SUV-X1', 'Sedan-Y2', 'Hatch-Z3', 'EV-E1', 'Commercial-C1'];
const AUTOMOTIVE_PLANTS = ['PLT-01 (Pune)', 'PLT-02 (Chennai)', 'PLT-03 (Aurangabad)', 'PLT-04 (Bangalore)'];

export default function DepartmentManagerPage() {
  const pathname = usePathname();
  const router = useRouter();
  const baseRequests = mockRequests;
  
  // Enhance requests with comprehensive automotive-specific data - convert to state
  const [allRequests, setAllRequests] = useState<ExtendedRequest[]>(() => {
    return baseRequests.map((r, idx) => {
    const createdAt = new Date(r.createdAt);
    const now = new Date();
    const ageDays = Math.ceil((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
    
    // Automotive-specific assignments
    const automotiveCategories = Object.keys(AUTOMOTIVE_CATEGORIES);
    const category = automotiveCategories[idx % automotiveCategories.length] || 'Powertrain';
    const subcategories = AUTOMOTIVE_CATEGORIES[category as keyof typeof AUTOMOTIVE_CATEGORIES];
    const subcategory = subcategories[idx % subcategories.length] || subcategories[0];
    
    const commodities = ['Bearings', 'Steel Coils', 'ECU Sensors', 'Plastics', 'Tooling Molds', 'Wire Harness', 'Fasteners', 'Rubber Compounds'];
    const costTypes = ['Material Cost', 'Tooling Cost', 'Freight Cost', 'Service Cost'];
    
    const plant = AUTOMOTIVE_PLANTS[idx % AUTOMOTIVE_PLANTS.length];
    const program = AUTOMOTIVE_PROGRAMS[idx % AUTOMOTIVE_PROGRAMS.length];
    
    // Enhanced part numbers with automotive format
    const partNumbers = ['ENG-BRG-6205-2RS', 'CHS-STL-1.2MM-X1', 'ELEC-O2-SEN-BOS', 'BIW-PLC-ABS-001', 'TOOL-MLD-TL-102'];
    
    // Line-stop risk calculation (based on urgency, age, and stock levels)
    const hasLineStopRisk = (r.urgency === 'critical' && ageDays > 3) || (r.urgency === 'high' && ageDays > 7) || idx === 0 || idx === 2;
    const riskReasons = [
      'Critical stock level - Engine line halt risk in 48h',
      'Supplier delay - Chassis line buffer depleting',
      'PPAP pending - Tooling release blocked',
      'IMDS compliance incomplete - Part clearance delayed',
      'IATF certification expiring - Supplier at risk',
    ];
    
    return {
      ...r,
      plant: plant,
      program: program,
      partNumber: partNumbers[idx] || `AUTO-PN-${String(idx + 1).padStart(5, '0')}`,
      commodity: commodities[idx % commodities.length],
      category: category,
      subcategory: subcategory,
      costType: costTypes[idx % costTypes.length],
      compliance: {
        iatfSupplier: idx % 3 !== 0, // Most suppliers are IATF
        ppapRequired: category === 'Tooling' || category === 'Body-in-White' || idx % 2 === 0,
        imdsRequired: category === 'Electronics' || category === 'Raw Materials' || idx % 3 === 0,
      },
      lineStopRisk: hasLineStopRisk,
      riskReason: hasLineStopRisk ? riskReasons[idx % riskReasons.length] : undefined,
      requiredBy: new Date(Date.now() + (5 + idx) * 86400000).toISOString().split('T')[0], // 5-10 days from now
      indentAge: ageDays,
      approvedAmount: r.status === 'approved' || r.status === 'po-issued' ? r.estimatedCost * (0.90 + Math.random() * 0.1) : undefined,
      approver: r.status === 'approved' ? 'Finance Head' : r.status === 'po-issued' ? 'CFO' : undefined,
      remarks: r.budgetStatus === 'over-budget' 
        ? 'Partially approved due to budget cap - requires reallocation' 
        : hasLineStopRisk 
          ? 'Escalated for expedited approval - line-stop risk' 
          : undefined,
      workflowStages: [
        { id: 'raised', name: 'Indent Raised', status: 'completed', timestamp: r.createdAt, approver: r.requester, remarks: 'Raised via SAP system' },
        { id: 'dept', name: 'Department Approval', status: r.status !== 'pending' ? 'completed' : 'in-progress', timestamp: r.updatedAt, approver: DEPARTMENT_CONFIG.manager, remarks: r.status !== 'pending' ? 'Approved by department manager' : 'Pending review' },
        { id: 'procurement', name: 'Procurement Validation', status: r.status === 'vendor-sourcing' || r.status === 'approved' || r.status === 'po-issued' ? 'completed' : 'pending', approver: r.assignedProcurementManager, remarks: r.status === 'vendor-sourcing' ? 'Vendor sourcing in progress' : undefined },
        { id: 'finance', name: 'Finance Review', status: r.status === 'approved' || r.status === 'po-issued' ? 'completed' : 'pending', approver: r.status === 'approved' ? 'Finance Head' : undefined, remarks: r.status === 'approved' ? 'Budget validated and approved' : undefined },
        { id: 'cfo', name: 'CFO/Head Approval', status: r.status === 'po-issued' ? 'completed' : r.status === 'approved' ? 'in-progress' : 'pending', approver: r.status === 'po-issued' ? 'CFO' : undefined, remarks: r.status === 'po-issued' ? 'Final approval granted' : undefined },
        { id: 'po', name: 'Purchase Order Released', status: r.status === 'po-issued' ? 'completed' : 'pending', approver: r.assignedProcurementManager, remarks: r.status === 'po-issued' ? 'PO issued to vendor' : undefined },
      ],
    };
    });
  });

  // Handler for smart insights action buttons - opens modals instead of navigation
  const handleInsightAction = useCallback((insightId: string, actionLabel: string) => {
    // Handle "Review Tooling Budget" or budget-related actions
    if (actionLabel.includes('Review') && actionLabel.includes('Budget')) {
      setShowToolingBudgetModal(true);
      return;
    }

    // Handle "View Forecast Details" actions
    if (actionLabel.includes('Forecast') || actionLabel.includes('View Forecast')) {
      setShowForecastModal(true);
      return;
    }

    // Handle "Review Reallocation" actions
    if (actionLabel.includes('Reallocation') || actionLabel.includes('Reallocate')) {
      setShowReallocationModal(true);
      return;
    }

    // Handle "Escalate to Quality" actions
    if (actionLabel.includes('Escalate') || actionLabel.includes('Quality')) {
      setShowQualityEscalationModal(true);
      return;
    }

    // Handle "Optimize Shipping" or logistics-related actions
    if (actionLabel.includes('Shipping') || actionLabel.includes('Optimize')) {
      setShowShippingOptimizationModal(true);
      return;
    }

    console.log('Unhandled insight action:', actionLabel, insightId);
  }, []);

  // Automotive-specific Smart Insights with action handlers
  const smartInsights = useMemo(() => [
    {
      id: 'insight-1',
      type: 'anomaly' as const,
      title: 'Tooling spend spike detected — Chassis Tooling up 65%',
      description: 'Chassis Tooling category shows 65% increase vs last month. Current: ₹12.5L vs avg ₹7.6L. New program SUV-X1 tooling ramp-up.',
      priority: 'high' as const,
      actionLabel: 'Review Tooling Budget',
      onAction: () => handleInsightAction('insight-1', 'Review Tooling Budget'),
    },
    {
      id: 'insight-2',
      type: 'forecast' as const,
      title: 'Q1 Forecast: Expected spend ₹48.2L (↑15% vs budget)',
      description: 'Based on production ramp-up for SUV-X1 and pending tooling approvals, Q1 spend projected 15% over allocated budget.',
      priority: 'high' as const,
      actionLabel: 'View Forecast Details',
      onAction: () => handleInsightAction('insight-2', 'View Forecast Details'),
    },
    {
      id: 'insight-3',
      type: 'suggestion' as const,
      title: 'Reallocate ₹2.5L from Raw Materials to Electronics',
      description: 'Electronics budget at 98% (ECU sensors spike) while Raw Materials at 72%. Reallocation recommended to avoid budget cap.',
      priority: 'medium' as const,
      actionLabel: 'Review Reallocation',
      onAction: () => handleInsightAction('insight-3', 'Review Reallocation'),
    },
    {
      id: 'insight-4',
      type: 'alert' as const,
      title: 'Line-stop risk: 3 critical parts pending PPAP approval',
      description: 'PN-ENG-BRG-6205, PN-CHS-STL-1.2MM, PN-TOOL-MLD-TL-102 require PPAP completion before production release.',
      priority: 'high' as const,
      actionLabel: 'Escalate to Quality',
      onAction: () => handleInsightAction('insight-4', 'Escalate to Quality'),
    },
    {
      id: 'insight-5',
      type: 'forecast' as const,
      title: 'Freight costs trending 20% above plan',
      description: 'Expedited freight for line-stop prevention increasing logistics costs. Current: ₹8.5L vs budget ₹7.1L for month.',
      priority: 'medium' as const,
      actionLabel: 'Optimize Shipping',
      onAction: () => handleInsightAction('insight-5', 'Optimize Shipping'),
    },
  ], [handleInsightAction]);
  
  const [selectedRequest, setSelectedRequest] = useState<ExtendedRequest | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [budgetFilter, setBudgetFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [plantFilter, setPlantFilter] = useState<string>('all');
  const [programFilter, setProgramFilter] = useState<string>('all');
  const [commodityFilter, setCommodityFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'card' | 'kanban'>('list');
  const [amountMin, setAmountMin] = useState<string>('');
  const [amountMax, setAmountMax] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [actionTab, setActionTab] = useState<'request-approval' | 'po-approval'>('request-approval');
  const [notificationFilter, setNotificationFilter] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all');
  const [notificationSearch, setNotificationSearch] = useState<string>('');
  const [readNotifications, setReadNotifications] = useState<Set<string>>(new Set());
  const [notificationTypeFilter, setNotificationTypeFilter] = useState<'all' | 'alerts' | 'rfq' | 'quality' | 'contracts'>('all');
  const [readStatusFilter, setReadStatusFilter] = useState<'all' | 'read' | 'unread'>('all');
  const [timeFilter, setTimeFilter] = useState<'all' | 'today' | 'week' | '24h'>('all');
  const [actionFilter, setActionFilter] = useState<'all' | 'with-actions' | 'no-actions'>('all');
  
  // Modals for notification actions
  const [showQualityReportModal, setShowQualityReportModal] = useState(false);
  const [showMeetingScheduleModal, setShowMeetingScheduleModal] = useState(false);
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
    }>;
  } | null>(null);
  const [isRFQComparisonModalOpen, setIsRFQComparisonModalOpen] = useState(false);

  // Modals for Smart Insights actions
  const [showToolingBudgetModal, setShowToolingBudgetModal] = useState(false);
  const [showForecastModal, setShowForecastModal] = useState(false);
  const [showReallocationModal, setShowReallocationModal] = useState(false);
  const [showQualityEscalationModal, setShowQualityEscalationModal] = useState(false);
  const [showShippingOptimizationModal, setShowShippingOptimizationModal] = useState(false);

  // Modals for Alerts actions
  const [showBudgetReviewModal, setShowBudgetReviewModal] = useState(false);
  const [showEscalationModal, setShowEscalationModal] = useState(false);

  // Column chooser state (with automotive columns)
  const [columns, setColumns] = useState<ColumnConfig[]>([
    { id: 'indentId', label: 'Indent ID', visible: true },
    { id: 'date', label: 'Date Raised', visible: true },
    { id: 'source', label: 'Source', visible: true },
    { id: 'category', label: 'Category', visible: true },
    { id: 'subcategory', label: 'Subcategory', visible: true },
    { id: 'item', label: 'Item Description', visible: true },
    { id: 'requestedAmount', label: 'Requested Amount', visible: true },
    { id: 'approvedAmount', label: 'Approved Amount', visible: true },
    { id: 'status', label: 'Status', visible: true },
    { id: 'approver', label: 'Approver', visible: true },
    { id: 'remarks', label: 'Remarks', visible: false },
    { id: 'requester', label: 'Requester', visible: true },
  ]);
  
  // Determine active tab from URL
  const getActiveTab = (): 'indents' | 'budget' | 'notifications' | 'analytics' => {
    if (pathname === '/department-manager' || pathname === '/department-manager/') return 'indents';
    if (pathname === '/department-manager/budget') return 'budget';
    if (pathname === '/department-manager/notifications') return 'notifications';
    if (pathname === '/department-manager/analytics') return 'analytics';
    return 'indents';
  };

  const [activeTab, setActiveTab] = useState<'indents' | 'budget' | 'notifications' | 'analytics'>(getActiveTab());

  // Sync activeTab with URL changes
  useEffect(() => {
    const tab = pathname === '/department-manager' || pathname === '/department-manager/' ? 'indents' :
                pathname === '/department-manager/budget' ? 'budget' :
                pathname === '/department-manager/notifications' ? 'notifications' :
                pathname === '/department-manager/analytics' ? 'analytics' :
                'indents';
    setActiveTab(tab);
  }, [pathname]);

  // Handler for alert action buttons (from AlertsCenter widget) - opens modals instead of navigation
  const handleAlertAction = useCallback((alertId: string, actionLabel: string) => {
    // Handle "Review Budget" actions - check for exact match first
    if (actionLabel === 'Review Budget' || actionLabel.includes('Review Budget')) {
      setShowBudgetReviewModal(true);
      return;
    }

    // Handle "Escalate Now" or "Escalate" actions
    if (actionLabel.includes('Escalate')) {
      setShowEscalationModal(true);
      return;
    }

    // Handle "View Indent" actions
    if (actionLabel.includes('View Indent')) {
      const indentMatch = alertId.match(/IND-[\d-]+/i);
      if (indentMatch) {
        const indentId = indentMatch[0];
        const request = allRequests.find(r => r.id === indentId || r.id.includes(indentId));
        if (request) {
          setSelectedRequest(request as ExtendedRequest);
        }
      } else {
        const recentIndent = allRequests
          .filter(r => r.source === 'sap' || r.source === 'email' || r.source === 'form')
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
        if (recentIndent) {
          setSelectedRequest(recentIndent as ExtendedRequest);
        }
      }
      return;
    }

    // Handle "View Allocation" or budget-related actions
    if (actionLabel.includes('View Allocation') || actionLabel.includes('Allocation')) {
      setShowReallocationModal(true);
      return;
    }

    // Handle "Follow Up" actions
    if (actionLabel.includes('Follow Up')) {
      const followUpIndent = allRequests.find(r => 
        r.partNumber?.includes('TL-102') || 
        r.itemName?.toLowerCase().includes('tooling') ||
        r.itemName?.toLowerCase().includes('mold')
      );
      if (followUpIndent) {
        setSelectedRequest(followUpIndent as ExtendedRequest);
      } else {
        console.log('Follow up action for alert:', alertId);
      }
      return;
    }

    console.log('Unhandled alert action:', actionLabel, alertId);
  }, [allRequests]);

  // Automotive-specific Alerts with action handlers - defined after handleAlertAction
  const alerts = useMemo(() => [
    {
      id: 'alert-1',
      type: 'over-budget' as const,
      title: 'Over Budget: Tooling category exceeded by ₹4.2L',
      description: 'Tooling budget overrun due to new mold approvals for SUV-X1. Current: ₹24.2L vs allocated ₹20L. Requires CFO approval.',
      timestamp: new Date().toISOString(),
      priority: 'critical' as const,
      actionLabel: 'Review Budget',
      onAction: () => handleAlertAction('alert-1', 'Review Budget'),
    },
    {
      id: 'alert-2',
      type: 'pending-approval' as const,
      title: 'Critical: 3 indents pending > 7 days — Line-stop risk',
      description: 'PN-ENG-BRG-6205, PN-CHS-STL-1.2MM, PN-ELEC-O2-SEN pending approval. Production impact if delayed further.',
      timestamp: new Date(Date.now() - 86400000 * 8).toISOString(),
      priority: 'critical' as const,
      actionLabel: 'Escalate Now',
      onAction: () => handleAlertAction('alert-2', 'Escalate Now'),
    },
    {
      id: 'alert-3',
      type: 'new-indent' as const,
      title: 'New Indent from SAP: IND-2305-PROD',
      description: 'Received via SAP for Engine Bearings (PN-ENG-BRG-6205). Amount: ₹8,75,000. Plant: PLT-01, Program: SUV-X1.',
      timestamp: new Date().toISOString(),
      priority: 'high' as const,
      actionLabel: 'View Indent',
      onAction: () => handleAlertAction('alert-3', 'View Indent'),
    },
    {
      id: 'alert-4',
      type: 'budget-revision' as const,
      title: 'Budget Revision Approved',
      description: 'Q1 Tooling budget increased by ₹5L to ₹25L. Allocation effective immediately. Updated by Finance Head.',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      priority: 'medium' as const,
      actionLabel: 'View Allocation',
      onAction: () => handleAlertAction('alert-4', 'View Allocation'),
    },
    {
      id: 'alert-5',
      type: 'deadline' as const,
      title: 'PPAP Submission Deadline: TL-102 in 3 days',
      description: 'Tooling TL-102 (Sigma Mold) requires PPAP submission by Jan 25. Delayed submission blocks production release.',
      timestamp: new Date().toISOString(),
      priority: 'high' as const,
      actionLabel: 'Follow Up',
      onAction: () => handleAlertAction('alert-5', 'Follow Up'),
    },
  ], [handleAlertAction]);

  // Handler for notification action buttons
  const handleActivityAction = (activity: typeof mockActivityFeed[0]) => {
    const actionLabel = activity.actionLabel || '';
    
    // Mark as read when action is clicked
    if (activity.id && !readNotifications.has(activity.id)) {
      setReadNotifications(prev => new Set([...prev, activity.id!]));
    }

    // Handle "View Request" actions
    if (actionLabel.includes('View Request')) {
      const requestIdMatch = actionLabel.match(/(REQ-\d+)/i);
      if (requestIdMatch) {
        const requestId = requestIdMatch[1];
        const request = allRequests.find(r => r.id === requestId);
        if (request) {
          setSelectedRequest(request as ExtendedRequest);
        } else {
          console.warn(`Request ${requestId} not found`);
        }
      }
      return;
    }

    // Handle "Review Quality Report" actions
    if (actionLabel.includes('Review Quality Report') || actionLabel.includes('Quality Report')) {
      setShowQualityReportModal(true);
      return;
    }

    // Handle "Review Quotes" actions
    if (actionLabel.includes('Review Quotes')) {
      // Try to extract RFQ number from description or title
      const rfqMatch = activity.description?.match(/RFQ-[\d-]+/i) || 
                       activity.title?.match(/RFQ-[\d-]+/i);
      
      if (rfqMatch) {
        const rfqNumber = rfqMatch[0];
        const rfq = mockRFQs.find(r => r.rfqNumber === rfqNumber);
        
        if (rfq) {
          // Generate mock quotes from vendors
          const matchingVendors = enhancedVendors
            .filter(v => v.category.toLowerCase() === rfq.category.toLowerCase() || 
                        rfq.itemName.toLowerCase().includes(v.name.toLowerCase().split(' ')[0].toLowerCase()))
            .slice(0, Math.min(4, rfq.suppliersResponded || 3));

          if (matchingVendors.length > 0) {
            const baseQuote = rfq.lowestQuote;
            const quotes = matchingVendors.map((v, idx) => ({
              vendorId: v.id,
              vendorName: v.name,
              quoteAmount: baseQuote + (idx * 50000) + Math.floor(Math.random() * 50000),
              leadTimeDays: v.avgLeadTimeDays || 10 + idx * 2,
              onTimePct: v.onTimeDeliveryPercent,
              qualityScore: v.qualityPercent,
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
        } else {
          // If RFQ not found, create a generic comparison
          const genericVendors = enhancedVendors.slice(0, 3);
          const baseQuote = 1000000;
          const quotes = genericVendors.map((v, idx) => ({
            vendorId: v.id,
            vendorName: v.name,
            quoteAmount: baseQuote + (idx * 50000) + Math.floor(Math.random() * 50000),
            leadTimeDays: v.avgLeadTimeDays || 10 + idx * 2,
            onTimePct: v.onTimeDeliveryPercent,
            qualityScore: v.qualityPercent,
          })).sort((a, b) => a.quoteAmount - b.quoteAmount);

          setSelectedRFQForComparison({
            rfqId: 'RFQ-GENERIC',
            rfqNumber: rfqMatch[0],
            itemName: activity.title || 'RFQ Item',
            category: 'General',
            quotes,
          });
          setIsRFQComparisonModalOpen(true);
        }
      }
      return;
    }

    // Handle "Schedule Meeting" actions
    if (actionLabel.includes('Schedule Meeting') || actionLabel.includes('Meeting')) {
      setShowMeetingScheduleModal(true);
      return;
    }

    // Handle "Follow Up" actions (could open a follow-up form or navigate)
    if (actionLabel.includes('Follow Up')) {
      // For now, just show a message or you can add a follow-up modal
      console.log('Follow up action for:', activity.title);
      return;
    }

    console.log('Unhandled action:', actionLabel);
  };

  // Filter requests for Request Approval (pending/in-review from team)
  // Match department name or allow all for demo purposes
  const requestsPendingApproval = useMemo(() => {
    return allRequests.filter(request => 
      (request.status === 'pending' || request.status === 'in-review') &&
      (DEPARTMENT_ALIASES.includes(request.department) || request.department === DEPARTMENT_NAME)
    );
  }, [allRequests]);

  // Filter requests for PO Approval
  const requestsPendingPOApproval = useMemo(() => {
    return allRequests.filter(request => 
      request.status === 'approved' && 
      (DEPARTMENT_ALIASES.includes(request.department) || request.department === DEPARTMENT_NAME)
    );
  }, [allRequests]);

  // Filter notifications (always calculate, not conditionally)
  const filteredNotifications = useMemo(() => {
    return mockActivityFeed.filter(activity => {
      // Priority filter
      if (notificationFilter !== 'all' && activity.priority !== notificationFilter) return false;
      
      // Search filter
      if (notificationSearch) {
        const query = notificationSearch.toLowerCase();
        if (!activity.title.toLowerCase().includes(query) && 
            !activity.description.toLowerCase().includes(query)) {
          return false;
        }
      }
      
      // Type filter
      if (notificationTypeFilter !== 'all') {
        const titleLower = activity.title.toLowerCase();
        const descLower = activity.description?.toLowerCase() || '';
        const matchesType = 
          (notificationTypeFilter === 'alerts' && titleLower.includes('alert')) ||
          (notificationTypeFilter === 'rfq' && (titleLower.includes('rfq') || descLower.includes('rfq'))) ||
          (notificationTypeFilter === 'quality' && (titleLower.includes('quality') || descLower.includes('quality'))) ||
          (notificationTypeFilter === 'contracts' && (titleLower.includes('contract') || descLower.includes('contract')));
        if (!matchesType) return false;
      }
      
      // Read status filter
      if (readStatusFilter !== 'all') {
        const isRead = readNotifications.has(activity.id);
        if (readStatusFilter === 'read' && !isRead) return false;
        if (readStatusFilter === 'unread' && isRead) return false;
      }
      
      // Time filter
      if (timeFilter !== 'all') {
        const notifDate = new Date(activity.timestamp);
        const now = new Date();
        let matchesTime = false;
        
        if (timeFilter === 'today') {
          matchesTime = notifDate.toDateString() === now.toDateString();
        } else if (timeFilter === 'week') {
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          matchesTime = notifDate >= weekAgo;
        } else if (timeFilter === '24h') {
          const dayAgo = new Date();
          dayAgo.setDate(dayAgo.getDate() - 1);
          matchesTime = notifDate >= dayAgo;
        }
        
        if (!matchesTime) return false;
      }
      
      // Action filter
      if (actionFilter !== 'all') {
        const hasAction = !!activity.actionLabel;
        if (actionFilter === 'with-actions' && !hasAction) return false;
        if (actionFilter === 'no-actions' && hasAction) return false;
      }
      
      return true;
    });
  }, [notificationFilter, notificationSearch, notificationTypeFilter, readStatusFilter, timeFilter, actionFilter, readNotifications]);

  // Calculate notification statistics (always calculate)
  const notificationsByPriority = useMemo(() => {
    const byPriority = {
      critical: filteredNotifications.filter(n => n.priority === 'critical').length,
      high: filteredNotifications.filter(n => n.priority === 'high').length,
      medium: filteredNotifications.filter(n => n.priority === 'medium').length,
      low: filteredNotifications.filter(n => n.priority === 'low').length,
    };
    return byPriority;
  }, [filteredNotifications]);

  const unreadByPriority = useMemo(() => {
    const unread = filteredNotifications.filter(n => !readNotifications.has(n.id));
    return {
      critical: unread.filter(n => n.priority === 'critical').length,
      high: unread.filter(n => n.priority === 'high').length,
      medium: unread.filter(n => n.priority === 'medium').length,
      low: unread.filter(n => n.priority === 'low').length,
    };
  }, [filteredNotifications, readNotifications]);

  const activityTimelineData = useMemo(() => {
    const days = 7;
    const data = [];
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayNotifications = filteredNotifications.filter(n => {
        const notifDate = new Date(n.timestamp).toISOString().split('T')[0];
        return notifDate === dateStr;
      });
      data.push({
        date: date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        count: dayNotifications.length,
        critical: dayNotifications.filter(n => n.priority === 'critical').length,
        high: dayNotifications.filter(n => n.priority === 'high').length,
      });
    }
    return data;
  }, [filteredNotifications]);

  const unreadCount = useMemo(() => {
    return filteredNotifications.filter(n => !readNotifications.has(n.id)).length;
  }, [filteredNotifications, readNotifications]);

  const notificationsWithActions = useMemo(() => {
    return filteredNotifications.filter(n => n.actionLabel).length;
  }, [filteredNotifications]);

  // Filter requests based on search and filters
  const filteredRequests = useMemo(() => {
    // Choose the right source based on action tab
    const sourceRequests = actionTab === 'request-approval' ? requestsPendingApproval : requestsPendingPOApproval;
    
    return sourceRequests.filter(request => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          request.id.toLowerCase().includes(query) ||
          request.itemName.toLowerCase().includes(query) ||
          request.partNumber?.toLowerCase().includes(query) ||
          request.commodity?.toLowerCase().includes(query) ||
          request.category?.toLowerCase().includes(query) ||
          request.subcategory?.toLowerCase().includes(query) ||
          request.requester.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Status filter
      if (statusFilter !== 'all' && request.status !== statusFilter) return false;

      // Budget filter
      if (budgetFilter !== 'all' && request.budgetStatus !== budgetFilter) return false;

      // Category filter
      if (categoryFilter !== 'all' && request.category !== categoryFilter) return false;

      // Source filter
      if (sourceFilter !== 'all' && request.source !== sourceFilter) return false;

      // Plant filter
      if (plantFilter !== 'all' && request.plant !== plantFilter) return false;

      // Program filter
      if (programFilter !== 'all' && request.program !== programFilter) return false;

      // Commodity filter
      if (commodityFilter !== 'all' && request.commodity !== commodityFilter) return false;

      // Amount range filter
      if (amountMin && request.estimatedCost < parseFloat(amountMin)) return false;
      if (amountMax && request.estimatedCost > parseFloat(amountMax)) return false;

      // Date range filter
      if (dateFrom && new Date(request.createdAt) < new Date(dateFrom)) return false;
      if (dateTo && new Date(request.createdAt) > new Date(dateTo)) return false;

      return true;
    });
  }, [actionTab, requestsPendingApproval, requestsPendingPOApproval, searchQuery, statusFilter, budgetFilter, categoryFilter, sourceFilter, plantFilter, programFilter, commodityFilter, amountMin, amountMax, dateFrom, dateTo]);

  // Calculate KPIs
  const allocatedBudget = 2000000;
  const committed = allRequests.filter(r => r.status === 'approved' || r.status === 'po-issued').reduce((a, b) => a + b.estimatedCost, 0);
  const pendingValue = allRequests.filter(r => r.status === 'pending' || r.status === 'in-review').reduce((a, b) => a + b.estimatedCost, 0);
  const available = allocatedBudget - committed;
  const overBudgetCount = allRequests.filter(r => r.budgetStatus === 'over-budget').length;
  const underBudgetCount = allRequests.filter(r => r.budgetStatus === 'under-budget').length;
  const onBudgetCount = allRequests.filter(r => r.budgetStatus !== 'over-budget' && r.budgetStatus !== 'under-budget').length;
  const totalIndents = allRequests.length;
  const approvedIndents = allRequests.filter(r => r.status === 'approved' || r.status === 'po-issued').length;
  const approvalRate = totalIndents > 0 ? ((approvedIndents / totalIndents) * 100).toFixed(1) : '0';

  // Calculate budget spent for each category
  const getCategoryBudgetInfo = (category: string | undefined) => {
    if (!category) return { code: DEPARTMENT_BUDGET_CODE, total: allocatedBudget, spent: 0 };
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
    };
    const total = budgetMap[category] || allocatedBudget;
    const spent = allRequests
      .filter(r => r.category === category && (r.status === 'approved' || r.status === 'po-issued'))
      .reduce((sum, r) => sum + r.estimatedCost, 0);
    const code = `${DEPARTMENT_BUDGET_CODE}-${category.substring(0, 4).toUpperCase()}`;
    return { code, total, spent };
  };

  // Budget status summary
  const budgetStatus = committed > allocatedBudget ? 'over-budget' : 
                       committed < allocatedBudget * 0.9 ? 'under-budget' : 
                       'on-budget';

  // Pipeline stages for department
  const pipelineStages = [
    { name: 'Indents Received', count: allRequests.length },
    { name: 'In Review', count: allRequests.filter(r => r.status === 'pending' || r.status === 'in-review').length },
    { name: 'Approved', count: allRequests.filter(r => r.status === 'approved').length },
    { name: 'PO Issued', count: allRequests.filter(r => r.status === 'po-issued').length },
    { name: 'Delivered', count: allRequests.filter(r => r.status === 'po-issued' && r.lineStopRisk === false).length },
  ];

  // Spend vs Budget data
  const spendVsBudgetData = [
    { month: 'Jul', budget: 500000, committed: 420000 },
    { month: 'Aug', budget: 600000, committed: 550000 },
    { month: 'Sep', budget: 650000, committed: 640000 },
    { month: 'Oct', budget: 700000, committed: 710000 },
  ];

  // Category spend data
  const categorySpendData = useMemo(() => {
    const categories = Array.from(new Set(allRequests.map(r => r.category).filter(Boolean)));
    return categories.map(cat => {
      const catRequests = allRequests.filter(r => r.category === cat);
      const spend = catRequests.reduce((a, b) => a + b.estimatedCost, 0);
      return { name: cat || 'Unknown', value: spend };
    });
  }, [allRequests]);

  // Automotive Budget category data with category/subcategory breakdown
  const categories = Array.from(new Set(allRequests.map(r => r.category).filter(Boolean))).sort();
  const budgetCategoryData = categories.map(cat => {
    const catRequests = allRequests.filter(r => r.category === cat);
    // Automotive budget allocations
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
    };
    const alloc = (cat && budgetMap[cat]) || 1000000;
    const comm = catRequests.filter(r => r.status === 'approved' || r.status === 'po-issued').reduce((a, b) => a + b.estimatedCost, 0);
    return { cat, alloc, comm, subcategories: Array.from(new Set(catRequests.map(r => r.subcategory).filter(Boolean))) };
  });

  // Monthly trend data
  // Enhanced monthly trend data with breakdown by plant and cost type
  const monthlyTrendData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr'];
    const plants = ['PLT-01', 'PLT-02', 'PLT-03', 'PLT-04'];
    const costTypes = ['Material', 'Tooling', 'Freight', 'Service'];
    
    return months.map((month, idx) => {
      const baseIndents = 10 + idx * 2;
      const baseSpend = 800000 + idx * 80000;
      
      // Breakdown by plant
      const plantBreakdown = plants.map((plant, pIdx) => ({
        plant,
        indents: Math.floor(baseIndents * (0.2 + (pIdx % 2) * 0.15) + Math.random() * 3),
      }));
      
      // Breakdown by cost type
      const costBreakdown = costTypes.map((type, cIdx) => {
        const percentage = type === 'Material' ? 0.55 : type === 'Tooling' ? 0.25 : type === 'Freight' ? 0.12 : 0.08;
        return {
          type,
          amount: Math.floor(baseSpend * percentage),
        };
      });
      
      return {
        month,
        indents: baseIndents,
        spend: baseSpend,
        approved: Math.floor(baseIndents * 0.7),
        pending: Math.floor(baseIndents * 0.25),
        rejected: Math.floor(baseIndents * 0.05),
        plantBreakdown,
        costBreakdown,
        avgValue: Math.floor(baseSpend / baseIndents),
        growth: idx > 0 ? ((baseIndents - (10 + (idx - 1) * 2)) / (10 + (idx - 1) * 2) * 100) : 0,
      };
    });
  }, []);

  // Get unique values for filters (automotive categories)
  const uniqueCategories = Array.from(new Set(allRequests.map(r => r.category).filter(Boolean))).sort();
  const uniqueCommodities = Array.from(new Set(allRequests.map(r => r.commodity).filter(Boolean))).sort();
  const uniquePlants = Array.from(new Set(allRequests.map(r => r.plant).filter(Boolean))).sort();
  const uniquePrograms = Array.from(new Set(allRequests.map(r => r.program).filter(Boolean))).sort();

  const navItems = [
    { 
      label: 'Indents', 
      href: '/department-manager', 
      icon: FileText,
    },
    { 
      label: 'Budget Overview', 
      href: '/department-manager/budget', 
      icon: TrendingUp,
    },
    { 
      label: 'Analytics', 
      href: '/department-manager/analytics', 
      icon: BarChart3,
    },
    { 
      label: 'Notifications', 
      href: '/department-manager/notifications', 
      icon: Clock,
    },
  ];

  const handleTabClick = (tab: 'indents' | 'budget' | 'notifications' | 'analytics') => {
    setActiveTab(tab);
    const routes = {
      indents: '/department-manager',
      budget: '/department-manager/budget',
      notifications: '/department-manager/notifications',
      analytics: '/department-manager/analytics',
    };
    router.push(routes[tab]);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setBudgetFilter('all');
    setCategoryFilter('all');
    setSourceFilter('all');
    setPlantFilter('all');
    setProgramFilter('all');
    setCommodityFilter('all');
    setAmountMin('');
    setAmountMax('');
    setDateFrom('');
    setDateTo('');
  };

  const hasActiveFilters = statusFilter !== 'all' || budgetFilter !== 'all' || categoryFilter !== 'all' || sourceFilter !== 'all' || plantFilter !== 'all' || programFilter !== 'all' || commodityFilter !== 'all' || searchQuery || amountMin || amountMax || dateFrom || dateTo;

  const handleColumnToggle = (columnId: string) => {
    setColumns(prev => prev.map(col => 
      col.id === columnId ? { ...col, visible: !col.visible } : col
    ));
  };

  const handleColumnReset = () => {
    setColumns(prev => prev.map(col => ({ ...col, visible: true })));
  };

  const handleExport = (format: 'excel' | 'pdf' | 'csv') => {
    const dataToExport = filteredRequests.map(request => {
      const budgetInfo = getCategoryBudgetInfo(request.category);
      return {
        'Indent ID': request.id,
        'Date Raised': new Date(request.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        'Source': request.source === 'sap' ? 'SAP System' : request.source === 'email' ? 'Email' : request.source === 'form' ? 'Portal' : request.source,
        'Requester': request.requester,
        'Category': request.category || '—',
        'Subcategory': request.subcategory || '—',
        'Item Description': request.itemName,
        'Amount (₹)': request.estimatedCost,
        'Budget Status': request.budgetStatus === 'over-budget' ? 'Over Budget' : request.budgetStatus === 'under-budget' ? 'Under Budget' : 'Pending Allocation',
        'Approval Status': request.status === 'pending' ? 'Pending' : request.status === 'in-review' ? 'In Review' : request.status === 'approved' ? 'Approved' : request.status === 'rejected' ? 'Rejected' : request.status,
        'Part Number': request.partNumber || '—',
        'Plant': request.plant || '—',
        'Program': request.program || '—',
        'Commodity': request.commodity || '—',
      };
    });

    if (format === 'csv') {
      // Generate CSV
      const headers = Object.keys(dataToExport[0] || {});
      const csvContent = [
        headers.join(','),
        ...dataToExport.map(row => 
          headers.map(header => {
            const value = row[header as keyof typeof row];
            // Escape commas and quotes in CSV
            if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          }).join(',')
        )
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `indents_${actionTab}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (format === 'excel') {
      // For Excel, we'll generate a CSV with .xlsx-like formatting
      // In production, you'd use a library like xlsx, but for now CSV works
      const headers = Object.keys(dataToExport[0] || {});
      const csvContent = [
        headers.join('\t'),
        ...dataToExport.map(row => 
          headers.map(header => row[header as keyof typeof row]).join('\t')
        )
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `indents_${actionTab}_${new Date().toISOString().split('T')[0]}.xls`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (format === 'pdf') {
      // For PDF, we'll create an HTML table and use print functionality
      // In production, you'd use jsPDF or similar library
      const printWindow = window.open('', '_blank');
      if (!printWindow) return;

      const headers = Object.keys(dataToExport[0] || {});
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Indents Report</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              table { border-collapse: collapse; width: 100%; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 10px; }
              th { background-color: #005691; color: white; font-weight: bold; }
              tr:nth-child(even) { background-color: #f2f2f2; }
              h1 { color: #005691; }
            </style>
          </head>
          <body>
            <h1>Indents Report - ${actionTab === 'request-approval' ? 'Request Approval' : 'PO Approval'}</h1>
            <p>Generated on: ${new Date().toLocaleString('en-IN')}</p>
            <p>Total Records: ${dataToExport.length}</p>
            <table>
              <thead>
                <tr>
                  ${headers.map(h => `<th>${h}</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                ${dataToExport.map(row => 
                  `<tr>${headers.map(header => `<td>${row[header as keyof typeof row]}</td>`).join('')}</tr>`
                ).join('')}
              </tbody>
            </table>
          </body>
        </html>
      `;

      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
        }, 250);
      };
    }
  };

  // Calculate average approval time
  const avgApprovalTime = 3.5;

  return (
    <DashboardLayout navItems={navItems} role="department-manager" title={
      activeTab === 'indents' ? 'Department Indents' :
      activeTab === 'budget' ? 'Budget Overview' :
      activeTab === 'analytics' ? 'Analytics & Insights' :
      'Notifications'
    }>
      <div className="space-y-6">
        {/* Advanced Sticky Header */}
        <DepartmentHeader
          departmentName={DEPARTMENT_NAME}
          departmentCode={DEPARTMENT_BUDGET_CODE}
          managerName={DEPARTMENT_CONFIG.manager}
          managerRole="Department Manager"
          financialYear="2024-25"
          totalBudget={allocatedBudget}
          spent={committed}
          remaining={available}
          lastUpdated={allRequests[0]?.updatedAt || new Date().toISOString()}
          nextReviewDate="2024-03-31"
        />

        {/* Budget Summary Tiles - Hidden on Notifications, Analytics, and Budget tabs */}
        {activeTab !== 'notifications' && activeTab !== 'analytics' && activeTab !== 'budget' && (
        <BudgetSummaryTiles
          totalBudget={allocatedBudget}
          utilized={committed}
          remaining={available}
          onBudgetPercent={(committed / allocatedBudget) * 100}
          activeIndents={totalIndents}
          avgApprovalTime={avgApprovalTime}
            underBudgetCount={underBudgetCount}
            atLimitCount={allRequests.filter(r => {
              const catInfo = getCategoryBudgetInfo(r.category);
              const catUtilization = (catInfo.spent / catInfo.total) * 100;
              return catUtilization >= 80 && catUtilization < 95;
            }).length}
            overBudgetCount={overBudgetCount}
            pendingApprovalsCount={requestsPendingApproval.length}
          />
        )}

        {/* Spend vs Budget Graph - Hidden on Notifications, Analytics, and Budget tabs */}
        {activeTab !== 'notifications' && activeTab !== 'analytics' && activeTab !== 'budget' && (
        <div className="bg-white border border-[#DFE2E4] rounded-lg p-4">
          <h4 className="text-sm font-medium text-[#31343A] mb-2">Spend vs Budget (By Month)</h4>
          <MultiLineChart
            data={spendVsBudgetData}
            lines={[
              { key: 'budget', color: '#9DA5A8', name: 'Budget' },
              { key: 'committed', color: '#005691', name: 'Committed' },
            ]}
            xAxisKey="month"
          />
        </div>
        )}

        {/* Content */}
        <div className="bg-white rounded-lg border border-[#DFE2E4]">
          <div className="p-6">
            {activeTab === 'indents' && (
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 space-y-6">
                  {/* Pipeline Funnel */}
                  <PipelineFunnel stages={pipelineStages} />

                  {/* Analytics Widgets Row */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <RequestsAgingBuckets />
                    <UrgencyBudgetMatrix />
                </div>

                  <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-[#31343A]">My Actions</h3>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 border border-[#B6BBBE] rounded-lg overflow-hidden">
                      <button
                        onClick={() => setViewMode('list')}
                        className={`px-3 py-2 ${viewMode === 'list' ? 'bg-[#005691] text-white' : 'text-[#31343A] hover:bg-[#DFE2E4]'}`}
                      >
                        <List className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setViewMode('card')}
                        className={`px-3 py-2 ${viewMode === 'card' ? 'bg-[#005691] text-white' : 'text-[#31343A] hover:bg-[#DFE2E4]'}`}
                      >
                        <Grid className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setViewMode('kanban')}
                        className={`px-3 py-2 ${viewMode === 'kanban' ? 'bg-[#005691] text-white' : 'text-[#31343A] hover:bg-[#DFE2E4]'}`}
                      >
                        <LayoutGrid className="w-4 h-4" />
                      </button>
                    </div>
                    <ColumnChooser 
                      columns={columns}
                      onToggle={handleColumnToggle}
                      onReset={handleColumnReset}
                    />
                    <div className="flex items-center gap-2 border border-[#B6BBBE] rounded-lg overflow-hidden">
                      <button
                        onClick={() => handleExport('excel')}
                        className="px-3 py-2 text-[#31343A] hover:bg-[#DFE2E4] flex items-center gap-2 text-sm"
                        title="Export to Excel"
                      >
                        <FileDown className="w-4 h-4" />
                        Excel
                      </button>
                      <button
                        onClick={() => handleExport('pdf')}
                        className="px-3 py-2 text-[#31343A] hover:bg-[#DFE2E4] text-sm"
                        title="Export to PDF"
                      >
                        PDF
                      </button>
                      <button
                        onClick={() => handleExport('csv')}
                        className="px-3 py-2 text-[#31343A] hover:bg-[#DFE2E4] text-sm"
                        title="Export to CSV"
                      >
                        CSV
                      </button>
                    </div>
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className="px-4 py-2 border border-[#B6BBBE] text-[#31343A] rounded-lg text-sm font-medium hover:bg-[#DFE2E4] transition-colors flex items-center gap-2"
                    >
                      <Filter className="w-4 h-4" />
                      Filters
                    </button>
                  </div>
                </div>

                {/* Action Tabs */}
                <div className="flex gap-2 mb-4 border-b border-[#DFE2E4]">
                  <button
                    onClick={() => setActionTab('request-approval')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                      actionTab === 'request-approval'
                        ? 'border-[#005691] text-[#005691]'
                        : 'border-transparent text-[#9DA5A8] hover:text-[#31343A]'
                    }`}
                  >
                    Request Approval ({requestsPendingApproval.length})
                  </button>
                  <button
                    onClick={() => setActionTab('po-approval')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                      actionTab === 'po-approval'
                        ? 'border-[#005691] text-[#005691]'
                        : 'border-transparent text-[#9DA5A8] hover:text-[#31343A]'
                    }`}
                  >
                    PO Approval ({requestsPendingPOApproval.length})
                  </button>
                </div>

                {/* Search and Filters */}
                <div className="space-y-4 mb-6">
                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#9DA5A8]" />
                    <input
                      type="text"
                      placeholder="Search by Indent ID, Part #, Item, Requester, Category, or Commodity..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-[#B6BBBE] rounded-lg text-sm focus:ring-2 focus:ring-[#005691] focus:border-transparent text-[#31343A]"
                    />
                  </div>

                  {/* Filter Panel */}
                  {showFilters && (
                    <div className="bg-[#DFE2E4]/30 border border-[#DFE2E4] rounded-lg p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-[#31343A]">Filters</h4>
                        {hasActiveFilters && (
                          <button
                            onClick={clearFilters}
                            className="text-xs text-[#005691] hover:underline flex items-center gap-1"
                          >
                            <X className="w-3 h-3" />
                            Clear All
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-[#9DA5A8] mb-2">Status</label>
                          <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full px-3 py-2 border border-[#B6BBBE] rounded-lg text-sm focus:ring-2 focus:ring-[#005691] focus:border-transparent text-[#31343A]"
                          >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="in-review">In Review</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                            <option value="vendor-sourcing">Vendor Sourcing</option>
                            <option value="po-issued">PO Issued</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-[#9DA5A8] mb-2">Budget Status</label>
                          <select
                            value={budgetFilter}
                            onChange={(e) => setBudgetFilter(e.target.value)}
                            className="w-full px-3 py-2 border border-[#B6BBBE] rounded-lg text-sm focus:ring-2 focus:ring-[#005691] focus:border-transparent text-[#31343A]"
                          >
                            <option value="all">All Budget</option>
                            <option value="under-budget">Under Budget</option>
                            <option value="over-budget">Over Budget</option>
                            <option value="pending-allocation">Pending Allocation</option>
                          </select>
                    </div>
                        <div>
                          <label className="block text-xs font-medium text-[#9DA5A8] mb-2">Category</label>
                          <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="w-full px-3 py-2 border border-[#B6BBBE] rounded-lg text-sm focus:ring-2 focus:ring-[#005691] focus:border-transparent text-[#31343A]"
                          >
                            <option value="all">All Categories</option>
                            {uniqueCategories.map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-[#9DA5A8] mb-2">Plant</label>
                          <select
                            value={plantFilter}
                            onChange={(e) => setPlantFilter(e.target.value)}
                            className="w-full px-3 py-2 border border-[#B6BBBE] rounded-lg text-sm focus:ring-2 focus:ring-[#005691] focus:border-transparent text-[#31343A]"
                          >
                            <option value="all">All Plants</option>
                            {uniquePlants.map(plant => (
                              <option key={plant} value={plant}>{plant}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-[#9DA5A8] mb-2">Program</label>
                          <select
                            value={programFilter}
                            onChange={(e) => setProgramFilter(e.target.value)}
                            className="w-full px-3 py-2 border border-[#B6BBBE] rounded-lg text-sm focus:ring-2 focus:ring-[#005691] focus:border-transparent text-[#31343A]"
                          >
                            <option value="all">All Programs</option>
                            {uniquePrograms.map(program => (
                              <option key={program} value={program}>{program}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-[#9DA5A8] mb-2">Commodity</label>
                          <select
                            value={commodityFilter}
                            onChange={(e) => setCommodityFilter(e.target.value)}
                            className="w-full px-3 py-2 border border-[#B6BBBE] rounded-lg text-sm focus:ring-2 focus:ring-[#005691] focus:border-transparent text-[#31343A]"
                          >
                            <option value="all">All Commodities</option>
                            {uniqueCommodities.map(commodity => (
                              <option key={commodity} value={commodity}>{commodity}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-[#9DA5A8] mb-2">Source</label>
                          <select
                            value={sourceFilter}
                            onChange={(e) => setSourceFilter(e.target.value)}
                            className="w-full px-3 py-2 border border-[#B6BBBE] rounded-lg text-sm focus:ring-2 focus:ring-[#005691] focus:border-transparent text-[#31343A]"
                          >
                            <option value="all">All Sources</option>
                            <option value="sap">SAP System</option>
                            <option value="email">Email</option>
                            <option value="form">Manual Form</option>
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                        <div>
                          <label className="block text-xs font-medium text-[#9DA5A8] mb-2">Amount Min</label>
                          <input
                            type="number"
                            value={amountMin}
                            onChange={(e) => setAmountMin(e.target.value)}
                            placeholder="Min amount"
                            className="w-full px-3 py-2 border border-[#B6BBBE] rounded-lg text-sm focus:ring-2 focus:ring-[#005691] focus:border-transparent text-[#31343A]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-[#9DA5A8] mb-2">Amount Max</label>
                          <input
                            type="number"
                            value={amountMax}
                            onChange={(e) => setAmountMax(e.target.value)}
                            placeholder="Max amount"
                            className="w-full px-3 py-2 border border-[#B6BBBE] rounded-lg text-sm focus:ring-2 focus:ring-[#005691] focus:border-transparent text-[#31343A]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-[#9DA5A8] mb-2">Date From</label>
                          <input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            className="w-full px-3 py-2 border border-[#B6BBBE] rounded-lg text-sm focus:ring-2 focus:ring-[#005691] focus:border-transparent text-[#31343A]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-[#9DA5A8] mb-2">Date To</label>
                          <input
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            className="w-full px-3 py-2 border border-[#B6BBBE] rounded-lg text-sm focus:ring-2 focus:ring-[#005691] focus:border-transparent text-[#31343A]"
                          />
                        </div>
                    </div>
                    </div>
                  )}

                  {/* Results Count */}
                  <div className="text-sm text-[#9DA5A8]">
                    Showing {filteredRequests.length} of {actionTab === 'request-approval' ? requestsPendingApproval.length : requestsPendingPOApproval.length} {actionTab === 'request-approval' ? 'requests' : 'POs'}
                  </div>
                </div>

                {/* My Actions Table - Different views based on viewMode */}
                {viewMode === 'list' && (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-[#DFE2E4]">
                      <thead className="bg-[#DFE2E4]/30">
                        <tr>
                          {columns.find(c => c.id === 'indentId')?.visible && <th className="px-3 py-3 text-left text-xs font-medium text-[#9DA5A8] uppercase tracking-wider">Indent ID</th>}
                          {columns.find(c => c.id === 'date')?.visible && <th className="px-4 py-3 text-left text-xs font-medium text-[#9DA5A8] uppercase tracking-wider">Date Raised</th>}
                          {columns.find(c => c.id === 'source')?.visible && <th className="px-4 py-3 text-left text-xs font-medium text-[#9DA5A8] uppercase tracking-wider">Source</th>}
                          {columns.find(c => c.id === 'requester')?.visible && <th className="px-4 py-3 text-left text-xs font-medium text-[#9DA5A8] uppercase tracking-wider">Requester</th>}
                          {columns.find(c => c.id === 'category')?.visible && <th className="px-4 py-3 text-left text-xs font-medium text-[#9DA5A8] uppercase tracking-wider">Category</th>}
                          {columns.find(c => c.id === 'subcategory')?.visible && <th className="px-4 py-3 text-left text-xs font-medium text-[#9DA5A8] uppercase tracking-wider">Subcategory</th>}
                          {columns.find(c => c.id === 'item')?.visible && <th className="px-4 py-3 text-left text-xs font-medium text-[#9DA5A8] uppercase tracking-wider">Item Description</th>}
                          {columns.find(c => c.id === 'requestedAmount')?.visible && <th className="px-4 py-3 text-left text-xs font-medium text-[#9DA5A8] uppercase tracking-wider">Amount (₹)</th>}
                          {columns.find(c => c.id === 'status')?.visible && <th className="px-4 py-3 text-left text-xs font-medium text-[#9DA5A8] uppercase tracking-wider">Budget Status</th>}
                          {columns.find(c => c.id === 'approver')?.visible && <th className="px-4 py-3 text-left text-xs font-medium text-[#9DA5A8] uppercase tracking-wider">Approval Status</th>}
                          <th className="px-4 py-3 text-left text-xs font-medium text-[#9DA5A8] uppercase tracking-wider">Action</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-[#DFE2E4]">
                        {filteredRequests.length > 0 ? (
                          filteredRequests.map((request) => {
                            const budgetInfo = getCategoryBudgetInfo(request.category);
                            return (
                              <tr 
                                key={request.id} 
                                className="hover:bg-[#DFE2E4]/30"
                              >
                                {columns.find(c => c.id === 'indentId')?.visible && (
                                  <td 
                                    className="px-3 py-4 whitespace-nowrap text-xs font-medium text-[#005691] cursor-pointer"
                                    onClick={() => setSelectedRequest(request)}
                                  >
                                    {request.id}
                                  </td>
                                )}
                                {columns.find(c => c.id === 'date')?.visible && (
                                  <td 
                                    className="px-4 py-4 whitespace-nowrap text-sm text-[#31343A] cursor-pointer"
                                    onClick={() => setSelectedRequest(request)}
                                  >
                                    {new Date(request.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                  </td>
                                )}
                                {columns.find(c => c.id === 'source')?.visible && (
                                  <td 
                                    className="px-4 py-4 whitespace-nowrap text-sm text-[#31343A] cursor-pointer"
                                    onClick={() => setSelectedRequest(request)}
                                  >
                                    {request.source === 'sap' ? 'SAP System' : request.source === 'email' ? 'Email' : request.source === 'form' ? 'Portal' : request.source}
                                  </td>
                                )}
                                {columns.find(c => c.id === 'requester')?.visible && (
                                  <td 
                                    className="px-4 py-4 whitespace-nowrap text-sm text-[#31343A] cursor-pointer"
                                    onClick={() => setSelectedRequest(request)}
                                  >
                                    {request.requester}
                                  </td>
                                )}
                                {columns.find(c => c.id === 'category')?.visible && (
                                  <td 
                                    className="px-4 py-4 whitespace-nowrap text-sm text-[#31343A] cursor-pointer"
                                    onClick={() => setSelectedRequest(request)}
                                  >
                                    {request.category || '—'}
                                  </td>
                                )}
                                {columns.find(c => c.id === 'subcategory')?.visible && (
                                  <td 
                                    className="px-4 py-4 whitespace-nowrap text-sm text-[#31343A] cursor-pointer"
                                    onClick={() => setSelectedRequest(request)}
                                  >
                                    {request.subcategory || '—'}
                                  </td>
                                )}
                                {columns.find(c => c.id === 'item')?.visible && (
                                  <td 
                                    className="px-4 py-4 text-sm text-[#31343A] cursor-pointer"
                                    onClick={() => setSelectedRequest(request)}
                                  >
                                    {request.itemName}
                                  </td>
                                )}
                                {columns.find(c => c.id === 'requestedAmount')?.visible && (
                                  <td 
                                    className="px-4 py-4 whitespace-nowrap text-sm font-medium text-[#31343A] cursor-pointer"
                                    onClick={() => setSelectedRequest(request)}
                                  >
                                    {formatCurrency(request.estimatedCost)}
                                  </td>
                                )}
                                {columns.find(c => c.id === 'status')?.visible && (
                                  <td 
                                    className="px-4 py-4 whitespace-nowrap cursor-pointer"
                                    onClick={() => setSelectedRequest(request)}
                                  >
                                    <StatusBadge status={request.budgetStatus === 'over-budget' ? 'over-budget' : request.budgetStatus === 'under-budget' ? 'under-budget' : 'pending-allocation'} />
                                  </td>
                                )}
                                {columns.find(c => c.id === 'approver')?.visible && (
                                  <td 
                                    className="px-4 py-4 whitespace-nowrap cursor-pointer"
                                    onClick={() => setSelectedRequest(request)}
                                  >
                                    <StatusBadge status={request.status} />
                                  </td>
                                )}
                                <td className="px-4 py-4 whitespace-nowrap">
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedRequest(request);
                                      }}
                                      className="text-xs px-3 py-1.5 text-[#005691] hover:bg-[#005691]/10 rounded border border-[#005691]/30 hover:border-[#005691] transition-colors font-medium"
                                    >
                                      View
                                    </button>
                                    {(request.status === 'pending' || request.status === 'in-review') && (
                                      <>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setAllRequests(prev => prev.map(r =>
                                              r.id === request.id
                                                ? { ...r, status: 'approved' as const, updatedAt: new Date().toISOString() }
                                                : r
                                            ));
                                          }}
                                          className="text-xs px-3 py-1.5 bg-green-600 text-white hover:bg-green-700 rounded transition-colors font-medium"
                                        >
                                          Approve
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setAllRequests(prev => prev.map(r =>
                                              r.id === request.id
                                                ? { ...r, status: 'rejected' as const, updatedAt: new Date().toISOString() }
                                                : r
                                            ));
                                          }}
                                          className="text-xs px-3 py-1.5 bg-[#E00420] text-white hover:bg-[#C00400] rounded transition-colors font-medium"
                                        >
                                          Reject
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan={columns.filter(c => c.visible).length + 1} className="px-6 py-8 text-center text-sm text-[#9DA5A8]">
                              No {actionTab === 'request-approval' ? 'indents pending approval' : 'POs pending approval'} found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {viewMode === 'card' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredRequests.length > 0 ? (
                      filteredRequests.map((request) => {
                        const budgetInfo = getCategoryBudgetInfo(request.category);
                        return (
                          <div
                            key={request.id}
                            className="border border-[#DFE2E4] rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => setSelectedRequest(request)}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h4 className="text-sm font-semibold text-[#005691]">{request.id}</h4>
                                <p className="text-xs text-[#9DA5A8] mt-1">
                                  {new Date(request.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                </p>
                              </div>
                              <StatusBadge status={request.status} />
                            </div>
                            <div className="space-y-2 mb-4">
                              <p className="text-sm font-medium text-[#31343A] line-clamp-2">{request.itemName}</p>
                              {columns.find(c => c.id === 'category')?.visible && request.category && (
                                <p className="text-xs text-[#9DA5A8]">Category: {request.category}</p>
                              )}
                              {columns.find(c => c.id === 'requester')?.visible && (
                                <p className="text-xs text-[#9DA5A8]">Requester: {request.requester}</p>
                              )}
                              {columns.find(c => c.id === 'requestedAmount')?.visible && (
                                <p className="text-sm font-semibold text-[#31343A]">{formatCurrency(request.estimatedCost)}</p>
                              )}
                            </div>
                            <div className="flex items-center justify-between pt-3 border-t border-[#DFE2E4]">
                              <StatusBadge status={request.budgetStatus === 'over-budget' ? 'over-budget' : request.budgetStatus === 'under-budget' ? 'under-budget' : 'pending-allocation'} />
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedRequest(request);
                                  }}
                                  className="text-xs px-3 py-1.5 text-[#005691] hover:bg-[#005691]/10 rounded border border-[#005691]/30 transition-colors font-medium"
                                >
                                  View
                                </button>
                                {(request.status === 'pending' || request.status === 'in-review') && (
                                  <>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setAllRequests(prev => prev.map(r =>
                                          r.id === request.id
                                            ? { ...r, status: 'approved' as const, updatedAt: new Date().toISOString() }
                                            : r
                                        ));
                                      }}
                                      className="text-xs px-2 py-1 bg-green-600 text-white hover:bg-green-700 rounded transition-colors font-medium"
                                    >
                                      Approve
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setAllRequests(prev => prev.map(r =>
                                          r.id === request.id
                                            ? { ...r, status: 'rejected' as const, updatedAt: new Date().toISOString() }
                                            : r
                                        ));
                                      }}
                                      className="text-xs px-2 py-1 bg-[#E00420] text-white hover:bg-[#C00400] rounded transition-colors font-medium"
                                    >
                                      Reject
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="col-span-full text-center py-8 text-sm text-[#9DA5A8]">
                        No {actionTab === 'request-approval' ? 'indents pending approval' : 'POs pending approval'} found.
                      </div>
                    )}
                  </div>
                )}

                {viewMode === 'kanban' && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {['pending', 'in-review', 'approved', 'rejected'].map((status) => {
                      // For Kanban, use allRequests filtered by department and search/filters to show true state
                      const kanbanRequests = allRequests.filter(request => {
                        const matchesDepartment = DEPARTMENT_ALIASES.includes(request.department) || request.department === DEPARTMENT_NAME;
                        if (!matchesDepartment) return false;
                        
                        // Apply search filter
                        if (searchQuery) {
                          const query = searchQuery.toLowerCase();
                          const matchesSearch = 
                            request.id.toLowerCase().includes(query) ||
                            request.itemName.toLowerCase().includes(query) ||
                            request.partNumber?.toLowerCase().includes(query) ||
                            request.commodity?.toLowerCase().includes(query) ||
                            request.category?.toLowerCase().includes(query) ||
                            request.subcategory?.toLowerCase().includes(query) ||
                            request.requester.toLowerCase().includes(query);
                          if (!matchesSearch) return false;
                        }
                        
                        // Apply other filters
                        if (statusFilter !== 'all' && request.status !== statusFilter) return false;
                        if (budgetFilter !== 'all' && request.budgetStatus !== budgetFilter) return false;
                        if (categoryFilter !== 'all' && request.category !== categoryFilter) return false;
                        if (sourceFilter !== 'all' && request.source !== sourceFilter) return false;
                        if (plantFilter !== 'all' && request.plant !== plantFilter) return false;
                        if (programFilter !== 'all' && request.program !== programFilter) return false;
                        if (commodityFilter !== 'all' && request.commodity !== commodityFilter) return false;
                        if (amountMin && request.estimatedCost < parseFloat(amountMin)) return false;
                        if (amountMax && request.estimatedCost > parseFloat(amountMax)) return false;
                        if (dateFrom && new Date(request.createdAt) < new Date(dateFrom)) return false;
                        if (dateTo && new Date(request.createdAt) > new Date(dateTo)) return false;
                        
                        return true;
                      });
                      
                      const statusRequests = kanbanRequests.filter(r => r.status === status);
                      const statusLabels: Record<string, string> = {
                        'pending': 'Pending',
                        'in-review': 'In Review',
                        'approved': 'Approved',
                        'rejected': 'Rejected',
                      };
                      
                      return (
                        <div key={status} className="bg-[#DFE2E4]/20 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-semibold text-[#31343A]">{statusLabels[status] || status}</h4>
                            <span className="px-2 py-1 bg-[#005691]/10 text-[#005691] rounded-full text-xs font-semibold">
                              {statusRequests.length}
                            </span>
                          </div>
                          <div className="space-y-2 max-h-[600px] overflow-y-auto">
                            {statusRequests.map((request) => (
                              <div
                                key={request.id}
                                className="bg-white border border-[#DFE2E4] rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer"
                                onClick={() => setSelectedRequest(request)}
                              >
                                <div className="text-xs font-medium text-[#005691] mb-1">{request.id}</div>
                                <p className="text-xs text-[#31343A] line-clamp-2 mb-2">{request.itemName}</p>
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-xs font-semibold text-[#31343A]">{formatCurrency(request.estimatedCost)}</span>
                                  <StatusBadge status={request.budgetStatus === 'over-budget' ? 'over-budget' : request.budgetStatus === 'under-budget' ? 'under-budget' : 'pending-allocation'} />
                                </div>
                                <div className="flex items-center gap-2 pt-2 border-t border-[#DFE2E4]">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedRequest(request);
                                    }}
                                    className="text-xs px-2 py-1 text-[#005691] hover:bg-[#005691]/10 rounded border border-[#005691]/30 transition-colors font-medium flex-1"
                                  >
                                    View
                                  </button>
                                  {(request.status === 'pending' || request.status === 'in-review') && (
                                    <>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setAllRequests(prev => prev.map(r =>
                                            r.id === request.id
                                              ? { ...r, status: 'approved' as const, updatedAt: new Date().toISOString() }
                                              : r
                                          ));
                                        }}
                                        className="text-xs px-2 py-1 bg-green-600 text-white hover:bg-green-700 rounded transition-colors font-medium"
                                      >
                                        ✓
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setAllRequests(prev => prev.map(r =>
                                            r.id === request.id
                                              ? { ...r, status: 'rejected' as const, updatedAt: new Date().toISOString() }
                                              : r
                                          ));
                                        }}
                                        className="text-xs px-2 py-1 bg-[#E00420] text-white hover:bg-[#C00400] rounded transition-colors font-medium"
                                      >
                                        ✕
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                            ))}
                            {statusRequests.length === 0 && (
                              <div className="text-center py-4 text-xs text-[#9DA5A8]">
                                No items
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

                {/* Right Panel: Alerts & Smart Insights */}
                <div className="space-y-6">
                  <AlertsCenter 
                    alerts={alerts}
                    onDismiss={(id) => console.log('Dismiss alert', id)}
                    onMarkRead={(id) => console.log('Mark read', id)}
                  />
                  <SmartInsights insights={smartInsights} />
                  </div>
              </div>
            )}

            {activeTab === 'budget' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-[#31343A]">Budget Overview</h3>
                
                {/* Enhanced Budget Status Summary with Trends */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-green-700 font-medium">Under Budget</p>
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                  </div>
                    <p className="text-2xl font-bold text-green-900">{underBudgetCount}</p>
                    <p className="text-[10px] text-green-600 mt-1">Indents safe to proceed</p>
                  </div>
                  <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-red-700 font-medium">Over Budget</p>
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                    </div>
                    <p className="text-2xl font-bold text-red-900">{overBudgetCount}</p>
                    <p className="text-[10px] text-red-600 mt-1">Requires escalation</p>
                  </div>
                  <div className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-amber-700 font-medium">At Limit</p>
                      <Clock className="h-4 w-4 text-amber-600" />
                    </div>
                    <p className="text-2xl font-bold text-amber-900">{onBudgetCount}</p>
                    <p className="text-[10px] text-amber-600 mt-1">Needs review</p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-blue-700 font-medium">Utilization</p>
                      <TrendingUp className="h-4 w-4 text-blue-600" />
                    </div>
                    <p className="text-2xl font-bold text-blue-900">{((committed / allocatedBudget) * 100).toFixed(1)}%</p>
                    <p className="text-[10px] text-blue-600 mt-1">
                      {formatCurrency(committed)} of {formatCurrency(allocatedBudget)}
                    </p>
                  </div>
                </div>

                {/* Budget Utilization Timeline */}
                <div className="bg-white border border-[#DFE2E4] rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-medium text-[#31343A]">Budget Utilization Trend</h4>
                    <div className="flex items-center gap-2 text-xs">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-[#005691]" />
                        <span className="text-[#9DA5A8]">Committed</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-gray-400" />
                        <span className="text-[#9DA5A8]">Budget</span>
                      </div>
                    </div>
                  </div>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsBarChart data={spendVsBudgetData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#DFE2E4" vertical={false} />
                        <XAxis dataKey="month" stroke="#9DA5A8" fontSize={11} tickLine={false} />
                        <YAxis 
                          stroke="#9DA5A8" 
                          fontSize={11} 
                          tickLine={false}
                          tickFormatter={(value: number) => `${(value / 1000).toFixed(0)}k`}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #DFE2E4',
                            borderRadius: '8px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                          }}
                          formatter={(value: number) => [formatCurrency(value), 'Amount']}
                        />
                        <Legend wrapperStyle={{ paddingTop: '10px' }} iconType="circle" />
                        <Bar dataKey="budget" name="Budget" fill="#9DA5A8" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="committed" name="Committed" fill="#005691" radius={[4, 4, 0, 0]} />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-4 gap-3 pt-4 border-t border-[#DFE2E4] mt-4">
                    {spendVsBudgetData.map((d) => {
                      const variance = ((d.committed - d.budget) / d.budget) * 100;
                      return (
                        <div key={d.month} className="text-center">
                          <div className="text-xs text-[#9DA5A8] mb-1">{d.month}</div>
                          <div className="text-sm font-bold text-[#31343A]">{formatCurrency(d.committed)}</div>
                          <div className={`text-[10px] mt-0.5 ${variance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {variance > 0 ? '+' : ''}{variance.toFixed(1)}% vs budget
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Budget Health Indicators */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Overall Budget Progress */}
                  <div className="bg-white border border-[#DFE2E4] rounded-lg p-6">
                    <h4 className="text-sm font-medium text-[#31343A] mb-4">Overall Budget Health</h4>
                    <div className="space-y-4">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-[#9DA5A8]">Total Budget</span>
                          <span className="text-sm font-semibold text-[#31343A]">{formatCurrency(allocatedBudget)}</span>
                        </div>
                        <div className="w-full h-4 bg-[#DFE2E4]/50 rounded-full overflow-hidden">
                          <div 
                            className={`h-4 rounded-full transition-all ${
                              (committed / allocatedBudget) * 100 > 90 ? 'bg-[#E00420]' : 
                              (committed / allocatedBudget) * 100 > 75 ? 'bg-yellow-500' : 'bg-[#005691]'
                            }`}
                            style={{ width: `${Math.min((committed / allocatedBudget) * 100, 100)}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-[#9DA5A8]">Committed: {formatCurrency(committed)}</span>
                          <span className="text-xs font-semibold text-[#31343A]">
                            {((committed / allocatedBudget) * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <div className="pt-4 border-t border-[#DFE2E4]">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-[#9DA5A8]">Available</span>
                          <span className="text-sm font-semibold text-green-600">{formatCurrency(available)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-[#9DA5A8]">Pending Approval</span>
                          <span className="text-sm font-semibold text-amber-600">{formatCurrency(pendingValue)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Top Spending Categories */}
                  <div className="bg-white border border-[#DFE2E4] rounded-lg p-6">
                    <h4 className="text-sm font-medium text-[#31343A] mb-4">Top Spending Categories</h4>
                    <div className="space-y-3">
                      {categorySpendData
                        .sort((a, b) => b.value - a.value)
                        .slice(0, 5)
                        .map((cat, idx) => {
                          const percentage = (cat.value / categorySpendData.reduce((sum, c) => sum + c.value, 0)) * 100;
                          return (
                            <div key={cat.name} className="flex items-center gap-3">
                              <div className="w-6 h-6 rounded-full bg-[#005691] text-white flex items-center justify-center text-xs font-bold">
                                {idx + 1}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-sm font-medium text-[#31343A]">{cat.name}</span>
                                  <span className="text-sm font-semibold text-[#31343A]">{formatCurrency(cat.value)}</span>
                                </div>
                                <div className="w-full h-1.5 bg-[#DFE2E4]/50 rounded-full overflow-hidden">
                                  <div 
                                    className="h-1.5 bg-[#005691] rounded-full"
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                                <div className="text-[10px] text-[#9DA5A8] mt-0.5">{percentage.toFixed(1)}% of total</div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>

                {/* Category Spend Chart */}
                <div className="bg-white border border-[#DFE2E4] rounded-lg p-6">
                  <h4 className="text-sm font-medium text-[#31343A] mb-4">Spend Distribution by Category</h4>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="h-[300px]">
                      <BarChart 
                        data={categorySpendData.map(d => ({ name: d.name, value: d.value / 1000 }))}
                        dataKey="value"
                        nameKey="name"
                        name="Spend (thousands)"
                      />
                    </div>
                    <div className="h-[300px]">
                      <PieChart data={categorySpendData} hideLegend />
                    </div>
                  </div>
                  </div>

                {/* Per-Category Budget Table with Enhanced Details */}
                <div className="bg-white border border-[#DFE2E4] rounded-lg overflow-hidden">
                  <div className="p-4 border-b border-[#DFE2E4] flex items-center justify-between">
                    <h4 className="text-sm font-medium text-[#31343A]">Budget by Category & Subcategory</h4>
                    <div className="flex items-center gap-2 text-xs text-[#9DA5A8]">
                      <span>Total: {formatCurrency(budgetCategoryData.reduce((sum, c) => sum + c.alloc, 0))}</span>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-[#DFE2E4] text-sm">
                      <thead className="bg-[#DFE2E4]/30">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#9DA5A8] uppercase tracking-wider">Category</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#9DA5A8] uppercase tracking-wider">Subcategories</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#9DA5A8] uppercase tracking-wider">Allocated</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#9DA5A8] uppercase tracking-wider">Committed</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#9DA5A8] uppercase tracking-wider">Available</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#9DA5A8] uppercase tracking-wider">Utilization %</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#9DA5A8] uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-[#DFE2E4]">
                        {budgetCategoryData.map(c => {
                          const utilization = (c.comm / c.alloc) * 100;
                          const available = c.alloc - c.comm;
                          const status = utilization > 90 ? 'Critical' : utilization > 75 ? 'Warning' : 'Healthy';
                          return (
                            <tr key={c.cat} className="hover:bg-[#DFE2E4]/30">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#31343A]">{c.cat}</td>
                              <td className="px-6 py-4 text-sm text-[#31343A]">
                                <div className="max-w-xs">
                                  {c.subcategories.length > 0 ? (
                                    <div className="flex flex-wrap gap-1">
                                      {c.subcategories.slice(0, 3).map((sub, idx) => (
                                        <span key={idx} className="px-2 py-0.5 bg-[#DFE2E4]/30 rounded text-xs">
                                          {sub}
                                        </span>
                                      ))}
                                      {c.subcategories.length > 3 && (
                                        <span className="px-2 py-0.5 bg-[#DFE2E4]/30 rounded text-xs">
                                          +{c.subcategories.length - 3} more
                                        </span>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-[#9DA5A8]">—</span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-[#31343A]">{formatCurrency(c.alloc)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-[#31343A]">{formatCurrency(c.comm)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">{formatCurrency(available)}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <div className="flex-1 h-2 bg-[#DFE2E4]/50 rounded-full overflow-hidden">
                                    <div 
                                      className={`h-2 rounded-full transition-all ${
                                        utilization > 90 ? 'bg-[#E00420]' : utilization > 75 ? 'bg-yellow-500' : 'bg-[#005691]'
                                      }`}
                                      style={{ width: `${Math.min(utilization, 100)}%` }}
                                    />
                  </div>
                                  <span className="text-xs font-semibold text-[#31343A] w-12 text-right">{utilization.toFixed(1)}%</span>
              </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  status === 'Critical' ? 'bg-[#E00420]/10 text-[#E00420]' :
                                  status === 'Warning' ? 'bg-yellow-500/10 text-yellow-700' :
                                  'bg-green-500/10 text-green-700'
                                }`}>
                                  {status}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Enhanced Analytics Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-blue-700 font-medium">Avg Processing Time</p>
                      <Clock className="h-4 w-4 text-blue-600" />
                  </div>
                    <p className="text-2xl font-bold text-blue-900">5.2 days</p>
                    <p className="text-[10px] text-blue-600 mt-1">↓ 0.8 days vs last month</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-green-700 font-medium">Approval Rate</p>
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    </div>
                    <p className="text-2xl font-bold text-green-900">{approvalRate}%</p>
                    <p className="text-[10px] text-green-600 mt-1">Above target (85%)</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-purple-700 font-medium">Avg Spend per Indent</p>
                      <FileText className="h-4 w-4 text-purple-600" />
                    </div>
                    <p className="text-xl font-bold text-purple-900">
                      {allRequests.length > 0 ? formatCurrency(allRequests.reduce((a, b) => a + b.estimatedCost, 0) / allRequests.length) : '₹0'}
                    </p>
                    <p className="text-[10px] text-purple-600 mt-1">Per indent</p>
                  </div>
                  <div className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-amber-700 font-medium">Budget Remaining</p>
                      <TrendingUp className="h-4 w-4 text-amber-600" />
                    </div>
                    <p className="text-xl font-bold text-amber-900">{formatCurrency(available)}</p>
                    <p className="text-[10px] text-amber-600 mt-1">
                      {((available / allocatedBudget) * 100).toFixed(1)}% of total
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-[#31343A]">Analytics & Insights</h3>

                {/* Automotive Monthly Trends - Enhanced */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Enhanced Indent Trends with Status Breakdown */}
                  <div className="bg-white border border-[#DFE2E4] rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-medium text-[#31343A]">Monthly Indent Trends</h4>
                      <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                          <span className="text-[#9DA5A8]">Approved</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-orange-500" />
                          <span className="text-[#9DA5A8]">Pending</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-red-500" />
                          <span className="text-[#9DA5A8]">Rejected</span>
                        </div>
                      </div>
                    </div>
                    <div className="h-[280px] mb-4">
                      <ResponsiveContainer width="100%" height={280}>
                        <RechartsBarChart data={monthlyTrendData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#DFE2E4" vertical={false} />
                          <XAxis dataKey="month" stroke="#9DA5A8" fontSize={11} tickLine={false} />
                          <YAxis stroke="#9DA5A8" fontSize={11} tickLine={false} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'white',
                              border: '1px solid #DFE2E4',
                              borderRadius: '8px',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            }}
                            formatter={(value: number) => [value, 'Count']}
                          />
                          <Legend wrapperStyle={{ paddingTop: '10px' }} iconType="circle" />
                          <Bar dataKey="approved" stackId="a" name="Approved" fill="#10B981" radius={[0, 0, 4, 4]} />
                          <Bar dataKey="pending" stackId="a" name="Pending" fill="#F59E0B" radius={[0, 0, 4, 4]} />
                          <Bar dataKey="rejected" stackId="a" name="Rejected" fill="#EF4444" radius={[0, 0, 4, 4]} />
                        </RechartsBarChart>
                      </ResponsiveContainer>
                  </div>
                    <div className="grid grid-cols-4 gap-3 pt-4 border-t border-[#DFE2E4]">
                      {monthlyTrendData.map((d) => (
                        <div key={d.month} className="text-center">
                          <div className="text-xs text-[#9DA5A8] mb-1">{d.month}</div>
                          <div className="text-lg font-bold text-[#31343A]">{d.indents}</div>
                          {d.growth !== 0 && (
                            <div className={`text-[10px] mt-0.5 ${d.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {d.growth > 0 ? '↑' : '↓'} {Math.abs(d.growth).toFixed(0)}%
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Enhanced Spend by Cost Type with Stacked Breakdown */}
                  <div className="bg-white border border-[#DFE2E4] rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-medium text-[#31343A]">Monthly Spend by Cost Type</h4>
                      <div className="text-right">
                        <div className="text-xs text-[#9DA5A8]">Total</div>
                        <div className="text-sm font-bold text-[#31343A]">
                          {formatCurrency(monthlyTrendData.reduce((sum, d) => sum + d.spend, 0))}
                        </div>
                      </div>
                    </div>
                    <div className="h-[280px] mb-4">
                      <ResponsiveContainer width="100%" height={280}>
                        <RechartsBarChart data={monthlyTrendData.map(d => ({
                          month: d.month,
                          Material: d.costBreakdown.find(c => c.type === 'Material')?.amount || 0,
                          Tooling: d.costBreakdown.find(c => c.type === 'Tooling')?.amount || 0,
                          Freight: d.costBreakdown.find(c => c.type === 'Freight')?.amount || 0,
                          Service: d.costBreakdown.find(c => c.type === 'Service')?.amount || 0,
                        }))}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#DFE2E4" vertical={false} />
                          <XAxis dataKey="month" stroke="#9DA5A8" fontSize={11} tickLine={false} />
                          <YAxis 
                            stroke="#9DA5A8" 
                            fontSize={11} 
                            tickLine={false}
                            tickFormatter={(value: number) => `${(value / 1000).toFixed(0)}k`}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'white',
                              border: '1px solid #DFE2E4',
                              borderRadius: '8px',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            }}
                            formatter={(value: number) => [formatCurrency(value), 'Amount']}
                          />
                          <Legend wrapperStyle={{ paddingTop: '10px' }} iconType="circle" />
                          <Bar dataKey="Material" stackId="a" name="Material" fill="#DC2626" radius={[0, 0, 4, 4]} />
                          <Bar dataKey="Tooling" stackId="a" name="Tooling" fill="#EF4444" radius={[0, 0, 4, 4]} />
                          <Bar dataKey="Freight" stackId="a" name="Freight" fill="#F87171" radius={[0, 0, 4, 4]} />
                          <Bar dataKey="Service" stackId="a" name="Service" fill="#FCA5A5" radius={[0, 0, 4, 4]} />
                        </RechartsBarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-4 gap-2 pt-4 border-t border-[#DFE2E4] text-xs">
                      {monthlyTrendData.map((d) => (
                        <div key={d.month} className="text-center">
                          <div className="text-[#9DA5A8] mb-1">{d.month}</div>
                          <div className="font-semibold text-[#31343A]">{formatCurrency(d.spend)}</div>
                          <div className="text-[10px] text-[#9DA5A8] mt-0.5">
                            Avg: {formatCurrency(d.avgValue)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Summary Statistics Row */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-blue-700 font-medium">Total Indents</span>
                      <TrendingUp className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="text-2xl font-bold text-blue-900">
                      {monthlyTrendData.reduce((sum, d) => sum + d.indents, 0)}
                    </div>
                    <div className="text-[10px] text-blue-600 mt-1">
                      +{monthlyTrendData[monthlyTrendData.length - 1].growth > 0 ? monthlyTrendData[monthlyTrendData.length - 1].growth.toFixed(0) : '0'}% vs prev month
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-green-700 font-medium">Approval Rate</span>
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="text-2xl font-bold text-green-900">
                      {((monthlyTrendData.reduce((sum, d) => sum + d.approved, 0) / monthlyTrendData.reduce((sum, d) => sum + d.indents, 0)) * 100).toFixed(0)}%
                    </div>
                    <div className="text-[10px] text-green-600 mt-1">
                      {monthlyTrendData.reduce((sum, d) => sum + d.approved, 0)} approved
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-purple-700 font-medium">Total Spend</span>
                      <BarChart3 className="h-4 w-4 text-purple-600" />
                    </div>
                    <div className="text-xl font-bold text-purple-900">
                      {formatCurrency(monthlyTrendData.reduce((sum, d) => sum + d.spend, 0))}
                    </div>
                    <div className="text-[10px] text-purple-600 mt-1">
                      Avg: {formatCurrency(monthlyTrendData.reduce((sum, d) => sum + d.spend, 0) / monthlyTrendData.length)}/mo
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-amber-700 font-medium">Avg Indent Value</span>
                      <FileText className="h-4 w-4 text-amber-600" />
                    </div>
                    <div className="text-xl font-bold text-amber-900">
                      {formatCurrency(monthlyTrendData.reduce((sum, d) => sum + d.avgValue, 0) / monthlyTrendData.length)}
                    </div>
                    <div className="text-[10px] text-amber-600 mt-1">
                      Per indent
                    </div>
                  </div>
                </div>

                {/* Automotive Compliance Overview */}
                <div className="bg-white border border-[#DFE2E4] rounded-lg p-6">
                  <h4 className="text-sm font-medium text-[#31343A] mb-4">Compliance Status Overview</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-[#31343A] mb-1">
                        {allRequests.filter(r => r.compliance?.ppapRequired).length} / {allRequests.length}
                      </div>
                      <div className="text-xs text-[#9DA5A8]">PPAP Required</div>
                      <div className="mt-2 text-xs text-green-600">
                        {allRequests.filter(r => r.compliance?.ppapRequired && r.status === 'po-issued').length} Completed
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-[#31343A] mb-1">
                        {allRequests.filter(r => r.compliance?.imdsRequired).length} / {allRequests.length}
                      </div>
                      <div className="text-xs text-[#9DA5A8]">IMDS Required</div>
                      <div className="mt-2 text-xs text-blue-600">
                        {allRequests.filter(r => r.compliance?.imdsRequired && r.status === 'po-issued').length} Submitted
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-[#31343A] mb-1">
                        {allRequests.filter(r => r.compliance?.iatfSupplier).length} / {allRequests.length}
                      </div>
                      <div className="text-xs text-[#9DA5A8]">IATF Certified Suppliers</div>
                      <div className="mt-2 text-xs text-purple-600">
                        {(allRequests.filter(r => r.compliance?.iatfSupplier).length / allRequests.length * 100).toFixed(0)}% Coverage
                      </div>
                    </div>
                  </div>
                </div>

                {/* Line-Stop Risk Summary */}
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-semibold text-red-700">Line-Stop Risk Summary</h4>
                    <span className="text-xs text-red-600 font-medium">
                      {allRequests.filter(r => r.lineStopRisk).length} Active Risks
                    </span>
                  </div>
                  <div className="space-y-2">
                    {allRequests.filter(r => r.lineStopRisk).slice(0, 3).map(r => (
                      <div key={r.id} className="flex items-center justify-between p-3 bg-white rounded border border-red-100">
                        <div>
                          <div className="text-sm font-medium text-[#31343A]">{r.partNumber}</div>
                          <div className="text-xs text-[#9DA5A8]">{r.itemName} • {r.program}</div>
                          <div className="text-xs text-red-600 mt-1">{r.riskReason}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-[#9DA5A8]">Required By</div>
                          <div className="text-sm font-medium text-[#31343A]">{r.requiredBy}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Repeating Items Widget */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <RepeatingItems />
                  <UrgencyBudgetMatrix />
                </div>

                {/* Additional Analytics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white border border-[#DFE2E4] rounded-lg p-4">
                    <p className="text-xs text-[#9DA5A8] mb-2">Total Indents (30d)</p>
                    <p className="text-2xl font-semibold text-[#31343A]">{totalIndents}</p>
                    <p className="text-xs text-green-600 mt-1">↑ 15% vs last month</p>
                  </div>
                  <div className="bg-white border border-[#DFE2E4] rounded-lg p-4">
                    <p className="text-xs text-[#9DA5A8] mb-2">Avg Indent Value</p>
                    <p className="text-2xl font-semibold text-[#31343A]">
                      {formatCurrency(allRequests.reduce((a, b) => a + b.estimatedCost, 0) / Math.max(allRequests.length, 1))}
                    </p>
                    <p className="text-xs text-[#9DA5A8] mt-1">Per indent</p>
                  </div>
                  <div className="bg-white border border-[#DFE2E4] rounded-lg p-4">
                    <p className="text-xs text-[#9DA5A8] mb-2">Fastest Approval</p>
                    <p className="text-2xl font-semibold text-[#31343A]">1.2d</p>
                    <p className="text-xs text-[#9DA5A8] mt-1">Average</p>
                  </div>
                  <div className="bg-white border border-[#DFE2E4] rounded-lg p-4">
                    <p className="text-xs text-[#9DA5A8] mb-2">Budget Utilization</p>
                    <p className="text-2xl font-semibold text-[#31343A]">
                      {((committed / allocatedBudget) * 100).toFixed(1)}%
                    </p>
                    <p className="text-xs text-[#9DA5A8] mt-1">Of allocated</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (() => {
              const totalCount = filteredNotifications.length;
              
              // Priority distribution for pie chart
              const priorityDistributionData = [
                { name: 'Critical', value: notificationsByPriority.critical, color: '#E00420' },
                { name: 'High', value: notificationsByPriority.high, color: '#FF8C00' },
                { name: 'Medium', value: notificationsByPriority.medium, color: '#FFD700' },
                { name: 'Low', value: notificationsByPriority.low, color: '#9DA5A8' },
              ].filter(item => item.value > 0);

              return (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                <h3 className="text-lg font-semibold text-[#31343A]">Notifications & Activity Feed</h3>
                      <p className="text-xs text-[#9DA5A8] mt-1">
                        {unreadCount} unread • {totalCount} total
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <button
                          onClick={() => {
                            const allIds = new Set(filteredNotifications.map(n => n.id));
                            setReadNotifications(prev => new Set([...prev, ...allIds]));
                          }}
                          className="text-xs px-3 py-1.5 border border-[#B6BBBE] text-[#31343A] rounded-lg hover:bg-[#DFE2E4] transition-colors"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Statistics Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <KPICard
                      title="Total Notifications"
                      value={totalCount.toString()}
                      icon={FileText}
                      className="bg-white"
                    />
                    <KPICard
                      title="Unread Notifications"
                      value={unreadCount.toString()}
                      change={unreadCount > 0 ? `${unreadCount} requiring attention` : 'All caught up'}
                      trend={unreadCount > 0 ? 'up' : 'neutral'}
                      icon={AlertTriangle}
                      className={unreadCount > 0 ? 'bg-orange-50 border-orange-200' : 'bg-green-50 border-green-200'}
                    />
                    <KPICard
                      title="Critical Alerts"
                      value={notificationsByPriority.critical.toString()}
                      change={unreadByPriority.critical > 0 ? `${unreadByPriority.critical} unread` : undefined}
                      trend={notificationsByPriority.critical > 0 ? 'up' : 'neutral'}
                      icon={AlertTriangle}
                      className={notificationsByPriority.critical > 0 ? 'bg-red-50 border-red-200' : 'bg-white'}
                    />
                    <KPICard
                      title="Action Required"
                      value={notificationsWithActions.toString()}
                      icon={CheckCircle2}
                      className="bg-blue-50 border-blue-200"
                    />
                  </div>

                  {/* Unread Breakdown & Action Items */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Unread Breakdown */}
                    <div className="bg-white rounded-lg border border-[#DFE2E4] p-6 shadow-sm">
                      <h4 className="text-sm font-semibold text-[#31343A] mb-4">Unread Breakdown</h4>
                      <div className="space-y-3">
                        {unreadByPriority.critical > 0 && (
                          <div className="flex items-center justify-between p-3 bg-[#E00420]/10 rounded-lg border border-[#E00420]/20">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-[#E00420]" />
                              <span className="text-sm text-[#31343A]">Critical</span>
                            </div>
                            <span className="text-sm font-semibold text-[#E00420]">{unreadByPriority.critical}</span>
                          </div>
                        )}
                        {unreadByPriority.high > 0 && (
                          <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-orange-500" />
                              <span className="text-sm text-[#31343A]">High</span>
                            </div>
                            <span className="text-sm font-semibold text-orange-600">{unreadByPriority.high}</span>
                          </div>
                        )}
                        {unreadByPriority.medium > 0 && (
                          <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-yellow-500" />
                              <span className="text-sm text-[#31343A]">Medium</span>
                            </div>
                            <span className="text-sm font-semibold text-yellow-600">{unreadByPriority.medium}</span>
                          </div>
                        )}
                        {unreadByPriority.low > 0 && (
                          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-blue-500" />
                              <span className="text-sm text-[#31343A]">Low</span>
                            </div>
                            <span className="text-sm font-semibold text-blue-600">{unreadByPriority.low}</span>
                          </div>
                        )}
                        {unreadCount === 0 && (
                          <div className="text-center py-8 text-[#9DA5A8] text-sm">
                            <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500" />
                            <p>All notifications read</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Items Summary */}
                    <div className="bg-white rounded-lg border border-[#DFE2E4] p-6 shadow-sm">
                      <h4 className="text-sm font-semibold text-[#31343A] mb-4">Pending Actions</h4>
                      <div className="space-y-3">
                        {filteredNotifications
                          .filter(n => n.actionLabel && !readNotifications.has(n.id))
                          .slice(0, 5)
                          .map((notification) => (
                            <div
                              key={notification.id}
                              className="flex items-start gap-3 p-3 bg-[#DFE2E4]/30 rounded-lg border border-[#DFE2E4] hover:bg-[#DFE2E4]/50 cursor-pointer transition-colors"
                              onClick={() => handleActivityAction(notification)}
                            >
                              <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                                notification.priority === 'critical' ? 'bg-[#E00420]' : 
                                notification.priority === 'high' ? 'bg-orange-500' : 
                                notification.priority === 'medium' ? 'bg-yellow-500' : 
                                'bg-[#9DA5A8]'
                              }`} />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-[#31343A] line-clamp-1">
                                  {notification.title}
                                </p>
                                <button className="text-xs mt-2 px-3 py-1 bg-[#005691] text-white rounded hover:bg-[#004574] transition-colors">
                                  {notification.actionLabel}
                                </button>
                              </div>
                            </div>
                          ))}
                        {filteredNotifications.filter(n => n.actionLabel && !readNotifications.has(n.id)).length === 0 && (
                          <div className="text-center py-8 text-[#9DA5A8] text-sm">
                            <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500" />
                            <p>No pending actions</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Notification Filters */}
                  <div className="bg-white rounded-lg border border-[#DFE2E4] p-4 shadow-sm">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#9DA5A8]" />
                        <input
                          type="text"
                          placeholder="Search notifications..."
                          value={notificationSearch}
                          onChange={(e) => setNotificationSearch(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-[#B6BBBE] rounded-lg text-sm focus:ring-2 focus:ring-[#005691] focus:border-transparent text-[#31343A]"
                        />
                      </div>
                      
                      <select
                        value={notificationFilter}
                        onChange={(e) => setNotificationFilter(e.target.value as any)}
                        className="px-4 py-2 border border-[#B6BBBE] rounded-lg text-sm focus:ring-2 focus:ring-[#005691] focus:border-transparent text-[#31343A] bg-white"
                      >
                        <option value="all">All Priorities</option>
                        <option value="critical">Critical</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                      
                      <select
                        value={notificationTypeFilter}
                        onChange={(e) => setNotificationTypeFilter(e.target.value as any)}
                        className="px-4 py-2 border border-[#B6BBBE] rounded-lg text-sm focus:ring-2 focus:ring-[#005691] focus:border-transparent text-[#31343A] bg-white"
                      >
                        <option value="all">All Types</option>
                        <option value="alerts">Alerts</option>
                        <option value="rfq">RFQs</option>
                        <option value="quality">Quality</option>
                        <option value="contracts">Contracts</option>
                      </select>
                      
                      <select
                        value={readStatusFilter}
                        onChange={(e) => setReadStatusFilter(e.target.value as any)}
                        className="px-4 py-2 border border-[#B6BBBE] rounded-lg text-sm focus:ring-2 focus:ring-[#005691] focus:border-transparent text-[#31343A] bg-white"
                      >
                        <option value="all">All Status</option>
                        <option value="read">Read</option>
                        <option value="unread">Unread</option>
                      </select>
                      
                      <select
                        value={timeFilter}
                        onChange={(e) => setTimeFilter(e.target.value as any)}
                        className="px-4 py-2 border border-[#B6BBBE] rounded-lg text-sm focus:ring-2 focus:ring-[#005691] focus:border-transparent text-[#31343A] bg-white"
                      >
                        <option value="all">All Time</option>
                        <option value="24h">Last 24h</option>
                        <option value="today">Today</option>
                        <option value="week">This Week</option>
                      </select>
                      
                      <select
                        value={actionFilter}
                        onChange={(e) => setActionFilter(e.target.value as any)}
                        className="px-4 py-2 border border-[#B6BBBE] rounded-lg text-sm focus:ring-2 focus:ring-[#005691] focus:border-transparent text-[#31343A] bg-white"
                      >
                        <option value="all">All Actions</option>
                        <option value="with-actions">With Actions</option>
                        <option value="no-actions">No Actions</option>
                      </select>
                      
                      {(notificationFilter !== 'all' || notificationSearch || notificationTypeFilter !== 'all' || readStatusFilter !== 'all' || timeFilter !== 'all' || actionFilter !== 'all') && (
                        <button
                          onClick={() => {
                            setNotificationFilter('all');
                            setNotificationSearch('');
                            setNotificationTypeFilter('all');
                            setReadStatusFilter('all');
                            setTimeFilter('all');
                            setActionFilter('all');
                          }}
                          className="px-4 py-2 text-xs border border-[#B6BBBE] text-[#31343A] rounded-lg hover:bg-[#DFE2E4] transition-colors"
                        >
                          Clear All
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Notifications List */}
                  {filteredNotifications.length > 0 ? (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                      {filteredNotifications.map((activity) => {
                        const isRead = readNotifications.has(activity.id);
                        return (
                    <div 
                      key={activity.id} 
                            className={`border rounded-lg p-4 transition-all cursor-pointer hover:shadow-md ${
                              !isRead ? (
                                activity.priority === 'critical' ? 'bg-[#E00420]/10 border-[#E00420]/30' :
                                activity.priority === 'high' ? 'bg-orange-50 border-orange-300' :
                                activity.priority === 'medium' ? 'bg-yellow-50 border-yellow-300' :
                                'bg-blue-50 border-blue-300'
                              ) : (
                                activity.priority === 'critical' ? 'bg-[#E00420]/5 border-[#E00420]/20' :
                                activity.priority === 'high' ? 'bg-orange-50/50 border-orange-200' :
                                activity.priority === 'medium' ? 'bg-yellow-50/50 border-yellow-200' :
                        'bg-[#DFE2E4]/30 border-[#DFE2E4]'
                              )
                      }`}
                            onClick={() => {
                              if (!isRead) {
                                setReadNotifications(prev => new Set([...prev, activity.id]));
                              }
                            }}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${
                          activity.priority === 'critical' ? 'bg-[#E00420]' : 
                          activity.priority === 'high' ? 'bg-orange-500' : 
                          activity.priority === 'medium' ? 'bg-yellow-500' : 
                          'bg-[#9DA5A8]'
                        }`} />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between mb-1 gap-2">
                                  <div className="flex items-center gap-2 flex-1">
                                    <p className={`text-sm font-medium ${!isRead ? 'text-[#31343A] font-semibold' : 'text-[#31343A]'}`}>
                                      {activity.title}
                                    </p>
                                    {!isRead && (
                                      <span className="px-1.5 py-0.5 bg-[#005691] text-white text-[10px] font-semibold rounded-full">
                                        New
                                      </span>
                                    )}
                          </div>
                                  <span className="text-xs text-[#9DA5A8] whitespace-nowrap">
                                    {formatDateTime(activity.timestamp)}
                                  </span>
                                </div>
                                <p className={`text-xs mt-1 ${!isRead ? 'text-[#31343A]' : 'text-[#9DA5A8]'}`}>
                                  {activity.description}
                                </p>
                          {activity.actionLabel && (
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleActivityAction(activity);
                                    }}
                                    className="text-xs px-3 py-1.5 bg-[#005691] text-white rounded hover:bg-[#004574] mt-2 transition-colors"
                                  >
                              {activity.actionLabel}
                            </button>
                          )}
                        </div>
                  </div>
                  </div>
                        );
                      })}
                </div>
                  ) : (
                    <div className="bg-[#DFE2E4]/30 border border-[#DFE2E4] rounded-lg p-8 text-center">
                      <p className="text-sm text-[#9DA5A8]">No notifications found</p>
                      {(notificationFilter !== 'all' || notificationSearch) && (
                        <button
                          onClick={() => {
                            setNotificationFilter('all');
                            setNotificationSearch('');
                          }}
                          className="text-xs text-[#005691] hover:underline mt-2"
                        >
                          Clear filters
                        </button>
                      )}
              </div>
            )}
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Indent Detail Modal with Workflow */}
      {selectedRequest && (
        <Modal
          isOpen={!!selectedRequest}
          onClose={() => setSelectedRequest(null)}
          title={`Indent ${selectedRequest.id}`}
          size="xl"
        >
          <div className="space-y-6">
            <IndentDetail
              request={selectedRequest}
              allocatedBudget={allocatedBudget}
              committedAmount={committed}
              availableAmount={available}
              onApprove={(requestId) => {
                setAllRequests(prev => prev.map(r => 
                  r.id === requestId 
                    ? { ...r, status: 'approved' as const, updatedAt: new Date().toISOString() }
                    : r
                ));
                // Update selectedRequest to reflect the change
                setSelectedRequest(prev => prev ? { ...prev, status: 'approved' as const, updatedAt: new Date().toISOString() } : null);
              }}
              onReject={(requestId) => {
                setAllRequests(prev => prev.map(r => 
                  r.id === requestId 
                    ? { ...r, status: 'rejected' as const, updatedAt: new Date().toISOString() }
                    : r
                ));
                // Update selectedRequest to reflect the change
                setSelectedRequest(prev => prev ? { ...prev, status: 'rejected' as const, updatedAt: new Date().toISOString() } : null);
              }}
            />
            {selectedRequest.workflowStages && selectedRequest.workflowStages.length > 0 ? (
              <ApprovalWorkflowMap
                indentId={selectedRequest.id}
                stages={selectedRequest.workflowStages}
                onStageClick={(stageId) => console.log('Stage clicked', stageId)}
              />
            ) : null}
          </div>
        </Modal>
      )}

      {/* Quality Report Modal */}
      <Modal
        isOpen={showQualityReportModal}
        onClose={() => setShowQualityReportModal(false)}
        title="Quality Inspection Report"
        size="xl"
      >
        <div className="space-y-6">
          <div className="bg-[#DFE2E4]/20 rounded-lg p-4 border border-[#DFE2E4]">
            <h3 className="text-sm font-semibold text-[#31343A] mb-2">Steel Coils Inspection - Batch QC-240122</h3>
            <p className="text-xs text-[#9DA5A8] mb-4">120 coils awaiting clearance</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="text-xs text-[#9DA5A8] mb-1">Total Batches</div>
              <div className="text-2xl font-bold text-blue-700">120</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="text-xs text-[#9DA5A8] mb-1">Cleared</div>
              <div className="text-2xl font-bold text-green-700">95</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <div className="text-xs text-[#9DA5A8] mb-1">Pending</div>
              <div className="text-2xl font-bold text-yellow-700">20</div>
            </div>
            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <div className="text-xs text-[#9DA5A8] mb-1">Rejected</div>
              <div className="text-2xl font-bold text-red-700">5</div>
            </div>
          </div>

          <div className="border-t border-[#DFE2E4] pt-4">
            <h4 className="text-sm font-semibold text-[#31343A] mb-3">Inspection Details</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#9DA5A8]">Inspection Date:</span>
                <span className="text-[#31343A] font-medium">{formatDate(new Date().toISOString())}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#9DA5A8]">Inspector:</span>
                <span className="text-[#31343A] font-medium">Quality Control Team</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#9DA5A8]">Compliance Status:</span>
                <span className="text-green-600 font-medium">79.2% Pass Rate</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-[#DFE2E4]">
            <button
              onClick={() => setShowQualityReportModal(false)}
              className="flex-1 px-4 py-2 bg-[#005691] text-white rounded hover:bg-[#004574] transition-colors text-sm font-medium"
            >
              <FileCheck className="h-4 w-4 inline mr-2" />
              Approve Clearance
            </button>
            <button
              onClick={() => setShowQualityReportModal(false)}
              className="px-4 py-2 border border-[#DFE2E4] text-[#31343A] rounded hover:bg-[#DFE2E4]/30 transition-colors text-sm font-medium"
            >
              Download Report
            </button>
          </div>
        </div>
      </Modal>

      {/* Meeting Schedule Modal */}
      <Modal
        isOpen={showMeetingScheduleModal}
        onClose={() => setShowMeetingScheduleModal(false)}
        title="Schedule Meeting"
        size="lg"
      >
        <div className="space-y-6">
          <div className="bg-[#DFE2E4]/20 rounded-lg p-4 border border-[#DFE2E4]">
            <h3 className="text-sm font-semibold text-[#31343A] mb-2">Contract Renewal Discussion</h3>
            <p className="text-xs text-[#9DA5A8]">SKF Bearings Annual Supply Contract - Renewal window opens in 30 days</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#31343A] mb-2">Meeting Title</label>
              <input
                type="text"
                defaultValue="SKF Bearings Contract Renewal"
                className="w-full px-3 py-2 border border-[#DFE2E4] rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#005691]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#31343A] mb-2">Date</label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  defaultValue={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-[#DFE2E4] rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#005691]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#31343A] mb-2">Time</label>
                <input
                  type="time"
                  defaultValue="10:00"
                  className="w-full px-3 py-2 border border-[#DFE2E4] rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#005691]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#31343A] mb-2">Duration</label>
              <select className="w-full px-3 py-2 border border-[#DFE2E4] rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#005691]">
                <option>30 minutes</option>
                <option>1 hour</option>
                <option>1.5 hours</option>
                <option>2 hours</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#31343A] mb-2">Attendees</label>
              <input
                type="text"
                placeholder="Enter email addresses (comma-separated)"
                defaultValue="procurement@company.com, finance@company.com"
                className="w-full px-3 py-2 border border-[#DFE2E4] rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#005691]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#31343A] mb-2">Meeting Notes</label>
              <textarea
                rows={4}
                placeholder="Add any relevant notes or agenda items..."
                className="w-full px-3 py-2 border border-[#DFE2E4] rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#005691] resize-none"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-[#DFE2E4]">
            <button
              onClick={() => {
                // In a real app, this would send the meeting invite
                setShowMeetingScheduleModal(false);
                console.log('Meeting scheduled');
              }}
              className="flex-1 px-4 py-2 bg-[#005691] text-white rounded hover:bg-[#004574] transition-colors text-sm font-medium"
            >
              <Calendar className="h-4 w-4 inline mr-2" />
              Schedule Meeting
            </button>
            <button
              onClick={() => setShowMeetingScheduleModal(false)}
              className="px-4 py-2 border border-[#DFE2E4] text-[#31343A] rounded hover:bg-[#DFE2E4]/30 transition-colors text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* Tooling Budget Review Modal */}
      <Modal
        isOpen={showToolingBudgetModal}
        onClose={() => setShowToolingBudgetModal(false)}
        title="Tooling Budget Review - Chassis Tooling"
        size="xl"
      >
        <div className="space-y-6">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-orange-800">Budget Anomaly Detected</h3>
              <span className="px-2 py-1 bg-[#E00420] text-white rounded-full text-xs font-semibold">High Priority</span>
            </div>
            <p className="text-xs text-orange-700 mb-2">Chassis Tooling category shows 65% increase vs last month</p>
            <div className="grid grid-cols-3 gap-3 mt-3">
              <div className="bg-white rounded p-2">
                <div className="text-xs text-[#9DA5A8]">Current Month</div>
                <div className="text-lg font-bold text-[#31343A]">{formatCurrency(1250000)}</div>
              </div>
              <div className="bg-white rounded p-2">
                <div className="text-xs text-[#9DA5A8]">Average (Last 3 months)</div>
                <div className="text-lg font-bold text-[#31343A]">{formatCurrency(760000)}</div>
              </div>
              <div className="bg-white rounded p-2">
                <div className="text-xs text-[#9DA5A8]">Variance</div>
                <div className="text-lg font-bold text-red-600">+{formatCurrency(490000)}</div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-[#31343A] mb-3">Root Cause Analysis</h4>
            <div className="space-y-2">
              <div className="flex items-start gap-2 p-3 bg-[#DFE2E4]/30 rounded">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                <div>
                  <div className="text-sm font-medium text-[#31343A]">New Program SUV-X1 Tooling Ramp-up</div>
                  <div className="text-xs text-[#9DA5A8]">Tooling molds and fixtures for new SUV production line</div>
                </div>
              </div>
              <div className="flex items-start gap-2 p-3 bg-[#DFE2E4]/30 rounded">
                <div className="w-2 h-2 rounded-full bg-orange-500 mt-1.5 flex-shrink-0" />
                <div>
                  <div className="text-sm font-medium text-[#31343A]">Expedited Tooling Approvals</div>
                  <div className="text-xs text-[#9DA5A8]">5 urgent tooling approvals processed this month</div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-[#31343A] mb-3">Recommended Actions</h4>
            <div className="space-y-2">
              <label className="flex items-start gap-2 p-3 border border-[#DFE2E4] rounded hover:bg-[#DFE2E4]/20 cursor-pointer">
                <input type="checkbox" className="mt-1" defaultChecked />
                <div>
                  <div className="text-sm font-medium text-[#31343A]">Request budget reallocation from Raw Materials</div>
                  <div className="text-xs text-[#9DA5A8]">₹2.5L available for reallocation</div>
                </div>
              </label>
              <label className="flex items-start gap-2 p-3 border border-[#DFE2E4] rounded hover:bg-[#DFE2E4]/20 cursor-pointer">
                <input type="checkbox" className="mt-1" />
                <div>
                  <div className="text-sm font-medium text-[#31343A]">Escalate to Finance for Q1 budget revision</div>
                  <div className="text-xs text-[#9DA5A8]">Q1 forecast shows 15% over budget</div>
                </div>
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-[#DFE2E4]">
            <button
              onClick={() => {
                console.log('Tooling budget actions applied');
                setShowToolingBudgetModal(false);
              }}
              className="flex-1 px-4 py-2 bg-[#005691] text-white rounded hover:bg-[#004574] transition-colors text-sm font-medium"
            >
              Apply Recommendations
            </button>
            <button
              onClick={() => {
                const ppapIndents = allRequests.filter(r => 
                  r.category === 'Tooling' || r.category === 'Chassis'
                );
                if (ppapIndents.length > 0) {
                  setSelectedRequest(ppapIndents[0] as ExtendedRequest);
                }
                setShowToolingBudgetModal(false);
              }}
              className="px-4 py-2 border border-[#005691] text-[#005691] rounded hover:bg-[#005691]/10 transition-colors text-sm font-medium"
            >
              View Tooling Indents
            </button>
            <button
              onClick={() => setShowToolingBudgetModal(false)}
              className="px-4 py-2 border border-[#DFE2E4] text-[#31343A] rounded hover:bg-[#DFE2E4]/30 transition-colors text-sm font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

      {/* Forecast Details Modal */}
      <Modal
        isOpen={showForecastModal}
        onClose={() => setShowForecastModal(false)}
        title="Q1 Forecast - Spend Projection"
        size="xl"
      >
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-blue-800">Q1 2025 Forecast</h3>
              <span className="px-2 py-1 bg-[#E00420] text-white rounded-full text-xs font-semibold">High Priority</span>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-3">
              <div className="bg-white rounded p-3">
                <div className="text-xs text-[#9DA5A8]">Expected Spend</div>
                <div className="text-2xl font-bold text-blue-900">{formatCurrency(4820000)}</div>
              </div>
              <div className="bg-white rounded p-3">
                <div className="text-xs text-[#9DA5A8]">Allocated Budget</div>
                <div className="text-2xl font-bold text-[#31343A]">{formatCurrency(4200000)}</div>
              </div>
              <div className="bg-red-50 rounded p-3">
                <div className="text-xs text-red-700">Projected Overrun</div>
                <div className="text-xl font-bold text-red-900">{formatCurrency(620000)}</div>
                <div className="text-xs text-red-600 mt-1">↑15% vs budget</div>
              </div>
              <div className="bg-orange-50 rounded p-3">
                <div className="text-xs text-orange-700">Risk Level</div>
                <div className="text-xl font-bold text-orange-900">High</div>
                <div className="text-xs text-orange-600 mt-1">Action required</div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-[#31343A] mb-3">Forecast Breakdown</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-[#DFE2E4]/30 rounded">
                <div>
                  <div className="text-sm font-medium text-[#31343A]">Production Ramp-up (SUV-X1)</div>
                  <div className="text-xs text-[#9DA5A8]">New production line tooling and materials</div>
                </div>
                <div className="text-sm font-semibold text-[#31343A]">{formatCurrency(2500000)}</div>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#DFE2E4]/30 rounded">
                <div>
                  <div className="text-sm font-medium text-[#31343A]">Pending Tooling Approvals</div>
                  <div className="text-xs text-[#9DA5A8]">5 approvals in pipeline</div>
                </div>
                <div className="text-sm font-semibold text-[#31343A]">{formatCurrency(1800000)}</div>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#DFE2E4]/30 rounded">
                <div>
                  <div className="text-sm font-medium text-[#31343A]">Normal Operations</div>
                  <div className="text-xs text-[#9DA5A8]">Regular monthly spend pattern</div>
                </div>
                <div className="text-sm font-semibold text-[#31343A]">{formatCurrency(520000)}</div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-[#31343A] mb-3">Mitigation Options</h4>
            <div className="space-y-2">
              <label className="flex items-start gap-2 p-3 border border-[#DFE2E4] rounded hover:bg-[#DFE2E4]/20 cursor-pointer">
                <input type="radio" name="mitigation" value="reallocate" defaultChecked className="mt-1" />
                <div>
                  <div className="text-sm font-medium text-[#31343A]">Reallocate from underutilized categories</div>
                  <div className="text-xs text-[#9DA5A8]">₹2.5L available from Raw Materials category</div>
                </div>
              </label>
              <label className="flex items-start gap-2 p-3 border border-[#DFE2E4] rounded hover:bg-[#DFE2E4]/20 cursor-pointer">
                <input type="radio" name="mitigation" value="request" className="mt-1" />
                <div>
                  <div className="text-sm font-medium text-[#31343A]">Request Q1 budget increase</div>
                  <div className="text-xs text-[#9DA5A8]">Submit to Finance for approval</div>
                </div>
              </label>
              <label className="flex items-start gap-2 p-3 border border-[#DFE2E4] rounded hover:bg-[#DFE2E4]/20 cursor-pointer">
                <input type="radio" name="mitigation" value="defer" className="mt-1" />
                <div>
                  <div className="text-sm font-medium text-[#31343A]">Defer non-critical tooling</div>
                  <div className="text-xs text-[#9DA5A8]">Delay 2 non-urgent approvals to Q2</div>
                </div>
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-[#DFE2E4]">
            <button
              onClick={() => {
                console.log('Forecast mitigation applied');
                setShowForecastModal(false);
              }}
              className="flex-1 px-4 py-2 bg-[#005691] text-white rounded hover:bg-[#004574] transition-colors text-sm font-medium"
            >
              Apply Mitigation Strategy
            </button>
            <button
              onClick={() => {
                setShowReallocationModal(true);
                setShowForecastModal(false);
              }}
              className="px-4 py-2 border border-[#005691] text-[#005691] rounded hover:bg-[#005691]/10 transition-colors text-sm font-medium"
            >
              Review Reallocation
            </button>
            <button
              onClick={() => setShowForecastModal(false)}
              className="px-4 py-2 border border-[#DFE2E4] text-[#31343A] rounded hover:bg-[#DFE2E4]/30 transition-colors text-sm font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

      {/* Reallocation Review Modal */}
      <Modal
        isOpen={showReallocationModal}
        onClose={() => setShowReallocationModal(false)}
        title="Budget Reallocation Review"
        size="xl"
      >
        <div className="space-y-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-yellow-800 mb-2">Reallocation Recommendation</h3>
            <p className="text-xs text-yellow-700">Electronics budget at 98% while Raw Materials at 72% utilization</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="border border-[#DFE2E4] rounded-lg p-4">
              <h4 className="text-sm font-medium text-[#31343A] mb-3">From: Raw Materials</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#9DA5A8]">Allocated</span>
                  <span className="font-medium text-[#31343A]">{formatCurrency(3800000)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#9DA5A8]">Utilized</span>
                  <span className="font-medium text-[#31343A]">{formatCurrency(2736000)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#9DA5A8]">Available</span>
                  <span className="font-medium text-green-600">{formatCurrency(1064000)}</span>
                </div>
                <div className="mt-2 pt-2 border-t border-[#DFE2E4]">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#9DA5A8]">Utilization</span>
                    <span className="font-semibold text-[#31343A]">72%</span>
                  </div>
                  <div className="w-full h-2 bg-[#DFE2E4]/50 rounded-full overflow-hidden mt-1">
                    <div className="h-2 bg-[#005691] rounded-full" style={{ width: '72%' }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="border border-[#DFE2E4] rounded-lg p-4">
              <h4 className="text-sm font-medium text-[#31343A] mb-3">To: Electronics</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#9DA5A8]">Allocated</span>
                  <span className="font-medium text-[#31343A]">{formatCurrency(3500000)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#9DA5A8]">Utilized</span>
                  <span className="font-medium text-[#31343A]">{formatCurrency(3430000)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#9DA5A8]">Available</span>
                  <span className="font-medium text-red-600">{formatCurrency(70000)}</span>
                </div>
                <div className="mt-2 pt-2 border-t border-[#DFE2E4]">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#9DA5A8]">Utilization</span>
                    <span className="font-semibold text-red-600">98%</span>
                  </div>
                  <div className="w-full h-2 bg-[#DFE2E4]/50 rounded-full overflow-hidden mt-1">
                    <div className="h-2 bg-[#E00420] rounded-full" style={{ width: '98%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-800">Reallocation Amount</span>
              <span className="text-lg font-bold text-blue-900">{formatCurrency(250000)}</span>
            </div>
            <div className="mt-3">
              <label className="block text-xs font-medium text-[#31343A] mb-2">Adjust Amount (₹)</label>
              <input
                type="number"
                defaultValue={250000}
                min={100000}
                max={1064000}
                step={50000}
                className="w-full px-3 py-2 border border-blue-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-[#31343A] mb-3">Reallocation Impact</h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between p-2 bg-[#DFE2E4]/30 rounded">
                <span className="text-[#9DA5A8]">Raw Materials (After)</span>
                <span className="font-medium text-[#31343A]">75% utilized</span>
              </div>
              <div className="flex justify-between p-2 bg-[#DFE2E4]/30 rounded">
                <span className="text-[#9DA5A8]">Electronics (After)</span>
                <span className="font-medium text-[#31343A]">91% utilized</span>
              </div>
              <div className="flex justify-between p-2 bg-green-50 rounded border border-green-200">
                <span className="text-green-700">Status</span>
                <span className="font-semibold text-green-700">Both categories within safe limits</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-[#DFE2E4]">
            <button
              onClick={() => {
                console.log('Reallocation approved');
                setShowReallocationModal(false);
              }}
              className="flex-1 px-4 py-2 bg-[#005691] text-white rounded hover:bg-[#004574] transition-colors text-sm font-medium"
            >
              Approve Reallocation
            </button>
            <button
              onClick={() => {
                setShowForecastModal(true);
                setShowReallocationModal(false);
              }}
              className="px-4 py-2 border border-[#005691] text-[#005691] rounded hover:bg-[#005691]/10 transition-colors text-sm font-medium"
            >
              View Forecast
            </button>
            <button
              onClick={() => setShowReallocationModal(false)}
              className="px-4 py-2 border border-[#DFE2E4] text-[#31343A] rounded hover:bg-[#DFE2E4]/30 transition-colors text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* Quality Escalation Modal */}
      <Modal
        isOpen={showQualityEscalationModal}
        onClose={() => setShowQualityEscalationModal(false)}
        title="PPAP Approval Escalation - Quality"
        size="xl"
      >
        <div className="space-y-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-red-800">Line-Stop Risk Alert</h3>
              <span className="px-2 py-1 bg-[#E00420] text-white rounded-full text-xs font-semibold">Critical</span>
            </div>
            <p className="text-xs text-red-700">3 critical parts pending PPAP approval - Production release blocked</p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-[#31343A] mb-3">Pending PPAP Approvals</h4>
            <div className="space-y-3">
              {allRequests
                .filter(r => r.compliance?.ppapRequired && (r.status === 'pending' || r.status === 'in-review'))
                .slice(0, 3)
                .map((request) => (
                  <div key={request.id} className="border border-[#DFE2E4] rounded-lg p-4 hover:bg-[#DFE2E4]/20 cursor-pointer"
                    onClick={() => {
                      setSelectedRequest(request as ExtendedRequest);
                      setShowQualityEscalationModal(false);
                    }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="text-sm font-medium text-[#31343A]">{request.partNumber || request.id}</div>
                        <div className="text-xs text-[#9DA5A8]">{request.itemName}</div>
                      </div>
                      <StatusBadge status={request.status} />
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs mt-2">
                      <div>
                        <div className="text-[#9DA5A8]">Program</div>
                        <div className="font-medium text-[#31343A]">{request.program || 'N/A'}</div>
                      </div>
                      <div>
                        <div className="text-[#9DA5A8]">Plant</div>
                        <div className="font-medium text-[#31343A]">{request.plant || 'N/A'}</div>
                      </div>
                      <div>
                        <div className="text-[#9DA5A8]">Amount</div>
                        <div className="font-medium text-[#31343A]">{formatCurrency(request.estimatedCost)}</div>
                      </div>
                    </div>
                    {request.requiredBy && (
                      <div className="mt-2 pt-2 border-t border-[#DFE2E4]">
                        <div className="text-xs text-red-600 font-medium">
                          Required By: {formatDate(request.requiredBy)}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-[#31343A] mb-3">Escalation Actions</h4>
            <div className="space-y-2">
              <label className="flex items-start gap-2 p-3 border border-[#DFE2E4] rounded hover:bg-[#DFE2E4]/20 cursor-pointer">
                <input type="checkbox" className="mt-1" defaultChecked />
                <div>
                  <div className="text-sm font-medium text-[#31343A]">Notify Quality Department</div>
                  <div className="text-xs text-[#9DA5A8]">Send escalation email to Quality Head</div>
                </div>
              </label>
              <label className="flex items-start gap-2 p-3 border border-[#DFE2E4] rounded hover:bg-[#DFE2E4]/20 cursor-pointer">
                <input type="checkbox" className="mt-1" defaultChecked />
                <div>
                  <div className="text-sm font-medium text-[#31343A]">Schedule Urgent Review Meeting</div>
                  <div className="text-xs text-[#9DA5A8]">With Quality, Procurement, and Production teams</div>
                </div>
              </label>
              <label className="flex items-start gap-2 p-3 border border-[#DFE2E4] rounded hover:bg-[#DFE2E4]/20 cursor-pointer">
                <input type="checkbox" className="mt-1" />
                <div>
                  <div className="text-sm font-medium text-[#31343A]">Request Expedited PPAP Processing</div>
                  <div className="text-xs text-[#9DA5A8]">Priority queue for PPAP submissions</div>
                </div>
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-[#DFE2E4]">
            <button
              onClick={() => {
                console.log('Quality escalation sent');
                setShowQualityEscalationModal(false);
              }}
              className="flex-1 px-4 py-2 bg-[#E00420] text-white rounded hover:bg-[#C00400] transition-colors text-sm font-medium"
            >
              Escalate to Quality
            </button>
            <button
              onClick={() => {
                const ppapIndents = allRequests.filter(r => 
                  r.compliance?.ppapRequired && (r.status === 'pending' || r.status === 'in-review')
                );
                if (ppapIndents.length > 0) {
                  setSelectedRequest(ppapIndents[0] as ExtendedRequest);
                }
                setShowQualityEscalationModal(false);
              }}
              className="px-4 py-2 border border-[#005691] text-[#005691] rounded hover:bg-[#005691]/10 transition-colors text-sm font-medium"
            >
              View All PPAP Items
            </button>
            <button
              onClick={() => setShowQualityEscalationModal(false)}
              className="px-4 py-2 border border-[#DFE2E4] text-[#31343A] rounded hover:bg-[#DFE2E4]/30 transition-colors text-sm font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

      {/* Shipping Optimization Modal */}
      <Modal
        isOpen={showShippingOptimizationModal}
        onClose={() => setShowShippingOptimizationModal(false)}
        title="Shipping Cost Optimization"
        size="xl"
      >
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-blue-800">Freight Cost Analysis</h3>
              <span className="px-2 py-1 bg-orange-500 text-white rounded-full text-xs font-semibold">Medium Priority</span>
            </div>
            <p className="text-xs text-blue-700">Expedited freight for line-stop prevention increasing logistics costs</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="border border-[#DFE2E4] rounded-lg p-4">
              <div className="text-xs text-[#9DA5A8] mb-1">Current Month</div>
              <div className="text-2xl font-bold text-[#31343A]">{formatCurrency(850000)}</div>
              <div className="text-xs text-red-600 mt-1">↑20% vs plan</div>
            </div>
            <div className="border border-[#DFE2E4] rounded-lg p-4">
              <div className="text-xs text-[#9DA5A8] mb-1">Budgeted</div>
              <div className="text-2xl font-bold text-[#31343A]">{formatCurrency(710000)}</div>
              <div className="text-xs text-[#9DA5A8] mt-1">Monthly target</div>
            </div>
            <div className="border border-[#DFE2E4] rounded-lg p-4">
              <div className="text-xs text-[#9DA5A8] mb-1">Over Budget</div>
              <div className="text-xl font-bold text-red-600">{formatCurrency(140000)}</div>
              <div className="text-xs text-red-600 mt-1">Requires action</div>
            </div>
            <div className="border border-[#DFE2E4] rounded-lg p-4">
              <div className="text-xs text-[#9DA5A8] mb-1">Expedited Shipments</div>
              <div className="text-xl font-bold text-orange-600">12</div>
              <div className="text-xs text-[#9DA5A8] mt-1">This month</div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-[#31343A] mb-3">Cost Breakdown</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-[#DFE2E4]/30 rounded">
                <div>
                  <div className="text-sm font-medium text-[#31343A]">Expedited Freight Charges</div>
                  <div className="text-xs text-[#9DA5A8]">12 urgent shipments</div>
                </div>
                <div className="text-sm font-semibold text-orange-600">{formatCurrency(280000)}</div>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#DFE2E4]/30 rounded">
                <div>
                  <div className="text-sm font-medium text-[#31343A]">Standard Shipping</div>
                  <div className="text-xs text-[#9DA5A8]">Regular deliveries</div>
                </div>
                <div className="text-sm font-semibold text-[#31343A]">{formatCurrency(570000)}</div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-[#31343A] mb-3">Optimization Recommendations</h4>
            <div className="space-y-2">
              <label className="flex items-start gap-2 p-3 border border-[#DFE2E4] rounded hover:bg-[#DFE2E4]/20 cursor-pointer">
                <input type="checkbox" className="mt-1" defaultChecked />
                <div>
                  <div className="text-sm font-medium text-[#31343A]">Consolidate shipments from same vendor</div>
                  <div className="text-xs text-[#9DA5A8]">Save ~₹45,000/month by combining orders</div>
                </div>
              </label>
              <label className="flex items-start gap-2 p-3 border border-[#DFE2E4] rounded hover:bg-[#DFE2E4]/20 cursor-pointer">
                <input type="checkbox" className="mt-1" defaultChecked />
                <div>
                  <div className="text-sm font-medium text-[#31343A]">Use preferred logistics partners</div>
                  <div className="text-xs text-[#9DA5A8]">Volume discounts available - save ~₹30,000/month</div>
                </div>
              </label>
              <label className="flex items-start gap-2 p-3 border border-[#DFE2E4] rounded hover:bg-[#DFE2E4]/20 cursor-pointer">
                <input type="checkbox" className="mt-1" />
                <div>
                  <div className="text-sm font-medium text-[#31343A]">Review expedited shipment necessity</div>
                  <div className="text-xs text-[#9DA5A8]">4 shipments could use standard shipping</div>
                </div>
              </label>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-green-800">Potential Monthly Savings</span>
              <span className="text-xl font-bold text-green-900">{formatCurrency(75000)}</span>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-[#DFE2E4]">
            <button
              onClick={() => {
                console.log('Shipping optimizations applied');
                setShowShippingOptimizationModal(false);
              }}
              className="flex-1 px-4 py-2 bg-[#005691] text-white rounded hover:bg-[#004574] transition-colors text-sm font-medium"
            >
              Apply Optimizations
            </button>
            <button
              onClick={() => {
                const logisticsIndents = allRequests.filter(r => 
                  r.category === 'Logistics' || r.subcategory?.toLowerCase().includes('freight')
                );
                if (logisticsIndents.length > 0) {
                  setSelectedRequest(logisticsIndents[0] as ExtendedRequest);
                }
                setShowShippingOptimizationModal(false);
              }}
              className="px-4 py-2 border border-[#005691] text-[#005691] rounded hover:bg-[#005691]/10 transition-colors text-sm font-medium"
            >
              View Logistics Indents
            </button>
            <button
              onClick={() => setShowShippingOptimizationModal(false)}
              className="px-4 py-2 border border-[#DFE2E4] text-[#31343A] rounded hover:bg-[#DFE2E4]/30 transition-colors text-sm font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

      {/* Budget Review Modal (from Alerts) */}
      <Modal
        isOpen={showBudgetReviewModal}
        onClose={() => setShowBudgetReviewModal(false)}
        title="Budget Review - Tooling Category Overrun"
        size="xl"
        zIndex={1000}
      >
        <div className="space-y-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-red-800">Over Budget Alert</h3>
              <span className="px-2 py-1 bg-[#E00420] text-white rounded-full text-xs font-semibold">Critical</span>
            </div>
            <p className="text-xs text-red-700 mb-2">Tooling budget overrun due to new mold approvals for SUV-X1</p>
            <div className="grid grid-cols-3 gap-3 mt-3">
              <div className="bg-white rounded p-2">
                <div className="text-xs text-[#9DA5A8]">Current</div>
                <div className="text-lg font-bold text-[#31343A]">{formatCurrency(2420000)}</div>
              </div>
              <div className="bg-white rounded p-2">
                <div className="text-xs text-[#9DA5A8]">Allocated</div>
                <div className="text-lg font-bold text-[#31343A]">{formatCurrency(2000000)}</div>
              </div>
              <div className="bg-white rounded p-2">
                <div className="text-xs text-[#9DA5A8]">Overrun</div>
                <div className="text-lg font-bold text-red-600">{formatCurrency(420000)}</div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-[#31343A] mb-3">Budget Details</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-[#DFE2E4]/30 rounded">
                <span className="text-sm text-[#31343A]">Category</span>
                <span className="text-sm font-semibold text-[#31343A]">Tooling</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#DFE2E4]/30 rounded">
                <span className="text-sm text-[#31343A]">Utilization</span>
                <span className="text-sm font-semibold text-red-600">121%</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#DFE2E4]/30 rounded">
                <span className="text-sm text-[#31343A]">Status</span>
                <span className="px-2 py-1 bg-[#E00420]/10 text-[#E00420] rounded-full text-xs font-semibold">Requires CFO Approval</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-[#31343A] mb-3">Recommended Actions</h4>
            <div className="space-y-2">
              <label className="flex items-start gap-2 p-3 border border-[#DFE2E4] rounded hover:bg-[#DFE2E4]/20 cursor-pointer">
                <input type="checkbox" className="mt-1" defaultChecked />
                <div>
                  <div className="text-sm font-medium text-[#31343A]">Request budget increase approval</div>
                  <div className="text-xs text-[#9DA5A8]">Submit to CFO for authorization</div>
                </div>
              </label>
              <label className="flex items-start gap-2 p-3 border border-[#DFE2E4] rounded hover:bg-[#DFE2E4]/20 cursor-pointer">
                <input type="checkbox" className="mt-1" />
                <div>
                  <div className="text-sm font-medium text-[#31343A]">Review reallocation options</div>
                  <div className="text-xs text-[#9DA5A8]">Explore budget transfer from other categories</div>
                </div>
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-[#DFE2E4]">
            <button
              onClick={() => {
                console.log('Budget review actions applied');
                setShowBudgetReviewModal(false);
              }}
              className="flex-1 px-4 py-2 bg-[#005691] text-white rounded hover:bg-[#004574] transition-colors text-sm font-medium"
            >
              Submit for Approval
            </button>
            <button
              onClick={() => {
                setShowReallocationModal(true);
                setShowBudgetReviewModal(false);
              }}
              className="px-4 py-2 border border-[#005691] text-[#005691] rounded hover:bg-[#005691]/10 transition-colors text-sm font-medium"
            >
              Review Reallocation
            </button>
            <button
              onClick={() => setShowBudgetReviewModal(false)}
              className="px-4 py-2 border border-[#DFE2E4] text-[#31343A] rounded hover:bg-[#DFE2E4]/30 transition-colors text-sm font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

      {/* Escalation Modal (from Alerts) */}
      <Modal
        isOpen={showEscalationModal}
        onClose={() => setShowEscalationModal(false)}
        title="Critical Indents Escalation"
        size="xl"
        zIndex={1000}
      >
        <div className="space-y-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-red-800">Line-Stop Risk</h3>
              <span className="px-2 py-1 bg-[#E00420] text-white rounded-full text-xs font-semibold">Critical</span>
            </div>
            <p className="text-xs text-red-700">3 indents pending {'>'} 7 days - Production impact if delayed further</p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-[#31343A] mb-3">Critical Pending Indents</h4>
            <div className="space-y-3">
              {allRequests
                .filter(r => 
                  r.urgency === 'critical' && 
                  (r.status === 'pending' || r.status === 'in-review') &&
                  (r.indentAge || 0) > 7
                )
                .slice(0, 3)
                .map((request) => (
                  <div key={request.id} className="border border-[#DFE2E4] rounded-lg p-4 hover:bg-[#DFE2E4]/20 cursor-pointer"
                    onClick={() => {
                      setSelectedRequest(request as ExtendedRequest);
                      setShowEscalationModal(false);
                    }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="text-sm font-medium text-[#31343A]">{request.partNumber || request.id}</div>
                        <div className="text-xs text-[#9DA5A8]">{request.itemName}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={request.status} />
                        <StatusBadge status={request.urgency} />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs mt-2">
                      <div>
                        <div className="text-[#9DA5A8]">Age</div>
                        <div className="font-medium text-red-600">{request.indentAge || 0} days</div>
                      </div>
                      <div>
                        <div className="text-[#9DA5A8]">Amount</div>
                        <div className="font-medium text-[#31343A]">{formatCurrency(request.estimatedCost)}</div>
                      </div>
                      <div>
                        <div className="text-[#9DA5A8]">Required By</div>
                        <div className="font-medium text-[#31343A]">{request.requiredBy ? formatDate(request.requiredBy) : 'N/A'}</div>
                      </div>
                    </div>
                    {request.riskReason && (
                      <div className="mt-2 pt-2 border-t border-[#DFE2E4]">
                        <div className="text-xs text-red-600">{request.riskReason}</div>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-[#31343A] mb-3">Escalation Actions</h4>
            <div className="space-y-2">
              <label className="flex items-start gap-2 p-3 border border-[#DFE2E4] rounded hover:bg-[#DFE2E4]/20 cursor-pointer">
                <input type="checkbox" className="mt-1" defaultChecked />
                <div>
                  <div className="text-sm font-medium text-[#31343A]">Notify Procurement Head</div>
                  <div className="text-xs text-[#9DA5A8]">Send urgent escalation notification</div>
                </div>
              </label>
              <label className="flex items-start gap-2 p-3 border border-[#DFE2E4] rounded hover:bg-[#DFE2E4]/20 cursor-pointer">
                <input type="checkbox" className="mt-1" defaultChecked />
                <div>
                  <div className="text-sm font-medium text-[#31343A]">Expedite Approval Process</div>
                  <div className="text-xs text-[#9DA5A8]">Move to priority queue for immediate review</div>
                </div>
              </label>
              <label className="flex items-start gap-2 p-3 border border-[#DFE2E4] rounded hover:bg-[#DFE2E4]/20 cursor-pointer">
                <input type="checkbox" className="mt-1" />
                <div>
                  <div className="text-sm font-medium text-[#31343A]">Notify Production Team</div>
                  <div className="text-xs text-[#9DA5A8]">Alert about potential line-stop risk</div>
                </div>
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-[#DFE2E4]">
            <button
              onClick={() => {
                console.log('Escalation sent');
                setShowEscalationModal(false);
              }}
              className="flex-1 px-4 py-2 bg-[#E00420] text-white rounded hover:bg-[#C00400] transition-colors text-sm font-medium"
            >
              Escalate Now
            </button>
            <button
              onClick={() => {
                const criticalIndents = allRequests.filter(r => 
                  r.urgency === 'critical' && 
                  (r.status === 'pending' || r.status === 'in-review') &&
                  (r.indentAge || 0) > 7
                );
                if (criticalIndents.length > 0) {
                  setSelectedRequest(criticalIndents[0] as ExtendedRequest);
                }
                setShowEscalationModal(false);
              }}
              className="px-4 py-2 border border-[#005691] text-[#005691] rounded hover:bg-[#005691]/10 transition-colors text-sm font-medium"
            >
              View All Critical Indents
            </button>
            <button
              onClick={() => setShowEscalationModal(false)}
              className="px-4 py-2 border border-[#DFE2E4] text-[#31343A] rounded hover:bg-[#DFE2E4]/30 transition-colors text-sm font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

      {/* RFQ Comparison Modal */}
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
            console.log('Quote selected:', vendorId);
            setIsRFQComparisonModalOpen(false);
            setSelectedRFQForComparison(null);
          }}
        />
      )}
    </DashboardLayout>
  );
}
