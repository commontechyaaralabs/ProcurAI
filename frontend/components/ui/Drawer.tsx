'use client';

import { X } from 'lucide-react';
import { useEffect } from 'react';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Drawer({ isOpen, onClose, title, children, width = 'lg' }: DrawerProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const widthClasses = {
    sm: 'w-full sm:w-96',
    md: 'w-full sm:w-[500px]',
    lg: 'w-full sm:w-[600px]',
    xl: 'w-full sm:w-[800px]',
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className={`fixed right-0 top-0 h-full ${widthClasses[width]} bg-white shadow-xl z-50 flex flex-col`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#DFE2E4]">
          <h2 className="text-xl font-semibold text-[#31343A]">{title}</h2>
          <button 
            onClick={onClose} 
            className="text-[#9DA5A8] hover:text-[#31343A] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </>
  );
}

