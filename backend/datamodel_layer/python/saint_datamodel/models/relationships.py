"""
Relationship mapping models between different entities
"""

from datetime import datetime
from typing import Optional, TYPE_CHECKING
from decimal import Decimal

from sqlalchemy import Column, Integer, String, ForeignKey, DECIMAL, TIMESTAMP, UniqueConstraint
from sqlalchemy.orm import relationship, Mapped, mapped_column

from .base import Base, TimestampMixin

# Import types for forward references
if TYPE_CHECKING:
    from .rules import DetectionRule
    from .mitre import MitreTechnique  
    from .vulnerabilities import CveEntry
    from .intelligence import Ioc

class RuleMitreMapping(Base, TimestampMixin):
    __tablename__ = 'rule_mitre_mappings'
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    rule_id: Mapped[int] = mapped_column(Integer, ForeignKey('detection_rules.id'))
    technique_id: Mapped[int] = mapped_column(Integer, ForeignKey('mitre_techniques.id'))
    mapping_confidence: Mapped[Decimal] = mapped_column(DECIMAL(3, 2), default=1.00)
    mapping_source: Mapped[Optional[str]] = mapped_column(String(100))
    
    # Relationships
    rule: Mapped["DetectionRule"] = relationship("DetectionRule", back_populates="mitre_mappings")
    technique: Mapped["MitreTechnique"] = relationship("MitreTechnique", back_populates="rule_mappings")
    
    __table_args__ = (
        UniqueConstraint('rule_id', 'technique_id', name='unique_rule_technique_mapping'),
    )

class RuleCveMapping(Base, TimestampMixin):
    __tablename__ = 'rule_cve_mappings'
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    rule_id: Mapped[int] = mapped_column(Integer, ForeignKey('detection_rules.id'))
    cve_id: Mapped[int] = mapped_column(Integer, ForeignKey('cve_entries.id'))
    relationship_type: Mapped[str] = mapped_column(String(50))
    confidence_score: Mapped[Decimal] = mapped_column(DECIMAL(3, 2), default=1.00)
    
    # Relationships
    rule: Mapped["DetectionRule"] = relationship("DetectionRule", back_populates="cve_mappings")
    cve: Mapped["CveEntry"] = relationship("CveEntry", back_populates="rule_mappings")
    
    __table_args__ = (
        UniqueConstraint('rule_id', 'cve_id', 'relationship_type', name='unique_rule_cve_relationship'),
    )

class RuleIocMapping(Base, TimestampMixin):
    __tablename__ = 'rule_ioc_mappings'
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    rule_id: Mapped[int] = mapped_column(Integer, ForeignKey('detection_rules.id'))
    ioc_id: Mapped[int] = mapped_column(Integer, ForeignKey('iocs.id'))
    relationship_type: Mapped[str] = mapped_column(String(50))
    confidence_score: Mapped[Decimal] = mapped_column(DECIMAL(3, 2), default=1.00)
    
    # Relationships
    rule: Mapped["DetectionRule"] = relationship("DetectionRule", back_populates="ioc_mappings")
    ioc: Mapped["Ioc"] = relationship("Ioc", back_populates="rule_mappings")
    
    __table_args__ = (
        UniqueConstraint('rule_id', 'ioc_id', 'relationship_type', name='unique_rule_ioc_relationship'),
    )
