'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { KPICard } from '@/components/ui/KPICard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Drawer } from '@/components/ui/Drawer';
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
import { FileText, TrendingUp, Clock, AlertTriangle, Search, Filter, X, BarChart3, PieChart as PieChartIcon, List, Grid, LayoutGrid, Download, FileDown } from 'lucide-react';
import { mockRequests, mockActivityFeed } from '@/lib/mockData';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils';
import { Request } from '@/types';
import { MultiLineChart } from '@/components/charts/MultiLineChart';
import { BarChart } from '@/components/charts/BarChart';
import { PieChart } from '@/components/charts/PieChart';

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
const DEPARTMENT_CONFIG = AUTOMOTIVE_DEPARTMENTS[0];
const DEPARTMENT_BUDGET_CODE = DEPARTMENT_CONFIG.code;
const DEPARTMENT_NAME = DEPARTMENT_CONFIG.name;

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
  
  // Enhance requests with comprehensive automotive-specific data
  const allRequests: ExtendedRequest[] = baseRequests.map((r, idx) => {
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

  // Automotive-specific Smart Insights
  const smartInsights = useMemo(() => [
    {
      id: 'insight-1',
      type: 'anomaly' as const,
      title: 'Tooling spend spike detected — Chassis Tooling up 65%',
      description: 'Chassis Tooling category shows 65% increase vs last month. Current: ₹12.5L vs avg ₹7.6L. New program SUV-X1 tooling ramp-up.',
      priority: 'high' as const,
      actionLabel: 'Review Tooling Budget',
    },
    {
      id: 'insight-2',
      type: 'forecast' as const,
      title: 'Q1 Forecast: Expected spend ₹48.2L (↑15% vs budget)',
      description: 'Based on production ramp-up for SUV-X1 and pending tooling approvals, Q1 spend projected 15% over allocated budget.',
      priority: 'high' as const,
      actionLabel: 'View Forecast Details',
    },
    {
      id: 'insight-3',
      type: 'suggestion' as const,
      title: 'Reallocate ₹2.5L from Raw Materials to Electronics',
      description: 'Electronics budget at 98% (ECU sensors spike) while Raw Materials at 72%. Reallocation recommended to avoid budget cap.',
      priority: 'medium' as const,
      actionLabel: 'Review Reallocation',
    },
    {
      id: 'insight-4',
      type: 'alert' as const,
      title: 'Line-stop risk: 3 critical parts pending PPAP approval',
      description: 'PN-ENG-BRG-6205, PN-CHS-STL-1.2MM, PN-TOOL-MLD-TL-102 require PPAP completion before production release.',
      priority: 'high' as const,
      actionLabel: 'Escalate to Quality',
    },
    {
      id: 'insight-5',
      type: 'forecast' as const,
      title: 'Freight costs trending 20% above plan',
      description: 'Expedited freight for line-stop prevention increasing logistics costs. Current: ₹8.5L vs budget ₹7.1L for month.',
      priority: 'medium' as const,
      actionLabel: 'Optimize Shipping',
    },
  ], []);

  // Automotive-specific Alerts
  const alerts = useMemo(() => [
    {
      id: 'alert-1',
      type: 'over-budget' as const,
      title: 'Over Budget: Tooling category exceeded by ₹4.2L',
      description: 'Tooling budget overrun due to new mold approvals for SUV-X1. Current: ₹24.2L vs allocated ₹20L. Requires CFO approval.',
      timestamp: new Date().toISOString(),
      priority: 'critical' as const,
      actionLabel: 'Review Budget',
    },
    {
      id: 'alert-2',
      type: 'pending-approval' as const,
      title: 'Critical: 3 indents pending > 7 days — Line-stop risk',
      description: 'PN-ENG-BRG-6205, PN-CHS-STL-1.2MM, PN-ELEC-O2-SEN pending approval. Production impact if delayed further.',
      timestamp: new Date(Date.now() - 86400000 * 8).toISOString(),
      priority: 'critical' as const,
      actionLabel: 'Escalate Now',
    },
    {
      id: 'alert-3',
      type: 'new-indent' as const,
      title: 'New Indent from SAP: IND-2305-PROD',
      description: 'Received via SAP for Engine Bearings (PN-ENG-BRG-6205). Amount: ₹8,75,000. Plant: PLT-01, Program: SUV-X1.',
      timestamp: new Date().toISOString(),
      priority: 'high' as const,
      actionLabel: 'View Indent',
    },
    {
      id: 'alert-4',
      type: 'budget-revision' as const,
      title: 'Budget Revision Approved',
      description: 'Q1 Tooling budget increased by ₹5L to ₹25L. Allocation effective immediately. Updated by Finance Head.',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      priority: 'medium' as const,
      actionLabel: 'View Allocation',
    },
    {
      id: 'alert-5',
      type: 'deadline' as const,
      title: 'PPAP Submission Deadline: TL-102 in 3 days',
      description: 'Tooling TL-102 (Sigma Mold) requires PPAP submission by Jan 25. Delayed submission blocks production release.',
      timestamp: new Date().toISOString(),
      priority: 'high' as const,
      actionLabel: 'Follow Up',
    },
  ], []);
  
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

  // Filter requests for Request Approval (pending/in-review from team)
  const requestsPendingApproval = useMemo(() => {
    return allRequests.filter(request => 
      (request.status === 'pending' || request.status === 'in-review') &&
      request.department === DEPARTMENT_NAME
    );
  }, [allRequests]);

  // Filter requests for PO Approval
  const requestsPendingPOApproval = useMemo(() => {
    return allRequests.filter(request => 
      request.status === 'approved' && request.department === DEPARTMENT_NAME
    );
  }, [allRequests]);

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
  const monthlyTrendData = [
    { month: 'Jan', indents: 12, spend: 850000 },
    { month: 'Feb', indents: 15, spend: 920000 },
    { month: 'Mar', indents: 18, spend: 1100000 },
    { month: 'Apr', indents: 14, spend: 980000 },
  ];

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
    console.log(`Exporting to ${format}...`);
    // TODO: Implement export functionality
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

        {/* Budget Summary Tiles */}
        <BudgetSummaryTiles
          totalBudget={allocatedBudget}
          utilized={committed}
          remaining={available}
          onBudgetPercent={(committed / allocatedBudget) * 100}
          activeIndents={totalIndents}
          avgApprovalTime={avgApprovalTime}
        />

        {/* Spend vs Budget Graph */}
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

                {/* My Actions Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-[#DFE2E4]">
                    <thead className="bg-[#DFE2E4]/30">
                      <tr>
                        <th className="px-3 py-3 text-left text-xs font-medium text-[#9DA5A8] uppercase tracking-wider">Request ID</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-[#9DA5A8] uppercase tracking-wider">Date Raised</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-[#9DA5A8] uppercase tracking-wider">Requester</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-[#9DA5A8] uppercase tracking-wider">Category</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-[#9DA5A8] uppercase tracking-wider">Subcategory</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-[#9DA5A8] uppercase tracking-wider">Item Description</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-[#9DA5A8] uppercase tracking-wider">Budget Code</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-[#9DA5A8] uppercase tracking-wider">Total Budget</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-[#9DA5A8] uppercase tracking-wider">Spent So Far</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-[#9DA5A8] uppercase tracking-wider">Requested Amount</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-[#9DA5A8] uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-[#DFE2E4]">
                      {filteredRequests.length > 0 ? (
                        filteredRequests.map((request) => {
                          const budgetInfo = getCategoryBudgetInfo(request.category);
                          return (
                            <tr 
                              key={request.id} 
                              className="hover:bg-[#DFE2E4]/30 cursor-pointer"
                              onClick={() => setSelectedRequest(request)}
                            >
                              <td className="px-3 py-4 whitespace-nowrap text-xs font-medium text-[#005691]">{request.id}</td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-[#31343A]">
                                {new Date(request.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-[#31343A]">{request.requester}</td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-[#31343A]">{request.category || '—'}</td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-[#31343A]">{request.subcategory || '—'}</td>
                              <td className="px-4 py-4 text-sm text-[#31343A]">{request.itemName}</td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-[#005691]">{budgetInfo.code}</td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-[#31343A]">{formatCurrency(budgetInfo.total)}</td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-[#31343A]">
                                {formatCurrency(budgetInfo.spent)}
                                <span className="ml-2 text-xs text-[#9DA5A8]">
                                  ({((budgetInfo.spent / budgetInfo.total) * 100).toFixed(1)}%)
                                </span>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-[#31343A]">{formatCurrency(request.estimatedCost)}</td>
                              <td className="px-4 py-4 whitespace-nowrap">
                            <StatusBadge status={request.status} />
                          </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={11} className="px-6 py-8 text-center text-sm text-[#9DA5A8]">
                            No {actionTab === 'request-approval' ? 'requests pending approval' : 'POs pending approval'} found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
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
                
                {/* Budget Status Summary */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-xs text-green-700 mb-1">Under Budget</p>
                    <p className="text-2xl font-semibold text-green-800">{underBudgetCount}</p>
                  </div>
                <div className="bg-[#E00420]/10 border border-[#E00420]/20 rounded-lg p-4">
                    <p className="text-xs text-[#E00420] mb-1">Over Budget</p>
                    <p className="text-2xl font-semibold text-[#E00420]">{overBudgetCount}</p>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <p className="text-xs text-amber-700 mb-1">On Budget / Pending</p>
                    <p className="text-2xl font-semibold text-amber-800">{onBudgetCount}</p>
                  </div>
                </div>

                {/* Category Spend Chart */}
                <div className="bg-white border border-[#DFE2E4] rounded-lg p-6">
                  <h4 className="text-sm font-medium text-[#31343A] mb-4">Spend by Category</h4>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <BarChart 
                        data={categorySpendData.map(d => ({ name: d.name, value: d.value / 1000 }))}
                        dataKey="value"
                        nameKey="name"
                        name="Spend (thousands)"
                      />
                    </div>
                    <div>
                      <PieChart data={categorySpendData} />
                    </div>
                  </div>
                  </div>

                {/* Per-Category Budget Table */}
                <div className="bg-white border border-[#DFE2E4] rounded-lg overflow-hidden">
                  <div className="p-4 border-b border-[#DFE2E4]">
                    <h4 className="text-sm font-medium text-[#31343A]">Budget by Category & Subcategory</h4>
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
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-[#DFE2E4]">
                        {budgetCategoryData.map(c => {
                          const utilization = (c.comm / c.alloc) * 100;
                          return (
                            <tr key={c.cat} className="hover:bg-[#DFE2E4]/30">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#31343A]">{c.cat}</td>
                              <td className="px-6 py-4 text-sm text-[#31343A]">
                                {c.subcategories.length > 0 ? c.subcategories.join(', ') : '—'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-[#31343A]">{formatCurrency(c.alloc)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-[#31343A]">{formatCurrency(c.comm)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-[#31343A]">{formatCurrency(c.alloc - c.comm)}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <div className="flex-1 h-2 bg-[#DFE2E4]/50 rounded-full overflow-hidden">
                                    <div 
                                      className={`h-2 rounded-full transition-all ${
                                        utilization > 90 ? 'bg-[#E00420]' : utilization > 75 ? 'bg-yellow-500' : 'bg-[#005691]'
                                      }`}
                                      style={{ width: `${Math.min(utilization, 100)}%` }}
                                    ></div>
                  </div>
                                  <span className="text-xs text-[#31343A] w-12 text-right">{utilization.toFixed(1)}%</span>
              </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Analytics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-[#DFE2E4]/30 rounded-lg p-4">
                    <p className="text-sm text-[#9DA5A8]">Average Processing Time</p>
                    <p className="text-2xl font-semibold text-[#31343A] mt-1">5.2 days</p>
                  </div>
                  <div className="bg-[#DFE2E4]/30 rounded-lg p-4">
                    <p className="text-sm text-[#9DA5A8]">Approval Rate</p>
                    <p className="text-2xl font-semibold text-[#31343A] mt-1">{approvalRate}%</p>
                  </div>
                  <div className="bg-[#DFE2E4]/30 rounded-lg p-4">
                    <p className="text-sm text-[#9DA5A8]">Average Spend per Indent</p>
                    <p className="text-2xl font-semibold text-[#31343A] mt-1">
                      {allRequests.length > 0 ? formatCurrency(allRequests.reduce((a, b) => a + b.estimatedCost, 0) / allRequests.length) : '₹0'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-[#31343A]">Analytics & Insights</h3>

                {/* Automotive Monthly Trends */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white border border-[#DFE2E4] rounded-lg p-6">
                    <h4 className="text-sm font-medium text-[#31343A] mb-4">Monthly Indent Trends (By Plant)</h4>
                    <BarChart
                      data={monthlyTrendData}
                      dataKey="indents"
                      nameKey="month"
                      name="Indents"
                    />
                  </div>
                  <div className="bg-white border border-[#DFE2E4] rounded-lg p-6">
                    <h4 className="text-sm font-medium text-[#31343A] mb-4">Monthly Spend by Cost Type</h4>
                    <BarChart
                      data={monthlyTrendData.map(d => ({ ...d, spend: d.spend / 1000 }))}
                      dataKey="spend"
                      nameKey="month"
                      name="Spend (thousands)"
                    />
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

            {activeTab === 'notifications' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-[#31343A]">Notifications & Activity Feed</h3>
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {mockActivityFeed.map((activity) => (
                    <div 
                      key={activity.id} 
                      className={`border rounded-lg p-4 ${
                        activity.priority === 'critical' ? 'bg-[#E00420]/10 border-[#E00420]/20' :
                        activity.priority === 'high' ? 'bg-orange-50 border-orange-200' :
                        activity.priority === 'medium' ? 'bg-yellow-50 border-yellow-200' :
                        'bg-[#DFE2E4]/30 border-[#DFE2E4]'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${
                          activity.priority === 'critical' ? 'bg-[#E00420]' : 
                          activity.priority === 'high' ? 'bg-orange-500' : 
                          activity.priority === 'medium' ? 'bg-yellow-500' : 
                          'bg-[#9DA5A8]'
                        }`} />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm font-medium text-[#31343A]">{activity.title}</p>
                            <span className="text-xs text-[#9DA5A8]">{formatDateTime(activity.timestamp)}</span>
                          </div>
                          <p className="text-xs text-[#9DA5A8] mt-1">{activity.description}</p>
                          {activity.actionLabel && (
                            <button className="text-xs px-2 py-1 bg-[#005691] text-white rounded hover:bg-[#004574] mt-2">
                              {activity.actionLabel}
                            </button>
                          )}
                        </div>
                  </div>
                  </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Indent Detail Drawer with Workflow */}
      {selectedRequest && (
        <Drawer
          isOpen={!!selectedRequest}
          onClose={() => setSelectedRequest(null)}
          title={`Indent ${selectedRequest.id}`}
          width="xl"
        >
          <div className="space-y-6">
            <IndentDetail
              request={selectedRequest}
              allocatedBudget={allocatedBudget}
              committedAmount={committed}
              availableAmount={available}
            />
            {selectedRequest.workflowStages && selectedRequest.workflowStages.length > 0 ? (
              <ApprovalWorkflowMap
                indentId={selectedRequest.id}
                stages={selectedRequest.workflowStages}
                onStageClick={(stageId) => console.log('Stage clicked', stageId)}
              />
            ) : null}
          </div>
        </Drawer>
      )}
    </DashboardLayout>
  );
}
