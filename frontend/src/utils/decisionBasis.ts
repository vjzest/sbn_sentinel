/**
 * D4 — Decision Basis Fetcher
 * Single authenticated read call to GET /api/v1/decision-basis/{signalId}.
 * No inference, no fallback-construction, no evaluation.
 */
import { DecisionBasisDTO } from '@/types/decisionBasis';
import { fetchWithAuth } from '@/utils/fetchWithAuth';

/**
 * Fetches the Decision Basis for a governed Signal.
 * Returns null on network/auth failure — never constructs a synthetic basis.
 */
export async function fetchDecisionBasis(
  signalId: string,
): Promise<DecisionBasisDTO | null> {
  if (!signalId) return null;

  try {
    const res = await fetchWithAuth(`/api/v1/decision-basis/${encodeURIComponent(signalId)}`);
    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        throw { status: res.status };
      }
      return null;
    }
    const data: DecisionBasisDTO = await res.json();
    return data;
  } catch (err) {
    const error = err as { status?: number };
    if (error?.status === 401 || error?.status === 403) {
      // Return a minimal DTO with technical_state = unauthorized
      return {
        object_ref: { object_type: 'Signal', object_id: signalId },
        journey_id: null,
        decision_context: { mode: 'current', sufficiency_status: null, evaluated_at: null, status: null, context_id: null },
        evidence: { used: [], missing: [], conflicts: [], freshness: [] },
        policy: null,
        rules: [],
        provenance: null,
        technical_state: 'unauthorized',
      };
    }
    return null;
  }
}
