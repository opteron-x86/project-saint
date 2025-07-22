"""
Pydantic schemas for API serialization and validation

Schema organization:
- base.py: Base schemas and mixins used across all schemas
- rules.py: Detection rules input/output schemas and search parameters
- mitre.py: MITRE ATT&CK schemas for tactics, techniques, groups, software
- vulnerabilities.py: CVE schemas and vulnerability data validation
- intelligence.py: IOC schemas and threat intelligence validation

Benefits of Pydantic schemas:
- Type safety and automatic validation
- Clear API documentation through schema definitions
- Automatic JSON serialization/deserialization
- Error handling with detailed validation messages
- IDE support with type hints
"""

from .base import BaseSchema, TimestampSchema, PaginationParams, SearchResults, ErrorResponse
from .rules import (
    RuleSourceCreate, RuleSourceUpdate, RuleSource,
    DetectionRuleCreate, DetectionRuleUpdate, DetectionRule, EnrichedDetectionRule,
    RuleSearchParams, RulePerformanceSummary
)
from .mitre import MitreTactic, MitreTechnique, MitreGroup, MitreSoftware, MitreCoverage, CoverageAnalysis
from .vulnerabilities import CveEntry, CveEntryBase
from .intelligence import IntelFeedCreate, IntelFeed, IocCreate, Ioc

# Export all schemas
__all__ = [
    # Base
    'BaseSchema', 'TimestampSchema', 'PaginationParams', 'SearchResults', 'ErrorResponse',
    # Rules
    'RuleSourceCreate', 'RuleSourceUpdate', 'RuleSource',
    'DetectionRuleCreate', 'DetectionRuleUpdate', 'DetectionRule', 'EnrichedDetectionRule',
    'RuleSearchParams', 'RulePerformanceSummary',
    # MITRE
    'MitreTactic', 'MitreTechnique', 'MitreGroup', 'MitreSoftware', 'MitreCoverage', 'CoverageAnalysis',
    # Vulnerabilities
    'CveEntry', 'CveEntryBase', 
    # Intelligence
    'IntelFeedCreate', 'IntelFeed', 'IocCreate', 'Ioc'
]
