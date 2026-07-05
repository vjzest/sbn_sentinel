import os
import json
import logging
from typing import Dict, Any
from app.services.anonymizer import hipaa_anonymizer
from app.services.ml_engine import ml_engine

# Try to import OpenAI for Phase 1 (Teacher Model)
try:
    from openai import OpenAI
    has_openai = True
except ImportError:
    has_openai = False

logger = logging.getLogger(__name__)

class IntelligenceEngine:
    """
    Dual-Phase Intelligence Engine.
    Phase 1: Uses OpenAI (Teacher) on strictly anonymized data.
    Phase 2/3: Falls back to or fully relies on the Custom Local ML Model (Student).
    Logs all decisions to build a local dataset for continuous self-training.
    """
    
    def __init__(self):
        self.openai_client = None
        self.api_key = os.getenv("OPENAI_API_KEY")
        
        if has_openai and self.api_key:
            self.openai_client = OpenAI(api_key=self.api_key)
            self.mode = "Teacher (OpenAI API + Data Masking)"
        else:
            self.mode = "Student (Local ML Engine Only)"

    def evaluate(self, event_type: str, metadata: Dict[str, Any]) -> Dict[str, Any]:
        """
        Core evaluation method.
        """
        # 1. Zero-PHI Data Masking (Strict HIPAA Compliance)
        raw_detail = metadata.get("detail", "")
        patient_name = metadata.get("patient_name", "Unknown")
        
        safe_message = hipaa_anonymizer.anonymize_text(raw_detail, patient_name=patient_name)
        safe_metadata = hipaa_anonymizer.anonymize_metadata(metadata)
        
        result = None
        
        # 2. Phase 1: Try External AI if available
        if self.openai_client:
            try:
                result = self._get_openai_recommendation(event_type, safe_message)
            except Exception as e:
                logger.error(f"OpenAI API failed, falling back to Local ML. Error: {e}")
                
        # 3. Phase 2/3: Local Custom ML Fallback / Independent Model
        if not result:
            result = ml_engine.evaluate_signal(event_type, safe_metadata)
            
        # 4. Data Flywheel: Save the interaction for nightly local training
        self._log_for_continuous_learning(raw_detail, result)
        
        return result

    def _get_openai_recommendation(self, event_type: str, safe_message: str) -> Dict[str, Any]:
        """Calls OpenAI with ZERO PHI (Only masked data)"""
        prompt = (
            f"You are a healthcare operations AI. Analyze this clinical event:\n"
            f"Event Type: {event_type}\n"
            f"Context: {safe_message}\n\n"
            f"Provide a JSON response with exactly three keys:\n"
            f"1. 'priority' (string: Low, Medium, High, or Critical)\n"
            f"2. 'ai_insight' (string: brief analysis of the situation)\n"
            f"3. 'recommended_action' (string: what the staff should do next)"
        )
        
        response = self.openai_client.chat.completions.create(
            model="gpt-4o-mini", # Cost-effective and fast
            messages=[
                {"role": "system", "content": "You output strict valid JSON only."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"}
        )
        
        content = response.choices[0].message.content
        return json.loads(content)
        
    def _log_for_continuous_learning(self, raw_message: str, ai_result: Dict[str, Any]):
        """
        Saves the raw context and the 'perfect' AI recommendation to a local file.
        Our ml_trainer.py will use this file every night to get smarter.
        """
        log_file = "local_training_data.jsonl"
        data_point = {
            "text": raw_message,
            "priority": ai_result.get("priority", "Medium"),
            "insight": ai_result.get("ai_insight", ""),
            "action": ai_result.get("recommended_action", "")
        }
        
        try:
            with open(log_file, "a") as f:
                f.write(json.dumps(data_point) + "\n")
        except Exception as e:
            logger.error(f"Failed to log for continuous learning: {e}")

intelligence_engine = IntelligenceEngine()
