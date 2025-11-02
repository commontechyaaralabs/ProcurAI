'use client';

import { Bell, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TopBarProps {
  title?: string;
  isSidebarExpanded?: boolean;
}

export function TopBar({ title, isSidebarExpanded = false }: TopBarProps) {
  return (
    <div className={cn(
      "h-16 bg-gradient-to-r from-[#31343A] via-[#2a2d33] to-[#31343A] border-b border-[#9DA5A8] flex items-center justify-between px-5 fixed top-0 right-0 z-10 transition-all duration-300",
      isSidebarExpanded ? "left-64" : "left-20"
    )}>
      <div className="flex items-center gap-3">
        <div className="flex flex-col">
          <h2 className="text-lg font-semibold text-white leading-tight">{title || 'Dashboard'}</h2>
          <span className="text-xs text-[#B6BBBE] font-normal">ProcurAI</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#9DA5A8]" />
          <input
            type="text"
            placeholder="Search..."
            className="pl-10 pr-4 py-2 border border-[#B6BBBE] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E00420] focus:border-transparent bg-[#DFE2E4] text-[#31343A] placeholder:text-[#9DA5A8]"
          />
        </div>
        <button className="relative p-2 text-[#DFE2E4] hover:text-white hover:bg-[#9DA5A8]/20 rounded-lg transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 h-2 w-2 bg-[#E00420] rounded-full"></span>
        </button>
      </div>
    </div>
  );
}



