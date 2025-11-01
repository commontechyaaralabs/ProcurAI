'use client';

import { Modal } from '@/components/ui/Modal';
import { EnhancedContract } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { TinyBars } from './TinyBars';
import { enhancedPurchaseOrders, enhancedVendors } from '@/lib/mockData';
import { Calendar, DollarSign, TrendingUp, AlertCircle, Building2, FileText, Clock, Percent } from 'lucide-react';

interface ContractDetailsModalProps {
  contract: EnhancedContract | null;
  isOpen: boolean;
  onClose: () => void;
  onRenew?: () => void;
}

export function ContractDetailsModal({ contract, isOpen, onClose, onRenew }: ContractDetailsModalProps) {
  if (!contract) return null;

  // Calculate contract metrics
  const contractDuration = Math.ceil(
    (new Date(contract.endDate).getTime() - new Date(contract.startDate).getTime()) / (1000 * 60 * 60 * 24)
  );
  const daysElapsed = contractDuration - (contract.daysToExpiry || 0);
  const utilizationRate = daysElapsed > 0 ? (contract.utilizedPercent / (daysElapsed / contractDuration)) * 100 : 0;
  
  // Calculate financial metrics
  const utilizedAmount = (contract.value * contract.utilizedPercent) / 100;
  const remainingAmount = contract.value - utilizedAmount;
  const avgMonthlyUtilization = contractDuration > 0 ? (utilizedAmount / (daysElapsed / 30)) : 0;
  
  // Get related purchase orders
  const contractPOs = enhancedPurchaseOrders.filter(po => po.vendorId === contract.vendorId);
  const recentContractPOs = contractPOs.slice(-5);
  const totalPOSpend = contractPOs.reduce((sum, po) => sum + po.amount, 0);
  
  // Get vendor info
  const vendor = enhancedVendors.find(v => v.id === contract.vendorId);
  
  // Calculate renewal urgency
  const isRenewalUrgent = (contract.daysToExpiry || 0) <= 90;
  const isRenewalApproaching = (contract.daysToExpiry || 0) <= 180;
  
  // Utilization status
  const utilizationStatus = contract.utilizedPercent >= 80 ? 'high' : 
                            contract.utilizedPercent >= 60 ? 'medium' : 'low';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Contract: ${contract.name}`} size="xl">
      <div className="space-y-6">
        {/* Header Summary */}
        <div className="grid grid-cols-4 gap-4 p-4 bg-[#DFE2E4]/30 rounded-lg border border-[#DFE2E4]">
          <div>
            <div className="text-xs text-[#9DA5A8] mb-1">Contract Value</div>
            <div className="text-lg font-semibold text-[#31343A]">{formatCurrency(contract.value)}</div>
          </div>
          <div>
            <div className="text-xs text-[#9DA5A8] mb-1">Utilized</div>
            <div className="text-lg font-semibold text-[#31343A]">{formatCurrency(utilizedAmount)}</div>
            <div className="text-[10px] text-[#9DA5A8]">{contract.utilizedPercent}%</div>
          </div>
          <div>
            <div className="text-xs text-[#9DA5A8] mb-1">Remaining</div>
            <div className="text-lg font-semibold text-[#31343A]">{formatCurrency(remainingAmount)}</div>
            <div className="text-[10px] text-[#9DA5A8]">{100 - contract.utilizedPercent}%</div>
          </div>
          <div>
            <div className="text-xs text-[#9DA5A8] mb-1">Days to Expiry</div>
            <div className={`text-lg font-semibold ${isRenewalUrgent ? 'text-[#E00420]' : isRenewalApproaching ? 'text-orange-600' : 'text-[#31343A]'}`}>
              {contract.daysToExpiry || 0}
            </div>
            <div className="text-[10px] text-[#9DA5A8]">{isRenewalUrgent ? 'Urgent' : isRenewalApproaching ? 'Approaching' : 'Active'}</div>
          </div>
        </div>

        {/* Basic Information */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-[#9DA5A8] flex items-center gap-1.5 mb-1">
              <FileText className="h-3.5 w-3.5" />
              Contract Name
            </label>
            <p className="text-lg font-semibold text-[#31343A]">{contract.name}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-[#9DA5A8] flex items-center gap-1.5 mb-1">
              <Building2 className="h-3.5 w-3.5" />
              Vendor
            </label>
            <p className="text-lg text-[#31343A]">{contract.vendor}</p>
            {vendor && (
              <div className="text-xs text-[#9DA5A8] mt-0.5">
                Rating: {vendor.performanceRating}/5.0 • Health: {vendor.healthScore}%
              </div>
            )}
          </div>
          <div>
            <label className="text-sm font-medium text-[#9DA5A8] flex items-center gap-1.5 mb-1">
              <Calendar className="h-3.5 w-3.5" />
              Start Date
            </label>
            <p className="text-lg text-[#31343A]">{formatDate(contract.startDate)}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-[#9DA5A8] flex items-center gap-1.5 mb-1">
              <Calendar className="h-3.5 w-3.5" />
              End Date
            </label>
            <p className="text-lg text-[#31343A]">{formatDate(contract.endDate)}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-[#9DA5A8] mb-1">Status</label>
            <div className="mt-1">
              <StatusBadge status={contract.status} />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-[#9DA5A8] mb-1">Contract Duration</label>
            <p className="text-lg text-[#31343A]">{contractDuration} days</p>
            <div className="text-xs text-[#9DA5A8] mt-0.5">
              {Math.floor(contractDuration / 365)} year{Math.floor(contractDuration / 365) !== 1 ? 's' : ''} {contractDuration % 365} days
            </div>
          </div>
        </div>

        {/* Financial Metrics */}
        <div className="border-t border-[#DFE2E4] pt-4">
          <h3 className="text-lg font-semibold text-[#31343A] mb-4 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-[#9DA5A8]" />
            Financial Metrics
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="border border-[#DFE2E4] rounded-lg p-3">
              <div className="text-xs text-[#9DA5A8] mb-1">Total Contract Value</div>
              <div className="text-xl font-semibold text-[#31343A]">{formatCurrency(contract.value)}</div>
              <div className="text-[10px] text-[#9DA5A8] mt-1">Original contract value</div>
            </div>
            <div className="border border-[#DFE2E4] rounded-lg p-3">
              <div className="text-xs text-[#9DA5A8] mb-1">Avg Monthly Spend</div>
              <div className="text-xl font-semibold text-[#31343A]">{formatCurrency(avgMonthlyUtilization)}</div>
              <div className="text-[10px] text-[#9DA5A8] mt-1">Based on utilization</div>
            </div>
            <div className="border border-[#DFE2E4] rounded-lg p-3">
              <div className="text-xs text-[#9DA5A8] mb-1">POs Under Contract</div>
              <div className="text-xl font-semibold text-[#31343A]">{contractPOs.length}</div>
              <div className="text-[10px] text-[#9DA5A8] mt-1">Total: {formatCurrency(totalPOSpend)}</div>
            </div>
          </div>
        </div>

        {/* Utilization Analysis */}
        <div className="border-t border-[#DFE2E4] pt-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[#31343A] flex items-center gap-2">
              <Percent className="h-5 w-5 text-[#9DA5A8]" />
              Contract Utilization Analysis
            </h3>
            {utilizationStatus === 'high' && (
              <div className="flex items-center gap-2 text-xs text-[#E00420] bg-[#E00420]/10 px-3 py-1.5 rounded-full">
                <AlertCircle className="h-3.5 w-3.5" />
                High Utilization - Consider Renewal
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            {/* Main Utilization Bar */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-[#31343A]">Utilization: {contract.utilizedPercent}%</span>
                <span className="text-xs text-[#9DA5A8]">
                  {formatCurrency(utilizedAmount)} of {formatCurrency(contract.value)}
                </span>
              </div>
              <div className="w-full bg-[#DFE2E4] rounded-full h-5 relative overflow-hidden">
                <div 
                  className={`h-5 rounded-full transition-all ${
                    contract.utilizedPercent >= 80 ? 'bg-[#E00420]' :
                    contract.utilizedPercent >= 60 ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`}
                  style={{ width: `${contract.utilizedPercent}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-semibold text-[#31343A]">
                    {contract.utilizedPercent}%
                  </span>
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-[#9DA5A8]">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Utilization Metrics */}
            <div className="grid grid-cols-3 gap-3">
              <div className="border border-[#DFE2E4] rounded-lg p-3">
                <div className="text-xs text-[#9DA5A8] mb-1">Days Elapsed</div>
                <div className="text-lg font-semibold text-[#31343A]">{daysElapsed}</div>
                <div className="text-[10px] text-[#9DA5A8] mt-0.5">
                  {((daysElapsed / contractDuration) * 100).toFixed(1)}% of duration
                </div>
              </div>
              <div className="border border-[#DFE2E4] rounded-lg p-3">
                <div className="text-xs text-[#9DA5A8] mb-1">Utilization Rate</div>
                <div className="text-lg font-semibold text-[#31343A]">{utilizationRate.toFixed(1)}%</div>
                <div className="text-[10px] text-[#9DA5A8] mt-0.5">vs timeline</div>
              </div>
              <div className="border border-[#DFE2E4] rounded-lg p-3">
                <div className="text-xs text-[#9DA5A8] mb-1">Projected Completion</div>
                <div className="text-lg font-semibold text-[#31343A]">
                  {contract.utilizedPercent > 0 && utilizationRate > 0 
                    ? Math.ceil((100 - contract.utilizedPercent) / (utilizationRate / (daysElapsed / 30)))
                    : '—'
                  }
                </div>
                <div className="text-[10px] text-[#9DA5A8] mt-0.5">months remaining</div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Purchase Orders */}
        {recentContractPOs.length > 0 && (
          <div className="border-t border-[#DFE2E4] pt-4">
            <h3 className="text-lg font-semibold text-[#31343A] mb-4">Recent Purchase Orders</h3>
            <div className="border border-[#DFE2E4] rounded-lg overflow-hidden">
              <div className="bg-[#DFE2E4]/30 px-4 py-2 border-b border-[#DFE2E4]">
                <div className="grid grid-cols-4 gap-4 text-xs font-semibold text-[#9DA5A8]">
                  <div>PO Number</div>
                  <div>Amount</div>
                  <div>Status</div>
                  <div>Date</div>
                </div>
              </div>
              <div className="max-h-40 overflow-y-auto">
                {recentContractPOs.map((po) => (
                  <div key={po.id} className="px-4 py-2 border-b border-[#DFE2E4] last:border-b-0 hover:bg-[#DFE2E4]/20 grid grid-cols-4 gap-4 items-center">
                    <div className="text-sm font-medium text-[#31343A]">{po.poNumber}</div>
                    <div className="text-sm text-[#31343A]">{formatCurrency(po.amount)}</div>
                    <div><StatusBadge status={po.status} /></div>
                    <div className="text-xs text-[#9DA5A8]">{formatDate(po.createdAt)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Renewal Information */}
        {contract.daysToExpiry !== undefined && (
          <div className={`border-t border-[#DFE2E4] pt-4 ${isRenewalUrgent || isRenewalApproaching ? 'bg-orange-50 border-orange-200 rounded-lg p-4' : ''}`}>
            <div className="flex items-start gap-3">
              <Clock className={`h-5 w-5 mt-0.5 ${isRenewalUrgent ? 'text-[#E00420]' : isRenewalApproaching ? 'text-orange-600' : 'text-[#9DA5A8]'}`} />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-[#31343A] mb-2">Renewal Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[#9DA5A8]">Days to Expiry:</span>
                    <span className={`font-semibold ${isRenewalUrgent ? 'text-[#E00420]' : isRenewalApproaching ? 'text-orange-600' : 'text-[#31343A]'}`}>
                      {contract.daysToExpiry} days
                    </span>
                  </div>
                  {isRenewalUrgent && (
                    <div className="flex items-center gap-2 text-xs text-[#E00420] bg-[#E00420]/10 px-3 py-2 rounded">
                      <AlertCircle className="h-4 w-4" />
                      <span>Renewal window opens in {Math.max(0, contract.daysToExpiry - 60)} days. Start renewal process now.</span>
                    </div>
                  )}
                  {isRenewalApproaching && !isRenewalUrgent && (
                    <div className="flex items-center gap-2 text-xs text-orange-600 bg-orange-50 px-3 py-2 rounded">
                      <AlertCircle className="h-4 w-4" />
                      <span>Renewal window will open in {contract.daysToExpiry - 60} days. Plan renewal discussions.</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="border-t border-[#DFE2E4] pt-4 flex gap-3">
          {contract.status === 'executed' && (
            <button
              onClick={() => { onRenew?.(); onClose(); }}
              className="px-4 py-2 bg-[#005691] text-white rounded-lg font-medium hover:bg-[#004574] flex items-center gap-2"
            >
              <TrendingUp className="h-4 w-4" />
              Renew Contract
            </button>
          )}
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

