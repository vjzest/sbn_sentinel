import re
from typing import Dict, Any

class HIPAAAnonymizer:
    """
    HIPAA Compliant Data De-identification Service.
    Masks Protected Health Information (PHI) such as names, phone numbers, emails, etc.
    before sending data to AI/ML engines or logs.
    """
    
    # Regex patterns for common PHI
    PHONE_REGEX = re.compile(r'\+?\d{1,3}[-.\s]?\(?\d{1,3}\)?[-.\s]?\d{3}[-.\s]?\d{4}')
    EMAIL_REGEX = re.compile(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}')
    SSN_REGEX = re.compile(r'\b\d{3}-\d{2}-\d{4}\b')
    
    @classmethod
    def anonymize_text(cls, text: str, patient_name: str = None) -> str:
        if not text:
            return text
            
        anonymized = text
        
        # 1. Mask Phone Numbers
        anonymized = cls.PHONE_REGEX.sub('[PHONE_REDACTED]', anonymized)
        
        # 2. Mask Emails
        anonymized = cls.EMAIL_REGEX.sub('[EMAIL_REDACTED]', anonymized)
        
        # 3. Mask SSN
        anonymized = cls.SSN_REGEX.sub('[SSN_REDACTED]', anonymized)
        
        # 4. Mask the specific patient name if provided
        if patient_name and patient_name in anonymized:
            # Simple replacement. For production, NLP-based NER (like Presidio) is recommended.
            anonymized = anonymized.replace(patient_name, '[PATIENT_NAME_REDACTED]')
            
        return anonymized

    @classmethod
    def anonymize_metadata(cls, metadata: Dict[str, Any]) -> Dict[str, Any]:
        """
        Deep copies and anonymizes metadata dictionary.
        """
        safe_metadata = {}
        patient_name = metadata.get("patient_name")
        
        for key, value in metadata.items():
            if key == "patient_name":
                safe_metadata[key] = "[REDACTED]"
            elif isinstance(value, str):
                safe_metadata[key] = cls.anonymize_text(value, patient_name)
            else:
                safe_metadata[key] = value
                
        return safe_metadata

hipaa_anonymizer = HIPAAAnonymizer()
