# lambda_function.py
"""
STIX Processor Lambda Function for SAINT
Processes MITRE ATT&CK STIX data and populates the SAINT database

Layers Required:
1. saint-dependencies (external packages)
2. saint-datamodel (SAINT models and repositories)
"""

import json
import logging
import os
from datetime import datetime, timezone
from typing import Dict, List, Any, Optional, Tuple, Set
from urllib.parse import urlparse

# Dependencies from saint-dependencies layer
import requests
from stix2 import MemoryStore, Filter
import stix2

# SAINT datamodel from saint-datamodel layer
from saint_datamodel import db_session
from saint_datamodel.models import (
    MitreTactic, MitreTechnique, MitreGroup, MitreSoftware
)
from saint_datamodel.repositories import MitreRepository
from saint_datamodel.utils import utc_now

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

class STIXProcessor:
    """STIX data processor for MITRE ATT&CK framework"""
    
    # MITRE ATT&CK STIX data sources
    MITRE_ENTERPRISE_URL = "https://raw.githubusercontent.com/mitre/cti/master/enterprise-attack/enterprise-attack.json"
    MITRE_MOBILE_URL = "https://raw.githubusercontent.com/mitre/cti/master/mobile-attack/mobile-attack.json"
    MITRE_ICS_URL = "https://raw.githubusercontent.com/mitre/cti/master/ics-attack/ics-attack.json"
    
    def __init__(self):
        self.session = requests.Session()
        self.session.timeout = 30
        self.processed_objects: Set[str] = set()
        
    def download_stix_data(self, url: str) -> Optional[Dict[str, Any]]:
        """Download STIX data from URL"""
        try:
            logger.info(f"Downloading STIX data from: {url}")
            response = self.session.get(url)
            response.raise_for_status()
            
            stix_data = response.json()
            logger.info(f"Downloaded {len(stix_data.get('objects', []))} STIX objects")
            return stix_data
            
        except requests.RequestException as e:
            logger.error(f"Failed to download STIX data from {url}: {e}")
            return None
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse STIX JSON from {url}: {e}")
            return None
    
    def process_stix_bundle(self, stix_data: Dict[str, Any], domain: str = "enterprise") -> Tuple[int, int, int]:
        """
        Process a STIX bundle and update the database
        Returns: (created_count, updated_count, error_count)
        """
        if not stix_data or 'objects' not in stix_data:
            logger.error("Invalid STIX data format")
            return 0, 0, 1
        
        created_count = 0
        updated_count = 0
        error_count = 0
        
        # Create STIX memory store for relationship resolution
        memory_store = MemoryStore()
        memory_store.add(stix_data['objects'])
        
        # Process objects by type priority (tactics first, then techniques, etc.)
        object_types = [
            'x-mitre-tactic',
            'attack-pattern',
            'intrusion-set', 
            'malware',
            'tool'
        ]
        
        for obj_type in object_types:
            objects = [obj for obj in stix_data['objects'] if obj.get('type') == obj_type]
            
            for stix_obj in objects:
                if stix_obj['id'] in self.processed_objects:
                    continue
                
                # Process each object in its own transaction
                try:
                    with db_session() as session:
                        mitre_repo = MitreRepository(session)
                        
                        if obj_type == 'x-mitre-tactic':
                            result = self._process_tactic(stix_obj, mitre_repo, domain)
                        elif obj_type == 'attack-pattern':
                            result = self._process_technique(stix_obj, mitre_repo, memory_store, domain)
                        elif obj_type == 'intrusion-set':
                            result = self._process_group(stix_obj, mitre_repo, memory_store, domain)
                        elif obj_type in ['malware', 'tool']:
                            result = self._process_software(stix_obj, mitre_repo, memory_store, domain)
                        else:
                            continue
                        
                        if result == 'created':
                            created_count += 1
                        elif result == 'updated':
                            updated_count += 1
                            
                        self.processed_objects.add(stix_obj['id'])
                        
                        # Transaction commits automatically via context manager
                        
                except Exception as e:
                    logger.error(f"Error processing STIX object {stix_obj.get('id', 'unknown')}: {e}")
                    error_count += 1
                    # Transaction automatically rolled back via context manager
        
        logger.info(f"STIX processing complete - Created: {created_count}, Updated: {updated_count}, Errors: {error_count}")
        return created_count, updated_count, error_count
    
    def _process_tactic(self, stix_obj: Dict[str, Any], repo: MitreRepository, domain: str) -> str:
        """Process MITRE tactic STIX object"""
        external_refs = stix_obj.get('external_references', [])
        mitre_ref = next((ref for ref in external_refs if ref.get('source_name') == 'mitre-attack'), None)
        
        if not mitre_ref:
            logger.warning(f"No MITRE reference found for tactic {stix_obj['id']}")
            return 'skipped'
        
        tactic_id = mitre_ref['external_id']
        
        # Check if tactic exists
        existing_tactic = repo.session.query(MitreTactic).filter_by(tactic_id=tactic_id).first()
        
        tactic_data = {
            'tactic_id': tactic_id,
            'name': stix_obj['name'],
            'description': stix_obj.get('description', ''),
            'external_references': {
                'stix_id': stix_obj['id'],
                'external_references': external_refs,
                'domain': domain,
                'kill_chain_phases': stix_obj.get('x_mitre_domains', [])
            }
        }
        
        if existing_tactic:
            # Update existing tactic
            for key, value in tactic_data.items():
                if key != 'tactic_id':  # Don't update primary identifier
                    setattr(existing_tactic, key, value)
            existing_tactic.updated_date = utc_now()
            logger.info(f"Updated tactic: {tactic_id}")
            return 'updated'
        else:
            # Create new tactic
            new_tactic = MitreTactic(**tactic_data)
            repo.session.add(new_tactic)
            logger.info(f"Created tactic: {tactic_id}")
            return 'created'
    
    def _process_technique(self, stix_obj: Dict[str, Any], repo: MitreRepository, memory_store: MemoryStore, domain: str) -> str:
        """Process MITRE technique STIX object"""
        external_refs = stix_obj.get('external_references', [])
        mitre_ref = next((ref for ref in external_refs if ref.get('source_name') == 'mitre-attack'), None)
        
        if not mitre_ref:
            logger.warning(f"No MITRE reference found for technique {stix_obj['id']}")
            return 'skipped'
        
        technique_id = mitre_ref['external_id']
        
        # Find associated tactic
        kill_chain_phases = stix_obj.get('kill_chain_phases', [])
        tactic_name = None
        if kill_chain_phases:
            tactic_name = kill_chain_phases[0].get('phase_name')
        
        tactic = None
        if tactic_name:
            # Convert phase name to display name (e.g., 'initial-access' -> 'Initial Access')
            display_name = tactic_name.replace('-', ' ').title()
            tactic = repo.session.query(MitreTactic).filter_by(name=display_name).first()
        
        # Check for parent technique (sub-techniques)
        parent_technique = None
        if '.' in technique_id:
            parent_id = technique_id.split('.')[0]
            parent_technique = repo.session.query(MitreTechnique).filter_by(technique_id=parent_id).first()
        
        # Check if technique exists
        existing_technique = repo.session.query(MitreTechnique).filter_by(technique_id=technique_id).first()
        
        technique_data = {
            'technique_id': technique_id,
            'name': stix_obj['name'],
            'description': stix_obj.get('description', ''),
            'tactic_id': tactic.id if tactic else None,
            'parent_technique_id': parent_technique.id if parent_technique else None,
            'kill_chain_phases': [phase['phase_name'] for phase in kill_chain_phases],
            'platforms': stix_obj.get('x_mitre_platforms', []),
            'data_sources': stix_obj.get('x_mitre_data_sources', []),
            'detection_description': stix_obj.get('x_mitre_detection', ''),
            'external_references': {
                'stix_id': stix_obj['id'],
                'external_references': external_refs,
                'domain': domain,
                'is_subtechnique': '.' in technique_id,
                'deprecated': stix_obj.get('x_mitre_deprecated', False),
                'version': stix_obj.get('x_mitre_version', '1.0')
            }
        }
        
        if existing_technique:
            # Update existing technique
            for key, value in technique_data.items():
                if key != 'technique_id':  # Don't update primary identifier
                    setattr(existing_technique, key, value)
            existing_technique.updated_date = utc_now()
            logger.info(f"Updated technique: {technique_id}")
            return 'updated'
        else:
            # Create new technique
            new_technique = MitreTechnique(**technique_data)
            repo.session.add(new_technique)
            logger.info(f"Created technique: {technique_id}")
            return 'created'
    
    def _process_group(self, stix_obj: Dict[str, Any], repo: MitreRepository, memory_store: MemoryStore, domain: str) -> str:
        """Process MITRE group STIX object"""
        external_refs = stix_obj.get('external_references', [])
        mitre_ref = next((ref for ref in external_refs if ref.get('source_name') == 'mitre-attack'), None)
        
        if not mitre_ref:
            logger.warning(f"No MITRE reference found for group {stix_obj['id']}")
            return 'skipped'
        
        group_id = mitre_ref['external_id']
        
        # Get associated techniques through relationships
        associated_techniques = self._get_related_technique_ids(stix_obj['id'], memory_store)
        
        # Check if group exists
        existing_group = repo.session.query(MitreGroup).filter_by(group_id=group_id).first()
        
        group_data = {
            'group_id': group_id,
            'name': stix_obj['name'],
            'aliases': stix_obj.get('aliases', []),
            'description': stix_obj.get('description', ''),
            'associated_techniques': associated_techniques,
            'external_references': {
                'stix_id': stix_obj['id'],
                'external_references': external_refs,
                'domain': domain
            }
        }
        
        if existing_group:
            # Update existing group
            for key, value in group_data.items():
                if key != 'group_id':  # Don't update primary identifier
                    setattr(existing_group, key, value)
            existing_group.updated_date = utc_now()
            logger.info(f"Updated group: {group_id}")
            return 'updated'
        else:
            # Create new group
            new_group = MitreGroup(**group_data)
            repo.session.add(new_group)
            logger.info(f"Created group: {group_id}")
            return 'created'
    
    def _process_software(self, stix_obj: Dict[str, Any], repo: MitreRepository, memory_store: MemoryStore, domain: str) -> str:
        """Process MITRE software (malware/tool) STIX object"""
        external_refs = stix_obj.get('external_references', [])
        mitre_ref = next((ref for ref in external_refs if ref.get('source_name') == 'mitre-attack'), None)
        
        if not mitre_ref:
            logger.warning(f"No MITRE reference found for software {stix_obj['id']}")
            return 'skipped'
        
        software_id = mitre_ref['external_id']
        
        # Get associated techniques through relationships
        associated_techniques = self._get_related_technique_ids(stix_obj['id'], memory_store)
        
        # Check if software exists
        existing_software = repo.session.query(MitreSoftware).filter_by(software_id=software_id).first()
        
        software_data = {
            'software_id': software_id,
            'name': stix_obj['name'],
            'aliases': stix_obj.get('x_mitre_aliases', []),
            'description': stix_obj.get('description', ''),
            'software_type': stix_obj['type'],  # 'malware' or 'tool'
            'platforms': stix_obj.get('x_mitre_platforms', []),
            'associated_techniques': associated_techniques,
            'external_references': {
                'stix_id': stix_obj['id'],
                'external_references': external_refs,
                'domain': domain
            }
        }
        
        if existing_software:
            # Update existing software
            for key, value in software_data.items():
                if key != 'software_id':  # Don't update primary identifier
                    setattr(existing_software, key, value)
            existing_software.updated_date = utc_now()
            logger.info(f"Updated software: {software_id}")
            return 'updated'
        else:
            # Create new software
            new_software = MitreSoftware(**software_data)
            repo.session.add(new_software)
            logger.info(f"Created software: {software_id}")
            return 'created'
    
    def _get_related_technique_ids(self, source_id: str, memory_store: MemoryStore) -> List[str]:
        """Get technique IDs associated with a source object through relationships"""
        technique_ids = []
        
        # Find relationships where this object uses techniques
        relationships = memory_store.query([
            Filter('type', '=', 'relationship'),
            Filter('source_ref', '=', source_id),
            Filter('relationship_type', '=', 'uses')
        ])
        
        for rel in relationships:
            target_obj = memory_store.get(rel.target_ref)
            if target_obj and target_obj.type == 'attack-pattern':
                # Get MITRE technique ID
                external_refs = getattr(target_obj, 'external_references', [])
                mitre_ref = next((ref for ref in external_refs if ref.get('source_name') == 'mitre-attack'), None)
                if mitre_ref:
                    technique_ids.append(mitre_ref['external_id'])
        
        return technique_ids

