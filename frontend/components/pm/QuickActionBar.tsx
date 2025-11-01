'use client';

import { Plus, FileText, ShoppingCart, MessageSquare } from 'lucide-react';

interface QuickActionBarProps {
  onCreateRFQ?: () => void;
  onCreatePO?: () => void;
  onUploadContract?: () => void;
  onSupplierChat?: () => void;
}

export function QuickActionBar({ onCreateRFQ, onCreatePO, onUploadContract, onSupplierChat }: QuickActionBarProps) {
  return (
    <div className="fixed bottom-3 left-3 right-3 z-30">
      <div className="mx-auto max-w-7xl bg-white border border-[#DFE2E4] rounded-xl shadow-md px-3 py-2 flex justify-center gap-3">
        <button onClick={onCreateRFQ} className="flex items-center gap-2 px-3 py-2 bg-[#005691] text-white rounded-lg text-sm hover:bg-[#004574]">
          <Plus className="w-4 h-4" /> New RFQ
        </button>
        <button onClick={onCreatePO} className="flex items-center gap-2 px-3 py-2 border border-[#B6BBBE] rounded-lg text-sm hover:bg-[#DFE2E4] text-[#31343A]">
          <ShoppingCart className="w-4 h-4" /> Create PO
        </button>
        <button onClick={onUploadContract} className="flex items-center gap-2 px-3 py-2 border border-[#B6BBBE] rounded-lg text-sm hover:bg-[#DFE2E4] text-[#31343A]">
          <FileText className="w-4 h-4" /> Upload Contract
        </button>
        <button onClick={onSupplierChat} className="flex items-center gap-2 px-3 py-2 border border-[#B6BBBE] rounded-lg text-sm hover:bg-[#DFE2E4] text-[#31343A]">
          <MessageSquare className="w-4 h-4" /> Supplier Chat
        </button>
      </div>
    </div>
  );
}


