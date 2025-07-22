# endpoints/rules.py
"""Endpoint handlers for detection rules."""

from saint_datamodel import db_session, RuleRepository
# CORRECTED: Explicitly import the schema classes to avoid name collision
from saint_datamodel.schemas import EnrichedDetectionRule, DetectionRule, RuleSearchParams
from api_utils.response_helpers import create_api_response

def get_rule_details(rule_id: str):
    """
    Handles GET /rules/{id}.
    Retrieves a single rule and its full enrichment data.
    """
    with db_session() as session:
        rule_repo = RuleRepository(session)
        # Use the specialized method from the repository to get all enrichments
        # Convert rule_id to int for repository lookup
        rule = rule_repo.get_with_enrichments(int(rule_id))

        if not rule:
            return create_api_response(404, {"error": "Rule not found"})

        # Use the Pydantic schema for serialization
        enriched_rule_schema = EnrichedDetectionRule.from_orm(rule)
        return create_api_response(200, enriched_rule_schema.model_dump())

def search_rules(params: dict):
    """
    Handles GET /rules.
    Searches and filters rules with pagination.
    """
    # Validate and parse search parameters using a Pydantic model
    try:
        search_params = RuleSearchParams(**params)
    except Exception as e:
        return create_api_response(400, {"error": "Invalid search parameters", "details": str(e)})

    with db_session() as session:
        rule_repo = RuleRepository(session)

        # Use the advanced search method from the repository
        rules, total_count = rule_repo.search_rules(
            query=search_params.query,
            rule_types=search_params.rule_types,
            severities=search_params.severities,
            source_ids=search_params.source_ids,
            tags=search_params.tags,
            is_active=search_params.is_active,
            limit=search_params.limit,
            offset=search_params.offset,
            platforms=search_params.platforms,
            rule_platforms=search_params.rule_platforms,
            tactics=search_params.tactics,
            validation_status=search_params.validation_status,
            sort_by=search_params.sort_by,
            sort_dir=search_params.sort_dir
        )

        # Serialize the list of rules using the base DetectionRule schema
        serialized_rules = [DetectionRule.from_orm(r).model_dump() for r in rules]

        response_data = {
            "items": serialized_rules,
            "total": total_count,
            "offset": search_params.offset,
            "limit": search_params.limit
        }

        return create_api_response(200, response_data)
