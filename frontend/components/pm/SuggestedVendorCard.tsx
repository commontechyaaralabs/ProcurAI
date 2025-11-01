'use client';

import { formatCurrency, formatDate } from '@/lib/utils';
import { TinySparkline } from './TinySparkline';
import { TinyBars } from './TinyBars';

type CardProps = {
  vendorName: string;
  category: string;
  healthScore: number;
  onTime: number;
  leadTime: number;
  totalSpend: number;
  contractCount: number;
  avgContractUtilization?: number;
  lastPODate?: string;
  daysSinceLastPO?: number;
  poSparkline: number[];
  contractUtilBars: number[];
  badge?: string; // "Best Match" | "Alternative" etc.
  vendorId?: string;
  onInviteToRFQ?: () => void;
  onCompare?: () => void;
  onViewProfile?: () => void;
};

export function SuggestedVendorCard(p: CardProps) {
  return (
    <div className="border border-[#DFE2E4] rounded-lg p-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-[#31343A]">{p.vendorName}</h4>
            {p.badge && <span className="px-2 py-0.5 text-xs rounded bg-green-100 text-green-800">{p.badge}</span>}
          </div>
          <div className="text-xs text-[#9DA5A8] mt-0.5 capitalize">{p.category}</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-[#9DA5A8]">Health</div>
          <div className="text-sm font-semibold text-[#31343A]">{p.healthScore}</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mt-3">
        <div className="border border-[#DFE2E4] rounded p-2">
          <div className="text-[11px] text-[#9DA5A8]">On-time</div>
          <div className="text-sm font-semibold text-[#31343A]">{p.onTime}%</div>
        </div>
        <div className="border border-[#DFE2E4] rounded p-2">
          <div className="text-[11px] text-[#9DA5A8]">Lead time</div>
          <div className="text-sm font-semibold text-[#31343A]">{p.leadTime} d</div>
        </div>
        <div className="border border-[#DFE2E4] rounded p-2">
          <div className="text-[11px] text-[#9DA5A8]">Contracts</div>
          <div className="text-sm font-semibold text-[#31343A]">{p.contractCount}</div>
        </div>
      </div>

          <div className="grid grid-cols-2 gap-3 mt-3">
            <div className="border border-[#DFE2E4] rounded p-2 overflow-hidden">
              <div className="text-[11px] text-[#9DA5A8] mb-1">PO amounts (recent)</div>
              <div className="w-full overflow-hidden">
                <TinySparkline data={p.poSparkline.length ? p.poSparkline : [0]} />
              </div>
            </div>
            <div className="border border-[#DFE2E4] rounded p-2 overflow-hidden">
              <div className="text-[11px] text-[#9DA5A8] mb-1">Contract utilization</div>
              <div className="w-full overflow-hidden">
                <TinyBars values={p.contractUtilBars.length ? p.contractUtilBars : [0]} />
              </div>
              {p.avgContractUtilization !== undefined &&
                <div className="text-[11px] text-[#9DA5A8] mt-1">Avg {p.avgContractUtilization}%</div>}
            </div>
          </div>

      <div className="grid grid-cols-3 gap-3 mt-3">
        <div className="border border-[#DFE2E4] rounded p-2">
          <div className="text-[11px] text-[#9DA5A8]">Total spend</div>
          <div className="text-sm font-semibold text-[#31343A]">{formatCurrency(p.totalSpend)}</div>
        </div>
        <div className="border border-[#DFE2E4] rounded p-2">
          <div className="text-[11px] text-[#9DA5A8]">Last PO</div>
          <div className="text-sm font-semibold text-[#31343A]">{p.lastPODate ? formatDate(p.lastPODate) : '—'}</div>
        </div>
        <div className="border border-[#DFE2E4] rounded p-2">
          <div className="text-[11px] text-[#9DA5A8]">Gap (days)</div>
          <div className="text-sm font-semibold text-[#31343A]">{p.daysSinceLastPO ?? '—'}</div>
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        <button 
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (p.onInviteToRFQ) {
              p.onInviteToRFQ();
            }
          }} 
          className="px-3 py-1.5 bg-[#005691] text-white rounded text-xs hover:bg-[#004574] disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!p.onInviteToRFQ}
        >
          Invite to RFQ
        </button>
        <button 
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (p.onCompare) {
              p.onCompare();
            }
          }} 
          className="px-3 py-1.5 border border-[#B6BBBE] rounded text-xs hover:bg-[#DFE2E4] text-[#31343A] disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!p.onCompare}
        >
          Compare
        </button>
        <button 
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('View Profile button clicked', p.onViewProfile, p.vendorId);
            if (p.onViewProfile) {
              console.log('Calling onViewProfile handler');
              p.onViewProfile();
            } else {
              console.error('onViewProfile is undefined!');
            }
          }} 
          className="px-3 py-1.5 border border-[#B6BBBE] rounded text-xs hover:bg-[#DFE2E4] text-[#31343A] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          View Profile
        </button>
      </div>
    </div>
  );
}

