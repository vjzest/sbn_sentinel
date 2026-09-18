/**
 * D4 — DecisionContextSummary
 * Presents context identity, sufficiency, evaluated timestamp, and mode.
 * SUFFICIENT ≠ COMPLETE. Backend field drives every display label (T02, T03).
 */
import React from 'react';
import { Clock, Shield } from 'lucide-react';
import type { DecisionContextSummaryDTO } from '@/types/decisionBasis';
import {
  labelForSufficiency,
  sufficiencyColorClass,
  formatTimestamp,
} from '@/utils/decisionBasisPresentation';

interface DecisionContextSummaryProps {
  context: DecisionContextSummaryDTO;
}

export const DecisionContextSummary: React.FC<DecisionContextSummaryProps> = ({
  context,
}) => {
  const {
    context_id,
    status,
    sufficiency_status,
    evaluated_at,
    mode,
  } = context;

  return (
    <section
      aria-labelledby="decision-context-summary-title"
      className="space-y-3"
    >
      <h3
        id="decision-context-summary-title"
        className="text-[10px] font-extrabold text-white/50 uppercase tracking-widest"
      >
        Decision Context
      </h3>

      <div className="grid grid-cols-2 gap-3">
        {/* Sufficiency — SUFFICIENT ≠ COMPLETE (T02) */}
        <div>
          <p className="text-[10px] text-white/50 uppercase tracking-widest font-bold mb-1">
            Sufficiency
          </p>
          <span
            className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-[6px] border ${sufficiencyColorClass(
              sufficiency_status,
            )}`}
            aria-label={`Sufficiency status: ${labelForSufficiency(sufficiency_status)}`}
          >
            <Shield className="w-3 h-3" aria-hidden="true" />
            {labelForSufficiency(sufficiency_status)}
          </span>
        </div>

        {/* Mode — from authoritative field only, never inferred */}
        <div>
          <p className="text-[10px] text-white/50 uppercase tracking-widest font-bold mb-1">
            Mode
          </p>
          <span
            className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-[6px] border ${
              mode === 'historical'
                ? 'text-amber-400 bg-amber-500/10 border-amber-500/30'
                : 'text-blue-400 bg-blue-500/10 border-blue-500/30'
            }`}
          >
            {mode === 'historical' ? 'Historical' : 'Current'}
          </span>
        </div>

        {/* Primary context status */}
        {status && (
          <div className="col-span-2">
            <p className="text-[10px] text-white/50 uppercase tracking-widest font-bold mb-1">
              Context Status
            </p>
            <p className="text-xs font-bold text-white">{status}</p>
          </div>
        )}

        {/* Evaluated timestamp — from backend only, no browser date (T03) */}
        {evaluated_at && (
          <div className="col-span-2">
            <p className="text-[10px] text-white/50 uppercase tracking-widest font-bold mb-1">
              Evaluated At
            </p>
            <span className="flex items-center gap-1.5 text-[10px] font-mono text-white/60">
              <Clock className="w-3 h-3" aria-hidden="true" />
              {formatTimestamp(evaluated_at)}
            </span>
          </div>
        )}

        {/* Context ID — survives progressive navigation (T06) */}
        {context_id && (
          <div className="col-span-2">
            <p className="text-[10px] text-white/50 uppercase tracking-widest font-bold mb-1">
              Context ID
            </p>
            <p className="text-[10px] font-mono text-white/40 break-all">
              {context_id}
            </p>
          </div>
        )}
      </div>
    </section>
  );
};
