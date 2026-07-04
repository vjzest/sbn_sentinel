import random
from typing import Dict, Any

class RulesEngine:
    """
    SBN Sentinel V1 Rules Engine.
    Evaluates clinical and operational metrics to trigger alerts and recommendations.
    """
    
    @staticmethod
    def evaluate_rule(event_type: str, metadata: Dict[str, Any]) -> Dict[str, Any]:
        """
        Evaluates rules based on incoming telemetry and enrich signals.
        """
        result = {
            "priority": "Medium",
            "ai_insight": "Standard operational update.",
            "recommended_action": "Monitor progress."
        }
        
        patient = metadata.get("patient_name", "Unknown Patient")
        
        if event_type == "EHR":
            # No-show rule
            if "No-Show" in metadata.get("detail", ""):
                result["priority"] = "High"
                result["ai_insight"] = f"No-show for {patient}. Estimated revenue impact: -$150.00."
                result["recommended_action"] = "Auto-send SMS reschedule link and dispatch $25 fee claim."
            # High wait-time rule
            elif "wait time" in metadata.get("detail", "").lower():
                result["priority"] = "Critical"
                result["ai_insight"] = f"Patient {patient} wait time has reached 45 minutes. High risk of patient satisfaction drop."
                result["recommended_action"] = "Re-route to Room 3. Notify Clinic Administrator immediately."
            else:
                result["priority"] = "Low"
                result["ai_insight"] = f"Routine schedule check for {patient} completed."
                result["recommended_action"] = "Log to chart."
                
        elif event_type == "Phone":
            result["priority"] = "Medium"
            result["ai_insight"] = f"Incoming message/call from {patient} indicating scheduling issues."
            result["recommended_action"] = "Schedule Callback Task for front-desk within 15 minutes."
            
        elif event_type == "Email":
            if "Lab" in metadata.get("detail", ""):
                result["priority"] = "High"
                result["ai_insight"] = f"Quest diagnostics lab reports delivered for {patient}."
                result["recommended_action"] = "Mark for immediate doctor signature in Practice Fusion."
            else:
                result["priority"] = "Low"
                result["ai_insight"] = "General clinical correspondence."
                result["recommended_action"] = "Archive email."
                
        return result

rules_engine = RulesEngine()
