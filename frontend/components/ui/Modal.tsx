'use client';

import { X } from 'lucide-react';
import { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  zIndex?: number;
}

export function Modal({ isOpen, onClose, title, children, size = 'md', zIndex = 100 }: ModalProps) {
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

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center" style={{ zIndex }} onClick={(e) => {
      // Only close if clicking the backdrop, not the modal content
      if (e.target === e.currentTarget) {
        onClose();
      }
    }}>
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-md" />
      <div className={`relative bg-white rounded-lg shadow-xl ${sizeClasses[size]} w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col pointer-events-auto`} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-[#DFE2E4]">
          <h2 className="text-xl font-semibold text-[#31343A]">{title}</h2>
          <button onClick={onClose} className="text-[#9DA5A8] hover:text-[#31343A]">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

