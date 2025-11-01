'use client';

import { enhancedContracts } from '@/lib/mockData';

export function ContractsUtilizationLadder(){
  const rows = [...enhancedContracts].sort((a,b)=> (b.utilizedPercent||0) - (a.utilizedPercent||0)).slice(0,10);
  return (
    <div className="bg-white rounded-lg border border-[#DFE2E4] p-4">
      <div className="text-sm font-semibold text-[#31343A] mb-2">Contracts by Utilization</div>
      <div className="space-y-2">
        {rows.map(c => (
          <div key={c.id}>
            <div className="flex items-center justify-between text-xs">
              <div className="text-[#31343A] truncate pr-3">{c.name}</div>
              <div className="text-[#9DA5A8]">{c.utilizedPercent}% • {c.daysToExpiry}d left</div>
            </div>
            <div className="w-full bg-[#DFE2E4] rounded h-2 mt-1">
              <div className="h-2 rounded bg-[#005691]" style={{ width: `${c.utilizedPercent||0}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

