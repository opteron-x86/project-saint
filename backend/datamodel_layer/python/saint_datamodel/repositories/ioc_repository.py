"""
Repository for Indicators of Compromise
"""

from typing import List, Optional, Tuple
from datetime import datetime, timedelta

from sqlalchemy import desc
from sqlalchemy.orm import Session

from .base import BaseRepository
from ..models.intelligence import Ioc

class IocRepository(BaseRepository[Ioc]):
    """Repository for Indicators of Compromise"""
    
    def __init__(self, session: Session):
        super().__init__(session, Ioc)
    
    def search_iocs(
        self,
        ioc_value: Optional[str] = None,
        ioc_types: Optional[List[str]] = None,
        threat_types: Optional[List[str]] = None,
        confidence_min: Optional[float] = None,
        tags: Optional[List[str]] = None,
        is_active: Optional[bool] = None,
        limit: int = 100,
        offset: int = 0
    ) -> Tuple[List[Ioc], int]:
        """Search IOCs with various filters"""
        
        query_builder = self.session.query(Ioc)
        
        # Search by IOC value
        if ioc_value:
            query_builder = query_builder.filter(Ioc.ioc_value.ilike(f'%{ioc_value}%'))
        
        # Filter by IOC types
        if ioc_types:
            query_builder = query_builder.filter(Ioc.ioc_type.in_(ioc_types))
        
        # Filter by threat types
        if threat_types:
            query_builder = query_builder.filter(Ioc.threat_type.in_(threat_types))
        
        # Filter by minimum confidence
        if confidence_min is not None:
            query_builder = query_builder.filter(Ioc.confidence_score >= confidence_min)
        
        # Filter by tags
        if tags:
            for tag in tags:
                query_builder = query_builder.filter(Ioc.tags.contains([tag]))
        
        # Filter by active status
        if is_active is not None:
            query_builder = query_builder.filter(Ioc.is_active == is_active)
        
        # Get total count
        total_count = query_builder.count()
        
        # Apply pagination and ordering
        iocs = (
            query_builder
            .order_by(desc(Ioc.last_seen))
            .offset(offset)
            .limit(limit)
            .all()
        )
        
        return iocs, total_count
    
    def get_recent_iocs(self, hours: int = 24) -> List[Ioc]:
        """Get IOCs seen in the last N hours"""
        cutoff_time = datetime.utcnow() - timedelta(hours=hours)
        return (
            self.session.query(Ioc)
            .filter(Ioc.last_seen >= cutoff_time)
            .filter(Ioc.is_active == True)
            .order_by(desc(Ioc.last_seen))
            .all()
        )
    
    def get_by_value_and_type(self, ioc_value: str, ioc_type: str) -> Optional[Ioc]:
        """Get IOC by value and type"""
        return (
            self.session.query(Ioc)
            .filter_by(ioc_value=ioc_value, ioc_type=ioc_type)
            .first()
        )
