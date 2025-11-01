'use client';

import { enhancedRequests } from '@/lib/mockData';

const urg = ['critical','high','medium'] as const;
const bud = ['over-budget','pending-allocation','under-budget'] as const;

export function UrgencyBudgetMatrix({ onCellClick }: { onCellClick?: (u:string,b:string)=>void }){
  const counts: Record<string,Record<string,number>> = {} as any;
  urg.forEach(u => counts[u] = { 'over-budget':0,'pending-allocation':0,'under-budget':0 });
  enhancedRequests.forEach(r => {
    const u = (r.urgency||'medium').toLowerCase();
    const b = (r.budgetStatus||'under-budget').toLowerCase();
    if (!counts[u]) counts[u] = { 'over-budget':0,'pending-allocation':0,'under-budget':0 };
    counts[u][b]++;
  });
  const tone = (u:string,b:string)=> u==='critical'||b==='over-budget' ? 'bg-[#E00420]/10 text-[#E00420]' : b==='pending-allocation' ? 'bg-yellow-50 text-yellow-700' : 'bg-green-50 text-green-700';
  return (
    <div className="bg-white rounded-lg border border-[#DFE2E4] p-4 h-full">
      <div className="text-sm font-semibold text-[#31343A] mb-3">Urgency × Budget</div>
      <div className="grid grid-cols-4 gap-2 text-xs">
        <div></div>
        {bud.map(b => <div key={b} className="text-[#9DA5A8] font-medium text-center capitalize">{b.replace('-', ' ')}</div>)}
        {urg.map(u => (
          <div key={u} className="contents">
            <div className="text-[#31343A] font-medium capitalize">{u}</div>
            {bud.map(b => (
              <button key={u+b} className={`py-3 rounded text-center ${tone(u,b)}`} onClick={()=>onCellClick?.(u,b)}>
                {counts[u][b]}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

