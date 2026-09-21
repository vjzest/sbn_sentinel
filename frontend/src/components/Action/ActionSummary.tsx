/**
 * D6.8: ActionSummary component
 * Displays the identity, type, target, status, and execution result
 * of a single governed action — from backend DTO only. No inference.
 */

import React from 'react';
import { Zap, Target, Clock, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import type { ActionItemDTO } from '@/types/actionLifecycle';
import {
  actionStatusLabel,
  actionStatusBadge,
  executionResultLabel,
  executionResultColor,
  actionTypeLabel,
} from '@/utils/actionPresentation';

interface Props {
  action: ActionItemDTO;
}

export const ActionSummary: React.FC<Props> = ({ action }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(action.action_id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-[14px] p-4 space-y-3">
      {/* Header row */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-[8px] bg-violet-500/20">
            <Zap className="w-3.5 h-3.5 text-violet-400" />
          </span>
          <span className="text-xs font-extrabold text-white uppercase tracking-wide">
            {actionTypeLabel(action.action_type)}
          </span>
        </div>
        {/* Status badge */}
        <span className={`inline-flex items-center text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-[6px] border ${actionStatusBadge(action.status)}`}>
          {actionStatusLabel(action.status)}
        </span>
      </div>

      {/* Fields */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-0.5">Action ID</p>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-[10px] font-mono text-blue-400 hover:text-blue-300 transition-colors"
          >
            <span className="truncate max-w-[100px]">{action.action_id}</span>
            {copied ? <Check className="w-3 h-3 text-emerald-400 flex-shrink-0" /> : <Copy className="w-3 h-3 flex-shrink-0" />}
          </button>
        </div>
        <div>
          <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-0.5">Execution Result</p>
          <p className={`text-xs font-bold ${executionResultColor(action.current_result)}`}>
            {executionResultLabel(action.current_result)}
          </p>
        </div>
        <div className="col-span-2">
          <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-0.5 flex items-center gap-1">
            <Target className="w-3 h-3" /> Target Reference
          </p>
          <p className="text-xs font-semibold text-white/80 font-mono break-all">{action.target_reference || '—'}</p>
        </div>
        {action.created_at && (
          <div>
            <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-0.5 flex items-center gap-1">
              <Clock className="w-3 h-3" /> Created
            </p>
            <p className="text-[11px] text-white/70 font-semibold">
              {new Date(action.created_at).toLocaleString()}
            </p>
          </div>
        )}
        {action.execute_by && (
          <div>
            <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-0.5 flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-400" /> Execute By
            </p>
            <p className="text-[11px] text-amber-400 font-semibold">
              {new Date(action.execute_by).toLocaleString()}
            </p>
          </div>
        )}
      </div>

      {/* Block reason */}
      {action.blocked_reason && (
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-[10px] px-3 py-2">
          <p className="text-[11px] text-orange-300 font-semibold leading-snug">{action.blocked_reason}</p>
        </div>
      )}
    </div>
  );
};
