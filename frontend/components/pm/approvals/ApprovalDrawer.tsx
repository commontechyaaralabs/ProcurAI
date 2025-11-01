'use client';

import { X, FileText, Building2, DollarSign, Calendar, AlertCircle, CheckCircle2, Clock, Download } from 'lucide-react';
import { EnhancedApproval, IndentApproval, QuoteApproval, POApproval } from '@/types';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DecisionBar } from './DecisionBar';
import { SLAChip } from './SLAChip';
import { enhancedVendors, enhancedContracts } from '@/lib/mockData';
import { useEffect } from 'react';

interface ApprovalDrawerProps {
  approval: EnhancedApproval | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (approvalId: string, comment?: string, metadata?: any) => void;
  onReject: (approvalId: string, reason: string) => void;
  onSendBack: (approvalId: string, reason: string) => void;
}

export function ApprovalDrawer({ approval, isOpen, onClose, onApprove, onReject, onSendBack }: ApprovalDrawerProps) {
  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!approval || !isOpen) return null;

  const isIndent = approval.approvalType === 'INDENT';
  const isQuote = approval.approvalType === 'QUOTE';
  const isPO = approval.approvalType === 'PO';

  // Calculate SLA
  const now = new Date();
  const submitted = new Date(approval.submittedAt);
  const elapsedHours = Math.floor((now.getTime() - submitted.getTime()) / (1000 * 60 * 60));
  const slaElapsedHours = approval.slaElapsedHours ?? elapsedHours;

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50"
      onClick={(e) => {
        // Only close if clicking the backdrop, not the modal content
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {/* Backdrop with blur */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-md transition-opacity duration-300" 
        onClick={onClose} 
      />

      {/* Modal - Centered */}
      <div
        className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col pointer-events-auto transform transition-all duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-white border-b border-[#DFE2E4] p-6 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-[#31343A]">{approval.title}</h2>
              <div className="flex items-center gap-3 mt-2">
                <StatusBadge status={approval.status === 'pending' ? 'pending' : approval.status === 'approved' ? 'active' : 'inactive'} />
                <SLAChip slaTargetHours={approval.slaTargetHours} slaElapsedHours={slaElapsedHours} />
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-[#9DA5A8] hover:text-[#31343A] p-2 hover:bg-[#DFE2E4] rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Summary */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#DFE2E4]">
            <div>
              <div className="text-xs text-[#9DA5A8] mb-1">Value</div>
              <div className="text-lg font-semibold text-[#31343A]">
                {approval.value ? formatCurrency(approval.value) : '—'}
              </div>
            </div>
            <div>
              <div className="text-xs text-[#9DA5A8] mb-1">Level</div>
              <div className="text-lg font-semibold text-[#31343A]">{approval.approverLevel}</div>
            </div>
            <div>
              <div className="text-xs text-[#9DA5A8] mb-1">Submitted</div>
              <div className="text-sm text-[#31343A]">{formatDateTime(approval.submittedAt)}</div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          {/* INDENT APPROVAL CONTENT */}
          {isIndent && (() => {
            const indent = approval as IndentApproval;
            return (
              <>
                <div>
                  <h3 className="text-lg font-semibold text-[#31343A] mb-4">Indent Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-[#9DA5A8] mb-1 block">Requester</label>
                      <p className="text-sm font-medium text-[#31343A]">{indent.requester}</p>
                    </div>
                    <div>
                      <label className="text-sm text-[#9DA5A8] mb-1 block">Department</label>
                      <p className="text-sm font-medium text-[#31343A]">{indent.dept}</p>
                    </div>
                    <div className="col-span-2">
                      <label className="text-sm text-[#9DA5A8] mb-1 block">Item Name</label>
                      <p className="text-sm font-medium text-[#31343A]">{indent.itemName}</p>
                    </div>
                    <div>
                      <label className="text-sm text-[#9DA5A8] mb-1 block">Quantity</label>
                      <p className="text-sm font-medium text-[#31343A]">{indent.quantity.toLocaleString()}</p>
                    </div>
                    <div>
                      <label className="text-sm text-[#9DA5A8] mb-1 block">Estimated Cost</label>
                      <p className="text-sm font-semibold text-[#31343A]">{formatCurrency(indent.estimatedCost)}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-[#DFE2E4] pt-4">
                  <h3 className="text-lg font-semibold text-[#31343A] mb-4">Budget Context</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#9DA5A8]">Budget Head</span>
                      <span className="text-sm font-medium text-[#31343A]">{indent.budgetHead || '—'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#9DA5A8]">Budget Status</span>
                      <StatusBadge
                        status={
                          indent.budgetStatus === 'under-budget' ? 'active' :
                          indent.budgetStatus === 'over-budget' ? 'inactive' : 'pending'
                        }
                      />
                    </div>
                    {indent.budgetStatus === 'over-budget' && indent.approverLevel !== 'CFO' && (
                      <div className="flex items-start gap-2 p-3 bg-[#E00420]/10 border border-[#E00420]/30 rounded-lg">
                        <AlertCircle className="h-4 w-4 text-[#E00420] mt-0.5" />
                        <div className="text-xs text-[#E00420]">
                          <strong>Budget Overrun:</strong> CFO approval required for over-budget items.
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t border-[#DFE2E4] pt-4">
                  <h3 className="text-lg font-semibold text-[#31343A] mb-4">Urgency & Priority</h3>
                  <div className="flex items-center gap-2">
                    <StatusBadge
                      status={
                        indent.urgency === 'critical' ? 'critical' :
                        indent.urgency === 'high' ? 'pending' : 'active'
                      }
                    />
                    {indent.blockerReason && (
                      <span className="text-xs text-[#9DA5A8]">Blocked: {indent.blockerReason}</span>
                    )}
                  </div>
                </div>

                {indent.attachments && indent.attachments.length > 0 && (
                  <div className="border-t border-[#DFE2E4] pt-4">
                    <h3 className="text-lg font-semibold text-[#31343A] mb-4">Attachments</h3>
                    <div className="space-y-2">
                      {indent.attachments.map((att, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-2 border border-[#DFE2E4] rounded-lg hover:bg-[#DFE2E4]/30">
                          <FileText className="h-4 w-4 text-[#9DA5A8]" />
                          <span className="text-sm text-[#31343A] flex-1">{att.name}</span>
                          <Download className="h-4 w-4 text-[#005691] cursor-pointer" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            );
          })()}

          {/* QUOTE APPROVAL CONTENT */}
          {isQuote && (() => {
            const quote = approval as QuoteApproval;
            const recommended = quote.suppliers.find(s => s.vendorId === quote.recommendedVendorId);
            const lowest = quote.suppliers.reduce((min, s) => s.quoteAmount < min.quoteAmount ? s : min, quote.suppliers[0]);

            return (
              <>
                <div>
                  <h3 className="text-lg font-semibold text-[#31343A] mb-4">RFQ Summary</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-[#9DA5A8] mb-1 block">RFQ Number</label>
                      <p className="text-sm font-medium text-[#31343A]">{quote.rfqId}</p>
                    </div>
                    <div>
                      <label className="text-sm text-[#9DA5A8] mb-1 block">Item</label>
                      <p className="text-sm font-medium text-[#31343A]">{quote.itemName}</p>
                    </div>
                    <div>
                      <label className="text-sm text-[#9DA5A8] mb-1 block">Responses</label>
                      <p className="text-sm font-medium text-[#31343A]">
                        {quote.suppliers.length} supplier{quote.suppliers.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-[#9DA5A8] mb-1 block">Quote Variance</label>
                      <p className="text-sm font-medium text-[#31343A]">
                        {quote.quoteVariancePct ? `${quote.quoteVariancePct.toFixed(1)}%` : '—'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-[#DFE2E4] pt-4">
                  <h3 className="text-lg font-semibold text-[#31343A] mb-4">Quote Comparison</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-[#DFE2E4]">
                      <thead className="bg-[#DFE2E4]/30">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-[#9DA5A8]">Vendor</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-[#9DA5A8]">Quote</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-[#9DA5A8]">Lead Time</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-[#9DA5A8]">On-Time %</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-[#9DA5A8]">Quality</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#DFE2E4]">
                        {quote.suppliers.map((supplier) => {
                          const isRecommended = supplier.vendorId === quote.recommendedVendorId;
                          const isLowest = supplier.vendorId === lowest.vendorId;
                          return (
                            <tr key={supplier.vendorId} className={isRecommended ? 'bg-[#005691]/5' : ''}>
                              <td className="px-4 py-2 text-sm text-[#31343A]">
                                <div className="flex items-center gap-2">
                                  {supplier.vendorName}
                                  {isRecommended && (
                                    <span className="px-2 py-0.5 bg-[#005691] text-white text-xs rounded-full">Recommended</span>
                                  )}
                                  {isLowest && !isRecommended && (
                                    <span className="px-2 py-0.5 bg-green-600 text-white text-xs rounded-full">Lowest</span>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-2 text-sm font-semibold text-[#31343A]">
                                {formatCurrency(supplier.quoteAmount)}
                              </td>
                              <td className="px-4 py-2 text-sm text-[#31343A]">{supplier.leadTimeDays || '—'} days</td>
                              <td className="px-4 py-2 text-sm text-[#31343A]">{supplier.onTimePct || '—'}%</td>
                              <td className="px-4 py-2 text-sm text-[#31343A]">{supplier.qualityScore?.toFixed(1) || '—'}/5.0</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            );
          })()}

          {/* PO APPROVAL CONTENT */}
          {isPO && (() => {
            const po = approval as POApproval;
            const vendor = enhancedVendors.find(v => v.id === po.vendorId);
            const contract = enhancedContracts.find(c => c.vendorId === po.vendorId && c.status === 'executed');

            return (
              <>
                <div>
                  <h3 className="text-lg font-semibold text-[#31343A] mb-4">PO Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-[#9DA5A8] mb-1 block">PO Number</label>
                      <p className="text-sm font-medium text-[#31343A]">{po.poId}</p>
                    </div>
                    <div>
                      <label className="text-sm text-[#9DA5A8] mb-1 block">Vendor</label>
                      <p className="text-sm font-medium text-[#31343A]">{po.vendorName}</p>
                    </div>
                    <div>
                      <label className="text-sm text-[#9DA5A8] mb-1 block">Amount</label>
                      <p className="text-sm font-semibold text-[#31343A]">{formatCurrency(po.amount)}</p>
                    </div>
                    <div>
                      <label className="text-sm text-[#9DA5A8] mb-1 block">Cost Center</label>
                      <p className="text-sm font-medium text-[#31343A]">{po.costCenter || '—'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-[#9DA5A8] mb-1 block">Budget Code</label>
                      <p className="text-sm font-medium text-[#31343A]">{po.budgetCode || '—'}</p>
                    </div>
                  </div>
                </div>

                {vendor && (
                  <div className="border-t border-[#DFE2E4] pt-4">
                    <h3 className="text-lg font-semibold text-[#31343A] mb-4">Vendor Performance</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <div className="text-xs text-[#9DA5A8] mb-1">On-Time Delivery</div>
                        <div className="text-sm font-semibold text-[#31343A]">{vendor.onTimeDeliveryPercent}%</div>
                      </div>
                      <div>
                        <div className="text-xs text-[#9DA5A8] mb-1">Quality Score</div>
                        <div className="text-sm font-semibold text-[#31343A]">{vendor.qualityPercent}%</div>
                      </div>
                      <div>
                        <div className="text-xs text-[#9DA5A8] mb-1">Rating</div>
                        <div className="text-sm font-semibold text-[#31343A]">{vendor.performanceRating}/5.0</div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="border-t border-[#DFE2E4] pt-4">
                  <h3 className="text-lg font-semibold text-[#31343A] mb-4">Compliance Status</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#9DA5A8]">Contract Status</span>
                      {contract ? (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">On Contract</span>
                      ) : (
                        <span className="px-2 py-1 bg-[#E00420]/10 text-[#E00420] text-xs rounded-full">Off Contract</span>
                      )}
                    </div>
                    {po.isOffContract && (
                      <div className="flex items-start gap-2 p-3 bg-[#E00420]/10 border border-[#E00420]/30 rounded-lg">
                        <AlertCircle className="h-4 w-4 text-[#E00420] mt-0.5" />
                        <div className="text-xs text-[#E00420]">
                          <strong>Off-Contract Purchase:</strong> Policy exception required. Head/CFO approval may be needed.
                        </div>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#9DA5A8]">GRN Status</span>
                      <StatusBadge status={po.grnStatus === 'received' ? 'active' : 'pending'} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#9DA5A8]">Invoice Status</span>
                      <StatusBadge status={po.invoiceStatus === 'received' ? 'active' : 'pending'} />
                    </div>
                  </div>
                </div>
              </>
            );
          })()}

          {/* Comment Box */}
          <div className="border-t border-[#DFE2E4] pt-4">
            <label className="text-sm font-medium text-[#31343A] mb-2 block">Comments (Optional)</label>
            <textarea
              id="approval-comment"
              rows={3}
              className="w-full px-3 py-2 text-sm border border-[#B6BBBE] rounded-lg text-[#31343A] focus:outline-none focus:ring-2 focus:ring-[#005691] focus:border-transparent"
              placeholder="Add any comments or notes..."
            />
          </div>

          {/* Decision Bar */}
          <DecisionBar
            onApprove={() => {
              const comment = (document.getElementById('approval-comment') as HTMLTextAreaElement)?.value || '';
              onApprove(approval.id, comment);
            }}
            onSendBack={() => {
              const comment = (document.getElementById('approval-comment') as HTMLTextAreaElement)?.value || '';
              if (!comment) {
                alert('Please provide a reason for sending back.');
                return;
              }
              onSendBack(approval.id, comment);
            }}
            onReject={() => {
              const comment = (document.getElementById('approval-comment') as HTMLTextAreaElement)?.value || '';
              if (!comment) {
                alert('Please provide a reason for rejection.');
                return;
              }
              onReject(approval.id, comment);
            }}
            showSendBack={approval.status !== 'on-hold'}
          />
        </div>
      </div>
    </div>
  );
}

