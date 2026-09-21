/**
 * D6.8: OutcomeSummary component
 * Displays OperationalOutcome — confirmation_state and resolution_state are SEPARATE truths.
 * INVARIANT: confirmation_state is NEVER inferred from action result or execution result.
 * Both states come from backend DB record only.
 */

import React from 'react';
import { ShieldCheck, AlertTriangle, HelpCircle } from 'lucide-react';
import type { OperationalOutcomeDTO } from '@/types/actionLifecycle';
import {
  confirmationStateLabel,
  confirmationStateBadge,
  resolutionStateLabel,
  resolutionStateBadge,
} from '@/utils/actionPresentation';

interface Props {
  outcome: OperationalOutcomeDTO;
}

const ConfirmationIcon: React.FC<{ state: string }> = ({ state }) => {
  switch (state) {
    case 'CONFIRMED': return <ShieldCheck className="w-4 h-4 text-emerald-400" />;
    case 'MISMATCH': return <AlertTriangle className="w-4 h-4 text-red-400" />;
    default: return <HelpCircle className="w-4 h-4 text-white/30" />;
  }
};

export const OutcomeSummary: React.FC<Props> = ({ outcome }) => {
  return (
    <div className="bg-white/5 border border-white/10 rounded-[12px] p-4 space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <span className="p-1.5 rounded-[8px] bg-teal-500/20">
          <ConfirmationIcon state={outcome.confirmation_state} />
        </span>
        <p className="text-xs font-extrabold text-white uppercase tracking-wide">Operational Outcome</p>
      </div>

      {/* CORE INVARIANT: confirmation and resolution shown as separate truths */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-1">Confirmation State</p>
          <span className={`inline-flex text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-[6px] border ${confirmationStateBadge(outcome.confirmation_state)}`}>
            {confirmationStateLabel(outcome.confirmation_state)}
          </span>
          <p className="text-[9px] text-white/30 mt-1 font-semibold">
            Not inferred from execution result
          </p>
        </div>
        <div>
          <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-1">Resolution State</p>
          <span className={`inline-flex text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-[6px] border ${resolutionStateBadge(outcome.resolution_state)}`}>
            {resolutionStateLabel(outcome.resolution_state)}
          </span>
        </div>
      </div>

      {/* Expected vs Observed */}
      {(outcome.expected_outcome !== null || outcome.observed_outcome !== null) && (
        <div className="space-y-2 border-t border-white/10 pt-3">
          {outcome.expected_outcome !== null && (
            <div>
              <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-0.5">Expected Outcome</p>
              <p className="text-[11px] text-white/70 font-mono break-all">
                {typeof outcome.expected_outcome === 'object'
                  ? JSON.stringify(outcome.expected_outcome)
                  : String(outcome.expected_outcome)}
              </p>
            </div>
          )}
          {outcome.observed_outcome !== null && (
            <div>
              <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-0.5">Observed Outcome</p>
              <p className="text-[11px] text-white/70 font-mono break-all">
                {typeof outcome.observed_outcome === 'object'
                  ? JSON.stringify(outcome.observed_outcome)
                  : String(outcome.observed_outcome)}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Timestamps & closure */}
      <div className="border-t border-white/10 pt-3 space-y-1.5">
        {outcome.confirmed_at && (
          <p className="text-[10px] text-white/40 font-semibold">
            Confirmed at: <span className="text-white/60">{new Date(outcome.confirmed_at).toLocaleString()}</span>
          </p>
        )}
        {outcome.closed_at && (
          <p className="text-[10px] text-white/40 font-semibold">
            Closed at: <span className="text-white/60">{new Date(outcome.closed_at).toLocaleString()}</span>
          </p>
        )}
        {outcome.closure_reason && (
          <p className="text-[10px] text-white/40 font-semibold">
            Closure reason: <span className="text-white/60">{outcome.closure_reason}</span>
          </p>
        )}
        {outcome.outcome_id && (
          <p className="text-[9px] font-mono text-white/20 border-t border-white/5 pt-1.5">
            Outcome ID: {outcome.outcome_id}
          </p>
        )}
      </div>
    </div>
  );
};
