"""
SQLAlchemy models for SAINT database
Organized by domain for better maintainability

Model organization:
- base.py: Base classes and mixins used across all models
- rules.py: Detection rules, sources, categories, performance, and analysis
- mitre.py: MITRE ATT&CK framework data (tactics, techniques, groups, software)
- vulnerabilities.py: CVE data and vulnerability feeds
- intelligence.py: Threat intelligence feeds and indicators of compromise
- relationships.py: Mapping tables that connect entities across domains

Benefits of this structure:
- Improved code organization and discoverability
- Easier maintenance - changes to one domain don't affect others
- Better for team development - different developers can own different domains  
- Reduced cognitive load when working on specific areas
- Clear separation of concerns following domain-driven design principles
"""

# Import all models to maintain backward compatibility
from .base import Base, TimestampMixin
from .rules import (
    RuleSource, DetectionRule, RuleCategory, RuleCategoryMapping,
    RulePerformance, RuleAnalysis, RuleCluster, RuleClusterMembership
)
from .mitre import MitreTactic, MitreTechnique, MitreGroup, MitreSoftware
from .vulnerabilities import CveEntry, VulnerabilityFeed
from .intelligence import IntelFeed, Ioc
from .relationships import RuleMitreMapping, RuleCveMapping, RuleIocMapping

# Export all models
__all__ = [
    # Base
    'Base', 'TimestampMixin',
    # Rules
    'RuleSource', 'DetectionRule', 'RuleCategory', 'RuleCategoryMapping',
    'RulePerformance', 'RuleAnalysis', 'RuleCluster', 'RuleClusterMembership',
    # MITRE
    'MitreTactic', 'MitreTechnique', 'MitreGroup', 'MitreSoftware',
    # Vulnerabilities  
    'CveEntry', 'VulnerabilityFeed',
    # Intelligence
    'IntelFeed', 'Ioc',
    # Relationships
    'RuleMitreMapping', 'RuleCveMapping', 'RuleIocMapping'
]
