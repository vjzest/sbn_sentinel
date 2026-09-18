/**
 * D4 — Decision Basis Fetcher
 * Single authenticated read call to GET /api/v1/decision-basis/{signalId}.
 * No inference, no fallback-construction, no evaluation.
 */
import { DecisionBasisDTO } from '@/types/decisionBasis';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? '';

/**
 * Fetches the Decision Basis for a governed Signal.
 * Returns null on network/auth failure — never constructs a synthetic basis.
 */
export async function fetchDecisionBasis(
  signalId: string,
): Promise<DecisionBasisDTO | null> {
  if (!signalId) return null;

  try {
    const token = typeof window !== 'undefined'
      ? localStorage.getItem('access_token')
      : null;

    if (!token) return null;

    const res = await fetch(
      `${BACKEND_URL}/api/v1/decision-basis/${encodeURIComponent(signalId)}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      },
    );

    if (res.status === 401 || res.status === 403) {
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

    if (!res.ok) {
      return null;
    }

    const data: DecisionBasisDTO = await res.json();
    return data;
  } catch {
    return null;
  }
}
