from pydantic import BaseModel, Field
from typing import Dict, Any
from enum import Enum
from datetime import datetime


class RiskLevel(str, Enum):
    INFORMATION = "Information"
    LOW = "Low"
    MODERATE = "Moderate"
    HIGH = "High"
    CRITICAL = "Critical"


class SignalCategory(str, Enum):
    PATIENT_FLOW = "Patient Flow"
    REVENUE = "Revenue"
    CLINICAL_WORKFLOW = "Clinical Workflow"
    OPERATIONAL_CAPACITY = "Operational Capacity"
    CONNECTOR_HEALTH = "Connector Health"


class OperationalSignal(BaseModel):
    category: SignalCategory
    source: str  # e.g., "Practice Fusion", "Internal Sentinel"
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    data: Dict[str, Any]  # Raw data from the source (e.g. appointment info, missing insurance flag)


class Recommendation(BaseModel):
    id: str
    problem: str
    reason: str
    business_impact: str
    action: str
    expected_outcome: str
    risk_level: RiskLevel
    priority_score: int
    explainability_log: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    status: str = "Active"  # Active, Acknowledged, Resolved
