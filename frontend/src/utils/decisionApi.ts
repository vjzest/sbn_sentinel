import { fetchWithAuth } from './fetchWithAuth';

export type AuthorityState = 'AUTHORIZED' | 'NOT_AUTHORIZED' | 'AUTHORITY_CHECK_FAILED' | 'AUTHORITY_UNKNOWN';

export type RecommendationReviewDTO = {
  object_ref: { object_type: 'Signal'; object_id: string };
  journey_id?: string | null;
  recommendation: {
    recommendation_id: string;
    decision_context_id: string;
    rule_evaluation_id: string;
    mapping_id: string;
    mapping_version: string;
    content: string;
    status: string;
    priority: string;
    generated_at: string;
  } | null;
  authority: {
    state: AuthorityState;
    allowed_decisions: string[];
    reason_required_for: string[];
    eligibility?: string;
  };
  current_decision: {
    decision_id: string;
    recommendation_id: string;
    decision_type: string;
    status: string;
    actor_id?: string | null;
    decision_timestamp?: string | null;
  } | null;
  technical_state: 'ready' | 'unavailable' | 'unauthorized' | 'ambiguous';
};

/**
 * Fetches the exact governed Recommendation and current Decision for a Signal.
 */
export async function fetchRecommendationReview(signalId: string): Promise<RecommendationReviewDTO> {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
  const res = await fetchWithAuth(`${backendUrl}/api/v1/decisions/review/${encodeURIComponent(signalId)}`);
  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      return {
        object_ref: { object_type: 'Signal', object_id: signalId },
        recommendation: null,
        authority: { state: 'UNAUTHORIZED', allowed_decisions: [], reason_required_for: [] },
        current_decision: null,
        technical_state: 'unauthorized',
      } as unknown as RecommendationReviewDTO;
    }
    throw new Error(`Failed to fetch recommendation review: ${res.statusText}`);
  }
  return res.json();
}

/**
 * Submits a governed Human Decision for a recommendation.
 * D5 Frontend sends ONLY recommendationId, decisionType, and reason.
 */
export async function submitHumanDecision(input: {
  recommendationId: string;
  decisionType: string;
  reason?: string;
}) {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
  const res = await fetchWithAuth(`${backendUrl}/api/v1/decisions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      recommendation_id: input.recommendationId,
      decision_type: input.decisionType,
      reason: input.reason || undefined,
    }),
  });
  
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Decision submission failed: ${errText}`);
  }
  return res.json();
}
