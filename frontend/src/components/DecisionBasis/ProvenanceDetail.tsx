/**
 * D4 — ProvenanceDetail (Level 3)
 * Exact backend refs, context ID, and ingestion timestamps.
 * Collapsed behind ProgressiveSection — authorized/minimized by default.
 * Read-only. No interpretation or recalculation.
 */
import React from 'react';
import { Hash } from 'lucide-react';
import type { ProvenanceDTO } from '@/types/decisionBasis';
import { formatTimestamp } from '@/utils/decisionBasisPresentation';

interface ProvenanceDetailProps {
  provenance: ProvenanceDTO | null | undefined;
}

export const ProvenanceDetail: React.FC<ProvenanceDetailProps> = ({
  provenance,
}) => {
  if (!provenance) {
    return (
      <section aria-labelledby="provenance-title" className="space-y-2">
        <h3
          id="provenance-title"
          className="text-[10px] font-extrabold text-white/50 uppercase tracking-widest"
        >
          Provenance
        </h3>
        <p className="text-[11px] text-white/40 font-semibold italic">
          Provenance records unavailable.
        </p>
      </section>
    );
  }

  return (
    <section aria-labelledby="provenance-title" className="space-y-3">
      <h3
        id="provenance-title"
        className="text-[10px] font-extrabold text-white/50 uppercase tracking-widest"
      >
        Provenance
      </h3>

      {/* Context ID — survives progressive navigation (T06) */}
      <div className="flex items-center gap-2 p-2 bg-white/5 border border-white/10 rounded-[8px]">
        <Hash className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" aria-hidden="true" />
        <p className="text-[10px] font-mono text-white/60 break-all">
          Context ID: {provenance.context_id}
        </p>
      </div>

      {provenance.provenance_items.length > 0 && (
        <ul className="space-y-1.5">
          {provenance.provenance_items.map((item, idx) => (
            <li
              key={`${item.evidence_id}-${idx}`}
              className="text-[10px] font-mono text-white/40 p-2 bg-white/3 border border-white/5 rounded-[8px] space-y-0.5"
            >
              <p>Evidence: {item.evidence_id}</p>
              <p>Source: {item.source_system}</p>
              {item.ingestion_timestamp && (
                <p>Ingested: {formatTimestamp(item.ingestion_timestamp)}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};
