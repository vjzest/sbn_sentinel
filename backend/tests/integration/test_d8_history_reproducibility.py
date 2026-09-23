# flake8: noqa: E501
import uuid
import pytest
import json
from datetime import datetime
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.main import app
from app.db.database import SessionLocal
from app.models.user import User
from app.api.deps import get_current_user

from app.models.governance_storage import (
    RecommendationModel, RuleEvaluationModel, HumanDecisionModel,
    OperationalActionModel, ExecutionAttemptModel, OperationalOutcomeModel,
    GovernedPolicyVersionModel, GovernedRuleVersionModel, GovernedRecommendationMappingModel
)
from app.models.decision_context_models import ContextEvidenceModel

from app.services.governance_registry import (
    governance_registry, PolicyVersion, RuleVersion, LifecycleState,
    RecommendationMapping, AuthorityRequirement
)

@pytest.fixture(scope="module")
def db_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c

def mock_get_current_user():
    return User(id=1, email="admin@sbnsentinel.com", role="system_administrator", is_active=True)

@pytest.fixture
def override_deps():
    app.dependency_overrides[get_current_user] = mock_get_current_user
    yield
    app.dependency_overrides.clear()

def test_d8_historical_chain_and_reproduction(client: TestClient, db_session: Session, override_deps):
    uid = uuid.uuid4().hex[:6]
    jny_id = f"JNY-D8-{uid}"
    ctx_id = f"CTX-D8-{uid}"
    pol_id = f"POL-D8-{uid}"
    rule_id = f"RULE-D8-{uid}"
    map_id = f"MAP-D8-{uid}"
    eval_id = f"EVAL-D8-{uid}"
    rec_id = f"REC-D8-{uid}"
    dec_id = f"DEC-D8-{uid}"
    act_id = f"ACT-D8-{uid}"
    att_id = f"ATT-D8-{uid}"
    out_id = f"OUT-D8-{uid}"

    # Clear previous mock policies just in case
    governance_registry._policies = [p for p in governance_registry._policies if not p.policy_id.startswith("POL-D8")]
    governance_registry._rules = [r for r in governance_registry._rules if not r.rule_id.startswith("RULE-D8")]
    governance_registry._recommendation_mappings = [m for m in governance_registry._recommendation_mappings if not m.mapping_id.startswith("MAP-D8")]

    # Register V1
    policy_v1 = PolicyVersion(policy_id=pol_id, version="V1", content="V1 Policy", lifecycle_state=LifecycleState.ACTIVE)
    rule_v1 = RuleVersion(rule_id=rule_id, version="V1", logic_description="", lifecycle_state=LifecycleState.ACTIVE, inputs=[], allowed_outputs=[], governing_policy_id=pol_id, governing_policy_version="V1")
    mapping_v1 = RecommendationMapping(mapping_id=map_id, version="V1", applicable_rule_id=rule_id, eligible_result="CONDITION_MET", recommendation_template="Action V1", authority_requirement=AuthorityRequirement.INFORMATIONAL, priority="High", lifecycle_state=LifecycleState.ACTIVE)
    
    governance_registry.register_policy(policy_v1)
    governance_registry.register_rule(rule_v1)
    governance_registry.register_recommendation_mapping(mapping_v1)

    # Register V2 (Materially different)
    policy_v2 = PolicyVersion(policy_id=pol_id, version="V2", content="V2 Policy", lifecycle_state=LifecycleState.ACTIVE)
    rule_v2 = RuleVersion(rule_id=rule_id, version="V2", logic_description="", lifecycle_state=LifecycleState.ACTIVE, inputs=[], allowed_outputs=[], governing_policy_id=pol_id, governing_policy_version="V2")
    mapping_v2 = RecommendationMapping(mapping_id=map_id, version="V2", applicable_rule_id=rule_id, eligible_result="CONDITION_MET", recommendation_template="Action V2", authority_requirement=AuthorityRequirement.APPROVAL_REQUIRED, priority="Critical", lifecycle_state=LifecycleState.ACTIVE)
    
    governance_registry.register_policy(policy_v2)
    governance_registry.register_rule(rule_v2)
    governance_registry.register_recommendation_mapping(mapping_v2)

    # Insert Historical V1 State
    try:
        db_session.add(ContextEvidenceModel(context_id=ctx_id, id=f"EVID-{uid}", evidence_type="mock", evidence_value="test"))
        db_session.add(RuleEvaluationModel(evaluation_id=eval_id, decision_context_id=ctx_id, rule_id=rule_id, rule_version="V1", policy_id=pol_id, policy_version="V1", result="CONDITION_MET", evaluation_timestamp=datetime.utcnow().isoformat(), journey_id=jny_id, input_values_json='{}'))
        db_session.add(RecommendationModel(recommendation_id=rec_id, decision_context_id=ctx_id, journey_id=jny_id, rule_evaluation_id=eval_id, mapping_id=map_id, mapping_version="V1", priority="High", content="Action V1", status="active", generated_at=datetime.utcnow().isoformat()))
        db_session.add(HumanDecisionModel(decision_id=dec_id, recommendation_id=rec_id, journey_id=jny_id, actor_id="ACTOR", decision_type="APPROVED", status="RECORDED"))
        db_session.add(OperationalActionModel(action_id=act_id, authorization_reference=dec_id, journey_id=jny_id, action_type="NOTIFY", target_reference="TGT", parameters_json='{}', status="COMPLETED"))
        db_session.add(ExecutionAttemptModel(attempt_id=att_id, action_id=act_id, journey_id=jny_id, attempt_number=1, result="SUCCESS"))
        db_session.add(OperationalOutcomeModel(outcome_id=out_id, action_id=act_id, journey_id=jny_id, confirmation_state="CONFIRMED", resolution_state="RESOLVED"))
        db_session.commit()

        # Test 1: Historical Chain Verification
        resp_chain = client.get(f"/api/v1/history/recommendations/{rec_id}")
        assert resp_chain.status_code == 200
        chain = resp_chain.json()
        assert chain["bindings"]["decision_context_id"] == ctx_id
        assert chain["bindings"]["evidence_refs"][0]["evidence_id"] == f"EVID-{uid}"
        assert chain["bindings"]["rule_evaluations"][0]["rule_id"] == rule_id
        assert chain["bindings"]["recommendations"][0]["recommendation_id"] == rec_id
        assert chain["bindings"]["decisions"][0]["decision_id"] == dec_id
        assert chain["bindings"]["actions"][0]["action_id"] == act_id
        assert chain["bindings"]["actions"][0]["attempts"][0]["attempt_id"] == att_id
        assert chain["bindings"]["actions"][0]["outcome"]["outcome_id"] == out_id

        # Take a snapshot of counts for read-only assurance
        recs_count = db_session.query(RecommendationModel).count()
        decs_count = db_session.query(HumanDecisionModel).count()
        acts_count = db_session.query(OperationalActionModel).count()

        # Test 2: MATCH Reproduction (Ensures V1 isolation despite V2 existing)
        resp_repro = client.get(f"/api/v1/history/recommendations/{rec_id}/reproduction")
        assert resp_repro.status_code == 200
        repro = resp_repro.json()
        assert repro["status"] == "MATCH"
        assert repro["reproduced"]["action"] == "Action V1"

        # Test 3: MISMATCH Reproduction
        # We mutate the historical input in DB to cause a mismatch (different output Action)
        rec_record = db_session.query(RecommendationModel).filter_by(recommendation_id=rec_id).first()
        rec_record.content = "Action V-Modified"
        db_session.commit()
        
        resp_mismatch = client.get(f"/api/v1/history/recommendations/{rec_id}/reproduction")
        assert resp_mismatch.status_code == 200
        mismatch = resp_mismatch.json()
        assert mismatch["status"] == "MISMATCH"
        assert mismatch["differences"] is not None

        # Restore
        rec_record.content = "Action V1"
        db_session.commit()

        # Test 4: NOT_REPRODUCIBLE (Missing Policy)
        eval_record = db_session.query(RuleEvaluationModel).filter_by(evaluation_id=eval_id).first()
        eval_record.policy_version = "V-MISSING"
        db_session.commit()
        resp_miss_pol = client.get(f"/api/v1/history/recommendations/{rec_id}/reproduction")
        assert resp_miss_pol.json()["status"] == "NOT_REPRODUCIBLE"
        assert resp_miss_pol.json()["diagnostic"]["code"] == "MISSING_POLICY"
        eval_record.policy_version = "V1"
        db_session.commit()

        # Test 5: NOT_REPRODUCIBLE (Missing Rule)
        eval_record.rule_version = "V-MISSING"
        db_session.commit()
        resp_miss_rule = client.get(f"/api/v1/history/recommendations/{rec_id}/reproduction")
        assert resp_miss_rule.json()["status"] == "NOT_REPRODUCIBLE"
        assert resp_miss_rule.json()["diagnostic"]["code"] == "MISSING_RULE"
        eval_record.rule_version = "V1"
        db_session.commit()

        # Test 6: NOT_REPRODUCIBLE (Missing Mapping)
        rec_record.mapping_version = "V-MISSING"
        db_session.commit()
        resp_miss_map = client.get(f"/api/v1/history/recommendations/{rec_id}/reproduction")
        assert resp_miss_map.json()["status"] == "NOT_REPRODUCIBLE"
        assert resp_miss_map.json()["diagnostic"]["code"] == "MISSING_MAPPING"
        rec_record.mapping_version = "V1"
        db_session.commit()

        # Read-only Assurance
        # Ensure no new records were created in DB during these GET requests
        assert db_session.query(RecommendationModel).count() == recs_count
        assert db_session.query(HumanDecisionModel).count() == decs_count
        assert db_session.query(OperationalActionModel).count() == acts_count

    finally:
        db_session.query(OperationalOutcomeModel).filter_by(outcome_id=out_id).delete()
        db_session.query(ExecutionAttemptModel).filter_by(attempt_id=att_id).delete()
        db_session.query(OperationalActionModel).filter_by(action_id=act_id).delete()
        db_session.query(HumanDecisionModel).filter_by(decision_id=dec_id).delete()
        db_session.query(RecommendationModel).filter_by(recommendation_id=rec_id).delete()
        db_session.query(RuleEvaluationModel).filter_by(evaluation_id=eval_id).delete()
        db_session.query(ContextEvidenceModel).filter_by(context_id=ctx_id).delete()
        db_session.query(GovernedPolicyVersionModel).filter(GovernedPolicyVersionModel.policy_id == pol_id).delete(synchronize_session=False)
        db_session.query(GovernedRuleVersionModel).filter(GovernedRuleVersionModel.rule_id == rule_id).delete(synchronize_session=False)
        db_session.query(GovernedRecommendationMappingModel).filter(GovernedRecommendationMappingModel.mapping_id == map_id).delete(synchronize_session=False)
        db_session.commit()
