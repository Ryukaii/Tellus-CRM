import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl'
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-2 sm:p-4">
        <div className="fixed inset-0 bg-black bg-opacity-25" onClick={onClose} />
        
        <div className={`relative bg-white rounded-lg sm:rounded-xl shadow-xl border border-tellus-gold-200 dark:bg-dark-card dark:border-dark-border ${sizeClasses[size]} w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto`}>
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-tellus-gold-200 bg-gradient-to-r from-tellus-gold-50 to-white dark:border-dark-border dark:from-dark-surfaceLight dark:to-dark-card">
            <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-tellus-charcoal-900 pr-2 dark:text-dark-text">{title}</h2>
            <button
              onClick={onClose}
              className="text-tellus-charcoal-400 hover:text-tellus-charcoal-600 transition-colors flex-shrink-0 p-1 dark:text-dark-textMuted dark:hover:text-dark-text"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
          
          <div className="p-4 sm:p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
