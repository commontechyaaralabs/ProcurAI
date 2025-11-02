'use client';

import { useMemo, useState } from 'react';
import { EnhancedRequest } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface CategoryData {
  category: string;
  subcategories: {
    subcategory: string;
    totalSpend: number;
    count: number;
  }[];
  totalSpend: number;
  count: number;
}

interface TreemapCell {
  id: string;
  category: string;
  subcategory?: string;
  label: string;
  value: number;
  percentage: number;
  count: number;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  level: 'category' | 'subcategory';
}

// Extract category from itemName and department
function extractCategory(itemName: string, department: string): { category: string; subcategory: string } {
  const itemLower = itemName.toLowerCase();
  const deptLower = department.toLowerCase();

  // Category mapping based on keywords
  let category = 'Raw Materials';
  let subcategory = 'General';

  // Powertrain categories
  if (itemLower.includes('engine') || itemLower.includes('bearing') || itemLower.includes('piston') || 
      itemLower.includes('crankshaft') || itemLower.includes('cylinder') || deptLower.includes('powertrain')) {
    category = 'Powertrain';
    if (itemLower.includes('bearing')) subcategory = 'Bearings';
    else if (itemLower.includes('piston')) subcategory = 'Pistons';
    else if (itemLower.includes('crankshaft')) subcategory = 'Crankshaft';
    else if (itemLower.includes('cylinder')) subcategory = 'Cylinder Components';
    else subcategory = 'Engine Components';
  }
  // Transmission
  else if (itemLower.includes('transmission') || itemLower.includes('gear') || itemLower.includes('clutch') ||
           deptLower.includes('transmission')) {
    category = 'Powertrain';
    if (itemLower.includes('gear')) subcategory = 'Transmission Gears';
    else if (itemLower.includes('clutch')) subcategory = 'Clutch Systems';
    else subcategory = 'Transmission Components';
  }
  // Chassis categories
  else if (itemLower.includes('chassis') || itemLower.includes('suspension') || itemLower.includes('coil spring') ||
           itemLower.includes('shock') || itemLower.includes('strut') || deptLower.includes('chassis')) {
    category = 'Chassis & Suspension';
    if (itemLower.includes('coil') || itemLower.includes('spring')) subcategory = 'Suspension Springs';
    else if (itemLower.includes('shock') || itemLower.includes('strut')) subcategory = 'Shocks & Struts';
    else subcategory = 'Chassis Components';
  }
  // Electronics
  else if (itemLower.includes('sensor') || itemLower.includes('ecu') || itemLower.includes('battery') ||
           itemLower.includes('wire') || itemLower.includes('harness') || itemLower.includes('electronic') ||
           deptLower.includes('electronic') || deptLower.includes('battery')) {
    category = 'Electronics & Electrical';
    if (itemLower.includes('sensor')) subcategory = 'Sensors';
    else if (itemLower.includes('ecu')) subcategory = 'ECU Components';
    else if (itemLower.includes('battery') || itemLower.includes('cell')) subcategory = 'Battery Systems';
    else if (itemLower.includes('wire') || itemLower.includes('harness')) subcategory = 'Wiring Systems';
    else subcategory = 'Electronics';
  }
  // Body & Exterior
  else if (itemLower.includes('steel') || itemLower.includes('coil') || itemLower.includes('panel') ||
           itemLower.includes('glass') || itemLower.includes('windshield') || itemLower.includes('paint') ||
           deptLower.includes('body') || deptLower.includes('paint')) {
    category = 'Body & Exterior';
    if (itemLower.includes('steel') || itemLower.includes('coil')) subcategory = 'Raw Materials';
    else if (itemLower.includes('panel')) subcategory = 'Body Panels';
    else if (itemLower.includes('glass') || itemLower.includes('windshield')) subcategory = 'Glass Components';
    else if (itemLower.includes('paint')) subcategory = 'Paint & Coatings';
    else subcategory = 'Body Components';
  }
  // Brake systems
  else if (itemLower.includes('brake') || itemLower.includes('pad') || itemLower.includes('disc') ||
           itemLower.includes('rotor') || deptLower.includes('brake')) {
    category = 'Brake Systems';
    if (itemLower.includes('pad')) subcategory = 'Brake Pads';
    else if (itemLower.includes('disc') || itemLower.includes('rotor')) subcategory = 'Brake Discs';
    else subcategory = 'Brake Components';
  }
  // Interior
  else if (itemLower.includes('seat') || itemLower.includes('dashboard') || itemLower.includes('interior') ||
           itemLower.includes('upholstery')) {
    category = 'Interior';
    if (itemLower.includes('seat')) subcategory = 'Seating';
    else if (itemLower.includes('dashboard')) subcategory = 'Dashboard Components';
    else subcategory = 'Interior Components';
  }
  // Safety
  else if (itemLower.includes('airbag') || itemLower.includes('safety') || itemLower.includes('crash')) {
    category = 'Safety & Compliance';
    subcategory = 'Safety Components';
  }
  // Tooling
  else if (itemLower.includes('tool') || itemLower.includes('mold') || itemLower.includes('fixture') ||
           deptLower.includes('tooling')) {
    category = 'Tooling & Equipment';
    subcategory = 'Tooling';
  }
  // Logistics & Services
  else if (itemLower.includes('logistics') || itemLower.includes('transport') || itemLower.includes('service') ||
           deptLower.includes('logistics') || deptLower.includes('service')) {
    category = 'Logistics & Services';
    subcategory = 'Services';
  }

  return { category, subcategory };
}

