'use client';

import { enhancedPurchaseOrders } from '@/lib/mockData';
import { formatCurrency } from '@/lib/utils';

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

  // Calculate statistics
  const critical = soon.filter(po => po.dtd <= 2);
  const warning = soon.filter(po => po.dtd > 2 && po.dtd <= 7);
  const moderate = soon.filter(po => po.dtd > 7);

  const totalValue = soon.reduce((sum, po) => sum + (po.amount || 0), 0);
  const criticalValue = critical.reduce((sum, po) => sum + (po.amount || 0), 0);
  const warningValue = warning.reduce((sum, po) => sum + (po.amount || 0), 0);
  const moderateValue = moderate.reduce((sum, po) => sum + (po.amount || 0), 0);

  const uniqueVendors = new Set(soon.map(po => po.vendor || po.vendorId)).size;
  
  // Vendor breakdown
  const vendorMap = new Map();
  soon.forEach(po => {
    const vendorName = po.vendor || po.vendorId || 'Unknown';
    if (!vendorMap.has(vendorName)) {
      vendorMap.set(vendorName, { count: 0, value: 0 });
    }
    const vendor = vendorMap.get(vendorName);
    vendor.count += 1;
    vendor.value += po.amount || 0;
  });
  const topVendors = Array.from(vendorMap.entries())
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  return (
    <div className="bg-white rounded-lg border border-[#DFE2E4] p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-[#31343A]">Delivery Risk (next 14 days)</h4>
        <div className="text-xs text-[#9DA5A8]">POs without GRN</div>
      </div>

      {/* PO Tags */}
      <div className="mt-3 flex flex-wrap gap-2 flex-shrink-0">
        {soon.map(po => (
          <div key={po.id} className={`px-3 py-2 rounded border text-xs ${po.dtd <= 2 ? 'border-[#E00420]/30 bg-[#E00420]/10 text-[#E00420]' : po.dtd <= 7 ? 'border-yellow-300 bg-yellow-50 text-yellow-700' : 'border-[#B6BBBE] bg-[#DFE2E4] text-[#31343A]'}`}>
            {po.poNumber} • due {po.dtd}d • {po.vendor}
          </div>
        ))}
        {soon.length===0 && <div className="text-xs text-[#9DA5A8]">No upcoming risk.</div>}
      </div>

      {/* Summary Statistics */}
      {soon.length > 0 && (
        <div className="mt-6 pt-4 border-t border-[#DFE2E4] flex-1 flex flex-col">
          <div className="space-y-5">
            {/* Visual Risk Distribution Bar */}
            <div>
              <div className="text-xs font-semibold text-[#31343A] mb-2">Risk Distribution</div>
              <div className="flex h-6 rounded overflow-hidden border border-[#DFE2E4]">
                {critical.length > 0 && (
                  <div 
                    className="bg-[#E00420] flex items-center justify-center"
                    style={{ width: `${(critical.length / soon.length) * 100}%` }}
                    title={`Critical: ${critical.length} POs`}
                  >
                    <span className="text-[10px] font-semibold text-white">{critical.length}</span>
                  </div>
                )}
                {warning.length > 0 && (
                  <div 
                    className="bg-yellow-500 flex items-center justify-center"
                    style={{ width: `${(warning.length / soon.length) * 100}%` }}
                    title={`Warning: ${warning.length} POs`}
                  >
                    <span className="text-[10px] font-semibold text-white">{warning.length}</span>
                  </div>
                )}
                {moderate.length > 0 && (
                  <div 
                    className="bg-[#B6BBBE] flex items-center justify-center"
                    style={{ width: `${(moderate.length / soon.length) * 100}%` }}
                    title={`Moderate: ${moderate.length} POs`}
                  >
                    <span className="text-[10px] font-semibold text-white">{moderate.length}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Risk Level Breakdown */}
            <div>
              <div className="text-xs font-semibold text-[#31343A] mb-3">Risk Breakdown</div>
              <div className="space-y-2.5">
                {critical.length > 0 && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#E00420]"></div>
                        <span className="text-xs text-[#31343A]">Critical (≤2 days)</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-semibold text-[#E00420] block">{critical.length} PO{critical.length !== 1 ? 's' : ''}</span>
                        <span className="text-[10px] text-[#9DA5A8]">{formatCurrency(criticalValue)}</span>
                      </div>
                    </div>
                  </div>
                )}
                {warning.length > 0 && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                        <span className="text-xs text-[#31343A]">Warning (3-7 days)</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-semibold text-yellow-700 block">{warning.length} PO{warning.length !== 1 ? 's' : ''}</span>
                        <span className="text-[10px] text-[#9DA5A8]">{formatCurrency(warningValue)}</span>
                      </div>
                    </div>
                  </div>
                )}
                {moderate.length > 0 && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#B6BBBE]"></div>
                        <span className="text-xs text-[#31343A]">Moderate (8-14 days)</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-semibold text-[#31343A] block">{moderate.length} PO{moderate.length !== 1 ? 's' : ''}</span>
                        <span className="text-[10px] text-[#9DA5A8]">{formatCurrency(moderateValue)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Top Vendors */}
            {topVendors.length > 0 && (
              <div>
                <div className="text-xs font-semibold text-[#31343A] mb-2">Top Vendors at Risk</div>
                <div className="space-y-2">
                  {topVendors.map((vendor, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-[#DFE2E4]/20 rounded">
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-[#31343A] truncate">{vendor.name}</div>
                        <div className="text-[10px] text-[#9DA5A8]">{vendor.count} PO{vendor.count !== 1 ? 's' : ''}</div>
                      </div>
                      <div className="text-xs font-semibold text-[#31343A] ml-2">{formatCurrency(vendor.value)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Summary Metrics */}
            <div className="pt-3 border-t border-[#DFE2E4]">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-[#9DA5A8] mb-1">Total Value at Risk</div>
                  <div className="text-sm font-semibold text-[#31343A]">{formatCurrency(totalValue)}</div>
                </div>
                <div>
                  <div className="text-xs text-[#9DA5A8] mb-1">Vendors Affected</div>
                  <div className="text-sm font-semibold text-[#31343A]">{uniqueVendors}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

