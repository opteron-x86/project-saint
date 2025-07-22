# datamodel-layer/python/saint_datamodel/utils.py
"""
Utility functions for the data model layer
"""

import hashlib
import json
import logging
import requests
from typing import Dict, Any, Optional, Tuple
from datetime import datetime, timezone
from sqlalchemy.orm import Session

# Local imports for CVE data
from .models import CveEntry
from .repositories import CveRepository

NVD_API_BASE_URL = "https://services.nvd.nist.gov/rest/json/cves/2.0"

logger = logging.getLogger(__name__)

def generate_rule_hash(rule_content: str) -> str:
    """Generate SHA256 hash for rule content deduplication"""
    return hashlib.sha256(rule_content.encode('utf-8')).hexdigest()

def normalize_metadata(metadata: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    """Normalize metadata for consistent storage"""
    if not metadata:
        return None

    # Ensure all datetime objects are ISO formatted strings
    normalized = {}
    for key, value in metadata.items():
        if isinstance(value, datetime):
            normalized[key] = value.isoformat()
        elif isinstance(value, dict):
            normalized[key] = normalize_metadata(value)
        else:
            normalized[key] = value

    return normalized

def calculate_confidence_score(
    source_credibility: float,
    rule_performance: Optional[Dict[str, int]] = None
) -> float:
    """Calculate confidence score based on source and performance"""
    base_score = source_credibility

    if rule_performance:
        total_detections = rule_performance.get('total_detections', 0)
        false_positives = rule_performance.get('false_positives', 0)

        if total_detections > 0:
            fp_rate = false_positives / total_detections
            # Adjust confidence based on false positive rate
            performance_modifier = max(0.5, 1.0 - fp_rate)
            base_score *= performance_modifier

    return min(1.0, max(0.0, base_score))

def utc_now() -> datetime:
    """Get current UTC timestamp"""
    return datetime.now(timezone.utc)

def create_db_secret(
    secret_name: str,
    password: str,
    username: str,
    host: str,
    port: int = 5432,
    dbname: str = "saint",
    region: str = "us-east-1"
) -> str:
    """
    Create a database secret in AWS Secrets Manager for SAINT
    Returns the ARN of the created secret
    """
    import boto3

    client = boto3.client('secretsmanager', region_name=region)

    secret_dict = {
        "password": password,
        "username": username,
        "host": host,
        "port": str(port),
        "dbname": dbname
    }

    try:
        response = client.create_secret(
            Name=secret_name,
            Description=f"Database credentials for SAINT application",
            SecretString=json.dumps(secret_dict),
            Tags=[
                {
                    'Key': 'Application',
                    'Value': 'saint'
                },
                {
                    'Key': 'Environment',
                    'Value': 'production'
                }
            ]
        )

        return response['ARN']

    except Exception as e:
        logger.error(f"Failed to create secret {secret_name}: {e}")
        raise


def _parse_cve_item(nvd_cve: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """Parses a single CVE item from the NVD API response into a dict."""
    try:
        cve_data = nvd_cve.get('cve', {})
        cvss_v3 = next(iter(cve_data.get('metrics', {}).get('cvssMetricV31', [])), {}).get('cvssData', {})
        cwe_id = next(iter(w.get('description', [{}])[0].get('value') for w in cve_data.get('weaknesses', []) if w), None)

        return {
            'cve_id': cve_data.get('id'),
            'description': next((d['value'] for d in cve_data.get('descriptions', []) if d['lang'] == 'en'), None),
            'published_date': datetime.fromisoformat(cve_data['published']),
            'modified_date': datetime.fromisoformat(cve_data['lastModified']),
            'cvss_v3_score': cvss_v3.get('baseScore'),
            'cvss_v3_vector': cvss_v3.get('vectorString'),
            'severity': cvss_v3.get('baseSeverity'),
            'cwe_ids': [cwe_id] if cwe_id else [],
            'cve_references': {'references': cve_data.get('references', [])}
        }
    except (KeyError, IndexError, TypeError) as e:
        logger.error(f"Failed to parse CVE item {nvd_cve.get('cve', {}).get('id', 'Unknown')}: {e}")
        return None

def fetch_and_store_cve_data(cve_id: str, session: Session) -> Tuple[Optional[CveEntry], bool]:
    """
    Checks if a CVE exists in the DB. If not, fetches it from NVD and stores it.
    Returns the CveEntry model instance and a boolean indicating if an API fetch was performed.
    """
    cve_repo = CveRepository(session)

    # 1. Check for local existence
    existing_cve = cve_repo.get_by_cve_id(cve_id)
    if existing_cve:
        logger.info(f"CVE {cve_id} already exists in the database. Skipping fetch.")
        return existing_cve, False

    # 2. Fetch on demand if it doesn't exist
    logger.info(f"CVE {cve_id} not found locally. Fetching from NVD.")
    was_fetched = True
    try:
        response = requests.get(f"{NVD_API_BASE_URL}?cveId={cve_id}", timeout=10)
        response.raise_for_status()
        data = response.json()

        if not data.get('vulnerabilities'):
            logger.warning(f"NVD API returned no data for CVE {cve_id}.")
            return None, was_fetched

        # 3. Parse and store the new CVE
        parsed_data = _parse_cve_item(data['vulnerabilities'][0])
        if parsed_data:
            new_cve = cve_repo.create(**parsed_data)
            logger.info(f"Successfully fetched and stored new CVE: {cve_id}")
            return new_cve, was_fetched

    except requests.exceptions.RequestException as e:
        logger.error(f"Failed to fetch data from NVD API for {cve_id}: {e}")
    except Exception as e:
        logger.error(f"An unexpected error occurred while fetching {cve_id}: {e}")

    return None, was_fetched

