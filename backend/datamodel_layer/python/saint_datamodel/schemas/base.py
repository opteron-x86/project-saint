"""
Base schemas and mixins
"""

from datetime import datetime
from typing import List, Optional, Any
from enum import Enum

from pydantic import BaseModel, Field, ConfigDict, field_validator

# Enums for validation
class RuleType(str, Enum):
    YARA = "yara"
    SURICATA = "suricata"
    SIGMA = "sigma"
    ELASTIC = "elastic"
    SENTINEL = "sentinel"
    TCL = "tcl" # CORRECTED: Added Trinity Cyber Language as a valid type

class Severity(str, Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    INFO = "info"

class IocType(str, Enum):
    IP = "ip"
    DOMAIN = "domain"
    URL = "url"
    HASH = "hash"
    EMAIL = "email"

# Base schemas
class BaseSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

class TimestampSchema(BaseSchema):
    created_date: datetime
    updated_date: datetime

# Search and pagination schemas
class PaginationParams(BaseSchema):
    offset: int = Field(0, ge=0)
    limit: int = Field(100, ge=1, le=1000)

class SearchResults(BaseSchema):
    items: List[Any]
    total: int
    offset: int
    limit: int
    has_more: bool
    
    @field_validator('has_more', mode='before')
    @classmethod
    def calculate_has_more(cls, v, info):
        if 'total' in info.data and 'offset' in info.data and 'limit' in info.data:
            return (info.data['offset'] + info.data['limit']) < info.data['total']
        return False

# Error schemas
class ErrorDetail(BaseSchema):
    message: str
    field: Optional[str] = None
    code: Optional[str] = None

class ErrorResponse(BaseModel):
    error: str
    details: Optional[List[ErrorDetail]] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
