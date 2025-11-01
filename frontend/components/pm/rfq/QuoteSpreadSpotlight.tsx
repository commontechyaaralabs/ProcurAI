'use client';

import { mockRFQs } from '@/lib/mockData';
import { formatCurrency } from '@/lib/utils';

export function QuoteSpreadSpotlight(){
  const rows = [...mockRFQs].filter(r=> typeof (r as any).quoteVariance === 'number')
    .sort((a:any,b:any)=> b.quoteVariance - a.quoteVariance).slice(0,8) as any[];
  return (
    <div className="bg-white rounded-lg border border-[#DFE2E4] p-4 flex flex-col" style={{ minHeight: '320px', maxHeight: '400px' }}>
      <div className="text-sm font-semibold text-[#31343A] mb-3">Quote Spread (Variance %)</div>
      <div className="overflow-y-auto flex-1 pr-1" style={{ maxHeight: 'calc(400px - 60px)' }}>
        <table className="w-full text-sm">
          <thead className="bg-[#DFE2E4]/30 text-[#9DA5A8] sticky top-0">
            <tr>
              <th className="px-2 py-2 text-left text-xs">RFQ</th>
              <th className="px-2 py-2 text-left text-xs">Item</th>
              <th className="px-2 py-2 text-left text-xs">Variance</th>
              <th className="px-2 py-2 text-left text-xs">Lowest Quote</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#DFE2E4]">
            {rows.map(r => (
              <tr key={r.id} className="hover:bg-[#DFE2E4]/30">
                <td className="px-2 py-2 text-xs font-medium whitespace-nowrap text-[#31343A]">{r.rfqNumber}</td>
                <td className="px-2 py-2 text-xs max-w-[120px] truncate text-[#31343A]" title={r.itemName}>{r.itemName}</td>
                <td className="px-2 py-2 text-xs font-semibold whitespace-nowrap text-[#31343A]">{r.quoteVariance}%</td>
                <td className="px-2 py-2 text-xs whitespace-nowrap text-[#31343A]">{formatCurrency(r.lowestQuote)}</td>
              </tr>
            ))}
            {rows.length===0 && <tr><td className="px-2 py-3 text-xs text-[#9DA5A8]" colSpan={4}>No RFQs with variance data.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

