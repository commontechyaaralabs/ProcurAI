'use client';

import { enhancedRequests } from '@/lib/mockData';

function simpleKey(s:string){ return s.toLowerCase().replace(/\s+/g,' ').trim(); }

export function DuplicateIndents(){
  const map: Record<string,string[]> = {};
  enhancedRequests.forEach(r => {
    const k = simpleKey(r.itemName);
    map[k] = map[k] || []; map[k].push(r.id);
  });
  const rows = Object.entries(map).filter(([_,ids])=> ids.length>1);
  return (
    <div className="bg-white rounded-lg border border-[#DFE2E4] p-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-semibold text-[#31343A]">Duplicate / Similar Indents</h4>
        <button className="text-xs px-2 py-1 border border-[#B6BBBE] rounded hover:bg-[#DFE2E4] text-[#31343A]">Merge to RFQ</button>
      </div>
      <div className="space-y-2">
        {rows.map(([name, ids]) => (
          <div key={name} className="text-sm">
            <span className="font-medium capitalize text-[#31343A]">{name}</span>
            <span className="ml-2 text-[#9DA5A8]">{ids.join(', ')}</span>
          </div>
        ))}
        {rows.length===0 && <div className="text-xs text-[#9DA5A8]">No candidate duplicates found.</div>}
      </div>
    </div>
  );
}

