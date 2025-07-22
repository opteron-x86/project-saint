# endpoints/statistics.py
# Statistics-related endpoint handlers

import logging
from sqlalchemy import func, and_, or_

# Import from the saint-datamodel layer (v2)
from saint_datamodel import db_session
# Correctly import the SQLAlchemy models for querying
from saint_datamodel.models import RuleSource, DetectionRule, MitreTechnique, MitreTactic, RuleMitreMapping
from api_utils.response_helpers import create_api_response, create_error_response
# Import the Pydantic schema for validating parameters
from saint_datamodel.schemas import RuleSearchParams

logger = logging.getLogger(__name__)

def handle_get_stats(params: dict):
    """
    Get dashboard statistics by querying the database.
    Accepts filters to provide scoped statistics.
    """
    logger.info(f"Generating dashboard statistics with filters: {params}")

    try:
        # Validate and parse search parameters to leverage Pydantic's type conversion
        search_params = RuleSearchParams(**params)
    except Exception as e:
        return create_error_response(400, {"error": "Invalid search parameters", "details": str(e)})

    with db_session() as session:
        try:
            # --- Build a base query with all filters applied, using the SQLAlchemy Model ---
            query_builder = session.query(DetectionRule.id).distinct()

            # Text search
            if search_params.query:
                query_builder = query_builder.filter(
                    or_(
                        DetectionRule.name.ilike(f'%{search_params.query}%'),
                        DetectionRule.description.ilike(f'%{search_params.query}%'),
                        DetectionRule.rule_id.ilike(f'%{search_params.query}%')
                    )
                )
            
            # Categorical filters
            if search_params.severities:
                query_builder = query_builder.filter(DetectionRule.severity.in_(search_params.severities))
            if search_params.source_ids:
                query_builder = query_builder.filter(DetectionRule.source_id.in_(search_params.source_ids))
            if search_params.tags:
                query_builder = query_builder.filter(DetectionRule.tags.contains(search_params.tags))
            if search_params.is_active is not None:
                query_builder = query_builder.filter(DetectionRule.is_active == search_params.is_active)
            if search_params.rule_platforms:
                query_builder = query_builder.filter(DetectionRule.rule_metadata['rule_platforms'].op('?|')(search_params.rule_platforms))
            if search_params.validation_status:
                query_builder = query_builder.filter(DetectionRule.rule_metadata['validation_status'].astext.in_(search_params.validation_status))

            # Joins for MITRE-based filters
            if search_params.platforms or search_params.tactics:
                query_builder = query_builder.join(RuleMitreMapping).join(MitreTechnique)
                if search_params.platforms:
                    query_builder = query_builder.filter(MitreTechnique.platforms.op('&&')(search_params.platforms))
                if search_params.tactics:
                    query_builder = query_builder.join(MitreTactic).filter(MitreTactic.name.in_(search_params.tactics))
            
            # --- Execute aggregation queries on the filtered set ---
            
            filtered_rule_ids_subquery = query_builder.subquery()

            total_rules = session.query(func.count(filtered_rule_ids_subquery.c.id)).scalar()

            agg_query_base = session.query(DetectionRule).filter(DetectionRule.id.in_(filtered_rule_ids_subquery))

            severity_counts = agg_query_base.with_entities(
                DetectionRule.severity, func.count(DetectionRule.id)
            ).filter(DetectionRule.severity.isnot(None)).group_by(DetectionRule.severity).all()
            by_severity = {severity: count for severity, count in severity_counts}

            source_counts = agg_query_base.join(RuleSource).with_entities(
                RuleSource.name, func.count(DetectionRule.id)
            ).group_by(RuleSource.name).all()
            by_rule_source = {name: count for name, count in source_counts}

            platform_counts_query = agg_query_base.with_entities(
                func.jsonb_array_elements_text(DetectionRule.rule_metadata['rule_platforms']).label('platform'),
                func.count(DetectionRule.id)
            ).filter(DetectionRule.rule_metadata.has_key('rule_platforms')).group_by('platform').all()
            by_rule_platform = {platform: count for platform, count in platform_counts_query}


            stats_data = {
                "total_rules": total_rules,
                "stats": {
                    "by_severity": by_severity,
                    "by_rule_source": by_rule_source,
                    "by_rule_platform": by_rule_platform,
                    "by_platform": {}
                },
                "active_filters": search_params.model_dump(exclude_none=True)
            }

            return create_api_response(200, stats_data)

        except Exception as e:
            logger.error(f"Error generating statistics: {e}", exc_info=True)
            return create_error_response(500, {"error": "Failed to generate statistics"})
