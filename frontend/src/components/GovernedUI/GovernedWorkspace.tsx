import React from 'react';
import { X } from 'lucide-react';
import { NavigationContext, GovernedRef } from '@/utils/governedNavigation';
import { ContextBreadcrumbs } from './ContextBreadcrumbs';

interface GovernedWorkspaceProps {
  context: NavigationContext;
  onNavigateUp?: (target: GovernedRef) => void;
  onClose?: () => void;
  primaryContent: React.ReactNode;
  contextPanels?: React.ReactNode;
}

export const GovernedWorkspace: React.FC<GovernedWorkspaceProps> = ({
  context,
  onNavigateUp,
  onClose,
  primaryContent,
  contextPanels
}) => {
  return (
    <div className="flex flex-col h-full bg-[var(--color-surface)] rounded-[24px] border border-white/10 overflow-hidden shadow-2xl animate-in fade-in duration-300 relative">
      {/* Workspace Header */}
      <div className="flex flex-wrap items-center justify-between p-4 px-6 border-b border-white/10 bg-white/5 shrink-0 gap-4">
        <ContextBreadcrumbs context={context} onNavigateUp={onNavigateUp} />
        
        {onClose && (
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer text-white/60 hover:text-white ms-auto focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            aria-label="Close Workspace"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Workspace Body - Responsive Layout */}
      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
        {/* Primary Content (Level 1) */}
        <div className={`flex-1 overflow-y-auto custom-scrollbar p-6 ${contextPanels ? 'lg:border-e lg:border-white/10' : ''}`}>
          {primaryContent}
        </div>

        {/* Context Panels (Level 2/3) */}
        {contextPanels && (
          <div className="w-full lg:w-[450px] flex-shrink-0 overflow-y-auto custom-scrollbar p-6 bg-black/20 border-t lg:border-t-0 border-white/10">
            <div className="flex flex-col gap-6">
              {contextPanels}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
