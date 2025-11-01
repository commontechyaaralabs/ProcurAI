'use client';

import { enhancedRequests } from '@/lib/mockData';

export function RepeatingItems(){
  const byItem: Record<string,{count:number,depts:Set<string>}> = {} as any;
  enhancedRequests.forEach(r => {
    const key = r.itemName.toLowerCase();
    if (!byItem[key]) byItem[key] = { count:0, depts:new Set() };
    byItem[key].count++; byItem[key].depts.add(r.department);
  });
  const rows = Object.entries(byItem).filter(([_,v])=>v.count>1).map(([k,v])=>({name:k,count:v.count,depts:[...v.depts].join(', ')}));
  return (
    <div className="bg-white rounded-lg border border-[#DFE2E4] p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-semibold text-[#31343A]">Repeating Items (30d)</h4>
        <button className="text-xs px-2 py-1 border border-[#B6BBBE] rounded hover:bg-[#DFE2E4] text-[#31343A]">Create Combined RFQ</button>
      </div>
      <div className="overflow-y-auto flex-1">
        <table className="w-full text-sm">
          <thead className="bg-[#DFE2E4]/30 text-[#9DA5A8]">
            <tr>
              <th className="px-3 py-2 text-left">Item</th>
              <th className="px-3 py-2 text-left">Count</th>
              <th className="px-3 py-2 text-left">Departments</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#DFE2E4]">
            {rows.length===0 && (
              <tr><td className="px-3 py-3 text-[#9DA5A8]" colSpan={3}>No repeats found.</td></tr>
            )}
            {rows.map(r => (
              <tr key={r.name} className="hover:bg-[#DFE2E4]/30">
                <td className="px-3 py-2 capitalize">{r.name}</td>
                <td className="px-3 py-2">{r.count}</td>
                <td className="px-3 py-2">{r.depts}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

