'use client';

import { useState, useMemo } from 'react';
import { enhancedVendors, mockRFQs, enhancedPurchaseOrders } from '@/lib/mockData';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface VendorDiscountData {
  vendorId: string;
  vendorName: string;
  totalSpend: number;
  avgDiscountPercent: number;
  orderCount: number;
  category?: string;
}

export function VendorDiscountSpendChart() {
  const [timePeriod, setTimePeriod] = useState<'this-month' | '3-months' | 'this-year'>('this-month');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Get date range based on time period
  const dateRange = useMemo(() => {
    const now = new Date();
    let startDate: Date;
    
    switch (timePeriod) {
      case 'this-month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case '3-months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        break;
      case 'this-year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
    }
    
    return { startDate, endDate: now };
  }, [timePeriod]);

  // Get unique categories/subcategories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    enhancedVendors.forEach(v => {
      if (v.category) cats.add(v.category);
    });
    return Array.from(cats).sort();
  }, []);

  // Calculate vendor discount data
  const vendorData = useMemo(() => {
    const vendorMap = new Map<string, VendorDiscountData>();

    // Filter POs by date range
    const filteredPOs = enhancedPurchaseOrders.filter(po => {
      const poDate = new Date(po.createdAt);
      return poDate >= dateRange.startDate && poDate <= dateRange.endDate;
    });

    // Process each PO to calculate discount
    filteredPOs.forEach(po => {
      // Find related RFQ (match by item name or vendor)
      const relatedRFQ = mockRFQs.find(rfq => {
        const rfqDate = new Date(rfq.dueDate);
        return rfqDate <= dateRange.endDate && 
               (rfq.itemName.toLowerCase().includes(po.itemName.toLowerCase().substring(0, 10)) ||
                po.vendor.toLowerCase().includes(rfq.itemName.toLowerCase().substring(0, 10)));
      });

      if (!relatedRFQ) return;

      const vendor = enhancedVendors.find(v => v.id === po.vendorId || v.name === po.vendor);
      if (!vendor) return;

      // Filter by category if selected
      if (categoryFilter !== 'all' && vendor.category !== categoryFilter) return;

      const firstQuote = relatedRFQ.lowestQuote;
      const poAmount = po.amount;
      
      // Calculate discount percentage (positive means discount, negative means increase)
      const discountPercent = firstQuote > 0 
        ? ((firstQuote - poAmount) / firstQuote) * 100 
        : 0;

      if (!vendorMap.has(vendor.id)) {
        vendorMap.set(vendor.id, {
          vendorId: vendor.id,
          vendorName: vendor.name,
          totalSpend: 0,
          avgDiscountPercent: 0,
          orderCount: 0,
          category: vendor.category,
        });
      }

      const data = vendorMap.get(vendor.id)!;
      data.totalSpend += poAmount;
      data.orderCount += 1;
      // Calculate weighted average discount
      data.avgDiscountPercent = 
        ((data.avgDiscountPercent * (data.orderCount - 1)) + discountPercent) / data.orderCount;
    });

    // If no data from POs, generate synthetic data for visualization
    if (vendorMap.size === 0) {
      enhancedVendors.forEach(vendor => {
        if (categoryFilter !== 'all' && vendor.category !== categoryFilter) return;
        
        // Generate synthetic discount data based on vendor performance
        const baseDiscount = (vendor.performanceRating - 3) * 5; // -10% to +10% based on rating
        const discountVariation = (vendor.id.charCodeAt(0) % 10) - 5; // -5% to +5%
        const avgDiscount = baseDiscount + discountVariation;
        
        // Generate order count based on spend
        const orderCount = Math.max(1, Math.floor(vendor.totalSpend / 500000));
        
        vendorMap.set(vendor.id, {
          vendorId: vendor.id,
          vendorName: vendor.name,
          totalSpend: vendor.totalSpend,
          avgDiscountPercent: avgDiscount,
          orderCount: orderCount,
          category: vendor.category,
        });
      });
    }

    return Array.from(vendorMap.values());
  }, [dateRange, categoryFilter]);

  // Chart dimensions
  const w = 480, h = 400, pad = 50, padRight = 25, padBottom = 35;
  const plotW = w - pad - padRight;
  const plotH = h - pad - padBottom;

  // Calculate scales
  const maxSpend = Math.max(...vendorData.map(v => v.totalSpend), 1);
  const minDiscount = Math.min(...vendorData.map(v => v.avgDiscountPercent), -10);
  const maxDiscount = Math.max(...vendorData.map(v => v.avgDiscountPercent), 15);
  const discountRange = maxDiscount - minDiscount;
  const maxOrderCount = Math.max(...vendorData.map(v => v.orderCount), 1);

  const [hoveredVendor, setHoveredVendor] = useState<number | null>(null);

  // Plot points
  const points = vendorData.map((v, idx) => {
    const x = pad + ((v.avgDiscountPercent - minDiscount) / discountRange) * plotW;
    const y = pad + plotH - (v.totalSpend / maxSpend) * plotH;
    const r = Math.max(8, Math.min(30, Math.sqrt(v.orderCount) * 8));
    return { ...v, x, y, r, index: idx };
  });

  return (
    <div className="bg-white rounded-lg border border-[#DFE2E4] p-4 relative">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-semibold text-[#31343A]">Vendors: Discount vs Spend</div>
        <div className="flex items-center gap-2">
          <select
            value={timePeriod}
            onChange={(e) => setTimePeriod(e.target.value as any)}
            className="px-3 py-1.5 border border-[#B6BBBE] rounded-lg text-xs focus:ring-2 focus:ring-[#005691] text-[#31343A]"
          >
            <option value="this-month">This Month</option>
            <option value="3-months">3 Months</option>
            <option value="this-year">This Year</option>
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 border border-[#B6BBBE] rounded-lg text-xs focus:ring-2 focus:ring-[#005691] text-[#31343A]"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="flex gap-4 mb-2 text-xs text-[#9DA5A8]">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#005691] border border-[#005691]/50"></div>
          <span>Bubble size = No of Orders</span>
        </div>
      </div>

      <svg width={w} height={h} className="bg-white">
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map((val) => {
          const x = pad + (val/100) * plotW;
          const y = pad + plotH - (val/100) * plotH;
          return (
            <g key={`grid-${val}`}>
              <line x1={x} y1={pad} x2={x} y2={pad + plotH} stroke="#DFE2E4" strokeWidth="0.5" strokeDasharray="2,2" opacity={0.5} />
              <line x1={pad} y1={y} x2={pad + plotW} y2={y} stroke="#DFE2E4" strokeWidth="0.5" strokeDasharray="2,2" opacity={0.5} />
            </g>
          );
        })}

        {/* Zero line for discount */}
        <line 
          x1={pad + ((0 - minDiscount) / discountRange) * plotW} 
          y1={pad} 
          x2={pad + ((0 - minDiscount) / discountRange) * plotW} 
          y2={pad + plotH} 
          stroke="#9DA5A8" 
          strokeWidth="1.5" 
          strokeDasharray="4,2" 
          opacity={0.6} 
        />

        {/* Main axes */}
        <line x1={pad} y1={pad} x2={pad} y2={pad + plotH} stroke="#9DA5A8" strokeWidth="1.5" />
        <line x1={pad} y1={pad + plotH} x2={pad + plotW} y2={pad + plotH} stroke="#9DA5A8" strokeWidth="1.5" />

        {/* Y-axis labels (Spend) */}
        {[0, 25, 50, 75, 100].map((val) => {
          const y = pad + plotH - (val/100) * plotH;
          const spendValue = (maxSpend * val / 100) / 1000000; // Convert to millions
          return (
            <text key={`y-${val}`} x={pad-8} y={y} textAnchor="end" fontSize="9" fill="#9DA5A8" dominantBaseline="middle">
              ₹{spendValue.toFixed(1)}M
            </text>
          );
        })}

        {/* X-axis labels (Discount %) */}
        {[-10, -5, 0, 5, 10, 15].map((val) => {
          if (val < minDiscount || val > maxDiscount) return null;
          const x = pad + ((val - minDiscount) / discountRange) * plotW;
          return (
            <text key={`x-${val}`} x={x} y={h-padBottom+12} textAnchor="middle" fontSize="9" fill="#9DA5A8">
              {val}%
            </text>
          );
        })}

        {/* Vendor points */}
        {points.map((p, i) => {
          const isHovered = hoveredVendor === i;
          const shortLabel = p.vendorName.split(' ')[0];
          
          return (
            <g key={p.vendorId}>
              <circle 
                cx={p.x} 
                cy={p.y} 
                r={isHovered ? p.r + 3 : p.r} 
                fill={p.avgDiscountPercent > 0 ? "#22C55E" : "#EF4444"} 
                opacity={isHovered ? 0.95 : 0.75}
                stroke={p.avgDiscountPercent > 0 ? "#16A34A" : "#DC2626"}
                strokeWidth={isHovered ? 3 : 2}
                onMouseEnter={() => setHoveredVendor(i)}
                onMouseLeave={() => setHoveredVendor(null)}
                className="cursor-pointer transition-all"
              />
              <circle 
                cx={p.x} 
                cy={p.y} 
                r={p.r + 1.5} 
                fill="none"
                stroke="white"
                strokeWidth="2"
                opacity={0.8}
                className="pointer-events-none"
              />
              <text 
                x={p.x} 
                y={p.y} 
                textAnchor="middle" 
                fontSize={p.r > 12 ? "8" : "7"} 
                fill="white" 
                fontWeight="600"
                className="pointer-events-none"
                dominantBaseline="middle"
              >
                {shortLabel.length > 8 ? shortLabel.substring(0, 6) + '..' : shortLabel}
              </text>
            </g>
          );
        })}

        {/* Axis labels */}
        <text x={pad + plotW/2} y={h-8} textAnchor="middle" fontSize="10" fill="#31343A" fontWeight="500">Discount % (1st Quote to PO)</text>
        <text x={14} y={pad + plotH/2} transform={`rotate(-90 14 ${pad + plotH/2})`} fontSize="10" fill="#31343A" fontWeight="500" textAnchor="middle">Total Spend (₹)</text>
      </svg>

      {/* Tooltip */}
      {hoveredVendor !== null && points[hoveredVendor] && (
        <div 
          className="relative bg-white border border-[#B6BBBE] rounded-lg shadow-lg p-3 z-10 pointer-events-none"
          style={{
            position: 'absolute',
            left: `${points[hoveredVendor].x + 30}px`,
            top: `${points[hoveredVendor].y - 90}px`,
            minWidth: '180px',
            transform: points[hoveredVendor].x + 180 > w ? 'translateX(-100%)' : 'none'
          }}
        >
          <div className="text-xs font-semibold text-[#31343A] mb-1.5">{points[hoveredVendor].vendorName}</div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-[#9DA5A8]">Total Spend:</span>
              <span className="text-[#31343A] font-medium">{formatCurrency(points[hoveredVendor].totalSpend)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#9DA5A8]">Discount %:</span>
              <span className={cn(
                "font-medium",
                points[hoveredVendor].avgDiscountPercent > 0 ? "text-green-600" : "text-red-600"
              )}>
                {points[hoveredVendor].avgDiscountPercent > 0 ? '+' : ''}{points[hoveredVendor].avgDiscountPercent.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#9DA5A8]">Orders:</span>
              <span className="text-[#31343A] font-medium">{points[hoveredVendor].orderCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#9DA5A8]">Category:</span>
              <span className="text-[#31343A] font-medium capitalize">{points[hoveredVendor].category || 'N/A'}</span>
            </div>
          </div>
        </div>
      )}

      {/* Summary stats */}
      <div className="mt-3 pt-3 border-t border-[#DFE2E4] grid grid-cols-3 gap-4 text-xs">
        <div>
          <div className="text-[#9DA5A8] mb-0.5">Avg Discount</div>
          <div className="text-sm font-semibold text-[#31343A]">
            {vendorData.length > 0 
              ? (vendorData.reduce((sum, v) => sum + v.avgDiscountPercent, 0) / vendorData.length).toFixed(1) + '%'
              : '0%'}
          </div>
        </div>
        <div>
          <div className="text-[#9DA5A8] mb-0.5">Total Spend</div>
          <div className="text-sm font-semibold text-[#31343A]">
            {formatCurrency(vendorData.reduce((sum, v) => sum + v.totalSpend, 0))}
          </div>
        </div>
        <div>
          <div className="text-[#9DA5A8] mb-0.5">Vendors</div>
          <div className="text-sm font-semibold text-[#31343A]">{vendorData.length} Active</div>
        </div>
      </div>
    </div>
  );
}

