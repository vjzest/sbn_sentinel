import React from 'react';
import { mapGovernedState, SemanticState } from '@/utils/governedPresentation';
import { CheckCircle2, AlertTriangle, Clock, HelpCircle, XCircle } from 'lucide-react';

interface GovernedStatusProps {
  state: string;
  label?: string;
  reason?: string;
  className?: string;
}

const getSemanticStyles = (semantic: SemanticState) => {
  switch (semantic) {
    case 'positive':
      return 'bg-[var(--color-semantic-positive)]/20 text-[var(--color-semantic-positive)] border-[var(--color-semantic-positive)]/30';
    case 'attention':
      return 'bg-[var(--color-semantic-attention)]/20 text-[var(--color-semantic-attention)] border-[var(--color-semantic-attention)]/30';
    case 'critical':
      return 'bg-[var(--color-semantic-critical)]/20 text-[var(--color-semantic-critical)] border-[var(--color-semantic-critical)]/30';
    case 'disabled':
      return 'bg-[var(--color-semantic-neutral)]/20 text-[var(--color-semantic-neutral)] border-[var(--color-semantic-neutral)]/30';
    case 'neutral':
    case 'unknown':
    default:
      return 'bg-[var(--color-semantic-unknown)]/10 text-[var(--color-semantic-unknown)] border-[var(--color-semantic-unknown)]/20';
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
