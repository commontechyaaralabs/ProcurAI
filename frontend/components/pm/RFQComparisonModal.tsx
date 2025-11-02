'use client';

import { Modal } from '@/components/ui/Modal';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Award, Clock, TrendingDown, TrendingUp, CheckCircle2, AlertCircle } from 'lucide-react';

interface QuoteDetail {
  vendorId: string;
  vendorName: string;
  quoteAmount: number;
  leadTimeDays?: number;
  onTimePct?: number;
  qualityScore?: number;
  submittedAt?: string;
  notes?: string;
}

interface RFQComparisonModalProps {
  rfqId: string;
  rfqNumber: string;
  itemName: string;
  category: string;
  quotes: QuoteDetail[];
  isOpen: boolean;
  onClose: () => void;
  onSelectQuote?: (vendorId: string) => void;
}

export function RFQComparisonModal({
  rfqId,
  rfqNumber,
  itemName,
  category,
  quotes,
  isOpen,
  onClose,
  onSelectQuote,
}: RFQComparisonModalProps) {
  if (quotes.length === 0) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Quote Comparison" size="xl">
        <div className="p-8 text-center text-[#9DA5A8]">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-[#B6BBBE]" />
          <p className="text-sm">No quotes received yet for this RFQ.</p>
        </div>
      </Modal>
    );
  }

  // Sort quotes by amount (lowest first)
  const sortedQuotes = [...quotes].sort((a, b) => a.quoteAmount - b.quoteAmount);
  const lowestQuote = sortedQuotes[0];
  const highestQuote = sortedQuotes[sortedQuotes.length - 1];

  const comparisonFields = [
    {
      label: 'Quote Amount',
      getValue: (q: QuoteDetail) => formatCurrency(q.quoteAmount),
      type: 'currency' as const,
      bestIsLowest: true,
    },
    {
      label: 'Lead Time',
      getValue: (q: QuoteDetail) => q.leadTimeDays ? `${q.leadTimeDays} days` : 'N/A',
      type: 'days' as const,
      bestIsLowest: true,
    },
    {
      label: 'On-time Delivery',
      getValue: (q: QuoteDetail) => q.onTimePct ? `${q.onTimePct}%` : 'N/A',
      type: 'percentage' as const,
      bestIsLowest: false,
    },
    {
      label: 'Quality Score',
      getValue: (q: QuoteDetail) => q.qualityScore ? `${q.qualityScore}%` : 'N/A',
      type: 'percentage' as const,
      bestIsLowest: false,
    },
  ];

  const getBestValue = (field: typeof comparisonFields[0]) => {
    if (quotes.length === 0) return null;
    
    if (field.type === 'currency' || field.type === 'days') {
      const values = quotes.map(q => {
        const val = field.getValue(q);
        const num = parseFloat(val.replace(/[^0-9.]/g, ''));
        return isNaN(num) ? (field.bestIsLowest ? Infinity : 0) : num;
      });
      const index = field.bestIsLowest 
        ? values.indexOf(Math.min(...values))
        : values.indexOf(Math.max(...values));
      return quotes[index];
    }
    
    if (field.type === 'percentage') {
      const values = quotes.map(q => {
        const val = field.getValue(q);
        const num = parseFloat(val.replace(/[^0-9.]/g, ''));
        return isNaN(num) ? 0 : num;
      });
      const index = field.bestIsLowest 
        ? values.indexOf(Math.min(...values))
        : values.indexOf(Math.max(...values));
      return quotes[index];
    }
    
    return null;
  };

  const isBest = (quote: QuoteDetail, field: typeof comparisonFields[0]) => {
    const best = getBestValue(field);
    return best?.vendorId === quote.vendorId;
  };

  const totalSavings = sortedQuotes.length > 1 
    ? sortedQuotes[sortedQuotes.length - 1].quoteAmount - sortedQuotes[0].quoteAmount
    : 0;

  const avgQuote = quotes.reduce((sum, q) => sum + q.quoteAmount, 0) / quotes.length;
  const varianceFromAvg = (quote: QuoteDetail) => {
    const diff = quote.quoteAmount - avgQuote;
    return ((diff / avgQuote) * 100).toFixed(1);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Quote Comparison" size="xl">
      <div className="space-y-4">
        {/* RFQ Info Header */}
        <div className="bg-[#DFE2E4]/20 rounded-lg p-4 border border-[#DFE2E4]">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-semibold text-[#31343A] mb-1">{rfqNumber}</h3>
              <p className="text-xs text-[#31343A] mb-1">{itemName}</p>
              <p className="text-xs text-[#9DA5A8]">Category: {category}</p>
            </div>
            <div className="text-right">
              <div className="text-xs text-[#9DA5A8] mb-1">Total Quotes</div>
              <div className="text-lg font-bold text-[#31343A]">{quotes.length}</div>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-green-50 rounded-lg p-3 border border-green-200">
            <div className="text-xs text-[#9DA5A8] mb-1">Lowest Quote</div>
            <div className="text-lg font-bold text-green-700">
              {formatCurrency(lowestQuote.quoteAmount)}
            </div>
            <div className="text-[10px] text-[#9DA5A8] mt-1">{lowestQuote.vendorName}</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <div className="text-xs text-[#9DA5A8] mb-1">Average Quote</div>
            <div className="text-lg font-bold text-blue-700">
              {formatCurrency(avgQuote)}
            </div>
          </div>
          <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
            <div className="text-xs text-[#9DA5A8] mb-1">Potential Savings</div>
            <div className="text-lg font-bold text-orange-700">
              {formatCurrency(totalSavings)}
            </div>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#DFE2E4] bg-[#DFE2E4]/30">
                <th className="text-left py-3 px-4 text-[#9DA5A8] font-medium">Vendor</th>
                {comparisonFields.map((field) => (
                  <th key={field.label} className="text-center py-3 px-4 text-[#9DA5A8] font-medium">
                    {field.label}
                  </th>
                ))}
                <th className="text-center py-3 px-4 text-[#9DA5A8] font-medium">Variance</th>
                <th className="text-center py-3 px-4 text-[#9DA5A8] font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DFE2E4]">
              {sortedQuotes.map((quote) => {
                const variance = varianceFromAvg(quote);
                const isLowest = quote.vendorId === lowestQuote.vendorId;
                return (
                  <tr 
                    key={quote.vendorId} 
                    className={`hover:bg-[#DFE2E4]/20 ${isLowest ? 'bg-green-50/50' : ''}`}
                  >
                    <td className="py-3 px-4">
                      <div className="font-medium text-[#31343A]">{quote.vendorName}</div>
                      {isLowest && (
                        <div className="flex items-center gap-1 mt-1">
                          <Award className="h-3 w-3 text-green-600" />
                          <span className="text-[10px] text-green-600 font-medium">Lowest</span>
                        </div>
                      )}
                    </td>
                    {comparisonFields.map((field) => {
                      const best = isBest(quote, field);
                      return (
                        <td
                          key={field.label}
                          className={`py-3 px-4 text-center ${
                            best ? 'bg-green-50 font-semibold' : ''
                          }`}
                        >
                          <div className="flex items-center justify-center gap-2">
                            <span className={best ? 'text-green-700' : 'text-[#31343A]'}>
                              {field.getValue(quote)}
                            </span>
                            {best && (
                              <Award className="h-4 w-4 text-green-600" />
                            )}
                          </div>
                        </td>
                      );
                    })}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {parseFloat(variance) < 0 ? (
                          <>
                            <TrendingDown className="h-3 w-3 text-green-600" />
                            <span className="text-xs text-green-600 font-medium">
                              {Math.abs(parseFloat(variance))}%
                            </span>
                          </>
                        ) : parseFloat(variance) > 0 ? (
                          <>
                            <TrendingUp className="h-3 w-3 text-red-600" />
                            <span className="text-xs text-red-600 font-medium">
                              +{variance}%
                            </span>
                          </>
                        ) : (
                          <span className="text-xs text-[#9DA5A8]">0%</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => onSelectQuote?.(quote.vendorId)}
                        className="text-xs px-3 py-1.5 bg-[#005691] text-white rounded hover:bg-[#004574] transition-colors font-medium"
                      >
                        Select
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Recommendations */}
        <div className="pt-4 border-t border-[#DFE2E4]">
          <h4 className="text-sm font-semibold text-[#31343A] mb-3">Recommendation</h4>
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs font-medium text-[#31343A] mb-1">
                  Recommended: {lowestQuote.vendorName}
                </p>
                <p className="text-xs text-[#9DA5A8]">
                  {lowestQuote.onTimePct && lowestQuote.onTimePct >= 95 
                    ? 'High on-time delivery rate. ' 
                    : ''}
                  {lowestQuote.qualityScore && lowestQuote.qualityScore >= 90 
                    ? 'Excellent quality track record. ' 
                    : ''}
                  Lowest quote at {formatCurrency(lowestQuote.quoteAmount)}.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

