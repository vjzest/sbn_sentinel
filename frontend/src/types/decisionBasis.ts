/**
 * D4 — Decision Basis DTO & Presentation Types
 * These are read-only presentation contracts only.
 * No computation or inference is defined here.
 */

export interface EvidenceBasisItem {
  /** Stable backend-assigned ID */
  evidence_id: string;
  /** Backend evidence type classification */
  type: string;
  /** Authoritative value from backend */
  value?: string | null;
  /** ISO timestamp from backend — never derived by browser */
  retrieved_at?: string | null;
  /** Backend retrieval classification: RETRIEVED | MISSING | STALE | FAILED */
  retrieval_status: string;
  /** Origin source system identifier */
  source?: string | null;
  /** Impact classification for missing evidence */
  impact_level?: string | null;
}

export interface EvidenceConflict {
  conflict_id: string;
  evidence_a_id: string;
  evidence_b_id: string;
  /** Backend-supplied human-readable description */
  description: string;
  /** Backend resolution status — NEVER resolved by frontend */
  resolution_status: string;
}

export interface EvidenceFreshness {
  evidence_id: string;
  age_seconds?: string | null;
  is_stale: boolean;
  /** Authoritative backend classification: STALE | CURRENT */
  freshness_status: string;
}

export interface DecisionContextSummaryDTO {
  context_id?: string | null;
  /** Backend primary context string */
  status?: string | null;
  /**
   * Backend governance sufficiency status.
   * SUFFICIENT ≠ COMPLETE. Missing evidence can coexist with SUFFICIENT.
   */
  sufficiency_status?: string | null;
  /** ISO timestamp from backend. Never computed by browser. */
  evaluated_at?: string | null;
  /** 'current' | 'historical' — from authoritative backend field only */
  mode: 'current' | 'historical';
}

export interface PolicyBasisDTO {
  policy_id: string;
  version: string;
  /** ACTIVE | SUPERSEDED | RETIRED | PENDING — never assumed ACTIVE */
  lifecycle_state: string;
  effective_from?: string | null;
  effective_until?: string | null;
}

export interface RuleBasisDTO {
  evaluation_id: string;
  rule_id: string;
  rule_version: string;
  policy_id: string;
  policy_version: string;
  /**
   * Authoritative backend result string.
   * RULE_EVALUATION_FAILED ≠ CONDITION_NOT_MET ≠ NOT_APPLICABLE.
   * Frontend never re-evaluates or normalises these.
   */
  result: string;
  evaluation_timestamp: string;
}

export interface ProvenanceDTO {
  context_id: string;
  provenance_items: Array<{
    evidence_id: string;
    source_system: string;
    ingestion_timestamp?: string | null;
  }>;
}

export interface DecisionBasisDTO {
  object_ref: {
    object_type: string;
    object_id: string;
  };
  journey_id?: string | null;
  decision_context: DecisionContextSummaryDTO;
  evidence: {
    used: EvidenceBasisItem[];
    missing: EvidenceBasisItem[];
    conflicts: EvidenceConflict[];
    freshness: EvidenceFreshness[];
  };
  policy?: PolicyBasisDTO | null;
  rules: RuleBasisDTO[];
  provenance?: ProvenanceDTO | null;
  /** Backend technical state: 'ready' | 'unavailable' | 'unauthorized' */
  technical_state: 'ready' | 'unavailable' | 'unauthorized';
}
