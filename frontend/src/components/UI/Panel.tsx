import React from 'react';

interface PanelProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  headerAction?: React.ReactNode;
}

export const Panel: React.FC<PanelProps> = ({ title, children, className = '', headerAction }) => {
  return (
    <div className={`bg-[var(--color-surface)] border border-[var(--color-semantic-unknown)]/20 rounded-[12px] overflow-hidden ${className}`}>
      {(title || headerAction) && (
        <div className="px-4 py-3 border-b border-[var(--color-semantic-unknown)]/20 flex justify-between items-center bg-[var(--color-surface-raised)]">
          {title && <h3 className="text-sm font-bold text-[var(--color-text-primary)]">{title}</h3>}
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div className="p-4">
        {children}
      </div>
    </div>
  );
};
