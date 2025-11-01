'use client';

import { enhancedPurchaseOrders } from '@/lib/mockData';

function daysToDue(dueDate?: string){
  if (!dueDate) return 9999;
  return Math.ceil((+new Date(dueDate) - Date.now()) / 86400000);
}

export function DeliveryRiskStrip(){
  const soon = (enhancedPurchaseOrders as any[]).filter(po => (po.grnStatus !== 'received'))
    .filter(po => typeof (po as any).dueDeliveryDate === 'string')
    .map(po => ({ ...po, dtd: daysToDue((po as any).dueDeliveryDate) }))
    .filter(po => po.dtd <= 14)
    .sort((a,b)=> a.dtd - b.dtd);

  return (
    <div className="bg-white rounded-lg border border-[#DFE2E4] p-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-[#31343A]">Delivery Risk (next 14 days)</h4>
        <div className="text-xs text-[#9DA5A8]">POs without GRN</div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {soon.map(po => (
          <div key={po.id} className={`px-3 py-2 rounded border text-xs ${po.dtd <= 2 ? 'border-[#E00420]/30 bg-[#E00420]/10 text-[#E00420]' : po.dtd <= 7 ? 'border-yellow-300 bg-yellow-50 text-yellow-700' : 'border-[#B6BBBE] bg-[#DFE2E4] text-[#31343A]'}`}>
            {po.poNumber} • due {po.dtd}d • {po.vendor}
          </div>
        ))}
        {soon.length===0 && <div className="text-xs text-[#9DA5A8]">No upcoming risk.</div>}
      </div>
    </div>
  );
}

