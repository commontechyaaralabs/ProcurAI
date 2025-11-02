'use client';

import { Settings2, Check } from 'lucide-react';
import { useState } from 'react';

export interface ColumnConfig {
  id: string;
  label: string;
  visible: boolean;
}

interface ColumnChooserProps {
  columns: ColumnConfig[];
  onToggle: (columnId: string) => void;
  onReset: () => void;
}

export function ColumnChooser({ columns, onToggle, onReset }: ColumnChooserProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 border border-[#B6BBBE] rounded-lg text-sm text-[#31343A] hover:bg-[#DFE2E4] transition-colors"
      >
        <Settings2 className="w-4 h-4" />
        <span>Columns</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-[#DFE2E4] rounded-lg shadow-lg z-20 p-3">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-[#31343A]">Column Chooser</h4>
              <button
                onClick={onReset}
                className="text-xs text-[#005691] hover:underline"
              >
                Reset
              </button>
            </div>
            <div className="space-y-1 max-h-[300px] overflow-y-auto">
              {columns.map((column) => (
                <label
                  key={column.id}
                  className="flex items-center gap-2 p-2 rounded hover:bg-[#DFE2E4]/30 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={column.visible}
                    onChange={() => onToggle(column.id)}
                    className="w-4 h-4 text-[#005691] border-[#B6BBBE] rounded focus:ring-[#005691]"
                  />
                  <span className="text-sm text-[#31343A] flex-1">{column.label}</span>
                  {column.visible && <Check className="w-4 h-4 text-[#005691]" />}
                </label>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

