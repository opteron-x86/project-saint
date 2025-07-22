<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 37ba2d8 (Initial commit)
# trinity_cyber_processor.py
"""
Processes Trinity Cyber rules from a JSON file in S3.
- Maps Trinity Cyber 'formula' objects to the SAINT database schema.
- Creates mappings between rules and MITRE ATT&CK techniques.
- CVE mapping is handled by a separate, dedicated Lambda function.
"""
<<<<<<< HEAD
import json
import logging
import re
import boto3
from typing import Dict, List, Any, Optional

# Import from the saint-datamodel layer
from saint_datamodel import db_session, RuleRepository, MitreRepository
from saint_datamodel.models import RuleSource, DetectionRule, RuleMitreMapping
from saint_datamodel.utils import generate_rule_hash, normalize_metadata

# --- Logging and Clients ---
logger = logging.getLogger()
logger.setLevel(logging.INFO)
s3_client = boto3.client('s3')

# Regex to extract MITRE Technique IDs (e.g., T1190 or TA0001) from tag values
MITRE_ID_REGEX = re.compile(r'\((T\d{4}(?:\.\d{3})?|TA\d{4})\)')

class TrinityCyberProcessor:
    SOURCE_NAME = "Trinity Cyber"

    def __init__(self):
        self.processed_count = 0
        self.created_count = 0
        self.updated_count = 0
        self.mitre_mappings_created = 0
        self.error_count = 0

    def get_or_create_source(self, session) -> RuleSource:
        """Gets or creates the 'Trinity Cyber' RuleSource."""
        source = session.query(RuleSource).filter_by(name=self.SOURCE_NAME).first()
        if source:
            return source
        new_source = RuleSource(name=self.SOURCE_NAME, description="Detection rules from Trinity Cyber.", source_type="Vendor", base_url="https://portal.trinitycyber.com")
        session.add(new_source)
        session.flush()
        return new_source

    def _map_and_upsert_rule(self, rule_data: Dict[str, Any], rule_repo: RuleRepository, source_id: int) -> Optional[DetectionRule]:
        """Maps TC data to the DetectionRule model and upserts it."""
        rule_id = rule_data.get('formulaId')
        if not rule_id:
            logger.warning("Skipping rule with no 'formulaId'.")
            return None

        # Store the original, unmodified JSON in the rule_content field
        rule_content = json.dumps(rule_data)
        rule_hash = generate_rule_hash(rule_content)

        flat_tags = [f"{tag.get('category', 'tag')}:{tag.get('value', '')}" for tag in rule_data.get('tags', [])]
        description = next(iter(rule_data.get('descriptions', [])), {}).get('description', '')

        # Trinity Cyber rules are for their Inline Active Prevention (IAP) platform
        rule_platforms = ["IAP"]

        rule_metadata = {
            'createTime': rule_data.get('createTime'),
            'updateTime': rule_data.get('updateTime'),
            'rule_platforms': rule_platforms,
            'validation_status': rule_data.get('validation_status', 'unknown')
        }

        rule_payload = {
            'name': rule_data.get('title'),
            'description': description,
            'rule_content': rule_content,
            'rule_type': 'tcl',
            'severity': rule_data.get('severity'),
            'is_active': rule_data.get('enabled', True),
            'tags': flat_tags,
            'rule_metadata': normalize_metadata(rule_metadata)
        }

        db_rule = rule_repo.get_by_source_and_rule_id(source_id=source_id, rule_id=str(rule_id))
        if db_rule:
            if db_rule.hash != rule_hash:
                rule_repo.update(db_rule.id, hash=rule_hash, **rule_payload)
                self.updated_count += 1
        else:
            db_rule = rule_repo.create(rule_id=str(rule_id), source_id=source_id, hash=rule_hash, **rule_payload)
            self.created_count += 1

        return db_rule

    def _map_mitre_techniques(self, db_rule: DetectionRule, rule_data: Dict[str, Any], mitre_repo: MitreRepository):
        """Finds MITRE techniques in tags and creates mappings."""
        unique_technique_ids = set()
        for tag in rule_data.get('tags', []):
            tag_value = tag.get('value', '')
            match = MITRE_ID_REGEX.search(tag_value)
            if match:
                technique_id_str = match.group(1).upper()
                if not technique_id_str.startswith('TA'): # We only want to map techniques, not tactics
                    unique_technique_ids.add(technique_id_str)

        for technique_id in unique_technique_ids:
            technique = mitre_repo.get_technique_by_id(technique_id)
            if not technique:
                logger.warning(f"Could not find MITRE technique '{technique_id}' in DB for rule '{db_rule.name}'.")
                continue

            existing_mapping = mitre_repo.session.query(RuleMitreMapping).filter_by(
                rule_id=db_rule.id, technique_id=technique.id
            ).first()

            if not existing_mapping:
                new_mapping = RuleMitreMapping(rule_id=db_rule.id, technique_id=technique.id, mapping_source=self.SOURCE_NAME)
                mitre_repo.session.add(new_mapping)
                self.mitre_mappings_created += 1

    def process_s3_object(self, bucket: str, key: str):
        """Main processing logic for the S3 file."""
        logger.info(f"Processing S3 object: s3://{bucket}/{key}")
        try:
            s3_object = s3_client.get_object(Bucket=bucket, Key=key)
            ruleset = json.loads(s3_object['Body'].read().decode('utf-8'))

            with db_session() as session:
                rule_repo = RuleRepository(session)
                mitre_repo = MitreRepository(session)
                tc_source = self.get_or_create_source(session)

                for rule_data in ruleset:
                    self.processed_count += 1
                    try:
                        db_rule = self._map_and_upsert_rule(rule_data, rule_repo, tc_source.id)
                        if not db_rule:
                            continue

                        self._map_mitre_techniques(db_rule, rule_data, mitre_repo)
                        # CVE mapping is handled by the dedicated cve-updater lambda

                        session.commit()

                    except Exception as e:
                        session.rollback()
                        self.error_count += 1
                        logger.error(f"Failed to process rule {rule_data.get('formulaId')}: {e}", exc_info=True)

        except Exception as e:
            self.error_count += 1
            logger.error(f"Fatal error processing S3 object s3://{bucket}/{key}: {e}", exc_info=True)

        logger.info(f"Processing finished. Rules: {self.processed_count}, MITRE Mappings: {self.mitre_mappings_created}, Errors: {self.error_count}")

