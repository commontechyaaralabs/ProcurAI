'use client';

import { useState } from 'react';
import { enhancedVendors } from '@/lib/mockData';
import { formatCurrency } from '@/lib/utils';

interface VendorScatterProps {
  showQuadrantView?: boolean;
}

export function VendorScatter({ showQuadrantView = true }: VendorScatterProps){
  const [hoveredVendor, setHoveredVendor] = useState<number | null>(null);
  const w = 480, h = 400, pad = 50, padRight = 25, padBottom = 35;
  
  // Map vendors from mockData - ensure all 8 vendors are included
  const pts = enhancedVendors.filter(v => v.onTimeDeliveryPercent != null && v.qualityPercent != null).map((v, idx) => ({
    x: v.onTimeDeliveryPercent || 0,
    y: v.qualityPercent || 0,
    r: Math.sqrt((v.totalSpend || 1)) / 120, // Adjusted divisor for better size variation
    label: v.name,
    vendor: v,
    index: idx
  }));

  // Calculate averages for threshold lines
  const avgOnTime = pts.reduce((sum, p) => sum + p.x, 0) / pts.length;
  const avgQuality = pts.reduce((sum, p) => sum + p.y, 0) / pts.length;

  const plotW = w - pad - padRight;
  const plotH = h - pad - padBottom;

  // Add jitter/spread to prevent overlapping - use a loop to build array sequentially
  const spreadPoints: Array<typeof pts[0] & { baseX: number; baseY: number; displayX: number; displayY: number; r: number }> = [];
  
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i];
    const baseX = pad + (p.x/100) * plotW;
    const baseY = pad + plotH - (p.y/100) * plotH;
    const r = Math.max(8, Math.min(25, p.r * 20)); // Increased max size for better visibility
    
    // Find nearby points and calculate offset
    let offsetX = 0;
    let offsetY = 0;
    const minDistance = r * 2.5; // Minimum distance between bubble centers
    
    for (let j = 0; j < i; j++) {
      const other = spreadPoints[j];
      const otherX = other.displayX;
      const otherY = other.displayY;
      const dx = baseX - otherX;
      const dy = baseY - otherY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < minDistance && distance > 0) {
        // Push away from overlapping point
        const pushDistance = (minDistance - distance) / distance;
        offsetX += dx * pushDistance * 0.5;
        offsetY += dy * pushDistance * 0.5;
      }
    }
    
    // Add slight random jitter if no collision detected
    if (Math.abs(offsetX) < 1 && Math.abs(offsetY) < 1) {
      const angle = (i * 137.5) % 360; // Golden angle for even distribution
      const jitterRadius = Math.min(r * 0.3, 8);
      offsetX += Math.cos(angle * Math.PI / 180) * jitterRadius;
      offsetY += Math.sin(angle * Math.PI / 180) * jitterRadius;
    }
    
    // Constrain to plot area
    const displayX = Math.max(pad + r, Math.min(pad + plotW - r, baseX + offsetX));
    const displayY = Math.max(pad + r, Math.min(pad + plotH - r, baseY + offsetY));
    
    spreadPoints.push({
      ...p,
      baseX,
      baseY,
      displayX,
      displayY,
      r
    });
  }

  // Improve spread algorithm - more aggressive separation
  const improvedSpreadPoints = [...spreadPoints];
  for (let iteration = 0; iteration < 3; iteration++) {
    for (let i = 0; i < improvedSpreadPoints.length; i++) {
      const p = improvedSpreadPoints[i];
      let totalDx = 0;
      let totalDy = 0;
      let count = 0;
      
      for (let j = 0; j < improvedSpreadPoints.length; j++) {
        if (i === j) continue;
        const other = improvedSpreadPoints[j];
        const dx = p.displayX - other.displayX;
        const dy = p.displayY - other.displayY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minDist = (p.r + other.r) * 1.8;
        
        if (distance < minDist && distance > 0) {
          const force = (minDist - distance) / minDist;
          totalDx += (dx / distance) * force * 15;
          totalDy += (dy / distance) * force * 15;
          count++;
        }
      }
      
      if (count > 0) {
        improvedSpreadPoints[i].displayX = Math.max(
          pad + improvedSpreadPoints[i].r,
          Math.min(pad + plotW - improvedSpreadPoints[i].r, improvedSpreadPoints[i].displayX + totalDx / count)
        );
        improvedSpreadPoints[i].displayY = Math.max(
          pad + improvedSpreadPoints[i].r,
          Math.min(pad + plotH - improvedSpreadPoints[i].r, improvedSpreadPoints[i].displayY + totalDy / count)
        );
      }
    }
  }

  return (
    <div className="bg-white rounded-lg border border-[#DFE2E4] p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-semibold text-[#31343A]">Vendors: On‑time vs Quality</div>
        <div className="flex items-center gap-4 text-xs text-[#9DA5A8]">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#E00420]/20 border border-[#E00420]/50"></div>
            <span>High Performer</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#DFE2E4] border border-[#B6BBBE]"></div>
            <span>Bubble size = Spend</span>
          </div>
        </div>
      </div>
      
      <div className={`flex gap-3 items-start ${showQuadrantView ? '' : 'justify-center'}`}>
        {/* Column 1: Chart */}
        <div className={`relative ${showQuadrantView ? 'flex-1' : 'w-full'}`}>
        <svg width={w} height={h} className="bg-white">
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((val) => {
            const x = pad + (val/100) * plotW;
            const y = pad + plotH - (val/100) * plotH;
            return (
              <g key={`grid-${val}`}>
                <line x1={x} y1={pad} x2={x} y2={pad + plotH} stroke="#DFE2E4" strokeWidth="0.5" strokeDasharray="2,2" opacity={0.5} />
                <line x1={pad} y1={y} x2={pad + plotW} y2={y} stroke="#DFE2E4" strokeWidth="0.5" strokeDasharray="2,2" opacity={0.5} />
                {/* X-axis labels */}
                <text x={x} y={h-padBottom+12} textAnchor="middle" fontSize="9" fill="#9DA5A8">{val}%</text>
                {/* Y-axis labels */}
                <text x={pad-8} y={y} textAnchor="end" fontSize="9" fill="#9DA5A8" dominantBaseline="middle">{val}%</text>
              </g>
            );
          })}

          {/* Quadrant background shades */}
          <rect x={pad} y={pad} width={plotW/2} height={plotH/2} fill="#E00420" opacity={0.03} />
          <rect x={pad+plotW/2} y={pad} width={plotW/2} height={plotH/2} fill="#005691" opacity={0.03} />
          <rect x={pad} y={pad+plotH/2} width={plotW/2} height={plotH/2} fill="#DFE2E4" opacity={0.05} />
          <rect x={pad+plotW/2} y={pad+plotH/2} width={plotW/2} height={plotH/2} fill="#DFE2E4" opacity={0.05} />

          {/* Quadrant labels */}
          <text x={pad+plotW*0.25} y={pad+plotH*0.15} textAnchor="middle" fontSize="9" fill="#9DA5A8" fontWeight="500">Low On-time</text>
          <text x={pad+plotW*0.25} y={pad+plotH*0.25} textAnchor="middle" fontSize="9" fill="#9DA5A8" fontWeight="500">High Quality</text>
          <text x={pad+plotW*0.75} y={pad+plotH*0.15} textAnchor="middle" fontSize="9" fill="#9DA5A8" fontWeight="500">High On-time</text>
          <text x={pad+plotW*0.75} y={pad+plotH*0.25} textAnchor="middle" fontSize="9" fill="#9DA5A8" fontWeight="500">High Quality</text>

          {/* Average threshold lines */}
          <line 
            x1={pad + (avgOnTime/100) * plotW} 
            y1={pad} 
            x2={pad + (avgOnTime/100) * plotW} 
            y2={pad + plotH} 
            stroke="#E00420" 
            strokeWidth="1.5" 
            strokeDasharray="4,2" 
            opacity={0.6} 
          />
          <line 
            x1={pad} 
            y1={pad + plotH - (avgQuality/100) * plotH} 
            x2={pad + plotW} 
            y2={pad + plotH - (avgQuality/100) * plotH} 
            stroke="#E00420" 
            strokeWidth="1.5" 
            strokeDasharray="4,2" 
            opacity={0.6} 
          />
          <text 
            x={pad + (avgOnTime/100) * plotW + 4} 
            y={pad + 10} 
            fontSize="8" 
            fill="#E00420" 
            fontWeight="600"
          >
            Avg: {avgOnTime.toFixed(0)}%
          </text>
          <text 
            x={pad + plotW - 50} 
            y={pad + plotH - (avgQuality/100) * plotH - 4} 
            fontSize="8" 
            fill="#E00420" 
            fontWeight="600"
            textAnchor="end"
          >
            Avg: {avgQuality.toFixed(0)}%
          </text>

          {/* Main axes */}
          <line x1={pad} y1={pad} x2={pad} y2={pad + plotH} stroke="#9DA5A8" strokeWidth="1.5" />
          <line x1={pad} y1={pad + plotH} x2={pad + plotW} y2={pad + plotH} stroke="#9DA5A8" strokeWidth="1.5" />

          {/* Connection lines from actual position to displayed position (if offset) */}
          {improvedSpreadPoints.map((p, i) => {
            const distance = Math.sqrt(
              Math.pow(p.displayX - p.baseX, 2) + Math.pow(p.displayY - p.baseY, 2)
            );
            if (distance > 2) {
              return (
                <line
                  key={`line-${i}`}
                  x1={p.baseX}
                  y1={p.baseY}
                  x2={p.displayX}
                  y2={p.displayY}
                  stroke="#DFE2E4"
                  strokeWidth="1"
                  strokeDasharray="2,2"
                  opacity={0.3}
                />
              );
            }
            return null;
          })}

          {/* Vendor points */}
          {improvedSpreadPoints.map((p, i) => {
            const isHovered = hoveredVendor === i;
            const isHighPerformer = p.x >= avgOnTime && p.y >= avgQuality;
            const shortLabel = p.label.split(' ')[0];
            
            return (
              <g key={i}>
                {/* Bubble */}
                <circle 
                  cx={p.displayX} 
                  cy={p.displayY} 
                  r={isHovered ? p.r + 3 : p.r} 
                  fill={isHighPerformer ? "#E00420" : "#005691"} 
                  opacity={isHovered ? 0.95 : 0.75}
                  stroke={isHighPerformer ? "#E00420" : "#005691"}
                  strokeWidth={isHovered ? 3 : 2}
                  onMouseEnter={() => setHoveredVendor(i)}
                  onMouseLeave={() => setHoveredVendor(null)}
                  className="cursor-pointer transition-all"
                />
                {/* White outline for better visibility */}
                <circle 
                  cx={p.displayX} 
                  cy={p.displayY} 
                  r={p.r + 1.5} 
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  opacity={0.8}
                  className="pointer-events-none"
                />
                {/* Vendor label - always visible */}
                <text 
                  x={p.displayX} 
                  y={p.displayY} 
                  textAnchor="middle" 
                  fontSize={p.r > 12 ? "8" : "7"} 
                  fill="white" 
                  fontWeight="600"
                  className="pointer-events-none"
                  dominantBaseline="middle"
                >
                  {shortLabel.length > 8 ? shortLabel.substring(0, 6) + '..' : shortLabel}
                </text>
                {/* Actual position indicator (small dot) */}
                {Math.sqrt(Math.pow(p.displayX - p.baseX, 2) + Math.pow(p.displayY - p.baseY, 2)) > 3 && (
                  <circle 
                    cx={p.baseX} 
                    cy={p.baseY} 
                    r={2} 
                    fill="#9DA5A8"
                    opacity={0.6}
                    className="pointer-events-none"
                  />
                )}
              </g>
            );
          })}

          {/* Axis labels */}
          <text x={pad + plotW/2} y={h-8} textAnchor="middle" fontSize="10" fill="#31343A" fontWeight="500">On-time Delivery %</text>
          <text x={14} y={pad + plotH/2} transform={`rotate(-90 14 ${pad + plotH/2})`} fontSize="10" fill="#31343A" fontWeight="500" textAnchor="middle">Quality Score %</text>
        </svg>

        {/* Tooltip */}
        {hoveredVendor !== null && improvedSpreadPoints[hoveredVendor] && (
          <div 
            className="absolute bg-white border border-[#B6BBBE] rounded-lg shadow-lg p-3 z-10 pointer-events-none"
            style={{
              left: `${improvedSpreadPoints[hoveredVendor].displayX + 30}px`,
              top: `${improvedSpreadPoints[hoveredVendor].displayY - 90}px`,
              minWidth: '180px',
              transform: improvedSpreadPoints[hoveredVendor].displayX + 180 > w ? 'translateX(-100%)' : 'none'
            }}
          >
            <div className="text-xs font-semibold text-[#31343A] mb-1.5">{improvedSpreadPoints[hoveredVendor].label}</div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-[#9DA5A8]">On-time:</span>
                <span className="text-[#31343A] font-medium">{improvedSpreadPoints[hoveredVendor].x.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#9DA5A8]">Quality:</span>
                <span className="text-[#31343A] font-medium">{improvedSpreadPoints[hoveredVendor].y.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#9DA5A8]">Total Spend:</span>
                <span className="text-[#31343A] font-medium">{formatCurrency(improvedSpreadPoints[hoveredVendor].vendor.totalSpend)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#9DA5A8]">Rating:</span>
                <span className="text-[#31343A] font-medium">{improvedSpreadPoints[hoveredVendor].vendor.performanceRating}/5.0</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-[#DFE2E4]">
                <span className="text-[#9DA5A8]">Health:</span>
                <span className={`font-medium ${improvedSpreadPoints[hoveredVendor].vendor.healthStatus === 'green' ? 'text-green-600' : improvedSpreadPoints[hoveredVendor].vendor.healthStatus === 'amber' ? 'text-yellow-600' : 'text-red-600'}`}>
                  {improvedSpreadPoints[hoveredVendor].vendor.healthScore}%
                </span>
              </div>
            </div>
          </div>
        )}
        </div>

        {showQuadrantView && (
          <>
        {/* Column 2: Quadrant View Visual */}
        <div className="flex-1 border-l border-[#DFE2E4] pl-4 flex-shrink-0 flex flex-col items-center">
          <div className="text-sm font-semibold text-[#31343A] mb-4">Quadrant View</div>
          
          {/* Visual Quadrant Grid - Centered and Larger */}
          <div className="flex justify-center w-full">
            <svg width="320" height="320" className="border border-[#DFE2E4] rounded" viewBox="0 0 320 320">
              {/* Quadrant backgrounds */}
              <rect x="0" y="0" width="160" height="160" fill="#005691" opacity="0.1" />
              <rect x="160" y="0" width="160" height="160" fill="#E00420" opacity="0.1" />
              <rect x="0" y="160" width="160" height="160" fill="#DFE2E4" opacity="0.2" />
              <rect x="160" y="160" width="160" height="160" fill="#DFE2E4" opacity="0.2" />
              
              {/* Threshold lines */}
              <line x1="160" y1="0" x2="160" y2="320" stroke="#E00420" strokeWidth="2" strokeDasharray="4,3" opacity="0.6" />
              <line x1="0" y1="160" x2="320" y2="160" stroke="#E00420" strokeWidth="2" strokeDasharray="4,3" opacity="0.6" />
              
              {/* Top-Left Quadrant */}
              <text x="80" y="50" textAnchor="middle" fontSize="12" fill="#31343A" fontWeight="600">Quality Focus</text>
              <text x="80" y="70" textAnchor="middle" fontSize="9" fill="#9DA5A8">Low On-time</text>
              <text x="80" y="85" textAnchor="middle" fontSize="9" fill="#9DA5A8">High Quality</text>
              
              {/* Top-Right Quadrant */}
              <text x="240" y="50" textAnchor="middle" fontSize="12" fill="#31343A" fontWeight="600">Star Performers</text>
              <text x="240" y="70" textAnchor="middle" fontSize="9" fill="#9DA5A8">High On-time</text>
              <text x="240" y="85" textAnchor="middle" fontSize="9" fill="#9DA5A8">High Quality</text>
              
              {/* Bottom-Left Quadrant */}
              <text x="80" y="210" textAnchor="middle" fontSize="12" fill="#31343A" fontWeight="600">At-Risk</text>
              <text x="80" y="230" textAnchor="middle" fontSize="9" fill="#9DA5A8">Low On-time</text>
              <text x="80" y="245" textAnchor="middle" fontSize="9" fill="#9DA5A8">Low Quality</text>
              
              {/* Bottom-Right Quadrant */}
              <text x="240" y="210" textAnchor="middle" fontSize="12" fill="#31343A" fontWeight="600">Timely Risky</text>
              <text x="240" y="230" textAnchor="middle" fontSize="9" fill="#9DA5A8">High On-time</text>
              <text x="240" y="245" textAnchor="middle" fontSize="9" fill="#9DA5A8">Low Quality</text>
              
              {/* Axes labels */}
              <text x="160" y="310" textAnchor="middle" fontSize="11" fill="#9DA5A8" fontWeight="500">On-time ↑</text>
              <text x="18" y="160" textAnchor="middle" fontSize="11" fill="#9DA5A8" fontWeight="500" transform="rotate(-90 18 160)">Quality →</text>
            </svg>
          </div>
        </div>

        {/* Column 3: Descriptions & Thresholds */}
        <div className="flex-1 border-l border-[#DFE2E4] pl-4 flex-shrink-0 flex flex-col">
          <div className="text-sm font-semibold text-[#31343A] mb-4">Quadrant Details</div>
          
          {/* Quadrant Details */}
          <div className="space-y-3 flex-1">
            <div className="border-l-4 border-[#E00420] pl-3 py-2">
              <div className="font-semibold text-[#31343A] text-xs">Top-Right: Star Performers</div>
              <p className="text-[#9DA5A8] text-[10px] mt-1 leading-relaxed">Best vendors - expand relationships</p>
            </div>
            
            <div className="border-l-4 border-[#005691] pl-3 py-2">
              <div className="font-semibold text-[#31343A] text-xs">Top-Left: Quality Focus</div>
              <p className="text-[#9DA5A8] text-[10px] mt-1 leading-relaxed">Work on logistics & lead times</p>
            </div>
            
            <div className="border-l-4 border-[#DFE2E4] pl-3 py-2">
              <div className="font-semibold text-[#31343A] text-xs">Bottom-Right: Timely Risky</div>
              <p className="text-[#9DA5A8] text-[10px] mt-1 leading-relaxed">Review QC processes</p>
            </div>
            
            <div className="border-l-4 border-[#DFE2E4] pl-3 py-2">
              <div className="font-semibold text-[#31343A] text-xs">Bottom-Left: At-Risk</div>
              <p className="text-[#9DA5A8] text-[10px] mt-1 leading-relaxed">Consider alternatives</p>
            </div>
          </div>
          
          <div className="mt-auto pt-4 border-t border-[#DFE2E4]">
            <div className="text-xs text-[#9DA5A8] mb-2.5 font-semibold">Average Thresholds</div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-[#9DA5A8]">On-time:</span>
                <span className="text-[#31343A] font-semibold">{avgOnTime.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#9DA5A8]">Quality:</span>
                <span className="text-[#31343A] font-semibold">{avgQuality.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>
          </>
        )}
      </div>

      {/* Summary stats */}
      <div className="mt-3 pt-3 border-t border-[#DFE2E4] grid grid-cols-3 gap-4 text-xs">
        <div>
          <div className="text-[#9DA5A8] mb-0.5">Avg On-time</div>
          <div className="text-sm font-semibold text-[#31343A]">{avgOnTime.toFixed(1)}%</div>
        </div>
        <div>
          <div className="text-[#9DA5A8] mb-0.5">Avg Quality</div>
          <div className="text-sm font-semibold text-[#31343A]">{avgQuality.toFixed(1)}%</div>
        </div>
        <div>
          <div className="text-[#9DA5A8] mb-0.5">Vendors</div>
          <div className="text-sm font-semibold text-[#31343A]">{pts.length} Active</div>
        </div>
      </div>
    </div>
  );
}

