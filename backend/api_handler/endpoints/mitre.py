# endpoints/mitre.py
"""Endpoint handlers for MITRE ATT&CK data."""

from sqlalchemy.orm import joinedload, selectinload
from saint_datamodel import db_session, MitreRepository
from saint_datamodel.models import MitreTactic, MitreTechnique
from saint_datamodel.schemas import MitreTactic as MitreTacticSchema, CoverageAnalysis
from api_utils.response_helpers import create_api_response
import logging

logger = logging.getLogger(__name__)

def get_mitre_matrix(db_session):
    """
    Handles GET /mitre/matrix.
    Returns the full ATT&CK matrix data, with tactics containing nested techniques
    and sub-techniques, structured for the frontend UI.
    """
    try:
        # Eagerly load all relationships in a single, efficient query.
        tactics_from_db = (
            db_session.query(MitreTactic)
            .options(
                selectinload(MitreTactic.techniques)
                .selectinload(MitreTechnique.subtechniques)
            )
            .order_by(MitreTactic.id)
            .all()
        )

        # Process the data to ensure only top-level techniques are at the root of each tactic
        processed_tactics = []
        for tactic in tactics_from_db:
            # Filter for techniques that do not have a parent
            tactic.techniques = [tech for tech in tactic.techniques if tech.parent_technique_id is None]
            processed_tactics.append(tactic)

        # Serialize the correctly structured data using Pydantic schemas.
        result = [MitreTacticSchema.from_orm(t).model_dump() for t in processed_tactics]

        return create_api_response(200, result)

    except Exception as e:
        logger.error(f"Error fetching MITRE matrix: {e}", exc_info=True)
        return create_api_response(500, {"error": "Failed to fetch MITRE matrix data"})


def get_coverage_analysis(params: dict):
    """
    Handles GET /mitre/coverage.
    Returns a summary of rule coverage across all MITRE techniques.
    Accepts an optional 'platforms' query parameter to filter the analysis.
    """
    with db_session() as session:
        mitre_repo = MitreRepository(session)
        
        platforms = params.get('platforms')
        
        coverage_data = mitre_repo.get_coverage_analysis(platforms=platforms)
        
        total_techniques = len(coverage_data)
        covered_techniques = sum(1 for tech in coverage_data if tech['count'] > 0)
        coverage_percentage = (covered_techniques / total_techniques * 100) if total_techniques > 0 else 0

        analysis_data = {
            "total_techniques": total_techniques,
            "covered_techniques": covered_techniques,
            "coverage_percentage": round(coverage_percentage, 2),
            "techniques": coverage_data
        }

        return create_api_response(200, analysis_data)