def lambda_handler(event, context):
    """Main handler triggered by S3 event."""
    processor = TrinityCyberProcessor()
    for record in event.get('Records', []):
        bucket = record['s3']['bucket']['name']
        key = record['s3']['object']['key']

        if key.startswith('trinitycyber/'):
            processor.process_s3_object(bucket=bucket, key=key)
        else:
            logger.warning(f"Skipping file not in 'trinitycyber/' folder: {key}")

    return {'statusCode': 200, 'body': json.dumps({'message': 'Processing complete.'})}
=======
# lambda_function.py
# Refactored for a simpler, more direct architecture.
# This version removes the dependency on the generic 'dimensional.main' and 'dimensional.config' modules.

import os
=======
>>>>>>> 37ba2d8 (Initial commit)
import json
import logging
import re
import boto3
from typing import Dict, List, Any, Optional

# Import from the saint-datamodel layer
from saint_datamodel import db_session, RuleRepository, MitreRepository
from saint_datamodel.models import RuleSource, DetectionRule, RuleMitreMapping
from saint_datamodel.utils import generate_rule_hash, normalize_metadata

# --- Logging and Clients ---
logger = logging.getLogger()
logger.setLevel(logging.INFO)
s3_client = boto3.client('s3')

# Regex to extract MITRE Technique IDs (e.g., T1190 or TA0001) from tag values
MITRE_ID_REGEX = re.compile(r'\((T\d{4}(?:\.\d{3})?|TA\d{4})\)')

