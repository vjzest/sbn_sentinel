import React from 'react';
import { ChevronRight } from 'lucide-react';
import { NavigationContext, GovernedRef } from '@/utils/governedNavigation';

interface ContextBreadcrumbsProps {
  context: NavigationContext;
  onNavigateUp?: (target: GovernedRef) => void;
}

export const ContextBreadcrumbs: React.FC<ContextBreadcrumbsProps> = ({ 
  context,
  onNavigateUp
}) => {
  const { primary, parent, mode } = context;

  const renderRef = (ref: GovernedRef, isClickable: boolean) => (
    <div className="flex items-center gap-1.5">
      <span className="text-[10px] uppercase font-bold tracking-wider text-white/50">
        {ref.objectType}
      </span>
      <button 
        className={`text-xs font-mono font-bold text-left focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-1 focus:ring-offset-[var(--color-surface)] rounded-sm ${
          isClickable 
            ? 'text-[var(--color-accent)] cursor-pointer hover:underline' 
            : 'text-white'
        }`}
        onClick={() => {
          if (isClickable && onNavigateUp) {
            onNavigateUp(ref);
          }
        }}
        disabled={!isClickable}
        aria-current={!isClickable ? 'page' : undefined}
      >
        {ref.objectId}
      </button>
    </div>
  );

  return (
    <div className="flex flex-wrap items-center gap-2" aria-label="Governed Context Breadcrumbs">
      {parent && (
        <>
          {renderRef(parent, true)}
          <ChevronRight className="w-3.5 h-3.5 text-white/30" />
        </>
      )}
      
      {renderRef(primary, false)}

      {mode === 'historical' && (
        <span className="ml-2 inline-flex items-center text-[9px] bg-slate-500/20 text-slate-400 border border-slate-500/30 px-1.5 py-0.5 rounded-[4px] font-extrabold uppercase tracking-widest">
          Historical
        </span>
      )}
    </div>
  );
};
