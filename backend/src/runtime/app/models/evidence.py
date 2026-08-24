from sqlalchemy import Column, String, DateTime, Integer, Text
from app.db.database import Base
from datetime import datetime

class EvidenceModel(Base):
    __tablename__ = "evidence_repository"
    evidence_id = Column(String, primary_key=True)
    canonical_entity = Column(String, nullable=False)
    fact_key = Column(String, nullable=False)
    fact_value_str = Column(String, nullable=True)
    source_connector = Column(String, nullable=False)
    retrieval_timestamp = Column(DateTime, nullable=False)
    evidence_type = Column(String, nullable=True)
    metadata_json = Column(Text, nullable=True)
    version = Column(Integer, default=1)
    previous_version_id = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
