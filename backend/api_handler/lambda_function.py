# lambda_function.py
"""
SAINT API Gateway Lambda Handler
- Routes API requests to the appropriate endpoint handlers.
- Uses the saint-datamodel layer for all database operations.
- Structures endpoints for rules, MITRE, CVEs, and filters.
"""

import json
import logging
import re
from typing import Dict, Any

# Import from the saint-datamodel layer
from saint_datamodel import db_session
from saint_datamodel.exceptions import NotFoundError

# Import local modules
from api_utils.response_helpers import create_api_response, create_error_response
from endpoints import rules, mitre, cve, filters, statistics, issues

# --- Logging Setup ---
logger = logging.getLogger()
logger.setLevel(logging.INFO)

def parse_query_parameters(event: Dict[str, Any]) -> Dict[str, Any]:
    """
    Parse and normalize query parameters from API Gateway event.
    Handles both single and multi-value parameters correctly.
    """
    params = event.get('queryStringParameters') or {}
    multi_params = event.get('multiValueQueryStringParameters') or {}
    
    for key, value_list in multi_params.items():
        if key in ['query', 'offset', 'limit', 'sort_by', 'sort_dir']:
            params[key] = value_list[0] if value_list else None
        else:
            params[key] = value_list
            
    return params

def route_request(http_method: str, path: str, params: Dict[str, Any], event: Dict[str, Any]) -> Dict[str, Any]:
    """Route incoming requests to the appropriate endpoint handler."""
    
    normalized_path = path.rstrip('/')

    # Health Check
    if http_method == 'GET' and (normalized_path == '/health' or normalized_path == ''):
        return create_api_response(200, {"status": "healthy", "service": "saint-api"})

    # Create Issue Endpoint
    issue_match = re.match(r'^/rules/([^/]+)/issues$', normalized_path)
    if http_method == 'POST' and issue_match:
        rule_id = issue_match.group(1)
        return issues.create_rule_issue(rule_id, event.get('body', '{}'))

    # Rules Endpoints
    if http_method == 'GET' and normalized_path == '/rules':
        return rules.search_rules(params)
    
    if http_method == 'GET' and normalized_path == '/rules/stats':
        return statistics.handle_get_stats(params)

    rule_details_match = re.match(r'^/rules/(\S+)$', normalized_path)
    if http_method == 'GET' and rule_details_match:
        rule_id = rule_details_match.group(1)
        return rules.get_rule_details(rule_id)

    # MITRE Endpoints
    if http_method == 'GET' and normalized_path == '/mitre/coverage':
        return mitre.get_coverage_analysis(params)
        
    if http_method == 'GET' and normalized_path == '/mitre/matrix':
        with db_session() as session:
            return mitre.get_mitre_matrix(session)

    # CVE Endpoints
    if http_method == 'GET' and normalized_path == '/cves':
        return cve.search_cves(params)

    cve_details_match = re.match(r'^/cves/([a-zA-Z0-9-]+)$', normalized_path, re.IGNORECASE)
    if http_method == 'GET' and cve_details_match:
        cve_id_str = cve_details_match.group(1)
        return cve.get_cve_details(cve_id_str)
        
    # Filter Options Endpoint
    if http_method == 'GET' and normalized_path == '/filters/options':
        return filters.get_filter_options()

    return create_error_response(404, f"Route not found for {http_method} {path}")

def lambda_handler(event: Dict[str, Any], context: object) -> Dict[str, Any]:
    """Main Lambda handler - routes requests to endpoint modules."""
    
    http_method = event.get('httpMethod', 'GET')
    path = event.get('path', '/')
    
    params = parse_query_parameters(event)
    
    logger.info(f"Processing {http_method} request to {path} with params: {params}")
    
    try:
        return route_request(http_method, path, params, event)
            
    except NotFoundError as e:
        logger.warning(f"Resource not found: {e}")
        return create_error_response(404, str(e))
        
    except Exception as e:
        logger.error(f"Unexpected server error: {e}", exc_info=True)
        return create_error_response(500, "Internal server error")