// Treemap layout algorithm (squarified)
function squarify(items: Omit<TreemapCell, 'x' | 'y' | 'width' | 'height'>[], x: number, y: number, width: number, height: number): TreemapCell[] {
  const cells: TreemapCell[] = [];
  const total = items.reduce((sum, item) => sum + item.value, 0);
  
  if (total === 0 || items.length === 0) return cells;

  const isHorizontal = width > height;
  const containerArea = width * height;

  let row: typeof items = [];
  let currentX = x;
  let currentY = y;
  let remainingWidth = width;
  let remainingHeight = height;

  const addRow = () => {
    const rowTotal = row.reduce((sum, item) => sum + item.value, 0);
    const rowAreaVal = (rowTotal / total) * containerArea;
    
    if (isHorizontal) {
      const rowHeight = rowAreaVal / remainingWidth;
      let currentRowX = currentX;
      
      row.forEach((item, idx) => {
        const itemArea = (item.value / total) * containerArea;
        const itemWidth = itemArea / rowHeight;
        
        cells.push({
          ...item,
          x: currentRowX,
          y: currentY,
          width: itemWidth,
          height: rowHeight,
        });
        currentRowX += itemWidth;
      });
      
      currentY += rowHeight;
      remainingHeight -= rowHeight;
    } else {
      const rowWidth = rowAreaVal / remainingHeight;
      let currentRowY = currentY;
      
      row.forEach((item, idx) => {
        const itemArea = (item.value / total) * containerArea;
        const itemHeight = itemArea / rowWidth;
        
        cells.push({
          ...item,
          x: currentX,
          y: currentRowY,
          width: rowWidth,
          height: itemHeight,
        });
        currentRowY += itemHeight;
      });
      
      currentX += rowWidth;
      remainingWidth -= rowWidth;
    }
    
    row = [];
  };

  items.forEach(item => {
    row.push(item);
    
    // Simple heuristic: if adding another item would worsen aspect ratio, finalize row
    if (row.length > 1) {
      const rowTotal = row.reduce((sum, i) => sum + i.value, 0);
      const rowAreaVal = (rowTotal / total) * containerArea;
      const rowDim = isHorizontal ? rowAreaVal / remainingWidth : rowAreaVal / remainingHeight;
      const itemDim = rowDim / row.length;
      const aspectRatio = Math.max(rowDim / itemDim, itemDim / rowDim);
      
      if (aspectRatio > 2.5 && row.length > 2) {
        const lastItem = row.pop();
        addRow();
        row = [lastItem!];
      }
    }
  });

  if (row.length > 0) {
    addRow();
  }

  return cells;
}

const COLORS = [
  '#005691', '#0066a3', '#0078b5', '#008ac7', '#009cd9',
  '#004574', '#006092', '#0070a0', '#0080b0', '#0090c0',
];

interface CategoryTreemapProps {
  requests: EnhancedRequest[];
}

