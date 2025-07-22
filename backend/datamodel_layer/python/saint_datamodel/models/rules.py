"""
Detection rules and rule management models
"""

from datetime import datetime
from typing import List, Optional, Dict, Any, TYPE_CHECKING
from decimal import Decimal

from sqlalchemy import (
    Column, Integer, String, Text, Boolean, TIMESTAMP, 
    ForeignKey, DECIMAL, ARRAY, UniqueConstraint, Index
)
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.dialects.postgresql import JSONB

from .base import Base, TimestampMixin

# Import types for forward references
if TYPE_CHECKING:
    from .relationships import RuleMitreMapping, RuleCveMapping, RuleIocMapping

class RuleSource(Base, TimestampMixin):
    __tablename__ = 'rule_sources'
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)
    description: Mapped[Optional[str]] = mapped_column(Text)
    source_type: Mapped[str] = mapped_column(String(50), nullable=False)
    base_url: Mapped[Optional[str]] = mapped_column(String(255))
    api_endpoint: Mapped[Optional[str]] = mapped_column(String(255))
    last_updated: Mapped[datetime] = mapped_column(TIMESTAMP, default=datetime.utcnow)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    source_metadata: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSONB)
    
    # Relationships
    detection_rules: Mapped[List["DetectionRule"]] = relationship(
        "DetectionRule", 
        back_populates="source",
        cascade="all, delete-orphan"
    )

class DetectionRule(Base, TimestampMixin):
    __tablename__ = 'detection_rules'
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    rule_id: Mapped[str] = mapped_column(String(255), nullable=False)
    source_id: Mapped[int] = mapped_column(Integer, ForeignKey('rule_sources.id'))
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    rule_content: Mapped[str] = mapped_column(Text, nullable=False)
    rule_type: Mapped[str] = mapped_column(String(50), nullable=False)
    severity: Mapped[Optional[str]] = mapped_column(String(20))
    confidence_score: Mapped[Optional[Decimal]] = mapped_column(DECIMAL(3, 2))
    false_positive_rate: Mapped[Optional[Decimal]] = mapped_column(DECIMAL(5, 4))
    last_tested: Mapped[Optional[datetime]] = mapped_column(TIMESTAMP)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    tags: Mapped[Optional[List[str]]] = mapped_column(ARRAY(String))
    rule_metadata: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSONB)
    hash: Mapped[str] = mapped_column(String(64), unique=True)
    
    # Relationships
    source: Mapped["RuleSource"] = relationship("RuleSource", back_populates="detection_rules")
    category_mappings: Mapped[List["RuleCategoryMapping"]] = relationship(
        "RuleCategoryMapping",
        back_populates="rule",
        cascade="all, delete-orphan"
    )
    mitre_mappings: Mapped[List["RuleMitreMapping"]] = relationship(
        "RuleMitreMapping",
        back_populates="rule",
        cascade="all, delete-orphan"
    )
    cve_mappings: Mapped[List["RuleCveMapping"]] = relationship(
        "RuleCveMapping",
        back_populates="rule",
        cascade="all, delete-orphan"
    )
    ioc_mappings: Mapped[List["RuleIocMapping"]] = relationship(
        "RuleIocMapping",
        back_populates="rule",
        cascade="all, delete-orphan"
    )
    performance_metrics: Mapped[List["RulePerformance"]] = relationship(
        "RulePerformance",
        back_populates="rule",
        cascade="all, delete-orphan"
    )
    
    __table_args__ = (
        UniqueConstraint('rule_id', 'source_id', name='unique_rule_per_source'),
        Index('idx_detection_rules_source_type', 'source_id', 'rule_type'),
        Index('idx_detection_rules_severity', 'severity', 'is_active'),
    )

class RuleCategory(Base):
    __tablename__ = 'rule_categories'
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)
    parent_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey('rule_categories.id'))
    description: Mapped[Optional[str]] = mapped_column(Text)
    
    # Relationships
    parent: Mapped[Optional["RuleCategory"]] = relationship("RuleCategory", remote_side=[id])
    rule_mappings: Mapped[List["RuleCategoryMapping"]] = relationship(
        "RuleCategoryMapping",
        back_populates="category"
    )

class RuleCategoryMapping(Base):
    __tablename__ = 'rule_category_mappings'
    
    rule_id: Mapped[int] = mapped_column(Integer, ForeignKey('detection_rules.id'), primary_key=True)
    category_id: Mapped[int] = mapped_column(Integer, ForeignKey('rule_categories.id'), primary_key=True)
    
    # Relationships
    rule: Mapped["DetectionRule"] = relationship("DetectionRule", back_populates="category_mappings")
    category: Mapped["RuleCategory"] = relationship("RuleCategory", back_populates="rule_mappings")

class RulePerformance(Base):
    __tablename__ = 'rule_performance'
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    rule_id: Mapped[int] = mapped_column(Integer, ForeignKey('detection_rules.id'))
    detection_count: Mapped[int] = mapped_column(Integer, default=0)
    false_positive_count: Mapped[int] = mapped_column(Integer, default=0)
    true_positive_count: Mapped[int] = mapped_column(Integer, default=0)
    last_detection: Mapped[Optional[datetime]] = mapped_column(TIMESTAMP)
    performance_period_start: Mapped[Optional[datetime]] = mapped_column(TIMESTAMP)
    performance_period_end: Mapped[Optional[datetime]] = mapped_column(TIMESTAMP)
    environment: Mapped[Optional[str]] = mapped_column(String(100))
    
    # Relationships
    rule: Mapped["DetectionRule"] = relationship("DetectionRule", back_populates="performance_metrics")

class RuleAnalysis(Base, TimestampMixin):
    __tablename__ = 'rule_analysis'
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    rule_id: Mapped[int] = mapped_column(Integer, ForeignKey('detection_rules.id'))
    analysis_type: Mapped[str] = mapped_column(String(100))
    analysis_result: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSONB)
    confidence_score: Mapped[Optional[Decimal]] = mapped_column(DECIMAL(3, 2))
    analysis_date: Mapped[datetime] = mapped_column(TIMESTAMP, default=datetime.utcnow)
    analyzer_version: Mapped[Optional[str]] = mapped_column(String(50))

class RuleCluster(Base, TimestampMixin):
    __tablename__ = 'rule_clusters'
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    cluster_name: Mapped[Optional[str]] = mapped_column(String(255))
    cluster_description: Mapped[Optional[str]] = mapped_column(Text)
    similarity_threshold: Mapped[Optional[Decimal]] = mapped_column(DECIMAL(3, 2))
    
    # Relationships
    memberships: Mapped[List["RuleClusterMembership"]] = relationship(
        "RuleClusterMembership",
        back_populates="cluster"
    )

class RuleClusterMembership(Base):
    __tablename__ = 'rule_cluster_memberships'
    
    rule_id: Mapped[int] = mapped_column(Integer, ForeignKey('detection_rules.id'), primary_key=True)
    cluster_id: Mapped[int] = mapped_column(Integer, ForeignKey('rule_clusters.id'), primary_key=True)
    similarity_score: Mapped[Optional[Decimal]] = mapped_column(DECIMAL(3, 2))
    
    # Relationships
    cluster: Mapped["RuleCluster"] = relationship("RuleCluster", back_populates="memberships")
