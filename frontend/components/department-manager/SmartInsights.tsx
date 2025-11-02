'use client';

import { AlertTriangle, TrendingUp, TrendingDown, Lightbulb, Brain, Zap } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface Insight {
  id: string;
  type: 'anomaly' | 'forecast' | 'suggestion' | 'alert';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  actionLabel?: string;
  onAction?: () => void;
}

interface SmartInsightsProps {
  insights: Insight[];
}

export function SmartInsights({ insights }: SmartInsightsProps) {
  const getInsightIcon = (type: Insight['type']) => {
    switch (type) {
      case 'anomaly':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'forecast':
        return <TrendingUp className="w-5 h-5 text-blue-500" />;
      case 'suggestion':
        return <Lightbulb className="w-5 h-5 text-yellow-500" />;
      case 'alert':
        return <Zap className="w-5 h-5 text-[#E00420]" />;
      default:
        return <Brain className="w-5 h-5 text-[#005691]" />;
    }
  };

  const getInsightColor = (type: Insight['type'], priority: Insight['priority']) => {
    if (type === 'anomaly' || type === 'alert') {
      return priority === 'high' 
        ? 'bg-[#E00420]/10 border-[#E00420]/20' 
        : 'bg-orange-50 border-orange-200';
    }
    if (type === 'forecast') {
      return 'bg-blue-50 border-blue-200';
    }
    if (type === 'suggestion') {
      return 'bg-yellow-50 border-yellow-200';
    }
    return 'bg-[#DFE2E4]/30 border-[#DFE2E4]';
  };

  const sortedInsights = insights.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  return (
    <div className="bg-white border border-[#DFE2E4] rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-[#005691]" />
          <h3 className="text-sm font-semibold text-[#31343A]">Smart Insights & AI Recommendations</h3>
        </div>
        <span className="text-xs text-[#9DA5A8]">{insights.length} insights</span>
      </div>

      <div className="space-y-3 max-h-[500px] overflow-y-auto">
        {sortedInsights.length > 0 ? (
          sortedInsights.map((insight) => (
            <div
              key={insight.id}
              className={`border rounded-lg p-4 transition-all hover:shadow-md ${getInsightColor(insight.type, insight.priority)}`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {getInsightIcon(insight.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-semibold text-[#31343A]">{insight.title}</h4>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      insight.priority === 'high' ? 'bg-[#E00420]/10 text-[#E00420]' :
                      insight.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {insight.priority} priority
                    </span>
                  </div>
                  <p className="text-xs text-[#9DA5A8] mb-2">{insight.description}</p>
                  {insight.actionLabel && (
                    <button
                      onClick={insight.onAction}
                      className="text-xs px-3 py-1.5 bg-[#005691] text-white rounded hover:bg-[#004574] transition-colors"
                    >
                      {insight.actionLabel}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-sm text-[#9DA5A8]">
            No insights available at this time.
          </div>
        )}
      </div>
    </div>
  );
}

