'use client';

import { enhancedRequests } from '@/lib/mockData';
import { AlertCircle, TrendingUp, Clock } from 'lucide-react';

function ageDays(iso: string) { return Math.ceil((Date.now() - +new Date(iso)) / 86400000); }

export function RequestsAgingBuckets() {
  const now = Date.now();
  const ages = enhancedRequests.map(r => r.indentAge ?? Math.ceil((now - +new Date(r.createdAt)) / 86400000));
  const buckets = [0,0,0,0];
  ages.forEach(d => {
    if (d <= 2) buckets[0]++; else if (d <= 7) buckets[1]++; else if (d <= 14) buckets[2]++; else buckets[3]++;
  });
  
  const total = buckets.reduce((a, b) => a + b, 0);
  const totalAging = buckets[1] + buckets[2] + buckets[3]; // 3+ days old
  const atRisk = buckets[2] + buckets[3]; // 8+ days old
  const avgAge = total > 0 ? (ages.reduce((a, b) => a + b, 0) / ages.length).toFixed(1) : '0';
  const maxBucket = Math.max(...buckets);
  
  const labels = ['0–2d','3–7d','8–14d','>14d'];
  const colors = [
    { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', bar: 'bg-green-500' },
    { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', bar: 'bg-yellow-500' },
    { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', bar: 'bg-orange-500' },
    { bg: 'bg-[#E00420]/10', border: 'border-[#E00420]/30', text: 'text-[#E00420]', bar: 'bg-[#E00420]' },
  ];
  const statusLabels = ['Fresh', 'Active', 'Aging', 'Stale'];
  
  return (
    <div className="bg-white rounded-lg border border-[#DFE2E4] p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-semibold text-[#31343A] mb-0.5">Request Aging</h4>
          <p className="text-xs text-[#9DA5A8]">Backlog distribution by age</p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-[#9DA5A8]">
            <Clock className="h-3.5 w-3.5" />
            <span>Avg: {avgAge}d</span>
          </div>
          {atRisk > 0 && (
            <div className="flex items-center gap-1.5 text-[#E00420]">
              <AlertCircle className="h-3.5 w-3.5" />
              <span>{atRisk} at risk</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-4 gap-3 mb-4">
        {buckets.map((c, i) => {
          const percentage = total > 0 ? ((c / total) * 100).toFixed(0) : '0';
          const barWidth = maxBucket > 0 ? (c / maxBucket) * 100 : 0;
          return (
            <div 
              key={i} 
              className={`border-2 ${colors[i].border} ${colors[i].bg} rounded-lg p-3 transition-all hover:shadow-md`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-medium text-[#9DA5A8]">{labels[i]}</div>
                <div className={`text-[10px] font-semibold ${colors[i].text}`}>{statusLabels[i]}</div>
              </div>
              <div className={`text-2xl font-bold ${colors[i].text} mb-2`}>{c}</div>
              
              {/* Percentage */}
              <div className="text-xs text-[#9DA5A8] mb-2">
                {percentage}% of total
              </div>
              
              {/* Visual bar */}
              <div className="w-full h-1.5 bg-[#DFE2E4] rounded-full overflow-hidden">
                <div 
                  className={`h-full ${colors[i].bar} transition-all`}
                  style={{ width: `${barWidth}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Summary insights */}
      <div className="pt-3 border-t border-[#DFE2E4]">
        <div className="grid grid-cols-3 gap-4 text-xs">
          <div>
            <div className="text-[#9DA5A8] mb-1">Total Active</div>
            <div className="text-sm font-semibold text-[#31343A]">{total} requests</div>
          </div>
          <div>
            <div className="text-[#9DA5A8] mb-1">Aging (3+ days)</div>
            <div className={`text-sm font-semibold ${totalAging > total * 0.5 ? 'text-[#E00420]' : 'text-[#31343A]'}`}>
              {totalAging} ({total > 0 ? ((totalAging / total) * 100).toFixed(0) : '0'}%)
            </div>
          </div>
          <div>
            <div className="text-[#9DA5A8] mb-1">Peak Bucket</div>
            <div className="text-sm font-semibold text-[#31343A]">
              {labels[buckets.indexOf(maxBucket)]} ({maxBucket} req)
            </div>
          </div>
        </div>
        
        {/* Alert if too many aging */}
        {atRisk > total * 0.2 && (
          <div className="mt-3 pt-3 border-t border-[#DFE2E4] flex items-start gap-2 text-xs">
            <AlertCircle className="h-4 w-4 text-[#E00420] mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-semibold text-[#E00420] mb-0.5">Action Required</div>
              <div className="text-[#9DA5A8]">
                {atRisk} request{atRisk !== 1 ? 's' : ''} aged 8+ days need immediate attention to prevent delays.
              </div>
            </div>
          </div>
        )}
        
        {/* Positive feedback if backlog is healthy */}
        {atRisk === 0 && total > 0 && (
          <div className="mt-3 pt-3 border-t border-[#DFE2E4] flex items-start gap-2 text-xs">
            <TrendingUp className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-semibold text-green-600 mb-0.5">Healthy Backlog</div>
              <div className="text-[#9DA5A8]">
                All requests are within acceptable aging thresholds. Great job!
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

