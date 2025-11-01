'use client';

import { enhancedRequests } from '@/lib/mockData';
import { suggestVendorsForRequest } from './vendorSuggestUtils';
import { SuggestedVendorCard } from './SuggestedVendorCard';

export function SuggestedVendorsPanel({ requestId, onClose, onInviteToRFQ, onCompare, onViewProfile, hideHeader }: { requestId: string; onClose: () => void; onInviteToRFQ?: (vendorId: string, requestId?: string) => void; onCompare?: (vendorId: string, requestId?: string) => void; onViewProfile?: (vendorId: string) => void; hideHeader?: boolean; }) {
  const req = enhancedRequests.find(r => r.id === requestId);
  if (!req) return null;

  const suggestions = suggestVendorsForRequest({
    itemName: req.itemName,
    department: req.department,
    categoryHint: req.category as any, // if you later add it on requests
    topN: 3,
  });

  return (
    <div className={hideHeader ? "" : "bg-white rounded-lg border border-[#DFE2E4] p-6"}>
      {!hideHeader && (
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-lg font-semibold text-[#31343A]">
            AI Suggested Vendors <span className="text-sm text-[#9DA5A8]">for {req.id} • {req.itemName}</span>
          </h4>
          <button onClick={onClose} className="text-[#9DA5A8] hover:text-[#31343A]">×</button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {suggestions.map((s, idx) => (
          <SuggestedVendorCard
            key={s.vendorId}
            vendorName={s.vendorName}
            category={s.category}
            healthScore={s.healthScore}
            onTime={s.onTime}
            leadTime={s.leadTime}
            totalSpend={s.totalSpend}
            contractCount={s.contractCount}
            avgContractUtilization={s.avgContractUtilization}
            lastPODate={s.lastPODate}
            daysSinceLastPO={s.daysSinceLastPO}
            poSparkline={s.poSparkline}
            contractUtilBars={s.contractUtilBars}
            badge={idx === 0 ? 'Best Match' : 'Alternative'}
            vendorId={s.vendorId}
            onInviteToRFQ={() => {
              if (onInviteToRFQ) {
                onInviteToRFQ(s.vendorId, requestId);
              }
            }}
            onCompare={() => {
              if (onCompare) {
                onCompare(s.vendorId, requestId);
              }
            }}
            onViewProfile={() => {
              if (onViewProfile) {
                onViewProfile(s.vendorId);
              }
            }}
          />
        ))}
      </div>
    </div>
  );
}

