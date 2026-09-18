/**
 * D4 — EvidenceConflictNotice
 * Presents backend-detected evidence conflicts explicitly.
 * NEVER selects a winner or resolves the conflict.
 * aria-live="polite" ensures screen readers announce conflicts.
 */
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import type { EvidenceConflict } from '@/types/decisionBasis';

interface EvidenceConflictNoticeProps {
  conflicts: EvidenceConflict[];
}

export const EvidenceConflictNotice: React.FC<EvidenceConflictNoticeProps> = ({
  conflicts,
}) => {
  if (conflicts.length === 0) {
    return (
      <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
        No Conflicts Detected
      </div>
    );
  }

  return (
    <div
      aria-live="polite"
      aria-label={`${conflicts.length} evidence conflict${conflicts.length > 1 ? 's' : ''} detected`}
      className="space-y-2"
    >
      {conflicts.map((c) => (
        <div
          key={c.conflict_id}
          role="alert"
          className="flex gap-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-[12px]"
        >
          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold text-amber-300">
              Conflict: {c.description}
            </p>
            <div className="flex flex-wrap gap-3 mt-1 text-[10px] font-mono text-amber-400/70">
              <span>Evidence A: {c.evidence_a_id}</span>
              <span>Evidence B: {c.evidence_b_id}</span>
            </div>
            <p className="text-[10px] text-amber-500 mt-1 font-semibold">
              Resolution: {c.resolution_status}
              {/* Note: frontend NEVER resolves conflicts */}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
