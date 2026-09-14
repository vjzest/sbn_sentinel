import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const Dialog: React.FC<DialogProps> = ({ isOpen, onClose, title, children, footer }) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6" aria-modal="true" role="dialog">
      <div 
        className="absolute inset-0 bg-[var(--color-overlay)] animate-in fade-in duration-200" 
        onClick={onClose} 
        aria-hidden="true" 
      />
      <div className="relative w-full max-w-lg bg-[var(--color-surface)] border border-[var(--color-semantic-unknown)]/30 rounded-[16px] shadow-2xl flex flex-col animate-in zoom-in-95 fade-in duration-200 max-h-[90vh]">
        <div className="flex items-center justify-between p-5 border-b border-[var(--color-semantic-unknown)]/20">
          <h2 className="text-lg font-bold text-[var(--color-text-primary)]">{title}</h2>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar text-[var(--color-text-secondary)]">
          {children}
        </div>
        {footer && (
          <div className="p-5 border-t border-[var(--color-semantic-unknown)]/20 bg-[var(--color-surface-raised)] rounded-b-[16px] flex justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
