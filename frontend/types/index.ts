export type UserRole = 'department-manager' | 'procurement-manager' | 'cfo';

export type BudgetStatus = 'under-budget' | 'over-budget' | 'pending-allocation';

export type RequestStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'in-review' | 'vendor-sourcing' | 'po-issued';

export type RequestSource = 'email' | 'sap' | 'form';

export type UrgencyLevel = 'low' | 'medium' | 'high' | 'critical';

export type VendorCategory = 'software' | 'hardware' | 'materials' | 'logistics' | 'services';

export interface Request {
  id: string;
  itemName: string;
  quantity: number;
  estimatedCost: number;
  businessJustification: string;
  urgency: UrgencyLevel;
  status: RequestStatus;
  budgetStatus: BudgetStatus;
  source: RequestSource;
  requester: string;
  department: string;
  assignedProcurementManager?: string;
  expectedTimeline?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Vendor {
  id: string;
  name: string;
  category: VendorCategory;
  status: 'active' | 'inactive' | 'pending';
  activeContracts: number;
  performanceRating: number;
  totalSpend: number;
}

export interface Contract {
  id: string;
  name: string;
  vendor: string;
  vendorId: string;
  value: number;
  status: 'draft' | 'under-review' | 'executed' | 'expired';
  startDate: string;
  endDate: string;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  vendor: string;
  vendorId: string;
  amount: number;
  status: 'pending' | 'approved' | 'delivered' | 'cancelled';
  createdAt: string;
  assignedTo: string;
}

export interface KPICard {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: string;
}

export interface ActionQueueItem {
  id: string;
  type: 'validation' | 'rfq-reminder' | 'contract-renewal' | 'approval';
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  dueDate?: string;
  entityType: string;
}

export interface EnhancedRequest extends Request {
  validationStatus: 'pending' | 'validated' | 'rejected';
  indentAge: number;
  requiredDate: string;
}

export interface EnhancedVendor extends Vendor {
  onTimeDeliveryPercent: number;
  qualityPercent: number;
  avgLeadTimeDays: number;
  healthStatus: 'green' | 'amber' | 'red';
  healthScore: number;
}

export interface EnhancedContract extends Contract {
  utilizedPercent: number;
  daysToExpiry?: number;
}

export interface EnhancedPurchaseOrder extends PurchaseOrder {
  grnStatus: string;
  invoiceStatus: string;
  age: number;
  costCenter: string;
  budgetCode: string;
  dueDeliveryDate?: string;
}

export interface RFQ {
  id: string;
  rfqNumber: string;
  itemName: string;
  category: string;
  suppliersInvited: number;
  suppliersResponded: number;
  lowestQuote: number;
  dueDate: string;
  status: 'draft' | 'sent' | 'quotes-received' | 'closed';
  quoteVariance?: number;
}

// Base approval structure
export interface ApprovalBase {
  id: string;
  approvalType: 'INDENT' | 'QUOTE' | 'PO';
  referenceId: string;           // REQ-xxx | RFQ-xxx | PO-xxx
  referenceNumber?: string;
  title: string;                 // short summary for the card/table
  value?: number;                // currency where relevant
  approverLevel: 'L1' | 'L2' | 'Head' | 'CFO';
  submittedAt: string;           // ISO
  slaTargetHours: number;
  slaElapsedHours?: number;
  status: 'pending' | 'approved' | 'rejected' | 'sent-back' | 'on-hold';
  requester?: string;            // who raised it
  attachments?: Array<{name: string, url?: string, type?: string}>;
}

// 1) Indent approval: focus on business need & budget alignment
export interface IndentApproval extends ApprovalBase {
  approvalType: 'INDENT';
  dept: string;
  itemName: string;
  quantity: number;
  estimatedCost: number;
  budgetHead?: string;
  budgetStatus: 'under-budget' | 'over-budget' | 'pending-allocation';
  urgency: 'critical' | 'high' | 'medium' | 'low';
  blockerReason?: 'missing-spec' | 'budget' | 'approval' | 'vendor-shortlist';
}

// 2) Vendor quote approval: choosing a quote
export interface QuoteApproval extends ApprovalBase {
  approvalType: 'QUOTE';
  rfqId: string;                 // RFQ-xxx
  itemName: string;
  suppliers: Array<{
    vendorId: string;
    vendorName: string;
    quoteAmount: number;
    leadTimeDays?: number;
    onTimePct?: number;
    qualityScore?: number;
  }>;
  recommendedVendorId: string;   // AI/Buyer recommendation
  quoteVariancePct?: number;
}

// 3) PO approval: final commercial control
export interface POApproval extends ApprovalBase {
  approvalType: 'PO';
  poId: string;                  // PO-xxx
  vendorId: string;
  vendorName: string;
  amount: number;
  costCenter?: string;
  budgetCode?: string;
  grnStatus?: 'pending' | 'received';
  invoiceStatus?: 'pending' | 'received';
  isOffContract?: boolean;       // vendor not in executed contracts
}

// Union type for all approvals
export type EnhancedApproval = IndentApproval | QuoteApproval | POApproval;

// Legacy Approval interface (for backward compatibility during migration)
export interface Approval {
  id: string;
  type: string;
  referenceNumber: string;
  value: number;
  status: 'pending' | 'approved' | 'rejected';
  age: number;
  approverLevel: number;
  slaTarget: number;
  slaActual?: number;
}

export interface ActivityFeedItem {
  id: string;
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  timestamp: string;
  actionLabel?: string;
}


