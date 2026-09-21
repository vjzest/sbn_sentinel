/**
 * D6.8: ContinuityNotice component
 * Shown when the Action Lifecycle DTO has no associated decision,
 * or when journey_id cannot be established.
 * INVARIANT: Never guesses parent chain. Missing = explicitly shown.
 */

import React from 'react';
import { Link, AlertCircle } from 'lucide-react';

interface Props {
  /** The decision_id that was queried */
  decisionId: string;
  /** Optional: detail about why continuity is broken */
  reason?: string;
}

export const ContinuityNotice: React.FC<Props> = ({ decisionId, reason }) => {
  return (
    <div className="bg-orange-500/10 border border-orange-500/30 rounded-[14px] p-5 flex gap-3">
      <span className="p-2 bg-orange-500/20 rounded-[10px] self-start flex-shrink-0">
        <Link className="w-4 h-4 text-orange-400" />
      </span>
      <div>
        <div className="flex items-center gap-2 mb-1">
          <AlertCircle className="w-3.5 h-3.5 text-orange-400" />
          <p className="text-xs font-extrabold text-orange-300 uppercase tracking-wide">
            Continuity Chain Unavailable
          </p>
        </div>
        <p className="text-[11px] text-orange-200/80 font-semibold leading-snug">
          The Governed Action Lifecycle for decision <span className="font-mono text-orange-300">{decisionId}</span> could not be resolved.
          {reason && ` Reason: ${reason}`}
        </p>
        <p className="text-[10px] text-orange-200/50 mt-2 font-semibold">
          This is not inferred or guessed. The upstream record is absent or has not been persisted yet.
        </p>
      </div>
    </div>
  );
};
