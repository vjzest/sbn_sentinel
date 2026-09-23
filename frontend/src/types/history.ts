export type TechnicalState = "valid" | "ambiguous" | "orphaned" | "tampered";

export interface EvidenceRef {
    evidence_id: string;
    version: string | null;
}

export interface RuleEvaluationRef {
    evaluation_id: string;
    rule_id: string;
    rule_version: string;
    policy_id: string;
    policy_version: string;
    evaluated_at: string | null;
}

export interface RecommendationRef {
    recommendation_id: string;
    mapping_id: string;
    mapping_version: string;
    status: string;
    generated_at: string | null;
}

export interface DecisionRef {
    decision_id: string;
    actor_id: string;
    decision_type: string;
    status: string;
    timestamp: string | null;
}

export interface HistoricalAttemptRef {
    attempt_id: string;
    attempt_number: number | null;
    result: string;
}

export interface HistoricalOutcomeRef {
    outcome_id: string;
    confirmation_state: string;
    resolution_state: string;
}

export interface ActionRef {
    action_id: string;
    action_type: string;
    status: string;
    current_result: string | null;
    attempts: HistoricalAttemptRef[];
    outcome: HistoricalOutcomeRef | null;
}

export interface HistoricalBindings {
    evidence_refs: EvidenceRef[];
    decision_context_id: string | null;
    policy: {
        policy_id: string;
        policy_version: string;
    } | null;
    rule_evaluations: RuleEvaluationRef[];
    recommendations: RecommendationRef[];
    decisions: DecisionRef[];
    actions: ActionRef[];
}

export interface HistoricalContextResponse {
    anchor: {
        object_type: "recommendation" | "journey";
        object_id: string;
        journey_id: string;
        mode: string;
    };
    bindings: HistoricalBindings;
    technical_state: TechnicalState;
}

export interface ReproductionResult {
    status: "MATCH" | "MISMATCH" | "NOT_REPRODUCIBLE";
    recommendation_id: string;
    original: any | null;
    reproduced: any | null;
    differences: any[];
    diagnostic: {
        stage: string;
        code: string;
        missing_dependency: any | null;
    } | null;
}
