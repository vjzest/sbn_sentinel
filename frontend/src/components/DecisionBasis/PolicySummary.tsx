/**
 * D4 — PolicySummary
 * Displays exact policy_id / version / lifecycle from the backend.
 * If policy is null/unavailable → renders "Basis detail unavailable".
 * NEVER: sorts by version, assumes ACTIVE, selects newest.
 */
import React from 'react';
import { FileText } from 'lucide-react';
import type { PolicyBasisDTO } from '@/types/decisionBasis';
import {
  labelForLifecycle,
  lifecycleColorClass,
  formatTimestamp,
} from '@/utils/decisionBasisPresentation';

interface PolicySummaryProps {
  policy: PolicyBasisDTO | null | undefined;
}

export const PolicySummary: React.FC<PolicySummaryProps> = ({ policy }) => {
  // If policy basis is unavailable, show unavailable — never infer (T10, T11)
  if (!policy) {
    return (
      <section aria-labelledby="policy-summary-title" className="space-y-2">
        <h3
          id="policy-summary-title"
          className="text-[10px] font-extrabold text-white/50 uppercase tracking-widest"
        >
          Policy Basis
        </h3>
        <p className="text-[11px] text-white/40 font-semibold italic">
          Policy basis detail unavailable.
        </p>
      </section>
    );
  }

  return (
    <section
      aria-labelledby="policy-summary-title"
      className="space-y-3"
    >
      <h3
        id="policy-summary-title"
        className="text-[10px] font-extrabold text-white/50 uppercase tracking-widest"
      >
        Policy Basis
      </h3>

      <div className="p-3 bg-white/5 border border-white/10 rounded-[12px] space-y-2">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-400 flex-shrink-0" aria-hidden="true" />
          <div className="min-w-0">
            <p className="text-xs font-extrabold text-white">
              {policy.policy_id}
              <span className="ml-1.5 text-white/40 font-mono text-[10px]">
                / {policy.version}
              </span>
            </p>
          </div>
        </div>

        {/* Lifecycle — distinct states, ACTIVE ≠ SUPERSEDED ≠ PENDING (T10) */}
        <div className="flex items-center gap-2">
          <p className="text-[10px] text-white/50 uppercase tracking-widest font-bold">
            Lifecycle:
          </p>
          <span
            className={`text-[10px] font-extrabold px-2 py-0.5 rounded-[6px] border ${lifecycleColorClass(
              policy.lifecycle_state,
            )}`}
            aria-label={`Policy lifecycle: ${labelForLifecycle(policy.lifecycle_state)}`}
          >
            {labelForLifecycle(policy.lifecycle_state)}
          </span>
        </div>

        {(policy.effective_from || policy.effective_until) && (
          <div className="text-[10px] font-mono text-white/40 space-y-0.5">
            {policy.effective_from && (
              <p>Effective from: {formatTimestamp(policy.effective_from)}</p>
            )}
            {policy.effective_until && (
              <p>Effective until: {formatTimestamp(policy.effective_until)}</p>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
