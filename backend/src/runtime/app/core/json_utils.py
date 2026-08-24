import json
import dataclasses
from datetime import datetime
from enum import Enum
import sys

# Import all governance dataclasses to decode them
import app.services.governance_registry as gov

class GovernanceJSONEncoder(json.JSONEncoder):
    def default(self, o):
        if dataclasses.is_dataclass(o):
            d = dataclasses.asdict(o)
            d["__dataclass__"] = o.__class__.__name__
            return d
        if isinstance(o, datetime):
            return {"__datetime__": o.isoformat()}
        if isinstance(o, Enum):
            return {"__enum__": f"{o.__class__.__name__}.{o.name}"}
        return super().default(o)

def governance_json_decoder(dct):
    if "__datetime__" in dct:
        return datetime.fromisoformat(dct["__datetime__"])
    if "__enum__" in dct:
        class_name, member_name = dct["__enum__"].split(".")
        return getattr(gov, class_name)[member_name]
    if "__dataclass__" in dct:
        class_name = dct.pop("__dataclass__")
        cls = getattr(gov, class_name)
        # Convert fields to appropriate types if needed, but dataclasses kwargs works
        return cls(**dct)
    return dct

def dumps(obj):
    return json.dumps(obj, cls=GovernanceJSONEncoder)

def loads(s):
    return json.loads(s, object_hook=governance_json_decoder)
