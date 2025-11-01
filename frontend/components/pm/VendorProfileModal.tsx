'use client';

import { Modal } from '@/components/ui/Modal';
import { EnhancedVendor } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { TinySparkline } from './TinySparkline';
import { TinyBars } from './TinyBars';
import { enhancedContracts, enhancedPurchaseOrders } from '@/lib/mockData';
import { TrendingUp, TrendingDown, Calendar, DollarSign } from 'lucide-react';

interface VendorProfileModalProps {
  vendor: EnhancedVendor | null;
  isOpen: boolean;
  onClose: () => void;
  onInviteToRFQ?: () => void;
}

export function VendorProfileModal({ vendor, isOpen, onClose, onInviteToRFQ }: VendorProfileModalProps) {
  if (!vendor) return null;

  const vendorPOs = enhancedPurchaseOrders.filter(po => po.vendorId === vendor.id);
  const vendorContracts = enhancedContracts.filter(c => c.vendorId === vendor.id);
  
  // Sort POs by date (most recent first) and take last 8 for chart
  const sortedPOs = [...vendorPOs].sort((a, b) => 
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
  const recentPOs = sortedPOs.slice(-8).map(po => po.amount);
  
  // Calculate metrics
  const totalRecentSpend = recentPOs.reduce((sum, amt) => sum + amt, 0);
  const avgPOAmount = recentPOs.length > 0 ? totalRecentSpend / recentPOs.length : 0;
  const poCount = recentPOs.length;
  const trend = recentPOs.length >= 2 
    ? (recentPOs[recentPOs.length - 1] > recentPOs[recentPOs.length - 2] ? 'up' : 'down')
    : null;
  
  // Get date range
  const oldestPO = sortedPOs.length > 0 ? sortedPOs[0] : null;
  const newestPO = sortedPOs.length > 0 ? sortedPOs[sortedPOs.length - 1] : null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Vendor Profile: ${vendor.name}`} size="lg" zIndex={9999}>
      <div className="space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-[#9DA5A8]">Vendor Name</label>
            <p className="text-lg font-semibold text-[#31343A]">{vendor.name}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-[#9DA5A8]">Category</label>
            <p className="text-lg text-[#31343A] capitalize">{vendor.category}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-[#9DA5A8]">Status</label>
            <div className="mt-1">
              <StatusBadge status={vendor.status} />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-[#9DA5A8]">Health Score</label>
            <p className="text-lg font-semibold text-[#31343A]">{vendor.healthScore}</p>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="border-t border-[#DFE2E4] pt-4">
          <h3 className="text-lg font-semibold text-[#31343A] mb-4">Performance Metrics</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="border border-[#DFE2E4] rounded-lg p-4">
              <div className="text-sm text-[#9DA5A8]">On-time Delivery</div>
              <div className="text-2xl font-semibold text-[#31343A]">{vendor.onTimeDeliveryPercent}%</div>
            </div>
            <div className="border border-[#DFE2E4] rounded-lg p-4">
              <div className="text-sm text-[#9DA5A8]">Quality Score</div>
              <div className="text-2xl font-semibold text-[#31343A]">{vendor.qualityPercent}%</div>
            </div>
            <div className="border border-[#DFE2E4] rounded-lg p-4">
              <div className="text-sm text-[#9DA5A8]">Avg Lead Time</div>
              <div className="text-2xl font-semibold text-[#31343A]">{vendor.avgLeadTimeDays} days</div>
            </div>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="border-t border-[#DFE2E4] pt-4">
          <h3 className="text-lg font-semibold text-[#31343A] mb-4">Financial Summary</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-[#9DA5A8]">Total Spend</label>
              <p className="text-xl font-semibold text-[#31343A]">{formatCurrency(vendor.totalSpend)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-[#9DA5A8]">Active Contracts</label>
              <p className="text-xl font-semibold text-[#31343A]">{vendor.activeContracts}</p>
            </div>
          </div>
        </div>

        {/* Recent PO Trends */}
        <div className="border-t border-[#DFE2E4] pt-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[#31343A]">Recent PO Trends</h3>
            {recentPOs.length > 0 && (
              <div className="flex items-center gap-4 text-xs text-[#9DA5A8]">
                {oldestPO && newestPO && (
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{formatDate(oldestPO.createdAt)} - {formatDate(newestPO.createdAt)}</span>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {recentPOs.length > 0 ? (
            <div className="space-y-4">
              {/* Summary Metrics */}
              <div className="grid grid-cols-3 gap-4">
                <div className="border border-[#DFE2E4] rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign className="h-4 w-4 text-[#9DA5A8]" />
                    <div className="text-xs text-[#9DA5A8]">Total Spend</div>
                  </div>
                  <div className="text-lg font-semibold text-[#31343A]">{formatCurrency(totalRecentSpend)}</div>
                  <div className="text-[10px] text-[#9DA5A8] mt-0.5">Last {poCount} PO{poCount !== 1 ? 's' : ''}</div>
                </div>
                
                <div className="border border-[#DFE2E4] rounded-lg p-3">
                  <div className="text-xs text-[#9DA5A8] mb-1">Average PO</div>
                  <div className="text-lg font-semibold text-[#31343A]">{formatCurrency(avgPOAmount)}</div>
                  <div className="text-[10px] text-[#9DA5A8] mt-0.5">Per order</div>
                </div>
                
                <div className="border border-[#DFE2E4] rounded-lg p-3">
                  <div className="text-xs text-[#9DA5A8] mb-1">Trend</div>
                  <div className="flex items-center gap-1.5">
                    {trend === 'up' ? (
                      <>
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <span className="text-lg font-semibold text-green-600">Increasing</span>
                      </>
                    ) : trend === 'down' ? (
                      <>
                        <TrendingDown className="h-4 w-4 text-[#E00420]" />
                        <span className="text-lg font-semibold text-[#E00420]">Decreasing</span>
                      </>
                    ) : (
                      <span className="text-lg font-semibold text-[#9DA5A8]">Stable</span>
                    )}
                  </div>
                  <div className="text-[10px] text-[#9DA5A8] mt-0.5">vs previous</div>
                </div>
              </div>
              
              {/* Sparkline Chart */}
              <div className="border border-[#DFE2E4] rounded-lg p-4 bg-[#DFE2E4]/10">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-medium text-[#31343A]">PO Amount Trend</div>
                  <div className="text-xs text-[#9DA5A8]">
                    {formatCurrency(Math.min(...recentPOs))} - {formatCurrency(Math.max(...recentPOs))}
                  </div>
                </div>
                <div className="w-full">
                  <TinySparkline data={recentPOs} />
                </div>
                <div className="mt-2 flex items-center justify-between text-[10px] text-[#9DA5A8]">
                  <span>Oldest</span>
                  <span>Newest</span>
                </div>
              </div>
              
              {/* Recent PO Details */}
              <div className="border border-[#DFE2E4] rounded-lg overflow-hidden">
                <div className="bg-[#DFE2E4]/30 px-4 py-2 border-b border-[#DFE2E4]">
                  <div className="text-xs font-semibold text-[#31343A]">Recent Purchase Orders</div>
                </div>
                <div className="max-h-32 overflow-y-auto">
                  {sortedPOs.slice(-5).reverse().map((po) => (
                    <div key={po.id} className="px-4 py-2 border-b border-[#DFE2E4] last:border-b-0 hover:bg-[#DFE2E4]/20">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-[#31343A]">{po.poNumber}</div>
                          <div className="text-xs text-[#9DA5A8]">{formatDate(po.createdAt)}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-[#31343A]">{formatCurrency(po.amount)}</div>
                          <StatusBadge status={po.status} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full h-24 flex items-center justify-center text-sm text-[#9DA5A8] border border-[#DFE2E4] rounded-lg bg-[#DFE2E4]/10">
              <div className="text-center">
                <DollarSign className="h-8 w-8 mx-auto mb-2 text-[#9DA5A8]" />
                <div>No recent purchase orders</div>
                <div className="text-xs mt-1">Purchase history will appear here</div>
              </div>
            </div>
          )}
        </div>

        {/* Active Contracts */}
        {vendorContracts.length > 0 && (
          <div className="border-t border-[#DFE2E4] pt-4">
            <h3 className="text-lg font-semibold text-[#31343A] mb-4">Active Contracts</h3>
            <div className="space-y-2">
              {vendorContracts.map(contract => (
                <div key={contract.id} className="border border-[#DFE2E4] rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-[#31343A]">{contract.name}</p>
                      <p className="text-sm text-[#9DA5A8]">Value: {formatCurrency(contract.value)}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-[#9DA5A8]">Utilized: {contract.utilizedPercent}%</div>
                      <TinyBars values={[contract.utilizedPercent || 0]} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="border-t border-[#DFE2E4] pt-4 flex gap-3">
          <button
            onClick={() => { onInviteToRFQ?.(); onClose(); }}
            className="px-4 py-2 bg-[#005691] text-white rounded-lg font-medium hover:bg-[#004574]"
          >
            Invite to RFQ
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-[#B6BBBE] text-[#31343A] rounded-lg font-medium hover:bg-[#DFE2E4]"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}