export function CategoryTreemap({ requests }: CategoryTreemapProps) {
  const [hoveredCell, setHoveredCell] = useState<TreemapCell | null>(null);

  const categoryData = useMemo(() => {
    const categoryMap = new Map<string, CategoryData>();

    requests.forEach(req => {
      const { category, subcategory } = extractCategory(req.itemName, req.department);
      
      if (!categoryMap.has(category)) {
        categoryMap.set(category, {
          category,
          subcategories: [],
          totalSpend: 0,
          count: 0,
        });
      }

      const catData = categoryMap.get(category)!;
      catData.totalSpend += req.estimatedCost;
      catData.count += 1;

      const subcatIndex = catData.subcategories.findIndex(s => s.subcategory === subcategory);
      if (subcatIndex === -1) {
        catData.subcategories.push({
          subcategory,
          totalSpend: req.estimatedCost,
          count: 1,
        });
      } else {
        catData.subcategories[subcatIndex].totalSpend += req.estimatedCost;
        catData.subcategories[subcatIndex].count += 1;
      }
    });

    return Array.from(categoryMap.values()).sort((a, b) => b.totalSpend - a.totalSpend);
  }, [requests]);

  const totalSpend = categoryData.reduce((sum, cat) => sum + cat.totalSpend, 0);

  const treemapCells = useMemo(() => {
    const cells: TreemapCell[] = [];
    const containerWidth = 800;
    const containerHeight = 400;
    const padding = 4;

    // Calculate layout for categories
    const categoryItems = categoryData.map((cat, idx) => ({
      id: `cat-${cat.category}`,
      category: cat.category,
      label: cat.category,
      value: cat.totalSpend,
      count: cat.count,
      percentage: (cat.totalSpend / totalSpend) * 100,
      color: COLORS[idx % COLORS.length],
      level: 'category' as const,
    }));

    const categoryCells = squarify(categoryItems, padding, padding, containerWidth - padding * 2, containerHeight - padding * 2);

    // For each category cell, add subcategory cells if space allows
    categoryCells.forEach(catCell => {
      const catData = categoryData.find(c => c.category === catCell.category);
      if (!catData) return;

      // Only show subcategories if category cell is large enough
      if (catCell.width > 150 && catCell.height > 80 && catData.subcategories.length > 1) {
        const subcatItems = catData.subcategories.map((subcat, idx) => ({
          id: `subcat-${catCell.category}-${subcat.subcategory}`,
          category: catCell.category,
          subcategory: subcat.subcategory,
          label: subcat.subcategory,
          value: subcat.totalSpend,
          count: subcat.count,
          percentage: (subcat.totalSpend / catData.totalSpend) * 100,
          color: catCell.color,
          level: 'subcategory' as const,
        }));

        const subcatCells = squarify(
          subcatItems,
          catCell.x + 2,
          catCell.y + 20,
          catCell.width - 4,
          catCell.height - 24
        );

        cells.push(...subcatCells);
      } else {
        cells.push(catCell);
      }
    });

    return cells;
  }, [categoryData, totalSpend]);

  return (
    <div className="bg-white rounded-lg border border-[#DFE2E4] p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-[#31343A]">Incoming Indents by Category</h3>
          <p className="text-xs text-[#9DA5A8] mt-1">Hover or click for further detail</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-[#31343A]">{requests.length} Indents</p>
          <p className="text-xs text-[#9DA5A8]">{formatCurrency(totalSpend)} Total</p>
        </div>
      </div>

      <div className="relative" style={{ width: '100%', height: '400px' }}>
        <svg width="100%" height="100%" viewBox="0 0 800 400" className="overflow-visible">
          {treemapCells.map((cell, idx) => {
            const isHovered = hoveredCell?.id === cell.id;
            const opacity = isHovered ? 1 : (cell.level === 'subcategory' ? 0.75 : 0.85);
            
            return (
              <g key={`${cell.category}-${cell.subcategory || 'cat'}-${idx}`}>
                <rect
                  x={cell.x}
                  y={cell.y}
                  width={cell.width}
                  height={cell.height}
                  fill={cell.color}
                  opacity={opacity}
                  stroke={isHovered ? '#31343A' : '#DFE2E4'}
                  strokeWidth={isHovered ? 2 : 1}
                  rx="2"
                  onMouseEnter={() => setHoveredCell(cell)}
                  onMouseLeave={() => setHoveredCell(null)}
                  className="cursor-pointer transition-all"
                />
                {cell.width > 80 && cell.height > 40 && (
                  <text
                    x={cell.x + cell.width / 2}
                    y={cell.y + (cell.level === 'category' ? 18 : 14)}
                    textAnchor="middle"
                    className="fill-white font-semibold"
                    fontSize={cell.level === 'category' ? 13 : 11}
                    style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
                  >
                    {cell.level === 'category' ? cell.category : cell.subcategory}
                  </text>
                )}
                {cell.width > 80 && cell.height > 50 && (
                  <text
                    x={cell.x + cell.width / 2}
                    y={cell.y + (cell.level === 'category' ? 35 : 28)}
                    textAnchor="middle"
                    className="fill-white font-medium"
                    fontSize={cell.level === 'category' ? 11 : 10}
                    style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
                  >
                    {cell.percentage.toFixed(1)}%
                  </text>
                )}
                {cell.width > 100 && cell.height > 60 && (
                  <text
                    x={cell.x + cell.width / 2}
                    y={cell.y + (cell.level === 'category' ? 52 : 42)}
                    textAnchor="middle"
                    className="fill-white"
                    fontSize={9}
                    style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
                  >
                    {cell.count} {cell.count === 1 ? 'indent' : 'indents'}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {hoveredCell && (
          <div
            className="absolute bg-white border-2 border-[#005691] rounded-lg shadow-xl p-3 z-10 pointer-events-none"
            style={{
              left: `${Math.min(70, (hoveredCell.x / 800) * 100)}%`,
              top: `${Math.min(60, (hoveredCell.y / 400) * 100) + 10}%`,
              transform: 'translate(-50%, 0)',
            }}
          >
            <div className="text-sm font-semibold text-[#31343A]">
              {hoveredCell.level === 'category' ? hoveredCell.category : `${hoveredCell.category} - ${hoveredCell.subcategory}`}
            </div>
            <div className="text-xs text-[#9DA5A8] mt-1">
              {formatCurrency(hoveredCell.value)} ({hoveredCell.percentage.toFixed(1)}%)
            </div>
            <div className="text-xs text-[#9DA5A8]">
              {hoveredCell.count} {hoveredCell.count === 1 ? 'indent' : 'indents'}
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-[#DFE2E4]">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          {categoryData.slice(0, 8).map((cat, idx) => (
            <div key={cat.category} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded"
                style={{ backgroundColor: COLORS[idx % COLORS.length] }}
              />
              <span className="text-[#31343A] truncate">{cat.category}</span>
              <span className="text-[#9DA5A8]">({cat.count})</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

