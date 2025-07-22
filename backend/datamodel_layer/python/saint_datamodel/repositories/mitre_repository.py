"""
Repository for MITRE ATT&CK data
"""

from typing import List, Optional, Dict, Any

from sqlalchemy import and_, func, cast, TEXT
from sqlalchemy.dialects.postgresql import JSONB, ARRAY, json_build_object, aggregate_order_by
from sqlalchemy.orm import Session
from sqlalchemy.sql import literal_column

from .base import BaseRepository
from ..models.mitre import MitreTactic, MitreTechnique, MitreGroup, MitreSoftware
from ..models.rules import DetectionRule
from ..models.relationships import RuleMitreMapping

class MitreRepository(BaseRepository[MitreTechnique]):
    """Repository for MITRE ATT&CK data"""
    
    def __init__(self, session: Session):
        super().__init__(session, MitreTechnique)
    
    def get_technique_by_id(self, technique_id: str) -> Optional[MitreTechnique]:
        """Get technique by MITRE technique ID"""
        return (
            self.session.query(MitreTechnique)
            .filter_by(technique_id=technique_id)
            .first()
        )
    
    def get_techniques_by_tactic(self, tactic_id: str) -> List[MitreTechnique]:
        """Get techniques for a specific tactic"""
        return (
            self.session.query(MitreTechnique)
            .join(MitreTactic)
            .filter(MitreTactic.tactic_id == tactic_id)
            .all()
        )
    
    def get_coverage_analysis(self, platforms: Optional[List[str]] = None) -> List[Dict[str, Any]]:
        """
        Get rule coverage analysis for MITRE techniques, including associated rule details.
        """
        # Efficiently build a JSON array of rule details within the query
        rules_agg = func.coalesce(
            func.jsonb_agg(
                aggregate_order_by(
                    json_build_object(
                        'id', DetectionRule.id,
                        'title', DetectionRule.name,
                        'severity', DetectionRule.severity
                    ),
                    DetectionRule.severity
                )
            ).filter(DetectionRule.id.isnot(None)),
            cast(literal_column("'[]'"), JSONB) # Correct way to create an empty JSONB array
        )

        # Base query
        query = (
            self.session.query(
                MitreTechnique.technique_id,
                MitreTechnique.name,
                func.count(DetectionRule.id).label('rule_count'),
                rules_agg.label('rules')
            )
            .select_from(MitreTechnique)
            .outerjoin(RuleMitreMapping, MitreTechnique.id == RuleMitreMapping.technique_id)
            .outerjoin(DetectionRule, and_(
                RuleMitreMapping.rule_id == DetectionRule.id,
                DetectionRule.is_active == True
            ))
        )

        # Apply platform filter if provided, with an explicit type cast to TEXT[]
        if platforms:
            query = query.filter(MitreTechnique.platforms.op('&&')(cast(platforms, ARRAY(TEXT))))

        # Finalize query
        results = (
            query
            .group_by(MitreTechnique.id, MitreTechnique.technique_id, MitreTechnique.name)
            .order_by(MitreTechnique.technique_id)
            .all()
        )
        
        return [
            {
                'technique_id': r.technique_id,
                'name': r.name,
                'count': r.rule_count,
                'rules': r.rules 
            }
            for r in results
        ]
    
    def get_tactic_by_id(self, tactic_id: str) -> Optional[MitreTactic]:
        """Get tactic by MITRE tactic ID"""
        return (
            self.session.query(MitreTactic)
            .filter_by(tactic_id=tactic_id)
            .first()
        )
    
    def get_group_by_id(self, group_id: str) -> Optional[MitreGroup]:
        """Get group by MITRE group ID"""
        return (
            self.session.query(MitreGroup)
            .filter_by(group_id=group_id)
            .first()
        )
    
    def get_software_by_id(self, software_id: str) -> Optional[MitreSoftware]:
        """Get software by MITRE software ID"""
        return (
            self.session.query(MitreSoftware)
            .filter_by(software_id=software_id)
            .first()
        )
