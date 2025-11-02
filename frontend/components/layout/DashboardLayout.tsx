'use client';

import { ReactNode, useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { NavItem } from '@/types/dashboard';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: ReactNode;
  navItems: NavItem[];
  role: string;
  title?: string;
}

export function DashboardLayout({ children, navItems, role, title }: DashboardLayoutProps) {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  return (
    <div className="flex h-screen bg-[#DFE2E4]/30">
      <Sidebar 
        navItems={navItems} 
        role={role} 
        isExpanded={isSidebarExpanded}
        onExpandChange={setIsSidebarExpanded}
      />
      <div className={cn(
        "flex-1 flex flex-col transition-all duration-300",
        isSidebarExpanded ? "ml-64" : "ml-20"
      )}>
        <TopBar title={title} isSidebarExpanded={isSidebarExpanded} />
        <main className="flex-1 overflow-y-auto p-6 mt-16">
          {children}
        </main>
      </div>
    </div>
  );
}



