'use client';

import { enhancedContracts, enhancedPurchaseOrders } from '@/lib/mockData';
import { formatCurrency } from '@/lib/utils';

export function OffContractSpend(){
  const vendorWithActive = new Set(enhancedContracts.filter(c=>c.status==='executed').map(c=>c.vendorId));
  const off = enhancedPurchaseOrders.filter(po => !vendorWithActive.has(po.vendorId));
  const total = off.reduce((s,po)=> s + (po.amount||0), 0);
  return (
    <div className="bg-white rounded-lg border border-[#DFE2E4] p-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-[#31343A]">Off‑contract Spend</h4>
        <div className="text-xs text-[#9DA5A8]">{off.length} POs</div>
      </div>
      <div className="mt-2 text-xl font-semibold text-[#31343A]">{formatCurrency(total)}</div>
      <div className="mt-2 text-xs text-[#9DA5A8]">Vendors without active contracts on PO date.</div>
    </div>
  );
}

