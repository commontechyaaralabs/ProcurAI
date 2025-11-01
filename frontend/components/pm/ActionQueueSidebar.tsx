'use client';

import { ActionQueueItem } from '@/types';
import { AlertTriangle, Clock, Bell, FileCheck2, Mail } from 'lucide-react';

const iconByType: Record<string, any> = {
  'validation': FileCheck2,
  'rfq-reminder': Mail,
  'contract-renewal': AlertTriangle,
  'approval': Bell,
};

const badgeByPriority: Record<string, string> = {
  'critical': 'bg-[#E00420]/10 text-[#E00420]',
  'high': 'bg-orange-100 text-orange-800',
  'medium': 'bg-yellow-100 text-yellow-800',
  'low': 'bg-[#DFE2E4] text-[#31343A]',
};

export function ActionQueueSidebar({ items, onOpen, onTakeAction }: { items: ActionQueueItem[]; onOpen?: (id: string) => void; onTakeAction?: (id: string, type: string) => void; }) {
  return (
    <aside className="hidden xl:block xl:col-span-3 2xl:col-span-3">
      <div className="bg-white rounded-lg border border-[#DFE2E4] p-4 sticky top-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-[#31343A]">Action Queue</h3>
          <span className="text-xs text-[#9DA5A8]">{items.length} items</span>
        </div>
        <div className="space-y-3 max-h-[70vh] overflow-auto pr-1">
          {items.map((it) => {
            const Icon = iconByType[it.type] ?? Clock;
            return (
              <div key={it.id} className="border border-[#DFE2E4] rounded-lg p-3">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    <Icon className="w-4 h-4 text-[#9DA5A8]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-[#31343A]">{it.title}</h4>
                      <span className={`px-2 py-0.5 text-[10px] rounded ${badgeByPriority[it.priority] || 'bg-[#DFE2E4] text-[#31343A]'}`}>
                        {it.priority.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-[#9DA5A8] mt-1">{it.description}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="text-[11px] text-[#9DA5A8]">
                        {it.dueDate ? <>Due: <b>{it.dueDate}</b></> : <span>—</span>}
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => onOpen?.(it.id)} className="text-xs px-2 py-1 border border-[#B6BBBE] rounded hover:bg-[#DFE2E4] text-[#31343A]">
                          Open {it.entityType}
                        </button>
                        <button onClick={() => onTakeAction?.(it.id, it.type)} className="text-xs px-2 py-1 bg-[#005691] text-white rounded hover:bg-[#004574]">
                          Take Action
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </aside>
  );
}


