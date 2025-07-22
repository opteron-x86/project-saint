"""
Repository for CVE data
"""

from typing import List, Optional
from datetime import datetime, timedelta

from sqlalchemy import desc
from sqlalchemy.orm import Session

from .base import BaseRepository
from ..models.vulnerabilities import CveEntry

class CveRepository(BaseRepository[CveEntry]):
    """Repository for CVE data"""
    
    def __init__(self, session: Session):
        super().__init__(session, CveEntry)
    
    def get_by_cve_id(self, cve_id: str) -> Optional[CveEntry]:
        """Get CVE by CVE ID"""
        return self.session.query(CveEntry).filter_by(cve_id=cve_id).first()
    
    def get_high_severity_cves(self, days: int = 30) -> List[CveEntry]:
        """Get high severity CVEs from last N days"""
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        return (
            self.session.query(CveEntry)
            .filter(CveEntry.published_date >= cutoff_date)
            .filter(CveEntry.cvss_v3_score >= 7.0)
            .order_by(desc(CveEntry.cvss_v3_score))
            .all()
        )
    
    def get_critical_cves(self, days: int = 7) -> List[CveEntry]:
        """Get critical CVEs from last N days"""
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        return (
            self.session.query(CveEntry)
            .filter(CveEntry.published_date >= cutoff_date)
            .filter(CveEntry.cvss_v3_score >= 9.0)
            .order_by(desc(CveEntry.published_date))
            .all()
        )
    
    def get_cves_by_severity(self, severity: str) -> List[CveEntry]:
        """Get CVEs by severity level"""
        return (
            self.session.query(CveEntry)
            .filter(CveEntry.severity == severity)
            .order_by(desc(CveEntry.published_date))
            .all()
        )
