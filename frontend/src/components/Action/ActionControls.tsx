/**
 * D6.8: ActionControls component
 * Renders Create / Execute / Retry buttons based on backend capability signals only.
 * - can_create: from ActionLifecycleDTO.can_create
 * - can_execute: from ActionItemDTO.can_execute
 * - can_retry: from ActionItemDTO.can_retry
 *
 * INVARIANT: Buttons always POST and then revalidate. No local state mutation.
 * Duplicate submission is prevented by disabling the button during inflight request.
 */

import React, { useState } from 'react';
import { Play, Plus, RefreshCw, Loader, AlertTriangle } from 'lucide-react';
import type { ActionCreationStateDTO, ActionItemDTO } from '@/types/actionLifecycle';
import { createAction, executeAction } from '@/utils/actionCommands';
import { actionTypeLabel } from '@/utils/actionPresentation';
import { t } from '@/localization/messages';

// ---------------------------------------------------------------------------
// Create Action Controls
// ---------------------------------------------------------------------------
interface CreateControlsProps {
  decisionId: string;
  creation: ActionCreationStateDTO;
  onSuccess: () => void;  // revalidate lifecycle after successful create
}

export const CreateActionControls: React.FC<CreateControlsProps> = ({ decisionId, creation, onSuccess }) => {
  const [selectedType, setSelectedType] = useState(creation.allowed_action_types[0] ?? '');
  const defaultTarget = creation.permitted_targets && creation.permitted_targets.length > 0 ? creation.permitted_targets[0].target_id : '';
  const [targetRef, setTargetRef] = useState(defaultTarget);
  const [inflight, setInflight] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (creation.state !== 'ELIGIBLE' || creation.allowed_action_types.length === 0 || !creation.permitted_targets || creation.permitted_targets.length === 0) {
    return null;
  }

  const handleCreate = async () => {
    if (!selectedType || !targetRef.trim() || inflight) return;
    setInflight(true);
    setError(null);
    const result = await createAction({
      decision_id: decisionId,
      action_type: selectedType,
      target_reference: targetRef.trim(),
      parameters: {},
    });
    setInflight(false);
    if (!result.ok) {
      setError(result.message ?? 'Create failed');
      return;
    }
    setTargetRef('');
    onSuccess();
  };

  return (
    <div className="space-y-2 pt-2 border-t border-white/10">
      <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest">{t.createNewAction}</p>
      <label className="block space-y-1">
        <span className="sr-only">{t.selectActionType}</span>
        <select
          value={selectedType}
          onChange={e => setSelectedType(e.target.value)}
          disabled={inflight}
          className="w-full bg-black/40 border border-white/10 rounded-[8px] text-xs text-white px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent disabled:opacity-50"
          aria-label={t.selectActionType}
        >
          {creation.allowed_action_types.map(t => (
            <option key={t} value={t}>{actionTypeLabel(t)}</option>
          ))}
        </select>
      </label>
      <label className="block space-y-1 mt-2">
        <span className="sr-only">{t.selectActionTarget}</span>
        <select
          value={targetRef}
          onChange={e => setTargetRef(e.target.value)}
          disabled={inflight}
          className="w-full bg-black/40 border border-white/10 rounded-[8px] text-xs text-white px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent disabled:opacity-50"
          aria-label={t.selectActionTarget}
        >
          {creation.permitted_targets.map(t => (
            <option key={t.target_id} value={t.target_id}>{t.label}</option>
          ))}
        </select>
      </label>
      {error && (
        <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-semantic-critical)]">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>{error}</span>
        </div>
      )}
      <button
        onClick={handleCreate}
        disabled={inflight || !selectedType || !targetRef.trim()}
        className="w-full flex items-center justify-center gap-2 bg-[var(--color-accent)]/80 hover:bg-[var(--color-accent)] text-white text-xs font-bold px-4 py-2 rounded-[10px] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-1 focus:ring-offset-[#0B0E14]"
      >
        {inflight ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
        {inflight ? t.creating : t.createAction}
      </button>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Execute / Retry Controls — per-action
// ---------------------------------------------------------------------------
interface ExecuteControlsProps {
  action: ActionItemDTO;
  onSuccess: () => void;
}

export const ExecuteActionControls: React.FC<ExecuteControlsProps> = ({ action, onSuccess }) => {
  const [inflight, setInflight] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canAct = action.can_execute || action.can_retry;
  if (!canAct) return null;

  const handleExecute = async () => {
    if (inflight) return;
    setInflight(true);
    setError(null);
    const result = await executeAction(action.action_id);
    setInflight(false);
    if (!result.ok) {
      setError(result.message ?? 'Execute failed');
      return;
    }
    onSuccess();
  };

  const label = action.can_retry ? t.retryExecution : t.executeAction;
  const Icon = action.can_retry ? RefreshCw : Play;

  return (
    <div className="pt-2">
      {error && (
        <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-semantic-critical)] mb-2">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>{error}</span>
        </div>
      )}
      <button
        onClick={handleExecute}
        disabled={inflight}
        className="w-full flex items-center justify-center gap-2 bg-[var(--color-semantic-positive)]/80 hover:bg-[var(--color-semantic-positive)] text-white text-xs font-bold px-4 py-2 rounded-[10px] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-1 focus:ring-offset-[#0B0E14]"
      >
        {inflight ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <Icon className="w-3.5 h-3.5" />}
        {inflight ? t.executing : label}
      </button>
    </div>
  );
};
