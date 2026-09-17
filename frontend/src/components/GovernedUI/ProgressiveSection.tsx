import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { DataState } from './DataState';

interface ProgressiveSectionProps {
  id: string;
  title: React.ReactNode;
  icon?: React.ReactNode;
  defaultExpanded?: boolean;
  dataState?: 'loading' | 'unavailable' | 'unauthorized' | 'ready' | 'empty';
  dataStateMessage?: string;
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
}

export const ProgressiveSection: React.FC<ProgressiveSectionProps> = ({
  id,
  title,
  icon,
  defaultExpanded = false,
  dataState = 'ready',
  dataStateMessage,
  children,
  className = '',
  headerClassName = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const toggle = () => setIsExpanded(prev => !prev);

  const isBlocked = ['unavailable', 'unauthorized'].includes(dataState);

  return (
    <div className={`bg-white/5 border border-white/10 rounded-[18px] overflow-hidden ${className}`}>
      <button
        id={`header-${id}`}
        aria-expanded={isExpanded}
        aria-controls={`content-${id}`}
        onClick={toggle}
        className={`w-full flex items-center justify-between p-4 text-left transition-colors hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] ${headerClassName}`}
      >
        <div className="flex items-center gap-2">
          {icon && <span className="flex-shrink-0">{icon}</span>}
          <h5 className="text-xs font-extrabold uppercase tracking-wider text-white">
            {title}
          </h5>
        </div>
        <div className="flex items-center gap-3">
          {dataState === 'loading' && (
            <span className="text-[10px] uppercase font-bold text-white/50 animate-pulse">Loading...</span>
          )}
          {dataState === 'unauthorized' && (
            <span className="text-[10px] uppercase font-bold text-red-400">Restricted</span>
          )}
          <span className="text-white/50">
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </span>
        </div>
      </button>

      {/* 
        We render the content container and apply animation classes.
        Using D2 simple motion if possible (animate-in slide-in-from-top-1).
      */}
      {isExpanded && (
        <div 
          id={`content-${id}`}
          aria-labelledby={`header-${id}`}
          className="p-4 pt-0 border-t border-white/10 mt-2 animate-in slide-in-from-top-1 fade-in duration-200"
        >
          {dataState === 'ready' && children}
          
          {dataState !== 'ready' && (
            <div className="pt-4">
              <DataState state={dataState} message={dataStateMessage} className="bg-transparent border-0" />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
