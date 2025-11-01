import {
  enhancedVendors,
  enhancedContracts,
  enhancedPurchaseOrders,
} from '@/lib/mockData';

type VendorStat = {
  vendorId: string;
  vendorName: string;
  category: string;
  healthScore: number;
  onTime: number;
  leadTime: number;
  totalSpend: number;
  contractCount: number;
  avgContractUtilization?: number;
  lastPODate?: string;
  daysSinceLastPO?: number;
  poSparkline: number[];          // last N PO amounts (small chart)
  contractUtilBars: number[];     // small bar chart values (utilization %)
};

const daysBetween = (a: Date, b: Date) => Math.ceil((+a - +b) / (1000 * 60 * 60 * 24));

/** Build stats for a vendor from mocks */
export function buildVendorStats(vendorId: string): VendorStat {
  const v = enhancedVendors.find(x => x.id === vendorId)!;

  const pos = enhancedPurchaseOrders
    .filter(po => po.vendorId === vendorId)
    .sort((a,b) => +new Date(a.createdAt) - +new Date(b.createdAt));

  const contracts = enhancedContracts.filter(c => c.vendorId === vendorId);
  const totalSpend = pos.reduce((s, p) => s + (p.amount || 0), 0);
  const contractCount = contracts.length;

  const lastPO = pos[pos.length - 1];
  const lastPODate = lastPO ? lastPO.createdAt : undefined;
  const daysSinceLastPO = lastPO ? daysBetween(new Date(), new Date(lastPO.createdAt)) : undefined;

  // tiny sparkline: take up to last 8 PO amounts
  const poSparkline = pos.slice(-8).map(p => p.amount || 0);

  // tiny bars: each contract utilization%
  const contractUtilBars = contracts.map(c => c.utilizedPercent || 0);
  const avgContractUtilization = contractUtilBars.length
    ? Math.round(contractUtilBars.reduce((a,b) => a+b, 0) / contractUtilBars.length)
    : undefined;

  return {
    vendorId: v.id,
    vendorName: v.name,
    category: v.category,
    healthScore: v.healthScore,
    onTime: v.onTimeDeliveryPercent,
    leadTime: v.avgLeadTimeDays,
    totalSpend,
    contractCount,
    avgContractUtilization,
    lastPODate,
    daysSinceLastPO,
    poSparkline,
    contractUtilBars,
  };
}

/** Rank vendors for a request: simple additive score (no ML) */
export function suggestVendorsForRequest(opts: {
  itemName: string;
  department?: string;
  categoryHint?: string;      // pass request.category if you have it
  topN?: number;
}) {
  const { itemName, department, categoryHint, topN = 3 } = opts;
  const nameLC = itemName.toLowerCase();

      // Automotive industry category inference
      const kwBearings = /bearing|bearing|ball.*bearing|roller.*bearing/;
      const kwEngine = /engine|piston|crankshaft|camshaft|valve|cylinder/;
      const kwSteel = /steel|coil|sheet|metal|chassis|body.*panel/;
      const kwElectronics = /sensor|ecu|harness|wiring|electronic|control|battery|cell/;
      const kwBrake = /brake|pad|caliper|rotor|disc/;
      const kwTire = /tire|tyre|wheel|rim/;
      const kwPaint = /paint|coating|primer|basecoat|clearcoat/;
      const kwTransmission = /transmission|gear|clutch|differential/;
      const kwSuspension = /suspension|spring|shock|strut|damper/;

      const inferred = categoryHint
        ?? (kwBearings.test(nameLC) ? 'hardware'
          : kwEngine.test(nameLC) ? 'hardware'
          : kwBrake.test(nameLC) ? 'hardware'
          : kwElectronics.test(nameLC) ? 'hardware'
          : kwTransmission.test(nameLC) ? 'hardware'
          : kwSuspension.test(nameLC) ? 'hardware'
          : kwTire.test(nameLC) ? 'hardware'
          : kwSteel.test(nameLC) ? 'materials'
          : kwPaint.test(nameLC) ? 'materials'
          : 'hardware');

  const scored = enhancedVendors.map(v => {
    // base on health + on-time + inverse lead
    let score =
      (v.healthScore || 0) * 0.5 +
      (v.onTimeDeliveryPercent || 0) * 0.35 +
      (100 - Math.min(30, v.avgLeadTimeDays || 0) * 3) * 0.15;

    // category fit boost
    if (v.category?.toLowerCase() === inferred) score += 12;

        // automotive-specific keyword matching
        if (inferred === 'hardware') {
          if (/bearing|skf|fag|ntn|bearing/i.test(v.name)) score += 8;
          if (/bosch|denso|continental|automotive/i.test(v.name)) score += 7;
          if (/brake|pad|suspension|transmission/i.test(nameLC) && /brake|suspension|transmission/i.test(v.name)) score += 6;
        }
        if (inferred === 'materials') {
          if (/steel|arcelormittal|tata.*steel/i.test(v.name)) score += 8;
          if (/paint|ppg|basf|coating/i.test(v.name)) score += 7;
        }

    return { vendor: v, score, inferred };
  });

  const top = scored.sort((a,b) => b.score - a.score).slice(0, topN);
  return top.map(t => ({ ...buildVendorStats(t.vendor.id), inferredCategory: t.inferred }));
}

