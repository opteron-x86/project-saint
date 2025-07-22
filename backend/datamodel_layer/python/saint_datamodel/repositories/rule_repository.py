"""
Repository for detection rules with specialized queries
"""

from typing import List, Optional, Dict, Any, Tuple
from datetime import datetime, timedelta

from sqlalchemy import and_, or_, func, desc, asc
from sqlalchemy.orm import Session, joinedload, selectinload

from .base import BaseRepository
from ..models.rules import DetectionRule, RulePerformance, RuleCategory, RuleCategoryMapping, RuleSource
from ..models.mitre import MitreTechnique, MitreTactic
from ..models.vulnerabilities import CveEntry
from ..models.relationships import RuleMitreMapping, RuleCveMapping, RuleIocMapping

class RuleRepository(BaseRepository[DetectionRule]):
    """Repository for detection rules with specialized queries"""
    
    def __init__(self, session: Session):
        super().__init__(session, DetectionRule)
    
    def get_by_hash(self, hash_value: str) -> Optional[DetectionRule]:
        """Get rule by content hash"""
        return self.session.query(DetectionRule).filter_by(hash=hash_value).first()
    
    def get_by_source_and_rule_id(self, source_id: int, rule_id: str) -> Optional[DetectionRule]:
        """Get rule by source and original rule ID"""
        return (
            self.session.query(DetectionRule)
            .filter_by(source_id=source_id, rule_id=rule_id)
            .first()
        )
    
    def get_with_enrichments(self, rule_id: int) -> Optional[DetectionRule]:
        """Get rule with all enrichment data loaded"""
        return (
            self.session.query(DetectionRule)
            .options(
                joinedload(DetectionRule.source),
                selectinload(DetectionRule.mitre_mappings).joinedload(RuleMitreMapping.technique),
                selectinload(DetectionRule.cve_mappings).joinedload(RuleCveMapping.cve),
                selectinload(DetectionRule.ioc_mappings),
                selectinload(DetectionRule.performance_metrics),
                selectinload(DetectionRule.category_mappings)
            )
            .filter(DetectionRule.id == rule_id)
            .first()
        )
    
    def search_rules(
        self,
        query: Optional[str] = None,
        rule_types: Optional[List[str]] = None,
        severities: Optional[List[str]] = None,
        source_ids: Optional[List[int]] = None,
        tags: Optional[List[str]] = None,
        is_active: Optional[bool] = None,
        limit: int = 100,
        offset: int = 0,
        platforms: Optional[List[str]] = None,
        rule_platforms: Optional[List[str]] = None,
        tactics: Optional[List[str]] = None,
        validation_status: Optional[List[str]] = None,
        sort_by: str = 'updated_date',
        sort_dir: str = 'desc',
    ) -> Tuple[List[DetectionRule], int]:
        """Advanced rule search with filters"""
        
        query_builder = self.session.query(DetectionRule).options(joinedload(DetectionRule.source)).distinct()
        
        if query:
            query_builder = query_builder.filter(
                or_(
                    DetectionRule.name.ilike(f'%{query}%'),
                    DetectionRule.description.ilike(f'%{query}%'),
                    DetectionRule.rule_id.ilike(f'%{query}%')
                )
            )
        
        if rule_types:
            query_builder = query_builder.filter(DetectionRule.rule_type.in_(rule_types))
        
        if severities:
            query_builder = query_builder.filter(DetectionRule.severity.in_(severities))
        
        if source_ids:
            query_builder = query_builder.filter(DetectionRule.source_id.in_(source_ids))
        
        if tags:
            query_builder = query_builder.filter(DetectionRule.tags.contains(tags))
        
        if is_active is not None:
            query_builder = query_builder.filter(DetectionRule.is_active == is_active)
        
        if rule_platforms:
            query_builder = query_builder.filter(DetectionRule.rule_metadata['rule_platforms'].op('?|')(rule_platforms))

        if platforms or tactics:
            query_builder = query_builder.join(RuleMitreMapping).join(MitreTechnique)
            
            if platforms:
                query_builder = query_builder.filter(MitreTechnique.platforms.op('&&')(platforms))
            
            if tactics:
                query_builder = query_builder.join(MitreTactic).filter(MitreTactic.name.in_(tactics))
        
        if validation_status:
            query_builder = query_builder.filter(DetectionRule.rule_metadata['validation_status'].astext.in_(validation_status))

        total_count_query = query_builder.statement.with_only_columns(func.count(DetectionRule.id.distinct()))
        total_count = self.session.execute(total_count_query).scalar()
        
        sort_column = getattr(DetectionRule, sort_by, DetectionRule.updated_date)
        sort_func = desc if sort_dir == 'desc' else asc
        query_builder = query_builder.order_by(sort_func(sort_column))
        
        rules = query_builder.offset(offset).limit(limit).all()
        
        return rules, total_count
    
    def get_rules_by_mitre_technique(self, technique_id: str) -> List[DetectionRule]:
        """Get rules that detect a specific MITRE technique"""
        return (
            self.session.query(DetectionRule)
            .join(RuleMitreMapping)
            .join(MitreTechnique)
            .filter(MitreTechnique.technique_id == technique_id)
            .filter(DetectionRule.is_active == True)
            .all()
        )
    
    def get_rules_by_cve(self, cve_id: str) -> List[DetectionRule]:
        """Get rules related to a specific CVE"""
        return (
            self.session.query(DetectionRule)
            .join(RuleCveMapping)
            .join(CveEntry)
            .filter(CveEntry.cve_id == cve_id)
            .filter(DetectionRule.is_active == True)
            .all()
        )
    
    def get_performance_summary(self, rule_id: int) -> Dict[str, Any]:
        """Get aggregated performance metrics for a rule"""
        metrics = (
            self.session.query(
                func.sum(RulePerformance.detection_count).label('total_detections'),
                func.sum(RulePerformance.false_positive_count).label('total_fps'),
                func.sum(RulePerformance.true_positive_count).label('total_tps'),
                func.max(RulePerformance.last_detection).label('last_detection')
            )
            .filter(RulePerformance.rule_id == rule_id)
            .first()
        )
        
        if metrics and metrics.total_detections:
            fp_rate = float(metrics.total_fps) / float(metrics.total_detections) if metrics.total_detections > 0 else 0
            return {
                'total_detections': metrics.total_detections or 0,
                'total_false_positives': metrics.total_fps or 0,
                'total_true_positives': metrics.total_tps or 0,
                'false_positive_rate': round(fp_rate, 4),
                'last_detection': metrics.last_detection
            }
        
        return {
            'total_detections': 0,
            'total_false_positives': 0,
            'total_true_positives': 0,
            'false_positive_rate': 0.0,
            'last_detection': None
        }
