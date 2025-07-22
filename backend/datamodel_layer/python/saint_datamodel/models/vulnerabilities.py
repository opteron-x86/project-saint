"""
CVE and vulnerability management models
"""

from datetime import datetime
from typing import List, Optional, Dict, Any, TYPE_CHECKING
from decimal import Decimal

from sqlalchemy import Column, Integer, String, Text, Boolean, TIMESTAMP, DECIMAL, ARRAY
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.dialects.postgresql import JSONB

from .base import Base, TimestampMixin

# Import types for forward references
if TYPE_CHECKING:
    from .relationships import RuleCveMapping

class CveEntry(Base, TimestampMixin):
    __tablename__ = 'cve_entries'
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    cve_id: Mapped[str] = mapped_column(String(20), nullable=False, unique=True)
    description: Mapped[Optional[str]] = mapped_column(Text)
    published_date: Mapped[Optional[datetime]] = mapped_column(TIMESTAMP)
    modified_date: Mapped[Optional[datetime]] = mapped_column(TIMESTAMP)
    cvss_v3_score: Mapped[Optional[Decimal]] = mapped_column(DECIMAL(3, 1))
    cvss_v3_vector: Mapped[Optional[str]] = mapped_column(String(255))
    cvss_v2_score: Mapped[Optional[Decimal]] = mapped_column(DECIMAL(3, 1))
    cvss_v2_vector: Mapped[Optional[str]] = mapped_column(String(255))
    severity: Mapped[Optional[str]] = mapped_column(String(20))
    cwe_ids: Mapped[Optional[List[str]]] = mapped_column(ARRAY(String))
    affected_products: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSONB)
    cve_references: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSONB)
    exploitability_score: Mapped[Optional[Decimal]] = mapped_column(DECIMAL(3, 1))
    impact_score: Mapped[Optional[Decimal]] = mapped_column(DECIMAL(3, 1))
    
    # Relationships
    rule_mappings: Mapped[List["RuleCveMapping"]] = relationship(
        "RuleCveMapping",
        back_populates="cve"
    )

class VulnerabilityFeed(Base):
    __tablename__ = 'vulnerability_feeds'
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    feed_name: Mapped[str] = mapped_column(String(100), nullable=False)
    feed_url: Mapped[Optional[str]] = mapped_column(String(255))
    last_updated: Mapped[Optional[datetime]] = mapped_column(TIMESTAMP)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
