"""
MITRE ATT&CK schemas
"""

from datetime import datetime
from typing import List, Optional, Dict, Any

from pydantic import Field

from .base import BaseSchema, TimestampSchema

# MITRE Tactic schemas
class MitreTacticBase(BaseSchema):
    tactic_id: str = Field(..., max_length=50)
    name: str = Field(..., max_length=255)
    description: Optional[str] = None
    external_references: Optional[Dict[str, Any]] = None

class MitreTactic(MitreTacticBase, TimestampSchema):
    id: int

# MITRE Technique schemas
class MitreTechniqueBase(BaseSchema):
    technique_id: str = Field(..., max_length=50)
    name: str = Field(..., max_length=255)
    description: Optional[str] = None
    tactic_id: int
    parent_technique_id: Optional[int] = None
    kill_chain_phases: Optional[List[str]] = None
    platforms: Optional[List[str]] = None
    data_sources: Optional[List[str]] = None
    detection_description: Optional[str] = None
    mitigation_description: Optional[str] = None
    external_references: Optional[Dict[str, Any]] = None

class MitreTechnique(MitreTechniqueBase, TimestampSchema):
    id: int
    tactic: Optional[MitreTactic] = None

# MITRE Group schemas
class MitreGroupBase(BaseSchema):
    group_id: str = Field(..., max_length=50)
    name: str = Field(..., max_length=255)
    aliases: Optional[List[str]] = None
    description: Optional[str] = None
    associated_techniques: Optional[List[str]] = None
    external_references: Optional[Dict[str, Any]] = None

class MitreGroup(MitreGroupBase, TimestampSchema):
    id: int

# MITRE Software schemas
class MitreSoftwareBase(BaseSchema):
    software_id: str = Field(..., max_length=50)
    name: str = Field(..., max_length=255)
    aliases: Optional[List[str]] = None
    description: Optional[str] = None
    software_type: Optional[str] = Field(None, max_length=50)
    platforms: Optional[List[str]] = None
    associated_techniques: Optional[List[str]] = None
    external_references: Optional[Dict[str, Any]] = None

class MitreSoftware(MitreSoftwareBase, TimestampSchema):
    id: int

# Analysis schemas
class MitreCoverage(BaseSchema):
    technique_id: str
    technique_name: str
    rule_count: int
    average_confidence: float
    coverage_level: str  # 'none', 'low', 'medium', 'high'

class CoverageAnalysis(BaseSchema):
    total_techniques: int
    covered_techniques: int
    coverage_percentage: float
    techniques: List[MitreCoverage]
