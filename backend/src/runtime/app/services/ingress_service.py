import logging
from typing import Dict, Any, List

logger = logging.getLogger(__name__)


class CanonicalIngressService:
    """
    Canonical Ingress Service (Evidence Input)
    Handles the ingestion of canonical evidence records from external connectors,
    separating raw data fetch from operational event generation.
    """

    def __init__(self):
        self.logger = logging.getLogger("CanonicalIngress")

    async def submit_batch(self, connector_id: str, records: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Accepts a batch of canonical evidence context records.
        Implements idempotency via fact_key (source_hash).
        """
        if not records:
            return {"status": "Success", "processed": 0}

        from app.models.evidence import EvidenceModel
        from app.db.database import SessionLocal
        import hashlib
        from datetime import datetime

        processed = 0
        with SessionLocal() as db:
            for r in records:
                context_type = r.get("context_type", "Unknown")
                detail = r.get("detail", {})
                resource_id = detail.get("id", "")
                
                # Create a stable source key for idempotency
                source_key_str = f"{connector_id}_{context_type}_{resource_id}_{detail.get('meta', {}).get('lastUpdated', '')}"
                fact_key = hashlib.sha256(source_key_str.encode()).hexdigest()

                # Deduplication check
                existing = db.query(EvidenceModel).filter(
                    EvidenceModel.source_connector == connector_id,
                    EvidenceModel.fact_key == fact_key
                ).first()
                
                if existing:
                    continue  # ALREADY_PROCESSED

                import uuid
                evidence_id = f"evd_{uuid.uuid4().hex}"
                
                evidence = EvidenceModel(
                    evidence_id=evidence_id,
                    canonical_entity=context_type,
                    fact_key=fact_key,
                    fact_value_str=str(detail),
                    source_connector=connector_id,
                    retrieval_timestamp=datetime.utcnow(),
                    evidence_type="Sync",
                    metadata_json="{}"
                )
                db.add(evidence)
                processed += 1
            
            db.commit()

        self.logger.info(f"[{connector_id}] Successfully ingested {processed} canonical records.")
        return {
            "status": "Success",
            "processed": processed,
            "connector_id": connector_id
        }

canonical_ingress = CanonicalIngressService()
