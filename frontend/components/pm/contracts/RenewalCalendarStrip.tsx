'use client';

import { enhancedContracts } from '@/lib/mockData';

function daysFromNow(date:string){ return Math.ceil((+new Date(date) - Date.now())/86400000); }

export function RenewalCalendarStrip(){
  const within90 = enhancedContracts.map(c => ({...c, d: daysFromNow(c.endDate)})).filter(c => c.d >= 0 && c.d <= 90).sort((a,b)=> a.d - b.d);
  return (
    <div className="bg-white rounded-lg border border-[#DFE2E4] p-4">
      <div className="text-sm font-semibold text-[#31343A] mb-2">Renewals (next 90 days)</div>
      <div className="flex flex-wrap gap-2">
        {within90.map(c => (
          <div key={c.id} className="px-3 py-1.5 rounded border border-[#B6BBBE] bg-[#DFE2E4] text-xs text-[#31343A]">
            {c.name} • {c.d}d
          </div>
        ))}
        {within90.length===0 && <div className="text-xs text-[#9DA5A8]">No renewals in next 90 days.</div>}
      </div>
    </div>
  );
}

