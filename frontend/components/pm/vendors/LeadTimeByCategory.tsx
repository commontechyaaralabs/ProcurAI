'use client';

import { enhancedVendors } from '@/lib/mockData';

export function LeadTimeByCategory(){
  const groups: Record<string, {sum:number, n:number}> = {} as any;
  enhancedVendors.forEach(v => {
    const k = v.category || 'other';
    if (!groups[k]) groups[k] = { sum:0, n:0 };
    groups[k].sum += (v.avgLeadTimeDays||0); groups[k].n += 1;
  });
  const rows = Object.entries(groups).map(([k,v]) => ({ k, avg: Math.round(v.sum/Math.max(1,v.n)), n:v.n }))
    .sort((a,b)=> b.avg - a.avg);
  return (
    <div className="bg-white rounded-lg border border-[#DFE2E4] p-4">
      <div className="text-sm font-semibold text-[#31343A] mb-2">Lead Time by Category</div>
      <div className="space-y-2">
        {rows.map(r => (
          <div key={r.k}>
            <div className="flex items-center justify-between text-xs">
              <div className="capitalize text-[#31343A]">{r.k} ({r.n})</div>
              <div className="text-[#31343A]">{r.avg}d</div>
            </div>
            <div className="w-full bg-[#DFE2E4] rounded h-2 mt-1">
              <div className="h-2 rounded bg-[#005691]" style={{ width: `${Math.min(100, r.avg*5)}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

