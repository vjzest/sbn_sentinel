import logging
import time
from typing import Dict, Any, List

logger = logging.getLogger(__name__)

from app.db.database import SessionLocal
from app.models.rule import RuleModel
from app.services.base_service import BaseService


class RulesEngine(BaseService):
    """
    MS-005/MS-012 Compliant Rules Engine (RE).
    Evaluates business rules dynamically based on DB state.
    """
    def __init__(self):
        self._cached_rules = []
        self._cache_time = 0
        self._cache_ttl_seconds = 300 # 5 minutes
    
    def _get_active_rules(self) -> List[Dict[str, Any]]:
        # SES-009: TTL Caching to prevent unnecessary DB hits for static rules
        if time.time() - self._cache_time < self._cache_ttl_seconds and self._cached_rules:
            return self._cached_rules

        try:
            db = SessionLocal()
            rules = db.query(RuleModel).filter(RuleModel.is_active == True).all()
            self._cached_rules = [{"rule_id": r.rule_id, "category": r.category, "severity": r.severity} for r in rules]
            self._cache_time = time.time()
            return self._cached_rules
        except Exception as e:
            logger.error(f"Error fetching rules: {e}")
            return self._cached_rules # fallback to stale cache if error occurs
        finally:
            if 'db' in locals():
                db.close()

    @property
    def service_name(self) -> str:
        return "RulesEngine"

    @property
    def version(self) -> str:
        return "v1.0"



    def _process(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Evaluates operational context against business rules.
        Payload expects: {"decision_context": Dict, "policy_result": Dict}
        """
        decision_context = payload.get("decision_context", {})
        policy_result = payload.get("policy_result", {})
        
        event_type = decision_context.get("event_type", "Unknown")
        
        if not policy_result.get("is_permitted", False):
            # Policy engine blocked this execution. Rule engine returns a blocked finding.
            return {
                "rule_id": "SYS-BLOCKED",
                "category": "Governance",
                "severity": "Information",
                "trigger": "Action blocked by Policy Engine.",
                "description": policy_result.get("governance_notes", "Blocked by governance policy.")
            }
        
        # Default finding
        finding = {
            "rule_id": "SYS-000",
            "category": "System",
            "severity": "Information",
            "trigger": "Routine Event",
            "description": "Routine system event observed."
        }
        
        # Fetch active rules from DB (PASME Controlled)
        active_rules = self._get_active_rules()
        active_ids = {r["rule_id"]: r for r in active_rules}
        
        # Determine violation based on event source
        primary_context = decision_context.get("primary_context", "")
        secondary_context = decision_context.get("secondary_context", "")
        
        if event_type == "EHR":
            if secondary_context == "Provider Schedule Gap" and "SCH-001" in active_ids:
                rule = active_ids["SCH-001"]
                finding = {
                    "rule_id": rule["rule_id"],
                    "category": rule["category"],
                    "severity": rule["severity"],
                    "trigger": "Appointment marked as No-Show in EHR.",
                    "description": "Patient did not arrive for scheduled appointment."
                }
            elif secondary_context == "Queue Congestion" and "SCH-002" in active_ids:
                rule = active_ids["SCH-002"]
                finding = {
                    "rule_id": rule["rule_id"],
                    "category": rule["category"],
                    "severity": rule["severity"],
                    "trigger": "Provider running behind schedule.",
                    "description": "Patient wait time exceeded threshold (45 mins)."
                }
            elif secondary_context == "Routine Booking" and "SCH-003" in active_ids:
                rule = active_ids["SCH-003"]
                finding = {
                    "rule_id": rule["rule_id"],
                    "category": rule["category"],
                    "severity": rule["severity"],
                    "trigger": "New appointment booked in EHR.",
                    "description": "None."
                }
                
        elif event_type == "Phone":
            if secondary_context == "Staff Overload" and "OPS-001" in active_ids:
                rule = active_ids["OPS-001"]
                finding = {
                    "rule_id": rule["rule_id"],
                    "category": rule["category"],
                    "severity": rule["severity"],
                    "trigger": "High call volume or unavailable staff.",
                    "description": "Patient couldn't reach the front desk."
                }
            
        elif event_type == "Email":
            if secondary_context == "Documentation Dependency" and "CLIN-001" in active_ids:
                rule = active_ids["CLIN-001"]
                finding = {
                    "rule_id": rule["rule_id"],
                    "category": rule["category"],
                    "severity": rule["severity"],
                    "trigger": "Diagnostics reports delivered.",
                    "description": "Lab results pending review."
                }
                
        # In a real implementation we would log to RuleExecutionLog here.
        # But to keep dependencies clean, we simply return the finding.
        
        return finding

rules_engine = RulesEngine()
