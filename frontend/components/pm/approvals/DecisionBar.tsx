'use client';

import { CheckCircle2, XCircle, ArrowLeft } from 'lucide-react';

interface DecisionBarProps {
  onApprove: () => void;
  onSendBack?: (reason?: string) => void;
  onReject: (reason?: string) => void;
  disabled?: boolean;
  showSendBack?: boolean;
}

export function DecisionBar({ onApprove, onSendBack, onReject, disabled = false, showSendBack = true }: DecisionBarProps) {
  return (
    <div className="mt-6 pt-4 border-t border-[#DFE2E4] flex gap-3">
      <button
        onClick={onApprove}
        disabled={disabled}
        className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        <CheckCircle2 className="h-4 w-4" />
        Approve
      </button>
      {showSendBack && onSendBack && (
        <button
          onClick={() => onSendBack()}
          disabled={disabled}
          className="px-4 py-2 border border-[#B6BBBE] text-[#31343A] rounded-lg font-medium hover:bg-[#DFE2E4] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Send back
        </button>
      )}
      <button
        onClick={() => onReject()}
        disabled={disabled}
        className="px-4 py-2 border border-[#E00420] text-[#E00420] rounded-lg font-medium hover:bg-[#E00420]/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        <XCircle className="h-4 w-4" />
        Reject
      </button>
    </div>
  );
}

