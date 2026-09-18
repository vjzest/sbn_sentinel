/**
 * D4 — EvidenceSummary
 * Presents Used / Missing / Freshness / Conflict evidence from backend payload.
 * CORE RULES:
 *   - Used Evidence is ALWAYS separate from Missing Evidence (T01)
 *   - Freshness status comes only from backend (T03) — no Date.now() calc
 *   - Conflicts are explicit, no winner selected (T04)
 *   - SUFFICIENT context does NOT hide Missing evidence (T02)
 */
import React from 'react';
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import type { DecisionBasisDTO } from '@/types/decisionBasis';
import {
  labelForFreshness,
  formatTimestamp,
} from '@/utils/decisionBasisPresentation';
import { EvidenceConflictNotice } from './EvidenceConflictNotice';

interface EvidenceSummaryProps {
  evidence: DecisionBasisDTO['evidence'];
}

export const EvidenceSummary: React.FC<EvidenceSummaryProps> = ({
  evidence,
}) => {
  const { used, missing, conflicts, freshness } = evidence;

  return (
    <section aria-labelledby="evidence-summary-title" className="space-y-5">
      <h3
        id="evidence-summary-title"
        className="text-[10px] font-extrabold text-white/50 uppercase tracking-widest"
      >
        Evidence
      </h3>

      {/* Level-1 counts strip — always visible */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400">
          <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Used: {used.length}</span>
        </div>
        <div
          className={`flex items-center gap-1.5 text-[11px] font-bold ${
            missing.length > 0 ? 'text-amber-400' : 'text-white/50'
          }`}
          aria-label={`Missing evidence: ${missing.length}`}
        >
          <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Missing: {missing.length}</span>
        </div>
        <div
          className={`flex items-center gap-1.5 text-[11px] font-bold ${
            conflicts.length > 0 ? 'text-amber-400' : 'text-white/50'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Conflicts: {conflicts.length}</span>
        </div>
      </div>

      {/* Conflicts — explicit, no resolution */}
      {conflicts.length > 0 && (
        <div>
          <p className="text-[10px] font-extrabold text-amber-400 uppercase tracking-widest mb-2">
            Conflict Detail
          </p>
          <EvidenceConflictNotice conflicts={conflicts} />
        </div>
      )}

      {/* Used Evidence — separate labeled region (T01) */}
      {used.length > 0 && (
        <div role="region" aria-label="Used evidence">
          <p className="text-[10px] font-extrabold text-white/50 uppercase tracking-widest mb-2">
            Used Evidence
          </p>
          <ul className="space-y-2">
            {used.map((ev) => {
              const fresh = freshness.find((f) => f.evidence_id === ev.evidence_id);
              return (
                <li
                  key={ev.evidence_id}
                  className="flex items-start gap-2 p-2.5 bg-white/5 border border-white/10 rounded-[10px]"
                >
                  <CheckCircle2
                    className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <p className="text-xs font-bold text-white truncate">
                      {ev.type}
                      {ev.source && (
                        <span className="ml-1.5 text-[10px] font-mono text-white/40">
                          ({ev.source})
                        </span>
                      )}
                    </p>
                    {ev.value && (
                      <p className="text-[10px] text-white/60 font-semibold truncate">
                        {ev.value}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2 text-[10px] font-mono">
                      {ev.retrieved_at && (
                        <span className="flex items-center gap-1 text-white/40">
                          <Clock className="w-3 h-3" aria-hidden="true" />
                          {formatTimestamp(ev.retrieved_at)}
                        </span>
                      )}
                      {/* Freshness — from backend only, no browser calculation */}
                      {fresh && (
                        <span
                          className={`font-bold ${fresh.is_stale ? 'text-amber-400' : 'text-emerald-400'}`}
                          aria-label={`Freshness: ${labelForFreshness(fresh.freshness_status)}`}
                        >
                          {labelForFreshness(fresh.freshness_status)}
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Missing Evidence — always separate labeled region (T01, T02) */}
      {/* Missing MUST remain visible even when context is SUFFICIENT */}
      {missing.length > 0 && (
        <div role="region" aria-label="Missing evidence">
          <p className="text-[10px] font-extrabold text-amber-400 uppercase tracking-widest mb-2">
            Missing Evidence
          </p>
          <ul className="space-y-2">
            {missing.map((ev) => (
              <li
                key={ev.evidence_id}
                className="flex items-start gap-2 p-2.5 bg-amber-500/5 border border-amber-500/20 rounded-[10px]"
              >
                <AlertCircle
                  className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <div className="min-w-0 flex-1 space-y-0.5">
                  <p className="text-xs font-bold text-amber-300">
                    {ev.type}
                  </p>
                  {ev.impact_level && (
                    <p className="text-[10px] text-amber-400/70 font-semibold">
                      Impact: {ev.impact_level}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {used.length === 0 && missing.length === 0 && (
        <p className="text-[11px] text-white/40 font-semibold italic">
          No evidence records available for this signal.
        </p>
      )}
    </section>
  );
};
