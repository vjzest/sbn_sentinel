import os
import joblib
from typing import Dict, Any

class MLEngine:
    """
    SBN Sentinel Custom ML Engine.
    Loads locally trained scikit-learn models for inference on incoming signals.
    """
    def __init__(self):
        self.priority_model = None
        self.action_model = None
        self.insight_model = None
        self.load_models()
        
    def load_models(self):
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        models_dir = os.path.join(base_dir, 'models')
        
        try:
            self.priority_model = joblib.load(os.path.join(models_dir, 'priority_model.pkl'))
            self.action_model = joblib.load(os.path.join(models_dir, 'action_model.pkl'))
            self.insight_model = joblib.load(os.path.join(models_dir, 'insight_model.pkl'))
            print("Successfully loaded Custom ML Models.")
        except Exception as e:
            print(f"Warning: Could not load ML models. Please run ml_trainer.py first. Error: {e}")

    def evaluate_signal(self, event_type: str, metadata: Dict[str, Any]) -> Dict[str, Any]:
        """
        Uses trained ML models to predict priority, insights, and recommended actions.
        """
        # If models aren't loaded, fallback to basic defaults
        if not self.priority_model:
            return {
                "priority": "Medium",
                "ai_insight": "Standard operational update.",
                "recommended_action": "Monitor progress."
            }
            
        # Extract the text data
        detail_text = metadata.get("detail", "")
        if not detail_text:
            detail_text = f"{event_type} event occurred."
            
        # Inference using our custom local models!
        predicted_priority = self.priority_model.predict([detail_text])[0]
        predicted_insight = self.insight_model.predict([detail_text])[0]
        predicted_action = self.action_model.predict([detail_text])[0]
        
        return {
            "priority": predicted_priority,
            "ai_insight": predicted_insight,
            "recommended_action": predicted_action
        }

ml_engine = MLEngine()
