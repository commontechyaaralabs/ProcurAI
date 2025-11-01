'use client';

import { Modal } from '@/components/ui/Modal';
import { EnhancedRequest } from '@/types';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { SuggestedVendorsPanel } from './SuggestedVendorsPanel';

interface RequestDetailsModalProps {
  request: EnhancedRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onValidate?: () => void;
  onSendToRFQ?: () => void;
  onHold?: () => void;
  onInviteToRFQ?: (vendorId: string, requestId?: string) => void;
  onCompare?: (vendorId: string, requestId?: string) => void;
  onViewProfile?: (vendorId: string) => void;
}

export function RequestDetailsModal({ 
  request, 
  isOpen, 
  onClose, 
  onValidate, 
  onSendToRFQ, 
  onHold,
  onInviteToRFQ,
  onCompare,
  onViewProfile
}: RequestDetailsModalProps) {
  if (!request) return null;

  const urgencyColors = {
    critical: 'bg-[#E00420]/10 text-[#E00420]',
    high: 'bg-orange-100 text-orange-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-[#DFE2E4] text-[#31343A]',
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Request Details: ${request.id}`} size="lg">
      <div className="space-y-6">
        {/* Basic Information */}
        <div>
          <h3 className="text-lg font-semibold text-[#31343A] mb-4">Request Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-[#9DA5A8]">Request ID</label>
              <p className="text-lg font-semibold text-[#31343A]">{request.id}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-[#9DA5A8]">Status</label>
              <div className="mt-1">
                <StatusBadge status={request.status} />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-[#9DA5A8]">Item Name</label>
              <p className="text-lg text-[#31343A]">{request.itemName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-[#9DA5A8]">Quantity</label>
              <p className="text-lg text-[#31343A]">{request.quantity}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-[#9DA5A8]">Estimated Cost</label>
              <p className="text-lg font-semibold text-[#31343A]">{formatCurrency(request.estimatedCost)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-[#9DA5A8]">Budget Status</label>
              <div className="mt-1">
                <StatusBadge status={request.budgetStatus} />
              </div>
            </div>
          </div>
        </div>

        {/* Requester Information */}
        <div className="border-t border-[#DFE2E4] pt-4">
          <h3 className="text-lg font-semibold text-[#31343A] mb-4">Requester Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-[#9DA5A8]">Requester</label>
              <p className="text-lg text-[#31343A]">{request.requester}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-[#9DA5A8]">Department</label>
              <p className="text-lg text-[#31343A]">{request.department}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-[#9DA5A8]">Source</label>
              <p className="text-lg text-[#31343A] capitalize">{request.source}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-[#9DA5A8]">Assigned PM</label>
              <p className="text-lg text-[#31343A]">{request.assignedProcurementManager || 'Unassigned'}</p>
            </div>
          </div>
        </div>

        {/* Request Details */}
        <div className="border-t border-[#DFE2E4] pt-4">
          <h3 className="text-lg font-semibold text-[#31343A] mb-4">Request Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-[#9DA5A8]">Urgency</label>
              <div className="mt-1">
                <span className={`px-3 py-1 text-sm font-medium rounded ${urgencyColors[request.urgency]}`}>
                  {request.urgency.toUpperCase()}
                </span>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-[#9DA5A8]">Validation Status</label>
              <div className="mt-1">
                <span className={`px-3 py-1 text-sm rounded ${
                  request.validationStatus === 'validated' ? 'bg-green-100 text-green-800' :
                  request.validationStatus === 'rejected' ? 'bg-[#E00420]/10 text-[#E00420]' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {request.validationStatus.toUpperCase()}
                </span>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-[#9DA5A8]">Required By</label>
              <p className="text-lg text-[#31343A]">{request.requiredDate}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-[#9DA5A8]">Age (Days)</label>
              <p className="text-lg text-[#31343A]">{request.indentAge} days</p>
            </div>
            <div>
              <label className="text-sm font-medium text-[#9DA5A8]">Expected Timeline</label>
              <p className="text-lg text-[#31343A]">{request.expectedTimeline || 'Not specified'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-[#9DA5A8]">Created At</label>
              <p className="text-lg text-[#31343A]">{formatDateTime(request.createdAt)}</p>
            </div>
          </div>
        </div>

        {/* Business Justification */}
        <div className="border-t border-[#DFE2E4] pt-4">
          <h3 className="text-lg font-semibold text-[#31343A] mb-2">Business Justification</h3>
          <p className="text-[#31343A] bg-[#DFE2E4]/30 rounded-lg p-4">{request.businessJustification}</p>
        </div>

        {/* AI Suggested Vendors */}
        <div className="border-t border-[#DFE2E4] pt-4">
          <div className="mb-3">
            <h3 className="text-lg font-semibold text-[#31343A]">AI Suggested Vendors</h3>
            <p className="text-sm text-[#9DA5A8]">Top vendor recommendations for this request</p>
          </div>
          <SuggestedVendorsPanel
            requestId={request.id}
            onClose={() => {}}
            onInviteToRFQ={(vendorId, reqId) => {
              if (onInviteToRFQ) {
                onInviteToRFQ(vendorId, reqId || request.id);
              }
            }}
            onCompare={(vendorId, reqId) => {
              if (onCompare) {
                onCompare(vendorId, reqId || request.id);
              }
            }}
            onViewProfile={(vendorId) => {
              if (onViewProfile) {
                onViewProfile(vendorId);
              }
            }}
            hideHeader
          />
        </div>

        {/* Actions */}
        <div className="border-t border-[#DFE2E4] pt-4 flex gap-3">
          {request.validationStatus !== 'validated' && (
            <button
              onClick={() => { onValidate?.(); }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
            >
              Validate
            </button>
          )}
          {request.validationStatus === 'validated' && request.status !== 'vendor-sourcing' && (
            <button
              onClick={() => { onSendToRFQ?.(); }}
              className="px-4 py-2 bg-[#005691] text-white rounded-lg font-medium hover:bg-[#004574]"
            >
              Send to RFQ
            </button>
          )}
          {request.status !== 'in-review' && (
            <button
              onClick={() => { onHold?.(); }}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg font-medium hover:bg-yellow-700"
            >
              Hold
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 border border-[#B6BBBE] text-[#31343A] rounded-lg font-medium hover:bg-[#DFE2E4]"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}

