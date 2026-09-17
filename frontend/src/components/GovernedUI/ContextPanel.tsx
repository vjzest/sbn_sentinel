import React from 'react';
import { NavigationContext } from '@/utils/governedNavigation';
import { DataState } from './DataState';

interface ContextPanelProps {
  context: NavigationContext;
  title: React.ReactNode;
  icon?: React.ReactNode;
  dataState?: 'loading' | 'unavailable' | 'unauthorized' | 'ready' | 'empty';
  dataStateMessage?: string;
  children: React.ReactNode;
  className?: string;
}

export const ContextPanel: React.FC<ContextPanelProps> = ({
  context,
  title,
  icon,
  dataState = 'ready',
  dataStateMessage,
  children,
  className = ''
}) => {
  return (
    <div className={`bg-gradient-to-br from-[var(--color-surface-raised)] to-[var(--color-surface)] border border-white/10 rounded-[24px] shadow-[0_20px_50px_rgba(46,16,85,0.3)] flex flex-col ${className}`}>
      <div className="p-6 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon && <span className="flex-shrink-0">{icon}</span>}
          <h3 className="text-base font-extrabold text-white flex items-center gap-2">
            {title}
            {context.mode === 'historical' && (
              <span className="text-[10px] font-mono bg-slate-500/20 border border-slate-500/50 text-slate-400 px-2 py-0.5 rounded-[6px]">
                HISTORICAL
              </span>
            )}
          </h3>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono bg-[var(--color-surface-raised)]/20 border border-[var(--color-surface-raised)]/50 text-[var(--color-accent)] px-2 py-0.5 rounded-[6px]" title="Context Reference">
            REF: {context.primary.objectId}
          </span>
        </div>
      </div>

      <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
        {dataState === 'ready' ? (
          children
        ) : (
          <div className="h-full flex items-center justify-center py-8">
            <DataState state={dataState} message={dataStateMessage} className="bg-transparent border-0" />
          </div>
        )}
      </div>
    </div>
  );
};
