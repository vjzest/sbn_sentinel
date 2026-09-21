/**
 * D6.8: ExecutionAttemptHistory component
 * Displays the list of execution attempts for an action.
 * All data comes from backend DTO — attempt_number, connector, result, error.
 * INVARIANT: attempt_number=1 is not assumed to be "success" — result field is authoritative.
 */

import React from 'react';
import { Activity, AlertCircle, CheckCircle2, Loader } from 'lucide-react';
import type { ExecutionAttemptDTO } from '@/types/actionLifecycle';
import { executionResultLabel, executionResultColor } from '@/utils/actionPresentation';

interface Props {
  attempts: ExecutionAttemptDTO[];
}

const ResultIcon: React.FC<{ result: string }> = ({ result }) => {
  switch (result) {
    case 'SUCCESS': return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />;
    case 'FAILED': return <AlertCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />;
    case 'PARTIAL': return <AlertCircle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />;
    case 'NOT_ATTEMPTED': return <Loader className="w-3.5 h-3.5 text-white/30 flex-shrink-0" />;
    default: return <Activity className="w-3.5 h-3.5 text-white/40 flex-shrink-0" />;
  }
};

export const ExecutionAttemptHistory: React.FC<Props> = ({ attempts }) => {
  if (attempts.length === 0) {
    return (
      <div className="text-[11px] text-white/40 text-center py-3 border border-dashed border-white/10 rounded-[10px]">
        No execution attempts on record.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {attempts.map((attempt) => (
        <div
          key={attempt.attempt_id}
          className="bg-black/30 border border-white/10 rounded-[10px] px-3 py-2.5"
        >
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-1.5">
              <ResultIcon result={attempt.result} />
              <span className="text-[11px] font-bold text-white">
                Attempt #{attempt.attempt_number}
              </span>
              <span className="text-[10px] text-white/40 font-mono">
                via {attempt.connector}
              </span>
            </div>
            <span className={`text-[10px] font-black uppercase ${executionResultColor(attempt.result)}`}>
              {executionResultLabel(attempt.result)}
            </span>
          </div>

          {attempt.attempt_timestamp && (
            <p className="text-[10px] text-white/40 font-semibold mb-1">
              {new Date(attempt.attempt_timestamp).toLocaleString()}
            </p>
          )}

          {attempt.error_message && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-[6px] px-2 py-1 mt-1.5">
              <p className="text-[10px] text-red-300 font-mono leading-snug break-all">
                {attempt.error_message}
              </p>
            </div>
          )}

          {(attempt.request_reference || attempt.response_reference) && (
            <div className="mt-1.5 space-y-0.5">
              {attempt.request_reference && (
                <p className="text-[9px] font-mono text-white/30">
                  REQ: {attempt.request_reference}
                </p>
              )}
              {attempt.response_reference && (
                <p className="text-[9px] font-mono text-white/30">
                  RES: {attempt.response_reference}
                </p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
