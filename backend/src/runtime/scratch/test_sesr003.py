import unittest
from datetime import datetime, timedelta
from app.services.governance_registry import (
    governance_registry, PolicyVersion, RuleVersion, RuleInputDefinition, LifecycleState
)
from app.services.policy_engine import policy_engine
from app.services.rules_engine import rules_engine

class TestSESR003(unittest.TestCase):

    def setUp(self):
        # Clear registry for testing
        governance_registry._policies = []
        governance_registry._rules = []
        governance_registry._evaluations = []

        # Setup base active policy
        self.pol_v1 = PolicyVersion(
            policy_id="POL-TEST",
            version="V1",
            content="Base policy",
            lifecycle_state=LifecycleState.ACTIVE,
            effective_from=datetime.utcnow() - timedelta(days=10),
            approval_state="APPROVED"
        )
        governance_registry.register_policy(self.pol_v1)

        # Setup base active rule
        self.rule_v1 = RuleVersion(
            rule_id="RULE-SCH-001",
            version="V1",
            logic_description="Test rule",
            lifecycle_state=LifecycleState.ACTIVE,
            governing_policy_id="POL-TEST",
            governing_policy_version="V1",
            inputs=[
                RuleInputDefinition("primary_context", "str", True, "DecisionContext"),
                RuleInputDefinition("secondary_context", "str", True, "DecisionContext")
            ],
            allowed_outputs=["CONDITION_MET", "CONDITION_NOT_MET"],
            effective_from=datetime.utcnow() - timedelta(days=10),
            approval_state="APPROVED"
        )
        governance_registry.register_rule(self.rule_v1)

    def test_prr003_applicable_policy_resolution(self):
        # Create a future policy version
        future_pol = PolicyVersion(
            policy_id="POL-TEST",
            version="V2",
            content="Future policy",
            lifecycle_state=LifecycleState.ACTIVE,
            effective_from=datetime.utcnow() + timedelta(days=5),
            approval_state="APPROVED",
            created_at=datetime.utcnow() + timedelta(seconds=1)
        )
        governance_registry.register_policy(future_pol)

        # Evaluate now -> Should pick V1, not V2
        now = datetime.utcnow()
        applicable = governance_registry.get_applicable_policies(now)
        self.assertEqual(len(applicable), 1)
        self.assertEqual(applicable[0].version, "V1")

        # Evaluate in 6 days -> Should pick V2
        future_time = now + timedelta(days=6)
        applicable_future = governance_registry.get_applicable_policies(future_time)
        self.assertEqual(len(applicable_future), 1)
        self.assertEqual(applicable_future[0].version, "V2")

    def test_pgc009_candidate_isolation(self):
        # Create a DRAFT policy
        draft_pol = PolicyVersion(
            policy_id="POL-TEST",
            version="V2",
            content="Draft policy",
            lifecycle_state=LifecycleState.DRAFT,
            effective_from=datetime.utcnow() - timedelta(days=1),
            approval_state="PENDING"
        )
        governance_registry.register_policy(draft_pol)
        
        # Evaluate now -> Should still pick V1
        now = datetime.utcnow()
        applicable = governance_registry.get_applicable_policies(now)
        self.assertEqual(len(applicable), 1)
        self.assertEqual(applicable[0].version, "V1")

    def test_pro006_missing_inputs_yield_not_evaluable(self):
        # Execute rule engine with missing input
        dc = {
            "primary_context": "Operational"
            # Missing secondary_context
        }
        
        # Mock policy pass
        class MockPolicyResult:
            is_permitted = True
        
        res = rules_engine._process({"decision_context": dc, "policy_result": MockPolicyResult()})
        
        findings = res.get("findings", [])
        self.assertEqual(len(findings), 1)
        self.assertEqual(findings[0]["result"], "NOT_EVALUABLE")

        # Verify evaluation record was saved
        evals = governance_registry._evaluations
        self.assertEqual(len(evals), 1)
        self.assertEqual(evals[0].result, "NOT_EVALUABLE")

    def test_pgc015_deterministic_rule_execution(self):
        dc = {
            "primary_context": "Operational",
            "secondary_context": "Provider Schedule Gap"
        }
        
        class MockPolicyResult:
            is_permitted = True
        
        res = rules_engine._process({"decision_context": dc, "policy_result": MockPolicyResult()})
        
        findings = res.get("findings", [])
        self.assertEqual(len(findings), 1)
        self.assertEqual(findings[0]["result"], "CONDITION_MET")

if __name__ == "__main__":
    unittest.main()
