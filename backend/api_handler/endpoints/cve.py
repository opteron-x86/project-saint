# endpoints/cve.py
"""Endpoint handlers for CVE data."""

from saint_datamodel import db_session, CveRepository
# CORRECTED: Explicitly import the CveEntry schema to avoid name collision
from saint_datamodel.schemas import CveEntry
from api_utils.response_helpers import create_api_response

def get_cve_details(cve_id: str):
    """
    Handles GET /cves/{cve_id}.
    Retrieves details for a single CVE.
    """
    with db_session() as session:
        cve_repo = CveRepository(session)
        cve = cve_repo.get_by_cve_id(cve_id.upper()) # Ensure CVE ID is uppercase
        
        if not cve:
            return create_api_response(404, {"error": "CVE not found"})
            
        # Serialize using the Pydantic model
        return create_api_response(200, CveEntry.from_orm(cve).model_dump())

def search_cves(params: dict):
    """
    Handles GET /cves.
    (This is a placeholder for a more advanced search. Currently gets all CVEs with pagination.)
    """
    # Note: A CveSearchParams schema should be created for advanced filtering
    offset = int(params.get('offset', 0))
    limit = int(params.get('limit', 100))

    with db_session() as session:
        cve_repo = CveRepository(session)
        cves = cve_repo.get_all(offset=offset, limit=limit)
        total_count = cve_repo.count()
        
        serialized_cves = [CveEntry.from_orm(c).model_dump() for c in cves]
        
        response_data = {
            "items": serialized_cves,
            "total": total_count,
            "offset": offset,
            "limit": limit
        }
        
        return create_api_response(200, response_data)
