"""
CVE and vulnerability schemas
"""

from datetime import datetime
from typing import List, Optional, Dict, Any
from decimal import Decimal

from pydantic import Field

from .base import BaseSchema, TimestampSchema

# CVE schemas
class CveEntryBase(BaseSchema):
    cve_id: str = Field(..., max_length=20)
    description: Optional[str] = None
    published_date: Optional[datetime] = None
    modified_date: Optional[datetime] = None
    cvss_v3_score: Optional[Decimal] = Field(None, ge=0, le=10)
    cvss_v3_vector: Optional[str] = Field(None, max_length=255)
    cvss_v2_score: Optional[Decimal] = Field(None, ge=0, le=10)
    cvss_v2_vector: Optional[str] = Field(None, max_length=255)
    severity: Optional[str] = Field(None, max_length=20)
    cwe_ids: Optional[List[str]] = None
    affected_products: Optional[Dict[str, Any]] = None
    cve_references: Optional[Dict[str, Any]] = None
    exploitability_score: Optional[Decimal] = Field(None, ge=0, le=10)
    impact_score: Optional[Decimal] = Field(None, ge=0, le=10)

class CveEntry(CveEntryBase, TimestampSchema):
    id: int

# Vulnerability Feed schemas
class VulnerabilityFeedBase(BaseSchema):
    feed_name: str = Field(..., max_length=100)
    feed_url: Optional[str] = Field(None, max_length=255)
    last_updated: Optional[datetime] = None
    is_active: bool = True

class VulnerabilityFeed(VulnerabilityFeedBase):
    id: int
