/**
 * D6.7b: Action Command utilities — wrapping POST /api/v1/actions/ and POST /api/v1/actions/execute
 * No local governance logic. All authority checks happen on the backend.
 */

import { fetchWithAuth } from '@/utils/fetchWithAuth';

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL ?? '';

export interface CreateActionParams {
  decision_id: string;
  action_type: string;
  target_reference: string;
  parameters: Record<string, unknown>;
}

export interface ActionCommandResult {
  ok: boolean;
  status?: string;
  action_id?: string;
  message?: string;
  raw?: unknown;
}

/**
 * POST /api/v1/actions/
 * Creates a new governed operational action (or returns IDEMPOTENT if one already exists).
 */
export async function createAction(params: CreateActionParams): Promise<ActionCommandResult> {
  try {
    const res = await fetchWithAuth(`${BACKEND}/api/v1/actions/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    if (!res.ok) {
      return { ok: false, message: data?.detail ?? 'Create action failed', raw: data };
    }
    return {
      ok: true,
      status: data?.status,
      action_id: data?.action_id,
      message: data?.message,
      raw: data,
    };
  } catch (err) {
    return { ok: false, message: 'Network error creating action' };
  }
}

/**
 * POST /api/v1/actions/execute
 * Executes an existing governed action by action_id.
 */
export async function executeAction(actionId: string): Promise<ActionCommandResult> {
  try {
    const res = await fetchWithAuth(`${BACKEND}/api/v1/actions/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action_id: actionId }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { ok: false, message: data?.detail ?? 'Execute action failed', raw: data };
    }
    return {
      ok: true,
      status: data?.status,
      action_id: actionId,
      message: data?.message,
      raw: data,
    };
  } catch (err) {
    return { ok: false, message: 'Network error executing action' };
  }
}