class TrinityCyberProcessor:
    SOURCE_NAME = "Trinity Cyber"

    def __init__(self):
        self.processed_count = 0
        self.created_count = 0
        self.updated_count = 0
        self.mitre_mappings_created = 0
        self.error_count = 0

    def get_or_create_source(self, session) -> RuleSource:
        """Gets or creates the 'Trinity Cyber' RuleSource."""
        source = session.query(RuleSource).filter_by(name=self.SOURCE_NAME).first()
        if source:
            return source
        new_source = RuleSource(name=self.SOURCE_NAME, description="Detection rules from Trinity Cyber.", source_type="Vendor", base_url="https://portal.trinitycyber.com")
        session.add(new_source)
        session.flush()
        return new_source

    def _map_and_upsert_rule(self, rule_data: Dict[str, Any], rule_repo: RuleRepository, source_id: int) -> Optional[DetectionRule]:
        """Maps TC data to the DetectionRule model and upserts it."""
        rule_id = rule_data.get('formulaId')
        if not rule_id:
            logger.warning("Skipping rule with no 'formulaId'.")
            return None

        # Store the original, unmodified JSON in the rule_content field
        rule_content = json.dumps(rule_data)
        rule_hash = generate_rule_hash(rule_content)

        flat_tags = [f"{tag.get('category', 'tag')}:{tag.get('value', '')}" for tag in rule_data.get('tags', [])]
        description = next(iter(rule_data.get('descriptions', [])), {}).get('description', '')

        # Trinity Cyber rules are for their Inline Active Prevention (IAP) platform
        rule_platforms = ["IAP"]

        rule_metadata = {
            'createTime': rule_data.get('createTime'),
            'updateTime': rule_data.get('updateTime'),
            'rule_platforms': rule_platforms,
            'validation_status': rule_data.get('validation_status', 'unknown')
        }

        rule_payload = {
            'name': rule_data.get('title'),
            'description': description,
            'rule_content': rule_content,
            'rule_type': 'tcl',
            'severity': rule_data.get('severity'),
            'is_active': rule_data.get('enabled', True),
            'tags': flat_tags,
            'rule_metadata': normalize_metadata(rule_metadata)
        }

        db_rule = rule_repo.get_by_source_and_rule_id(source_id=source_id, rule_id=str(rule_id))
        if db_rule:
            if db_rule.hash != rule_hash:
                rule_repo.update(db_rule.id, hash=rule_hash, **rule_payload)
                self.updated_count += 1
        else:
            db_rule = rule_repo.create(rule_id=str(rule_id), source_id=source_id, hash=rule_hash, **rule_payload)
            self.created_count += 1

        return db_rule

    def _map_mitre_techniques(self, db_rule: DetectionRule, rule_data: Dict[str, Any], mitre_repo: MitreRepository):
        """Finds MITRE techniques in tags and creates mappings."""
        unique_technique_ids = set()
        for tag in rule_data.get('tags', []):
            tag_value = tag.get('value', '')
            match = MITRE_ID_REGEX.search(tag_value)
            if match:
                technique_id_str = match.group(1).upper()
                if not technique_id_str.startswith('TA'): # We only want to map techniques, not tactics
                    unique_technique_ids.add(technique_id_str)

        for technique_id in unique_technique_ids:
            technique = mitre_repo.get_technique_by_id(technique_id)
            if not technique:
                logger.warning(f"Could not find MITRE technique '{technique_id}' in DB for rule '{db_rule.name}'.")
                continue

            existing_mapping = mitre_repo.session.query(RuleMitreMapping).filter_by(
                rule_id=db_rule.id, technique_id=technique.id
            ).first()

            if not existing_mapping:
                new_mapping = RuleMitreMapping(rule_id=db_rule.id, technique_id=technique.id, mapping_source=self.SOURCE_NAME)
                mitre_repo.session.add(new_mapping)
                self.mitre_mappings_created += 1

    def process_s3_object(self, bucket: str, key: str):
        """Main processing logic for the S3 file."""
        logger.info(f"Processing S3 object: s3://{bucket}/{key}")
        try:
            s3_object = s3_client.get_object(Bucket=bucket, Key=key)
            ruleset = json.loads(s3_object['Body'].read().decode('utf-8'))

            with db_session() as session:
                rule_repo = RuleRepository(session)
                mitre_repo = MitreRepository(session)
                tc_source = self.get_or_create_source(session)

                for rule_data in ruleset:
                    self.processed_count += 1
                    try:
                        db_rule = self._map_and_upsert_rule(rule_data, rule_repo, tc_source.id)
                        if not db_rule:
                            continue

                        self._map_mitre_techniques(db_rule, rule_data, mitre_repo)
                        # CVE mapping is handled by the dedicated cve-updater lambda

                        session.commit()

                    except Exception as e:
                        session.rollback()
                        self.error_count += 1
                        logger.error(f"Failed to process rule {rule_data.get('formulaId')}: {e}", exc_info=True)

        except Exception as e:
            self.error_count += 1
            logger.error(f"Fatal error processing S3 object s3://{bucket}/{key}: {e}", exc_info=True)

        logger.info(f"Processing finished. Rules: {self.processed_count}, MITRE Mappings: {self.mitre_mappings_created}, Errors: {self.error_count}")

