import React from 'react';
import { mapGovernedState, SemanticState } from '@/utils/governedPresentation';
import { CheckCircle2, AlertTriangle, AlertCircle, Clock, HelpCircle, XCircle } from 'lucide-react';

interface GovernedStatusProps {
  state: string;
  label?: string;
  reason?: string;
  className?: string;
}

const getSemanticStyles = (semantic: SemanticState) => {
  switch (semantic) {
    case 'positive':
      return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    case 'attention':
      return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    case 'critical':
      return 'bg-red-500/20 text-red-400 border-red-500/30';
    case 'disabled':
      return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    case 'neutral':
    case 'unknown':
    default:
      return 'bg-white/10 text-white/70 border-white/20';
  }
};

const getSemanticIcon = (semantic: SemanticState) => {
  switch (semantic) {
    case 'positive':
      return <CheckCircle2 className="w-3.5 h-3.5" />;
    case 'attention':
      return <Clock className="w-3.5 h-3.5" />;
    case 'critical':
      return <XCircle className="w-3.5 h-3.5" />;
    case 'disabled':
      return <AlertTriangle className="w-3.5 h-3.5" />;
    case 'neutral':
    case 'unknown':
    default:
      return <HelpCircle className="w-3.5 h-3.5" />;
  }
};

export const GovernedStatus: React.FC<GovernedStatusProps> = ({ state, label, reason, className = '' }) => {
  const presentation = mapGovernedState(state);
  const displayLabel = label || presentation.label;
  const styles = getSemanticStyles(presentation.semantic);
  const icon = getSemanticIcon(presentation.semantic);

  return (
    <div className={`inline-flex items-center gap-1.5 text-[10px] md:text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-[8px] border ${styles} ${className}`} title={reason}>
      {icon}
      <span>{displayLabel}</span>
      {reason && (
        <span className="ml-1 opacity-70 normal-case tracking-normal">
          ({reason})
        </span>
      )}
    </div>
  );
};
