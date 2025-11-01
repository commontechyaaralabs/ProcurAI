'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  onClick?: () => void;
  isActive?: boolean;
}

interface SidebarProps {
  navItems: NavItem[];
  role: string;
}

export function Sidebar({ navItems, role }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-[#31343A] border-r border-[#9DA5A8] h-screen fixed left-0 top-0 overflow-y-auto flex flex-col">
      <div className="h-16 border-b border-[#9DA5A8] bg-gradient-to-r from-[#31343A] via-[#2a2d33] to-[#31343A] flex items-center px-5">
        <div className="flex items-center gap-3">
          <div className="bg-white px-4 py-2.5 rounded-lg shadow-lg border border-[#DFE2E4]/50 hover:shadow-xl transition-all duration-300">
            <img 
              src="/bosch_logo-removebg-preview.png" 
              alt="Bosch Logo" 
              className="h-8 w-auto object-contain"
            />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#DFE2E4] tracking-wider">PROCURAI</p>
            <p className="text-[10px] text-[#B6BBBE] mt-0.5">Enterprise Platform</p>
          </div>
        </div>
      </div>
      <nav className="p-4 space-y-1 flex-1">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = item.isActive !== undefined ? item.isActive : (pathname === item.href || (item.href !== '#' && item.href !== '/procurement-manager' && pathname?.startsWith(item.href + '/')) || (item.href === '/procurement-manager' && pathname === '/procurement-manager'));
          
          const content = (
            <>
              <Icon className="h-5 w-5" />
              {item.label}
            </>
          );

          if (item.onClick) {
            return (
              <button
                key={`${item.href}-${index}`}
                onClick={item.onClick}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-[#E00420] text-white'
                    : 'text-[#DFE2E4] hover:bg-[#9DA5A8]/20'
                )}
              >
                {content}
              </button>
            );
          }
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-[#E00420] text-white'
                  : 'text-[#DFE2E4] hover:bg-[#9DA5A8]/20'
              )}
            >
              {content}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto border-t border-[#9DA5A8] bg-[#9DA5A8]/10">
        <div className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-8 w-8 rounded-full bg-[#E00420] flex items-center justify-center text-white text-sm font-medium">
            {role.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#DFE2E4] truncate">
              {role === 'department-manager' && 'Department Manager'}
              {role === 'procurement-manager' && 'Procurement Manager'}
              {role === 'cfo' && 'CFO / Procurement Head'}
            </p>
              <p className="text-xs text-[#B6BBBE] truncate">Active User</p>
            </div>
          </div>
          <Link
            href="/"
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-[#DFE2E4] hover:bg-[#9DA5A8]/20 transition-colors border border-[#B6BBBE]"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </Link>
        </div>
      </div>
    </div>
  );
}

