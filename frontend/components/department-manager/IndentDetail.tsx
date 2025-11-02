'use client';

import { Request } from '@/types';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatCurrency, formatDate } from '@/lib/utils';

interface ExtendedRequest extends Request {
  plant?: string;
  program?: string;
  partNumber?: string;
  commodity?: string;
  category?: string;
  subcategory?: string;
  compliance?: {
    iatfSupplier?: boolean;
    ppapRequired?: boolean;
    imdsRequired?: boolean;
  };
  lineStopRisk?: boolean;
  riskReason?: string;
  requiredBy?: string;
}

interface ApprovalHistoryItem {
  id: string;
  approver: string;
  role: string;
  action: 'approved' | 'rejected' | 'sent-back' | 'escalated';
  timestamp: string;
  notes?: string;
}

interface IndentDetailProps {
  request: ExtendedRequest;
  allocatedBudget?: number;
  committedAmount?: number;
  availableAmount?: number;
  onApprove?: (requestId: string) => void;
  onReject?: (requestId: string) => void;
}

// Mock approval history - in real app, this would come from API
const getApprovalHistory = (request: ExtendedRequest): ApprovalHistoryItem[] => {
  const history: ApprovalHistoryItem[] = [];
  
  if (request.status === 'approved' || request.status === 'po-issued') {
    history.push({
      id: 'app-1',
      approver: 'John Doe',
      role: 'Department Manager',
      action: 'approved',
      timestamp: request.updatedAt || request.createdAt,
      notes: 'Approved as per quarterly budget allocation',
    });
  }
  
  if (request.status === 'rejected') {
    history.push({
      id: 'app-2',
      approver: 'Jane Smith',
      role: 'Procurement Manager',
      action: 'rejected',
      timestamp: request.updatedAt || request.createdAt,
      notes: 'Budget exceeded for this category',
    });
  }
  
  history.push({
    id: 'app-3',
    approver: request.requester,
    role: 'Requester',
    action: 'sent-back',
    timestamp: request.createdAt,
    notes: 'Submitted for review',
  });
  
  return history.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export function IndentDetail({ 
  request, 
  allocatedBudget = 2000000,
  committedAmount = 1450000,
  availableAmount = 230000,
  onApprove,
  onReject
}: IndentDetailProps) {
  const utilizationPercent = allocatedBudget > 0 ? (committedAmount / allocatedBudget) * 100 : 0;
  const approvalHistory = getApprovalHistory(request);

  const getSourceLabel = (source: string) => {
    switch (source) {
      case 'sap': return 'SAP System';
      case 'email': return 'Email';
      case 'form': return 'Manual Form';
      default: return source;
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'approved': return 'Approved';
      case 'rejected': return 'Rejected';
      case 'sent-back': return 'Sent Back';
      case 'escalated': return 'Escalated';
      default: return action;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-[#E00420]/10 text-[#E00420] border-[#E00420]/20';
      case 'sent-back': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'escalated': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-[#DFE2E4] text-[#31343A] border-[#B6BBBE]';
    }
  };

  return (
    <div className="space-y-6">
      {/* Budget Snapshot */}
      <div className="bg-[#DFE2E4]/30 rounded-lg p-4 border border-[#DFE2E4]">
        <h3 className="text-sm font-semibold text-[#31343A] mb-3">Budget Snapshot</h3>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <p className="text-xs text-[#9DA5A8]">Total Budget</p>
            <p className="text-lg font-semibold text-[#31343A] mt-1">{formatCurrency(allocatedBudget)}</p>
          </div>
          <div>
            <p className="text-xs text-[#9DA5A8]">Utilized</p>
            <p className="text-lg font-semibold text-[#31343A] mt-1">{formatCurrency(committedAmount)}</p>
            <p className="text-xs text-[#9DA5A8] mt-1">{utilizationPercent.toFixed(1)}% utilized</p>
          </div>
          <div>
            <p className="text-xs text-[#9DA5A8]">After Approval</p>
            <p className="text-lg font-semibold text-[#31343A] mt-1">
              {formatCurrency(committedAmount + (request.estimatedCost || 0))}
            </p>
            <p className="text-xs text-[#9DA5A8] mt-1">
              ({(((committedAmount + (request.estimatedCost || 0)) / allocatedBudget) * 100).toFixed(1)}%)
            </p>
          </div>
        </div>
        <div className="mt-3 p-3 bg-white rounded-lg border border-[#DFE2E4]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-[#31343A]">Budget Status</span>
            {((committedAmount + (request.estimatedCost || 0)) / allocatedBudget) * 100 > 95 ? (
              <span className="px-2 py-1 bg-[#E00420]/10 text-[#E00420] rounded-full text-xs font-semibold">
                Critical (Approval Escalation Required)
              </span>
            ) : ((committedAmount + (request.estimatedCost || 0)) / allocatedBudget) * 100 > 90 ? (
              <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
                Warning (Near Limit)
              </span>
            ) : (
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                Safe (Within Budget)
              </span>
            )}
          </div>
          <div className="h-2 bg-[#DFE2E4]/50 rounded-full overflow-hidden">
            <div 
              className={`h-2 rounded-full transition-all ${
                ((committedAmount + (request.estimatedCost || 0)) / allocatedBudget) * 100 > 95 ? 'bg-[#E00420]' :
                ((committedAmount + (request.estimatedCost || 0)) / allocatedBudget) * 100 > 90 ? 'bg-yellow-500' :
                'bg-[#005691]'
              }`}
              style={{ width: `${Math.min(((committedAmount + (request.estimatedCost || 0)) / allocatedBudget) * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Request Details */}
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-[#31343A] mb-2">Indent Details</h3>
          <div className="bg-white border border-[#DFE2E4] rounded-lg p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-[#9DA5A8]">Indent ID</span>
              <span className="text-sm font-medium text-[#31343A]">{request.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-[#9DA5A8]">Indent Date</span>
              <span className="text-sm font-medium text-[#31343A]">{formatDate(request.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-[#9DA5A8]">Source</span>
              <span className="text-sm font-medium text-[#31343A]">{getSourceLabel(request.source)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-[#9DA5A8]">Item Name</span>
              <span className="text-sm font-medium text-[#31343A]">{request.itemName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-[#9DA5A8]">Quantity</span>
              <span className="text-sm font-medium text-[#31343A]">{request.quantity.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-[#9DA5A8]">Requested Amount</span>
              <span className="text-sm font-medium text-[#31343A]">{formatCurrency(request.estimatedCost)}</span>
            </div>
            {request.category && (
              <div className="flex justify-between">
                <span className="text-sm text-[#9DA5A8]">Category</span>
                <span className="text-sm font-medium text-[#31343A]">{request.category}</span>
              </div>
            )}
            {request.subcategory && (
              <div className="flex justify-between">
                <span className="text-sm text-[#9DA5A8]">Subcategory</span>
                <span className="text-sm font-medium text-[#31343A]">{request.subcategory}</span>
              </div>
            )}
            {request.plant && (
              <div className="flex justify-between">
                <span className="text-sm text-[#9DA5A8]">Plant</span>
                <span className="text-sm font-medium text-[#31343A]">{request.plant}</span>
              </div>
            )}
            {request.program && (
              <div className="flex justify-between">
                <span className="text-sm text-[#9DA5A8]">Program</span>
                <span className="text-sm font-medium text-[#31343A]">{request.program}</span>
              </div>
            )}
            {request.partNumber && (
              <div className="flex justify-between">
                <span className="text-sm text-[#9DA5A8]">Part Number</span>
                <span className="text-sm font-medium text-[#31343A]">{request.partNumber}</span>
              </div>
            )}
            {request.commodity && (
              <div className="flex justify-between">
                <span className="text-sm text-[#9DA5A8]">Commodity</span>
                <span className="text-sm font-medium text-[#31343A]">{request.commodity}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-sm text-[#9DA5A8]">Urgency</span>
              <StatusBadge status={request.urgency} />
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-[#9DA5A8]">Status</span>
              <StatusBadge status={request.status} />
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-[#9DA5A8]">Budget Status</span>
              <StatusBadge status={request.budgetStatus} />
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-[#9DA5A8]">Requester</span>
              <span className="text-sm font-medium text-[#31343A]">{request.requester}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-[#9DA5A8]">Department</span>
              <span className="text-sm font-medium text-[#31343A]">{request.department}</span>
            </div>
            {request.assignedProcurementManager && (
              <div className="flex justify-between">
                <span className="text-sm text-[#9DA5A8]">Procurement Manager</span>
                <span className="text-sm font-medium text-[#31343A]">{request.assignedProcurementManager}</span>
              </div>
            )}
            {request.lineStopRisk && request.riskReason && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-2">
                <p className="text-xs font-semibold text-red-700 mb-1">Line-Stop Risk</p>
                <p className="text-sm text-red-600">{request.riskReason}</p>
              </div>
            )}
          </div>
        </div>

        {/* Business Justification */}
        <div>
          <h3 className="text-sm font-semibold text-[#31343A] mb-2">Business Justification</h3>
          <div className="bg-white border border-[#DFE2E4] rounded-lg p-4">
            <p className="text-sm text-[#31343A]">{request.businessJustification}</p>
          </div>
        </div>

        {/* Compliance Flags */}
        {request.compliance && (
          <div>
            <h3 className="text-sm font-semibold text-[#31343A] mb-2">Compliance</h3>
            <div className="bg-white border border-[#DFE2E4] rounded-lg p-4">
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${request.compliance.iatfSupplier ? 'bg-green-500' : 'bg-[#9DA5A8]'}`} />
                  <span className="text-sm text-[#31343A]">IATF Supplier</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${request.compliance.ppapRequired ? 'bg-yellow-500' : 'bg-[#9DA5A8]'}`} />
                  <span className="text-sm text-[#31343A]">PPAP Required</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${request.compliance.imdsRequired ? 'bg-blue-500' : 'bg-[#9DA5A8]'}`} />
                  <span className="text-sm text-[#31343A]">IMDS Required</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Attachments */}
        <div>
          <h3 className="text-sm font-semibold text-[#31343A] mb-2">Attachments</h3>
          <div className="bg-white border border-[#DFE2E4] rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm text-[#31343A]">
              <span className="text-[#005691] hover:underline cursor-pointer">Quote.pdf</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-[#31343A]">
              <span className="text-[#005691] hover:underline cursor-pointer">VendorComparison.xlsx</span>
            </div>
          </div>
        </div>

        {/* Approval History */}
        <div>
          <h3 className="text-sm font-semibold text-[#31343A] mb-2">Approval History</h3>
          <div className="space-y-3">
            {approvalHistory.length > 0 ? (
              approvalHistory.map((item) => (
                <div key={item.id} className="bg-white border border-[#DFE2E4] rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-medium text-[#31343A]">{item.approver}</p>
                      <p className="text-xs text-[#9DA5A8]">{item.role}</p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getActionColor(item.action)}`}>
                      {getActionLabel(item.action)}
                    </span>
                  </div>
                  <p className="text-xs text-[#9DA5A8] mb-2">
                    {new Date(item.timestamp).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} ({item.approver})
                  </p>
                  {item.notes && (
                    <p className="text-sm text-[#31343A] mt-2 italic">&quot;{item.notes}&quot;</p>
                  )}
                </div>
              ))
            ) : (
              <div className="bg-white border border-[#DFE2E4] rounded-lg p-4">
                <div className="space-y-2">
                  <p className="text-xs text-[#31343A]">Submitted: {new Date(request.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} ({request.requester})</p>
                  <p className="text-xs text-[#9DA5A8]">Pending: Department Manager</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-4 border-t border-[#DFE2E4]">
          {request.status === 'pending' || request.status === 'in-review' ? (
            <>
              <button 
                onClick={() => onApprove?.(request.id)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              >
                Approve
              </button>
              <button 
                onClick={() => onReject?.(request.id)}
                className="px-4 py-2 bg-[#E00420] text-white rounded-lg hover:bg-[#C00400] transition-colors text-sm font-medium"
              >
                Reject
              </button>
            </>
          ) : (
            <>
              <button 
                disabled
                className="px-4 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed text-sm font-medium"
              >
                {request.status === 'approved' ? 'Approved' : request.status === 'rejected' ? 'Rejected' : 'Processed'}
              </button>
            </>
          )}
          <button className="px-4 py-2 border border-[#B6BBBE] text-[#31343A] rounded-lg hover:bg-[#DFE2E4] transition-colors text-sm font-medium">
            Add Remark
          </button>
          <button className="px-4 py-2 border border-[#B6BBBE] text-[#31343A] rounded-lg hover:bg-[#DFE2E4] transition-colors text-sm font-medium">
            View History
          </button>
        </div>
      </div>
    </div>
  );
}
