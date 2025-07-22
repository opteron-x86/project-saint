"""
Threat intelligence and IOC models
"""

from datetime import datetime
from typing import List, Optional, Dict, Any, TYPE_CHECKING
from decimal import Decimal

from sqlalchemy import Column, Integer, String, Text, Boolean, TIMESTAMP, ForeignKey, DECIMAL, ARRAY
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.dialects.postgresql import JSONB

from .base import Base, TimestampMixin

# Import types for forward references
if TYPE_CHECKING:
    from .relationships import RuleIocMapping

class IntelFeed(Base, TimestampMixin):
    __tablename__ = 'intel_feeds'
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)
    description: Mapped[Optional[str]] = mapped_column(Text)
    feed_type: Mapped[Optional[str]] = mapped_column(String(50))
    source_url: Mapped[Optional[str]] = mapped_column(String(255))
    update_frequency: Mapped[Optional[int]] = mapped_column(Integer)
    credibility_score: Mapped[Optional[Decimal]] = mapped_column(DECIMAL(3, 2))
    last_updated: Mapped[datetime] = mapped_column(TIMESTAMP, default=datetime.utcnow)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    api_key_required: Mapped[bool] = mapped_column(Boolean, default=False)
    feed_metadata: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSONB)
    
    # Relationships
    iocs: Mapped[List["Ioc"]] = relationship("Ioc", back_populates="source_feed")

class Ioc(Base, TimestampMixin):
    __tablename__ = 'iocs'
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    ioc_type: Mapped[str] = mapped_column(String(50), nullable=False)
    ioc_value: Mapped[str] = mapped_column(String(500), nullable=False)
    source_feed_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey('intel_feeds.id'))
    threat_type: Mapped[Optional[str]] = mapped_column(String(100))
    confidence_score: Mapped[Optional[Decimal]] = mapped_column(DECIMAL(3, 2))
    first_seen: Mapped[datetime] = mapped_column(TIMESTAMP, default=datetime.utcnow)
    last_seen: Mapped[datetime] = mapped_column(TIMESTAMP, default=datetime.utcnow)
    tags: Mapped[Optional[List[str]]] = mapped_column(ARRAY(String))
    context: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSONB)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    
    # Relationships
    source_feed: Mapped[Optional["IntelFeed"]] = relationship("IntelFeed", back_populates="iocs")
    rule_mappings: Mapped[List["RuleIocMapping"]] = relationship(
        "RuleIocMapping",
        back_populates="ioc"
    )
