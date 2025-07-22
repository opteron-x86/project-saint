"""
Repository pattern for data access operations
Provides clean abstractions for common database operations

Repository organization:
- base.py: Base repository class with common CRUD operations
- rule_repository.py: Detection rules data access and business logic
- mitre_repository.py: MITRE ATT&CK data access and analysis
- ioc_repository.py: IOC data access and threat intelligence queries  
- cve_repository.py: CVE data access and vulnerability management

Benefits of the repository pattern:
- Encapsulates complex database queries
- Provides business-focused method names
- Easy testing through mocking
- Consistent error handling
- Single place to optimize database performance
"""

from .base import BaseRepository
from .rule_repository import RuleRepository
from .mitre_repository import MitreRepository
from .ioc_repository import IocRepository
from .cve_repository import CveRepository

# Export all repositories
__all__ = [
    'BaseRepository',
    'RuleRepository', 
    'MitreRepository',
    'IocRepository',
    'CveRepository'
]
