# saint-datamodel/schemas/rules.py
"""
Detection rules schemas
"""
import json
from datetime import datetime
from typing import List, Optional, Dict, Any
from decimal import Decimal

from pydantic import Field, computed_field, model_validator

from .base import BaseSchema, TimestampSchema, PaginationParams, RuleType, Severity
# Import schemas that are forward-referenced in EnrichedDetectionRule
from .mitre import MitreTechnique
from .vulnerabilities import CveEntry
from .intelligence import Ioc

# Rule Source schemas
class RuleSourceBase(BaseSchema):
    name: str = Field(..., max_length=100)
    description: Optional[str] = None
    source_type: str = Field(..., max_length=50)
    base_url: Optional[str] = Field(None, max_length=255)
    api_endpoint: Optional[str] = Field(None, max_length=255)
    is_active: bool = True
    source_metadata: Optional[Dict[str, Any]] = None

class RuleSourceCreate(RuleSourceBase):
    pass

class RuleSourceUpdate(BaseSchema):
    name: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = None
    source_type: Optional[str] = Field(None, max_length=50)
    base_url: Optional[str] = Field(None, max_length=255)
    api_endpoint: Optional[str] = Field(None, max_length=255)
    is_active: Optional[bool] = None
    source_metadata: Optional[Dict[str, Any]] = None

class RuleSource(RuleSourceBase, TimestampSchema):
    id: int
    last_updated: datetime

# Detection Rule schemas
class DetectionRuleBase(BaseSchema):
    rule_id: str = Field(..., max_length=255)
    source_id: int
    name: str = Field(..., max_length=255)
    description: Optional[str] = None
    rule_content: str
    rule_type: RuleType
    severity: Optional[Severity] = None
    confidence_score: Optional[Decimal] = Field(None, ge=0, le=1)
    false_positive_rate: Optional[Decimal] = Field(None, ge=0, le=1)
    last_tested: Optional[datetime] = None
    is_active: bool = True
    tags: Optional[List[str]] = None
    rule_metadata: Optional[Dict[str, Any]] = None

class DetectionRuleCreate(DetectionRuleBase):
    pass

class DetectionRuleUpdate(BaseSchema):
    name: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    rule_content: Optional[str] = None
    rule_type: Optional[RuleType] = None
    severity: Optional[Severity] = None
    confidence_score: Optional[Decimal] = Field(None, ge=0, le=1)
    false_positive_rate: Optional[Decimal] = Field(None, ge=0, le=1)
    last_tested: Optional[datetime] = None
    is_active: Optional[bool] = None
    tags: Optional[List[str]] = None
    rule_metadata: Optional[Dict[str, Any]] = None

class DetectionRule(DetectionRuleBase, TimestampSchema):
    id: int
    hash: str
    source: Optional["RuleSource"] = None
    
    @computed_field
    @property
    def title(self) -> str:
        return self.name

    @computed_field
    @property
    def rule_source(self) -> str:
        return self.source.name if self.source else "Unknown"

    @computed_field
    @property
    def rule_platforms(self) -> List[str]:
        return self.rule_metadata.get('rule_platforms', []) if self.rule_metadata else []
    
    @computed_field
    @property
    def linked_technique_ids(self) -> List[str]:
        if self.tags:
            return [tag for tag in self.tags if tag.startswith('T')]
        return []

# Performance schemas
class RulePerformanceBase(BaseSchema):
    rule_id: int
    detection_count: int = 0
    false_positive_count: int = 0
    true_positive_count: int = 0
    last_detection: Optional[datetime] = None
    performance_period_start: Optional[datetime] = None
    performance_period_end: Optional[datetime] = None
    environment: Optional[str] = Field(None, max_length=100)

class RulePerformance(RulePerformanceBase):
    id: int

class RulePerformanceSummary(BaseSchema):
    total_detections: int
    total_false_positives: int
    total_true_positives: int
    false_positive_rate: float
    last_detection: Optional[datetime]

# Search schemas
class RuleSearchParams(PaginationParams):
    query: Optional[str] = None
    rule_types: Optional[List[RuleType]] = None
    severities: Optional[List[Severity]] = None
    source_ids: Optional[List[int]] = None
    tags: Optional[List[str]] = None
    is_active: Optional[bool] = None
    platforms: Optional[List[str]] = None
    rule_platforms: Optional[List[str]] = None
    tactics: Optional[List[str]] = None
    validation_status: Optional[List[str]] = None
    sort_by: Optional[str] = 'updated_date'
    sort_dir: Optional[str] = 'desc'


# Enriched rule schema with all relationships
class EnrichedDetectionRule(DetectionRule):
    mitre_mappings: List[Any] = Field(default=[], exclude=True)  # Exclude from final JSON
    cve_mappings: List[Any] = Field(default=[], exclude=True)    # Exclude from final JSON
    
    # These will hold the final, clean data for the frontend
    linked_techniques: List[MitreTechnique] = []
    cves: List[CveEntry] = []

    @model_validator(mode='after')
    def process_mappings(self) -> 'EnrichedDetectionRule':
        if self.mitre_mappings:
            self.linked_techniques = [mapping.technique for mapping in self.mitre_mappings if hasattr(mapping, 'technique') and mapping.technique]
        
        if self.cve_mappings:
            self.cves = [mapping.cve for mapping in self.cve_mappings if hasattr(mapping, 'cve') and mapping.cve]
            
        return self

    @computed_field
    @property
    def raw_rule(self) -> Optional[Dict[str, Any]]:
        try:
            return json.loads(self.rule_content)
        except (json.JSONDecodeError, TypeError):
            return None

# Rebuild the model to resolve the forward references
EnrichedDetectionRule.model_rebuild()
