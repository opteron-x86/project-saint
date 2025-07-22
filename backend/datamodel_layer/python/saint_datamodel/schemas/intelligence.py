"""
Threat intelligence and IOC schemas
"""

from datetime import datetime
from typing import List, Optional, Dict, Any
from decimal import Decimal

from pydantic import Field

from .base import BaseSchema, TimestampSchema, IocType

# Intelligence Feed schemas
class IntelFeedBase(BaseSchema):
    name: str = Field(..., max_length=100)
    description: Optional[str] = None
    feed_type: Optional[str] = Field(None, max_length=50)
    source_url: Optional[str] = Field(None, max_length=255)
    update_frequency: Optional[int] = None
    credibility_score: Optional[Decimal] = Field(None, ge=0, le=1)
    is_active: bool = True
    api_key_required: bool = False
    feed_metadata: Optional[Dict[str, Any]] = None

class IntelFeedCreate(IntelFeedBase):
    pass

class IntelFeedUpdate(BaseSchema):
    name: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = None
    feed_type: Optional[str] = Field(None, max_length=50)
    source_url: Optional[str] = Field(None, max_length=255)
    update_frequency: Optional[int] = None
    credibility_score: Optional[Decimal] = Field(None, ge=0, le=1)
    is_active: Optional[bool] = None
    api_key_required: Optional[bool] = None
    feed_metadata: Optional[Dict[str, Any]] = None

class IntelFeed(IntelFeedBase, TimestampSchema):
    id: int
    last_updated: datetime

# IOC schemas
class IocBase(BaseSchema):
    ioc_type: IocType
    ioc_value: str = Field(..., max_length=500)
    source_feed_id: Optional[int] = None
    threat_type: Optional[str] = Field(None, max_length=100)
    confidence_score: Optional[Decimal] = Field(None, ge=0, le=1)
    tags: Optional[List[str]] = None
    context: Optional[Dict[str, Any]] = None
    is_active: bool = True

class IocCreate(IocBase):
    pass

class IocUpdate(BaseSchema):
    ioc_type: Optional[IocType] = None
    ioc_value: Optional[str] = Field(None, max_length=500)
    source_feed_id: Optional[int] = None
    threat_type: Optional[str] = Field(None, max_length=100)
    confidence_score: Optional[Decimal] = Field(None, ge=0, le=1)
    tags: Optional[List[str]] = None
    context: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None

class Ioc(IocBase, TimestampSchema):
    id: int
    first_seen: datetime
    last_seen: datetime
    source_feed: Optional[IntelFeed] = None

# Search schemas
class IocSearchParams(BaseSchema):
    ioc_value: Optional[str] = None
    ioc_types: Optional[List[IocType]] = None
    threat_types: Optional[List[str]] = None
    confidence_min: Optional[float] = Field(None, ge=0, le=1)
    tags: Optional[List[str]] = None
    is_active: Optional[bool] = None
    limit: int = Field(100, ge=1, le=1000)
    offset: int = Field(0, ge=0)
