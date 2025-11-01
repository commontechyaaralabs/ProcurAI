'use client';

import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { NavItem } from '@/types/dashboard';

interface DashboardLayoutProps {
  children: ReactNode;
  navItems: NavItem[];
  role: string;
  title?: string;
}

export function DashboardLayout({ children, navItems, role, title }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen bg-[#DFE2E4]/30">
      <Sidebar navItems={navItems} role={role} />
      <div className="flex-1 ml-64 flex flex-col">
        <TopBar title={title} />
        <main className="flex-1 overflow-y-auto p-6 mt-16">
          {children}
        </main>
      </div>
    </div>
  );
}



