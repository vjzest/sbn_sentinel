from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class RuleBase(BaseModel):
    rule_id: str
    name: str
    category: str
    description: str
    trigger_condition: str
    severity: str
    business_impact: str
    recommended_owner: str
    is_active: bool = True
    version: str = "1.0"

class RuleCreate(RuleBase):
    pass

class Rule(RuleBase):
    id: int
    created_at: datetime
    modified_at: datetime

    class Config:
        from_attributes = True

class RuleExecutionLogBase(BaseModel):
    rule_id: str
    input_source: str
    evaluation_result: str
    severity: str
    processing_duration_ms: int
    user_acknowledged: bool = False

class RuleExecutionLogCreate(RuleExecutionLogBase):
    pass

class RuleExecutionLog(RuleExecutionLogBase):
    id: int
    timestamp: datetime

    class Config:
        from_attributes = True
