'use client';

import { mockRFQs } from '@/lib/mockData';
import { formatDate } from '@/lib/utils';

export function RFQResponseLadder(){
  return (
    <div className="bg-white rounded-lg border border-[#DFE2E4] p-4">
      <div className="text-sm font-semibold text-[#31343A] mb-3">RFQ Response Ladder</div>
      <div className="space-y-3 max-h-[280px] overflow-auto pr-1">
        {mockRFQs.filter(r=>r.status!=='closed').map(r => {
          const pct = Math.round((r.suppliersResponded / Math.max(1, r.suppliersInvited)) * 100);
          return (
            <div key={r.id} className="border border-[#DFE2E4] rounded p-3">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-[#31343A]">{r.rfqNumber} • {r.itemName}</div>
                <div className="text-xs text-[#9DA5A8]">Due {formatDate(r.dueDate)}</div>
              </div>
              <div className="mt-2">
                <div className="w-full bg-[#DFE2E4] rounded-full h-2">
                  <div className="h-2 rounded-full bg-[#005691]" style={{ width: `${pct}%` }} />
                </div>
                <div className="mt-1 text-xs text-[#9DA5A8]">Invited {r.suppliersInvited} • Responded {r.suppliersResponded} • {pct}%</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

