'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, Search, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

interface TopBarProps {
  title?: string;
  isSidebarExpanded?: boolean;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'error',
    title: 'Delivery Risk Alert',
    message: '6 POs are at critical risk (due in ≤2 days) without GRN',
    timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
    read: false,
  },
  {
    id: '2',
    type: 'warning',
    title: 'Approval Pending',
    message: '3 indent approvals require your attention',
    timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
    read: false,
  },
  {
    id: '3',
    type: 'info',
    title: 'RFQ Response Received',
    message: 'SKF Bearings submitted quote for REQ-001',
    timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
    read: false,
  },
  {
    id: '4',
    type: 'success',
    title: 'PO Approved',
    message: 'PO-2024-045 has been approved and sent to vendor',
    timestamp: new Date(Date.now() - 5 * 3600000).toISOString(),
    read: true,
  },
  {
    id: '5',
    type: 'warning',
    title: 'Contract Expiring Soon',
    message: 'ArcelorMittal Steel contract expires in 15 days',
    timestamp: new Date(Date.now() - 8 * 3600000).toISOString(),
    read: false,
  },
];

export function TopBar({ title, isSidebarExpanded = false }: TopBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationClick = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'error':
        return <AlertCircle className="h-4 w-4 text-[#E00420]" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      default:
        return <Clock className="h-4 w-4 text-blue-500" />;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = Date.now();
    const time = new Date(timestamp).getTime();
    const diff = now - time;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

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
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="relative p-2 text-[#DFE2E4] hover:text-white hover:bg-[#9DA5A8]/20 rounded-lg transition-colors"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-0.5 right-0.5 h-4 w-4 bg-[#E00420] rounded-full flex items-center justify-center text-[10px] font-semibold text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {isOpen && (
            <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-lg shadow-xl border border-[#DFE2E4] z-50 max-h-[600px] flex flex-col">
              <div className="p-4 border-b border-[#DFE2E4] flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[#31343A]">Notifications</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs text-[#005691] hover:text-[#004080] font-medium"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="overflow-y-auto flex-1">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-sm text-[#9DA5A8]">
                    No notifications
                  </div>
                ) : (
                  <div className="divide-y divide-[#DFE2E4]">
                    {notifications.map((notification) => (
                      <button
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification.id)}
                        className={cn(
                          "w-full text-left p-4 hover:bg-[#DFE2E4]/20 transition-colors",
                          !notification.read && "bg-blue-50/30"
                        )}
                      >
                        <div className="flex gap-3">
                          <div className="flex-shrink-0 mt-0.5">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className={cn(
                                "text-xs font-semibold text-[#31343A]",
                                !notification.read && "font-bold"
                              )}>
                                {notification.title}
                              </h4>
                              {!notification.read && (
                                <div className="h-2 w-2 bg-[#005691] rounded-full flex-shrink-0 mt-1.5"></div>
                              )}
                            </div>
                            <p className="text-xs text-[#9DA5A8] mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="text-[10px] text-[#B6BBBE] mt-2">
                              {formatTimeAgo(notification.timestamp)}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {notifications.length > 0 && (
                <div className="p-3 border-t border-[#DFE2E4] text-center">
                  <button className="text-xs text-[#005691] hover:text-[#004080] font-medium">
                    View all notifications
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}



