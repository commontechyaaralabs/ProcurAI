'use client';

import { Modal } from '@/components/ui/Modal';
import { EnhancedVendor } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { Check, X, TrendingUp, Clock, Award } from 'lucide-react';

interface VendorComparisonModalProps {
  vendors: EnhancedVendor[];
  isOpen: boolean;
  onClose: () => void;
}

export function VendorComparisonModal({ vendors, isOpen, onClose }: VendorComparisonModalProps) {
  if (vendors.length === 0) return null;

  const comparisonFields = [
    {
      label: 'Vendor Name',
      getValue: (v: EnhancedVendor) => v.name,
      type: 'text' as const,
    },
    {
      label: 'Performance Rating',
      getValue: (v: EnhancedVendor) => `${v.performanceRating}/5.0`,
      type: 'rating' as const,
    },
    {
      label: 'On-time Delivery',
      getValue: (v: EnhancedVendor) => `${v.onTimeDeliveryPercent || 0}%`,
      type: 'percentage' as const,
    },
    {
      label: 'Quality Score',
      getValue: (v: EnhancedVendor) => `${v.qualityPercent || 0}%`,
      type: 'percentage' as const,
    },
    {
      label: 'Avg Lead Time',
      getValue: (v: EnhancedVendor) => `${v.avgLeadTimeDays || 0} days`,
      type: 'days' as const,
    },
    {
      label: 'Total Spend',
      getValue: (v: EnhancedVendor) => formatCurrency(v.totalSpend || 0),
      type: 'currency' as const,
    },
    {
      label: 'Active Contracts',
      getValue: (v: EnhancedVendor) => `${v.activeContracts || 0}`,
      type: 'number' as const,
    },
    {
      label: 'Health Score',
      getValue: (v: EnhancedVendor) => `${v.healthScore || 0}%`,
      type: 'percentage' as const,
    },
    {
      label: 'Health Status',
      getValue: (v: EnhancedVendor) => v.healthStatus || 'unknown',
      type: 'status' as const,
    },
  ];

  const getBestValue = (field: typeof comparisonFields[0]) => {
    if (vendors.length === 0) return null;
    
    if (field.type === 'percentage' || field.type === 'rating' || field.type === 'number') {
      const values = vendors.map(v => {
        const val = field.getValue(v);
        const num = parseFloat(val.replace(/[^0-9.]/g, ''));
        return isNaN(num) ? 0 : num;
      });
      return vendors[values.indexOf(Math.max(...values))];
    }
    
    if (field.type === 'days') {
      const values = vendors.map(v => {
        const val = field.getValue(v);
        const num = parseFloat(val.replace(/[^0-9.]/g, ''));
        return isNaN(num) ? Infinity : num;
      });
      return vendors[values.indexOf(Math.min(...values))];
    }
    
    return null;
  };

  const isBest = (vendor: EnhancedVendor, field: typeof comparisonFields[0]) => {
    const best = getBestValue(field);
    return best?.id === vendor.id;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Vendor Comparison" size="xl">
      <div className="space-y-4">
        <div className="text-sm text-[#9DA5A8] mb-4">
          Comparing {vendors.length} vendor{vendors.length !== 1 ? 's' : ''}
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#DFE2E4]">
                <th className="text-left py-3 px-4 text-[#9DA5A8] font-medium">Metric</th>
                {vendors.map((vendor, idx) => (
                  <th key={vendor.id} className="text-center py-3 px-4 text-[#31343A] font-semibold">
                    Vendor {idx + 1}
                  </th>
                ))}
              </tr>
              <tr className="border-b border-[#DFE2E4]">
                <th className="text-left py-2 px-4"></th>
                {vendors.map((vendor) => (
                  <th key={vendor.id} className="text-center py-2 px-4 text-[#31343A] font-medium text-xs">
                    {vendor.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DFE2E4]">
              {comparisonFields.map((field) => (
                <tr key={field.label} className="hover:bg-[#DFE2E4]/20">
                  <td className="py-3 px-4 text-[#31343A] font-medium">{field.label}</td>
                  {vendors.map((vendor) => {
                    const best = isBest(vendor, field);
                    return (
                      <td
                        key={vendor.id}
                        className={`py-3 px-4 text-center ${
                          best ? 'bg-green-50' : ''
                        }`}
                      >
                        <div className="flex items-center justify-center gap-2">
                          <span className={`${best ? 'font-semibold text-green-700' : 'text-[#31343A]'}`}>
                            {field.getValue(vendor)}
                          </span>
                          {best && (
                            <Award className="h-4 w-4 text-green-600" />
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className="pt-4 border-t border-[#DFE2E4]">
          <h4 className="text-sm font-semibold text-[#31343A] mb-3">Summary</h4>
          <div className="grid grid-cols-2 gap-4">
            {vendors.map((vendor, idx) => (
              <div key={vendor.id} className="border border-[#DFE2E4] rounded-lg p-3">
                <div className="text-xs font-semibold text-[#31343A] mb-2">
                  Vendor {idx + 1}: {vendor.name}
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#9DA5A8]">Strengths:</span>
                    <span className="text-[#31343A]">
                      {vendor.onTimeDeliveryPercent && vendor.onTimeDeliveryPercent >= 95 ? 'High On-time' : ''}
                      {vendor.qualityPercent && vendor.qualityPercent >= 90 ? ' • High Quality' : ''}
                      {vendor.avgLeadTimeDays && vendor.avgLeadTimeDays <= 5 ? ' • Fast Delivery' : ''}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#9DA5A8]">Health:</span>
                    <span className={`font-medium ${
                      vendor.healthStatus === 'green' ? 'text-green-600' :
                      vendor.healthStatus === 'amber' ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {vendor.healthScore}% ({vendor.healthStatus})
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}

