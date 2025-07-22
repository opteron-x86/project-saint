"""
MITRE ATT&CK framework models
"""

from datetime import datetime
from typing import List, Optional, Dict, Any, TYPE_CHECKING

from sqlalchemy import Column, Integer, String, Text, ForeignKey, ARRAY
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.dialects.postgresql import JSONB

from .base import Base, TimestampMixin

# Import types for forward references
if TYPE_CHECKING:
    from .relationships import RuleMitreMapping

class MitreTactic(Base, TimestampMixin):
    __tablename__ = 'mitre_tactics'
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    tactic_id: Mapped[str] = mapped_column(String(50), nullable=False, unique=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    external_references: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSONB)
    
    # Relationships
    techniques: Mapped[List["MitreTechnique"]] = relationship(
        "MitreTechnique",
        back_populates="tactic"
    )

class MitreTechnique(Base, TimestampMixin):
    __tablename__ = 'mitre_techniques'
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    technique_id: Mapped[str] = mapped_column(String(50), nullable=False, unique=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    tactic_id: Mapped[int] = mapped_column(Integer, ForeignKey('mitre_tactics.id'))
    parent_technique_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey('mitre_techniques.id'))
    kill_chain_phases: Mapped[Optional[List[str]]] = mapped_column(ARRAY(String))
    platforms: Mapped[Optional[List[str]]] = mapped_column(ARRAY(String))
    data_sources: Mapped[Optional[List[str]]] = mapped_column(ARRAY(String))
    detection_description: Mapped[Optional[str]] = mapped_column(Text)
    mitigation_description: Mapped[Optional[str]] = mapped_column(Text)
    external_references: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSONB)
    
    # Relationships
    tactic: Mapped["MitreTactic"] = relationship("MitreTactic", back_populates="techniques")
    
    # Correctly define the parent-child self-referential relationship
    parent_technique: Mapped[Optional["MitreTechnique"]] = relationship(
        "MitreTechnique", 
        remote_side=[id], 
        back_populates="subtechniques"
    )
    subtechniques: Mapped[List["MitreTechnique"]] = relationship(
        "MitreTechnique", 
        back_populates="parent_technique"
    )
    
    rule_mappings: Mapped[List["RuleMitreMapping"]] = relationship(
        "RuleMitreMapping",
        back_populates="technique"
    )

class MitreGroup(Base, TimestampMixin):
    __tablename__ = 'mitre_groups'
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    group_id: Mapped[str] = mapped_column(String(50), nullable=False, unique=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    aliases: Mapped[Optional[List[str]]] = mapped_column(ARRAY(String))
    description: Mapped[Optional[str]] = mapped_column(Text)
    associated_techniques: Mapped[Optional[List[str]]] = mapped_column(ARRAY(String))
    external_references: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSONB)

class MitreSoftware(Base, TimestampMixin):
    __tablename__ = 'mitre_software'
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    software_id: Mapped[str] = mapped_column(String(50), nullable=False, unique=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    aliases: Mapped[Optional[List[str]]] = mapped_column(ARRAY(String))
    description: Mapped[Optional[str]] = mapped_column(Text)
    software_type: Mapped[Optional[str]] = mapped_column(String(50))
    platforms: Mapped[Optional[List[str]]] = mapped_column(ARRAY(String))
    associated_techniques: Mapped[Optional[List[str]]] = mapped_column(ARRAY(String))
    external_references: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSONB)
