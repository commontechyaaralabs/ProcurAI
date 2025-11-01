'use client';

import { enhancedPurchaseOrders } from '@/lib/mockData';

export function ThreeWayMatchStatus(){
  const onlyPO = enhancedPurchaseOrders.filter(p=>p.grnStatus!=='received' && p.invoiceStatus!=='received').length;
  const poGRN = enhancedPurchaseOrders.filter(p=>p.grnStatus==='received' && p.invoiceStatus!=='received').length;
  const poInv = enhancedPurchaseOrders.filter(p=>p.grnStatus!=='received' && p.invoiceStatus==='received').length;
  const full = enhancedPurchaseOrders.filter(p=>p.grnStatus==='received' && p.invoiceStatus==='received').length;
  const total = enhancedPurchaseOrders.length || 1;
  const seg = [onlyPO, poGRN, poInv, full];
  const pct = seg.map(s=> Math.round((s/total)*100));
  const colors = ['#9ca3af','#f59e0b','#3b82f6','#16a34a'];
  return (
    <div className="bg-white rounded-lg border border-[#DFE2E4] p-4">
      <div className="text-sm font-semibold text-[#31343A] mb-2">3‑Way Match Status</div>
      <div className="w-full bg-[#DFE2E4] rounded h-3 flex overflow-hidden">
        {seg.map((s,i)=> (
          <div key={i} style={{ width: `${(s/total)*100}%`, background: colors[i] }} />
        ))}
      </div>
      <div className="mt-2 grid grid-cols-4 text-xs text-[#31343A] gap-2">
        <div>PO only <b>{pct[0]}%</b></div>
        <div>PO+GRN <b>{pct[1]}%</b></div>
        <div>PO+Inv <b>{pct[2]}%</b></div>
        <div>PO+GRN+Inv <b>{pct[3]}%</b></div>
      </div>
    </div>
  );
}