def lambda_handler(event, context):
    """Main handler triggered by S3 event."""
    processor = TrinityCyberProcessor()
    for record in event.get('Records', []):
        bucket = record['s3']['bucket']['name']
        key = record['s3']['object']['key']

        if key.startswith('trinitycyber/'):
            processor.process_s3_object(bucket=bucket, key=key)
        else:
            logger.warning(f"Skipping file not in 'trinitycyber/' folder: {key}")

<<<<<<< HEAD
    db_session = None
    try:
        # 1. Directly instantiate the connector
        connector = TrinityCyberAPIConnector(
            secret=api_key,
            timeout_sec=60,
            retry_count=3,
            retry_pause_sec=5
        )

        # 2. Directly instantiate the adapter
        adapter = TrinityCyberAdapter(
            source='trinitycyber_1',
            overrides={
                'platform': os.environ.get('TRINITYCYBER_PLATFORM'),
                'platform_aor': os.environ.get('TRINITYCYBER_PLATFORM_AOR'),
                'source_org': os.environ.get('TRINITYCYBER_SOURCE_ORG'),
            }
        )

        # 3. Run the simplified workflow
        logger.info("Fetching data from Trinity Cyber connector...")
        raw_data = connector.fetch_data()

        if not raw_data:
            raise RuntimeError("Connector returned no data from Trinity Cyber API.")

        logger.info("Processing data with Trinity Cyber adapter...")
        rules_data = adapter.process_data(raw_data)

        if not rules_data:
            logger.warning("Adapter processed the data but returned an empty list.")
            return {'statusCode': 200, 'body': json.dumps('No new rules to process.')}

        # 4. Process data and update database
        db_session = get_session()
        processed_ids = process_and_upsert_rules(rules_data, db_session)
        prune_old_rules(processed_ids, db_session)

        logger.info("Committing all transactions.")
        db_session.commit()

        logger.info("--- Trinity Cyber Rule Processor Lambda finished successfully. ---")
        return {'statusCode': 200, 'body': json.dumps('Rule processing completed successfully.')}

    except Exception as e:
        logger.critical(f"A critical error occurred: {e}", exc_info=True)
        if db_session: db_session.rollback()
        return {'statusCode': 500, 'body': json.dumps(f'An unexpected error occurred: {str(e)}')}
    finally:
        if db_session: db_session.close()
>>>>>>> a6cbcab (Complete infrastructure overhaul to serverless, including backend code)
=======
    return {'statusCode': 200, 'body': json.dumps({'message': 'Processing complete.'})}
>>>>>>> 37ba2d8 (Initial commit)
