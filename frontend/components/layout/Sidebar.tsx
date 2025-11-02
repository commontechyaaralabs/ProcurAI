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
  isExpanded: boolean;
  onExpandChange: (expanded: boolean) => void;
}

export function Sidebar({ navItems, role, isExpanded, onExpandChange }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div 
      className={cn(
        'bg-[#31343A] border-r border-[#9DA5A8] h-screen fixed left-0 top-0 overflow-y-auto flex flex-col transition-all duration-300 z-50',
        isExpanded ? 'w-64' : 'w-20'
      )}
      onMouseEnter={() => onExpandChange(true)}
      onMouseLeave={() => onExpandChange(false)}
    >
      <div className={cn(
        "h-16 border-b border-[#9DA5A8] bg-gradient-to-r from-[#31343A] via-[#2a2d33] to-[#31343A] flex items-center transition-all duration-300",
        isExpanded ? "px-5" : "px-2 justify-center"
      )}>
        <div className={cn("flex items-center transition-all duration-300", isExpanded ? "gap-3" : "gap-0")}>
          <div className={cn(
            "bg-white rounded-lg shadow-lg border border-[#DFE2E4]/50 hover:shadow-xl transition-all duration-300 flex-shrink-0 flex items-center justify-center",
            isExpanded ? "px-4 py-2.5" : "px-2 py-2"
          )}>
            <img 
              src="/bosch_logo-removebg-preview.png" 
              alt="Bosch Logo" 
              className={cn(
                "object-contain transition-all duration-300",
                isExpanded ? "h-8 w-auto" : "h-6 w-auto max-w-[60px]"
              )}
            />
          </div>
          <div className={cn(
            "transition-all duration-300",
            isExpanded ? "opacity-100 max-w-xs" : "opacity-0 max-w-0 overflow-hidden"
          )}>
            <p className="text-xs font-semibold text-[#DFE2E4] tracking-wider whitespace-nowrap">PROCURAI</p>
            <p className="text-[10px] text-[#B6BBBE] mt-0.5 whitespace-nowrap">Enterprise Platform</p>
          </div>
        </div>
      </div>
      <nav className={cn("space-y-1 flex-1 transition-all duration-300", isExpanded ? "p-4" : "p-2")}>
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = item.isActive !== undefined ? item.isActive : (pathname === item.href || (item.href !== '#' && item.href !== '/procurement-manager' && pathname?.startsWith(item.href + '/')) || (item.href === '/procurement-manager' && pathname === '/procurement-manager'));
          
          const content = (
            <>
              <Icon className={cn("flex-shrink-0", isExpanded ? "h-5 w-5" : "h-6 w-6")} />
              <span className={cn(
                "whitespace-nowrap transition-all duration-300",
                isExpanded ? "opacity-100 max-w-xs" : "opacity-0 max-w-0 overflow-hidden"
              )}>
                {item.label}
              </span>
            </>
          );

          if (item.onClick) {
            return (
              <button
                key={`${item.href}-${index}`}
                onClick={item.onClick}
                className={cn(
                  'w-full flex items-center rounded-lg text-sm font-medium transition-all duration-200',
                  isExpanded ? 'gap-3 px-4 py-3' : 'justify-center px-2 py-3',
                  isActive
                    ? 'bg-[#E00420] text-white'
                    : 'text-[#DFE2E4] hover:bg-[#9DA5A8]/20'
                )}
                title={!isExpanded ? item.label : undefined}
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
                'flex items-center rounded-lg text-sm font-medium transition-all duration-200',
                isExpanded ? 'gap-3 px-4 py-3' : 'justify-center px-2 py-3',
                isActive
                  ? 'bg-[#E00420] text-white'
                  : 'text-[#DFE2E4] hover:bg-[#9DA5A8]/20'
              )}
              title={!isExpanded ? item.label : undefined}
            >
              {content}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto border-t border-[#9DA5A8] bg-[#9DA5A8]/10">
        <div className={cn("transition-all duration-300", isExpanded ? "p-4" : "p-2")}>
          <div className={cn("flex items-center mb-3", isExpanded ? "gap-3" : "justify-center")}>
            <div className="h-8 w-8 rounded-full bg-[#E00420] flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
              {role.charAt(0).toUpperCase()}
            </div>
            <div className={cn(
              "transition-all duration-300",
              isExpanded ? "flex-1 min-w-0 opacity-100 max-w-xs" : "opacity-0 max-w-0 overflow-hidden"
            )}>
              <p className="text-sm font-medium text-[#DFE2E4] truncate whitespace-nowrap">
                {role === 'department-manager' && 'Department Manager'}
                {role === 'procurement-manager' && 'Procurement Manager'}
                {role === 'cfo' && 'CFO / Procurement Head'}
              </p>
              <p className="text-xs text-[#B6BBBE] truncate whitespace-nowrap">Active User</p>
            </div>
          </div>
          <Link
            href="/"
            className={cn(
              "w-full flex items-center rounded-lg text-sm font-medium text-[#DFE2E4] hover:bg-[#9DA5A8]/20 transition-all duration-200 border border-[#B6BBBE]",
              isExpanded ? "gap-2 px-3 py-2" : "justify-center px-2 py-2"
            )}
            title={!isExpanded ? "Back" : undefined}
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className={cn(
              "transition-all duration-300 whitespace-nowrap",
              isExpanded ? "opacity-100 max-w-xs" : "opacity-0 max-w-0 overflow-hidden"
            )}>
              Back
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}

