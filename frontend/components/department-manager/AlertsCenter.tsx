'use client';

import { Bell, X, AlertCircle, CheckCircle2, Info, Clock } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';
import { useState } from 'react';

interface Alert {
  id: string;
  type: 'over-budget' | 'pending-approval' | 'new-indent' | 'budget-revision' | 'deadline' | 'info';
  title: string;
  description: string;
  timestamp: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  actionLabel?: string;
  onAction?: () => void;
}

interface AlertsCenterProps {
  alerts: Alert[];
  onDismiss?: (alertId: string) => void;
  onMarkRead?: (alertId: string) => void;
}

export function AlertsCenter({ alerts, onDismiss, onMarkRead }: AlertsCenterProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const unreadCount = alerts.filter(a => !a.onAction).length;

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'over-budget':
      case 'deadline':
        return <AlertCircle className="w-4 h-4 text-[#E00420]" />;
      case 'pending-approval':
        return <Clock className="w-4 h-4 text-orange-500" />;
      case 'new-indent':
      case 'budget-revision':
        return <Info className="w-4 h-4 text-blue-500" />;
      default:
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    }
  };

  const getAlertColor = (type: Alert['type'], priority: Alert['priority']) => {
    if (type === 'over-budget' || (type === 'deadline' && priority === 'critical')) {
      return 'bg-[#E00420]/10 border-[#E00420]/20';
    }
    if (priority === 'high' || type === 'pending-approval') {
      return 'bg-orange-50 border-orange-200';
    }
    if (type === 'budget-revision' || type === 'new-indent') {
      return 'bg-blue-50 border-blue-200';
    }
    return 'bg-[#DFE2E4]/30 border-[#DFE2E4]';
  };

  const sortedAlerts = alerts.sort((a, b) => {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  return (
    <div className="bg-white border border-[#DFE2E4] rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-[#005691]" />
          <h3 className="text-sm font-semibold text-[#31343A]">Alerts & Notifications</h3>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 bg-[#E00420] text-white text-xs font-semibold rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs text-[#005691] hover:underline"
        >
          {isExpanded ? 'Collapse' : 'View All'}
        </button>
      </div>

      <div className={`space-y-2 ${isExpanded ? 'max-h-[600px] overflow-y-auto' : 'max-h-[300px] overflow-y-auto'}`}>
        {sortedAlerts.length > 0 ? (
          sortedAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`border rounded-lg p-3 transition-all hover:shadow-md ${getAlertColor(alert.type, alert.priority)}`}
            >
              <div className="flex items-start gap-2">
                <div className="mt-0.5">
                  {getAlertIcon(alert.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="text-xs font-semibold text-[#31343A]">{alert.title}</h4>
                    <button
                      onClick={() => onDismiss?.(alert.id)}
                      className="text-[#9DA5A8] hover:text-[#31343A] flex-shrink-0"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-xs text-[#9DA5A8] mb-2">{alert.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#9DA5A8]">
                      {formatDateTime(alert.timestamp)}
                    </span>
                    {alert.actionLabel && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (alert.onAction) {
                            alert.onAction();
                          }
                          onMarkRead?.(alert.id);
                        }}
                        className="text-xs px-2 py-1 bg-[#005691] text-white rounded hover:bg-[#004574] transition-colors"
                      >
                        {alert.actionLabel}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-6 text-sm text-[#9DA5A8]">
            No alerts at this time.
          </div>
        )}
      </div>
    </div>
  );
}

