/**
 * D6.7: Action Lifecycle fetch utility.
 * Wraps GET /api/v1/actions/lifecycle/{decision_id}
 * Returns ActionLifecycleDTO or a safe unavailable sentinel.
 */

import { fetchWithAuth } from '@/utils/fetchWithAuth';
import type { ActionLifecycleDTO } from '@/types/actionLifecycle';

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL ?? '';

/**
 * Fetch the full Action Lifecycle for a given Human Decision ID.
 * Always returns a structurally valid ActionLifecycleDTO — never throws.
 * technical_state carries the error signal on failure.
 */
export async function fetchActionLifecycle(decisionId: string): Promise<ActionLifecycleDTO> {
  const unavailable: ActionLifecycleDTO = {
    object_ref: { object_type: 'HumanDecision', object_id: decisionId },
    journey_id: null,
    decision: null,
    creation: { state: 'UNKNOWN', allowed_action_types: [], permitted_targets: [] },
    actions: [],
    can_create: false,
    technical_state: 'unavailable',
  };

  try {
    const res = await fetchWithAuth(
      `${BACKEND}/api/v1/actions/lifecycle/${encodeURIComponent(decisionId)}`
    );

    if (res.status === 401 || res.status === 403) {
      return { ...unavailable, technical_state: 'unauthorized' };
    }
    if (!res.ok) {
      return unavailable;
    }

    const data: ActionLifecycleDTO = await res.json();
    // Normalise: ensure arrays are always arrays (defensive against backend changes)
    return {
      ...data,
      actions: Array.isArray(data.actions) ? data.actions : [],
    };
  } catch {
    return unavailable;
  }
}
