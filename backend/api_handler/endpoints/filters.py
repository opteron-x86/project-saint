# endpoints/filters.py
"""Endpoint handler for retrieving filter options."""

from sqlalchemy import func, text
from saint_datamodel import db_session
# Corrected imports to use the SQLAlchemy models and Mitre models
from saint_datamodel.models import RuleSource, DetectionRule, MitreTactic

from api_utils.response_helpers import create_api_response

def get_filter_options():
    """
    Handles GET /filters/options.
    Aggregates distinct values for building UI filter controls.
    """
    with db_session() as session:
        # Get rule sources -> { value: "1", label: "Elastic" }
        sources_query = session.query(RuleSource.id, RuleSource.name).filter(RuleSource.is_active == True).order_by(RuleSource.name).all()
        rule_sources = [{"value": str(s.id), "label": s.name} for s in sources_query]

        # Get distinct severities -> { value: "high", label: "High" }
        severities_query = session.query(DetectionRule.severity).distinct().all()
        severities = [{"value": s[0], "label": s[0].capitalize()} for s in severities_query if s[0]]

        # Get distinct tags -> { value: "T1059.001", label: "T1059.001" }
        tags_query = session.query(func.unnest(DetectionRule.tags)).distinct().all()
        tags = [{"value": t[0], "label": t[0]} for t in tags_query if t[0]]

        # Get distinct ATT&CK platforms -> { value: "Windows", label: "Windows" }
        # This is a raw query for efficiency on a potentially large array column
        platforms_query = session.execute(text("SELECT DISTINCT unnest(platforms) FROM mitre_techniques WHERE platforms IS NOT NULL")).fetchall()
        platforms = [{"value": p[0], "label": p[0]} for p in platforms_query if p[0]]

        # Get distinct Rule platforms -> { value: "Azure", label: "Azure" }
        rule_platforms_query = session.execute(text("SELECT DISTINCT jsonb_array_elements_text(rule_metadata->'rule_platforms') FROM detection_rules WHERE rule_metadata ? 'rule_platforms'")).fetchall()
        rule_platforms = [{"value": rp[0], "label": rp[0]} for rp in rule_platforms_query if rp[0]]

        # Get MITRE Tactics -> { value: "TA0002", label: "Execution" }
        tactics_query = session.query(MitreTactic.name).distinct().all()
        tactics = [{"value": t.name, "label": t.name} for t in tactics_query if t.name]

        # Get distinct validation statuses -> { value: "validated", label: "Validated" }
        validation_statuses_query = session.query(DetectionRule.rule_metadata['validation_status'].astext).distinct().all()
        validation_statuses = [{"value": vs[0], "label": vs[0].replace("_", " ").title()} for vs in validation_statuses_query if vs[0]]


        response_data = {
            "platforms": sorted(platforms, key=lambda x: x['label']),
            "rule_sources": rule_sources, # Already sorted by query
            "severities": sorted(severities, key=lambda x: x['label']),
            "tactics": sorted(tactics, key=lambda x: x['label']),
            "tags": sorted(tags, key=lambda x: x['label']),
            "rule_platforms": sorted(rule_platforms, key=lambda x: x['label']),
            "validation_statuses": sorted(validation_statuses, key=lambda x: x['label']),
        }

        return create_api_response(200, response_data)