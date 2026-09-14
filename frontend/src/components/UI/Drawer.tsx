import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  position?: 'right' | 'left' | 'bottom';
}

export const Drawer: React.FC<DrawerProps> = ({ isOpen, onClose, title, children, position = 'right' }) => {
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

  const positionClasses = {
    right: 'right-0 top-0 h-full w-full sm:w-[400px] md:w-[500px] border-l',
    left: 'left-0 top-0 h-full w-full sm:w-[400px] md:w-[500px] border-r',
    bottom: 'bottom-0 left-0 w-full h-[80vh] rounded-t-[20px] border-t',
  };

  return (
    <div className="fixed inset-0 z-50 flex" aria-modal="true" role="dialog">
      <div 
        className="absolute inset-0 bg-[var(--color-overlay)] animate-in fade-in duration-200" 
        onClick={onClose} 
        aria-hidden="true" 
      />
      <div className={`absolute bg-[var(--color-surface)] border-[var(--color-semantic-unknown)]/20 shadow-2xl flex flex-col transition-transform duration-300 ease-out animate-in slide-in-from-${position} ${positionClasses[position]}`}>
        <div className="flex items-center justify-between p-4 border-b border-[var(--color-semantic-unknown)]/20 bg-[var(--color-surface-raised)]">
          <h2 className="text-lg font-bold text-[var(--color-text-primary)]">{title}</h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/5 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
            aria-label="Close drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};