def lambda_handler(event, context):
    """
    AWS Lambda handler for STIX processing
    
    Event parameters:
    - source: 'enterprise', 'mobile', 'ics', or 'all' (default: 'enterprise')
    - force_update: boolean to force full update (default: False)
    - custom_url: optional custom STIX data URL
    
    Environment Variables Required:
    - DB_HOST: Database hostname
    - DB_SECRET_ARN: ARN of secret containing database credentials
    - DB_NAME: Database name (optional, defaults to 'saint')
    - DB_USER: Database username (optional, defaults to 'postgres')
    """
    
    try:
        # Parse event parameters
        source = event.get('source', 'enterprise').lower()
        force_update = event.get('force_update', False)
        custom_url = event.get('custom_url')
        
        logger.info(f"Starting STIX processing - Source: {source}, Force update: {force_update}")
        
        processor = STIXProcessor()
        
        total_created = 0
        total_updated = 0
        total_errors = 0
        
        # Determine which sources to process
        sources_to_process = []
        
        if custom_url:
            sources_to_process.append(('custom', custom_url))
        elif source == 'all':
            sources_to_process = [
                ('enterprise', processor.MITRE_ENTERPRISE_URL),
                ('mobile', processor.MITRE_MOBILE_URL),
                ('ics', processor.MITRE_ICS_URL)
            ]
        elif source == 'enterprise':
            sources_to_process.append(('enterprise', processor.MITRE_ENTERPRISE_URL))
        elif source == 'mobile':
            sources_to_process.append(('mobile', processor.MITRE_MOBILE_URL))
        elif source == 'ics':
            sources_to_process.append(('ics', processor.MITRE_ICS_URL))
        else:
            raise ValueError(f"Invalid source: {source}")
        
        # Process each source
        for domain, url in sources_to_process:
            logger.info(f"Processing {domain} STIX data from {url}")
            
            # Download STIX data
            stix_data = processor.download_stix_data(url)
            if not stix_data:
                logger.error(f"Failed to download STIX data for {domain}")
                total_errors += 1
                continue
            
            # Process STIX bundle
            created, updated, errors = processor.process_stix_bundle(stix_data, domain)
            total_created += created
            total_updated += updated
            total_errors += errors
        
        # Prepare response
        response = {
            'statusCode': 200 if total_errors == 0 else 207,  # 207 for partial success
            'body': {
                'message': 'STIX processing completed',
                'results': {
                    'created': total_created,
                    'updated': total_updated,
                    'errors': total_errors
                },
                'processing_time': context.get_remaining_time_in_millis() if context else None,
                'timestamp': datetime.now(timezone.utc).isoformat()
            }
        }
        
        logger.info(f"STIX processing completed successfully: {response['body']['results']}")
        return response
        
    except Exception as e:
        logger.error(f"Fatal error in STIX processing: {e}", exc_info=True)
        
        return {
            'statusCode': 500,
            'body': {
                'error': 'Internal server error during STIX processing',
                'message': str(e),
                'timestamp': datetime.now(timezone.utc).isoformat()
            }
        }