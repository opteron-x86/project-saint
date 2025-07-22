# cve-updater/lambda_function.py
"""
Standalone Lambda function to update and enrich CVE data.
- Triggered by EventBridge on a schedule.
- Scans all rules for mentioned CVEs.
- Identifies CVEs missing from the cve_entries table.
- Fetches data for a batch of missing CVEs from the NVD API with rate limiting.
- Creates the necessary rule-to-cve mappings.
"""

import json
import logging
import os
import re
import time
from typing import Dict, Any, Set, Tuple

import boto3
from sqlalchemy import text

from saint_datamodel import db_session
from saint_datamodel.models import RuleCveMapping, CveEntry, DetectionRule
from saint_datamodel.utils import fetch_and_store_cve_data

# --- Configuration ---
logger = logging.getLogger()
logger.setLevel(logging.INFO)
BATCH_SIZE = int(os.environ.get("BATCH_SIZE", "50"))
RATE_LIMIT_SLEEP = int(os.environ.get("RATE_LIMIT_SLEEP", "4"))
CVE_REGEX = re.compile(r'CVE-\d{4}-\d{4,}', re.IGNORECASE)

def get_all_cves_from_rules(session) -> Dict[str, Set[int]]:
    """
    Scans all detection rules and extracts all unique CVE IDs mentioned in them.
    Returns a dictionary mapping each CVE ID to a set of rule IDs that mention it.
    """
    logger.info("Scanning all rules for CVE identifiers...")
    cve_to_rule_ids: Dict[str, Set[int]] = {}
    
    # Query all rules that have tags or relevant metadata
    rules = session.query(DetectionRule.id, DetectionRule.tags, DetectionRule.rule_metadata).all()
    
    for rule_id, tags, metadata in rules:
        found_cves: Set[str] = set()
        
        # Search in tags
        if tags:
            for tag in tags:
                matches = CVE_REGEX.findall(tag)
                for match in matches:
                    found_cves.add(match.upper())

        # Search in Trinity Cyber raw data
        if metadata and metadata.get('createTime'): # Heuristic for TC rules
            raw_content = session.query(DetectionRule.rule_content).filter(DetectionRule.id == rule_id).scalar()
            try:
                raw_json = json.loads(raw_content)
                for cve_obj in raw_json.get('cves', []):
                    if cve_obj.get('id'):
                        found_cves.add(cve_obj.get('id').upper())
            except (json.JSONDecodeError, TypeError):
                pass # Ignore if rule_content is not valid JSON

        for cve_id in found_cves:
            if cve_id not in cve_to_rule_ids:
                cve_to_rule_ids[cve_id] = set()
            cve_to_rule_ids[cve_id].add(rule_id)
            
    logger.info(f"Found {len(cve_to_rule_ids)} unique CVEs mentioned across all rules.")
    return cve_to_rule_ids

def get_existing_cves(session, cve_ids: Set[str]) -> Set[str]:
    """Checks the database for which CVEs from a given set already exist."""
    if not cve_ids:
        return set()
    
    existing_cve_results = session.query(CveEntry.cve_id).filter(CveEntry.cve_id.in_(cve_ids)).all()
    return {cve_id for (cve_id,) in existing_cve_results}

def create_missing_mappings(session, cve_to_rule_ids: Dict[str, Set[int]]):
    """Creates rule-to-cve mappings for CVEs that are now present in the database."""
    mappings_created = 0
    logger.info("Checking for and creating missing rule-to-CVE mappings...")

    for cve_id, rule_ids in cve_to_rule_ids.items():
        cve_entry = session.query(CveEntry).filter_by(cve_id=cve_id).first()
        if not cve_entry:
            continue # Skip if the CVE still doesn't exist for some reason

        for rule_id in rule_ids:
            # Check if this specific mapping already exists
            existing_mapping = session.query(RuleCveMapping).filter_by(
                rule_id=rule_id, cve_id=cve_entry.id
            ).first()

            if not existing_mapping:
                new_mapping = RuleCveMapping(
                    rule_id=rule_id,
                    cve_id=cve_entry.id,
                    relationship_type="detects"
                )
                session.add(new_mapping)
                mappings_created += 1
    
    if mappings_created > 0:
        session.commit()
        logger.info(f"Successfully created {mappings_created} new rule-to-CVE mappings.")
    else:
        logger.info("No new mappings were needed.")


def lambda_handler(event: Dict[str, Any], context: object) -> Dict[str, Any]:
    """Main handler for the CVE updater."""
    start_time = time.time()
    logger.info("Starting CVE updater process...")
    
    enriched_count = 0
    error_count = 0

    try:
        with db_session() as session:
            # 1. Find all CVEs mentioned in rules
            cve_to_rule_ids = get_all_cves_from_rules(session)
            all_cve_ids_in_rules = set(cve_to_rule_ids.keys())

            # 2. Find which CVEs already exist in our database
            existing_cve_ids = get_existing_cves(session, all_cve_ids_in_rules)

            # 3. Determine which CVEs are missing and need to be fetched
            missing_cve_ids = sorted(list(all_cve_ids_in_rules - existing_cve_ids))
            
            logger.info(f"Found {len(missing_cve_ids)} CVEs to enrich.")

            # 4. Process a batch of the missing CVEs
            cves_to_process = missing_cve_ids[:BATCH_SIZE]
            if not cves_to_process:
                logger.info("No new CVEs to process in this invocation.")
            
            for cve_id in cves_to_process:
                try:
                    logger.info(f"Enriching missing CVE: {cve_id}")
                    _, was_fetched = fetch_and_store_cve_data(cve_id, session)
                    if was_fetched:
                        enriched_count += 1
                        logger.info(f"Successfully enriched {cve_id}. Sleeping for {RATE_LIMIT_SLEEP} seconds.")
                        time.sleep(RATE_LIMIT_SLEEP)
                except Exception as e:
                    error_count += 1
                    logger.error(f"Failed to enrich CVE {cve_id}: {e}", exc_info=True)
            
            # 5. After enriching, create any mappings that might now be possible
            create_missing_mappings(session, cve_to_rule_ids)

    except Exception as e:
        error_count += 1
        logger.error(f"A critical error occurred during the CVE update process: {e}", exc_info=True)

    end_time = time.time()
    duration = round(end_time - start_time, 2)
    
    summary = {
        'message': 'CVE update process finished.',
        'duration_seconds': duration,
        'cves_enriched_this_run': enriched_count,
        'errors': error_count
    }
    
    logger.info(summary)
    return {'statusCode': 200, 'body': json.dumps(summary)}
