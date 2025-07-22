# elastic_rule_processor.py
"""
Elastic Detection Rule Processor Lambda Function for SAINT
Processes Elastic rules, normalizes their metadata, and maps them to 
MITRE ATT&CK techniques and CVEs.
"""

import json
import logging
import os
import re
from datetime import datetime, timezone
from typing import Dict, Any, Optional, List, Set

import boto3

from saint_datamodel import db_session
from saint_datamodel.models import RuleSource, DetectionRule, RuleMitreMapping, MitreTechnique, RuleCveMapping
from saint_datamodel.repositories import RuleRepository, MitreRepository
from saint_datamodel.utils import generate_rule_hash, normalize_metadata
from saint_datamodel.exceptions import DatabaseError

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

s3_client = boto3.client('s3')

CVE_REGEX = re.compile(r'CVE-\d{4}-\d{4,}', re.IGNORECASE)

class ElasticRuleProcessor:
    SOURCE_NAME = "Elastic"

    # Mapping of keywords in tags to normalized platform names
    PLATFORM_KEYWORDS = {
        "aws": "AWS",
        "azure": "Azure",
        "gcp": "GCP",
        "oci": "OCI",
        "windows": "Windows",
        "linux": "Linux",
        "macos": "macOS",
        "kubernetes": "Containers",
        "o365": "Office 365",
        "office": "Office 365"
    }

    def __init__(self):
        self.processed_count = 0
        self.created_count = 0
        self.updated_count = 0
        self.error_count = 0
        self.skipped_lines = 0
        self.mitre_mappings_created = 0
        self.cve_mappings_created = 0

    def get_or_create_source(self, session) -> RuleSource:
        source = session.query(RuleSource).filter_by(name=self.SOURCE_NAME).first()
        if source:
            return source
        logger.info(f"Rule source '{self.SOURCE_NAME}' not found, creating it.")
        new_source = RuleSource(
            name=self.SOURCE_NAME,
            description="Detection rules imported from an Elastic SIEM export.",
            source_type="SIEM",
            base_url=os.environ.get('KIBANA_URL'),
            is_active=True
        )
        session.add(new_source)
        session.flush()
        return new_source

    def _extract_platforms_from_tags(self, tags: List[str]) -> List[str]:
        """Extracts and normalizes platform names from a list of tags."""
        platforms: Set[str] = set()
        for tag in tags:
            tag_lower = tag.lower()
            for keyword, platform_name in self.PLATFORM_KEYWORDS.items():
                if keyword in tag_lower:
                    platforms.add(platform_name)
        return sorted(list(platforms))

    def _build_metadata(self, rule_json: Dict[str, Any]) -> Dict[str, Any]:
        """Builds the metadata object, including normalized rule platforms."""
        tags = rule_json.get('tags', [])
        rule_platforms = self._extract_platforms_from_tags(tags)

        metadata = {
            'risk_score': rule_json.get('risk_score'),
            'references': rule_json.get('references', []),
            'false_positives': rule_json.get('false_positives', []),
            'author': rule_json.get('author', []),
            'license': rule_json.get('license'),
            'interval': rule_json.get('interval'),
            'from': rule_json.get('from'),
            'to': rule_json.get('to'),
            'language': rule_json.get('language'),
            'threat_mapping': rule_json.get('threat', []),
            'rule_platforms': rule_platforms,
        }
        return normalize_metadata(metadata)

    def _map_mitre_techniques(self, db_rule: DetectionRule, mitre_repo: MitreRepository):
        """
        Parses MITRE techniques from rule metadata, ensuring uniqueness, 
        and creates mappings in the database.
        """
        threat_mappings = db_rule.rule_metadata.get('threat_mapping', [])
        if not threat_mappings:
            return

        unique_technique_ids = set()
        for threat in threat_mappings:
            for technique_info in threat.get('technique', []):
                if technique_info.get('id'):
                    unique_technique_ids.add(technique_info['id'])
                for sub_technique_info in technique_info.get('subtechnique', []):
                     if sub_technique_info.get('id'):
                        unique_technique_ids.add(sub_technique_info['id'])

        for technique_id_str in unique_technique_ids:
            technique = mitre_repo.get_technique_by_id(technique_id_str)
            if not technique:
                logger.warning(f"Could not find MITRE technique '{technique_id_str}' in DB for rule '{db_rule.name}'.")
                continue

            existing_mapping = mitre_repo.session.query(RuleMitreMapping).filter_by(
                rule_id=db_rule.id,
                technique_id=technique.id
            ).first()

            if not existing_mapping:
                new_mapping = RuleMitreMapping(
                    rule_id=db_rule.id,
                    technique_id=technique.id,
                    mapping_source=self.SOURCE_NAME
                )
                mitre_repo.session.add(new_mapping)
                self.mitre_mappings_created += 1

    def _map_cves(self, db_rule: DetectionRule, session):
        """Parses CVEs from rule tags and creates mappings."""
        # This function is a placeholder as CVEs are handled by a dedicated lambda
        pass

    def process_rule_line(self, rule_json: Dict[str, Any], rule_repo: RuleRepository, mitre_repo: MitreRepository, source_id: int, session) -> None:
        """Processes a single rule and handles its mappings."""
        rule_id = rule_json.get('rule_id')
        if not rule_id:
            return

        rule_content = json.dumps(rule_json)
        rule_hash = generate_rule_hash(rule_content)

        rule_data = {
            'name': rule_json.get('name'),
            'description': rule_json.get('description'),
            'rule_content': rule_content,
            'rule_type': 'elastic',
            'severity': rule_json.get('severity'),
            'is_active': rule_json.get('enabled', False),
            'tags': rule_json.get('tags', []),
            'rule_metadata': self._build_metadata(rule_json)
        }

        db_rule = rule_repo.get_by_source_and_rule_id(source_id=source_id, rule_id=rule_id)
        if db_rule:
            if db_rule.hash != rule_hash:
                # Update the existing rule object's attributes directly
                for key, value in rule_data.items():
                    setattr(db_rule, key, value)
                db_rule.hash = rule_hash # Don't forget to update the hash
                self.updated_count += 1
        else:
            db_rule = rule_repo.create(rule_id=rule_id, source_id=source_id, hash=rule_hash, **rule_data)
            self.created_count += 1

        if db_rule:
            self._map_mitre_techniques(db_rule=db_rule, mitre_repo=mitre_repo)
            self._map_cves(db_rule=db_rule, session=session)

    def process_s3_object(self, bucket: str, key: str):
        """Main processing logic, handling each line in its own transaction."""
        logger.info(f"Processing S3 object: s3://{bucket}/{key}")
        try:
            s3_object = s3_client.get_object(Bucket=bucket, Key=key)
            for line in s3_object['Body'].iter_lines():
                line_str = line.decode('utf-8')
                if '"rule_id":' not in line_str:
                    self.skipped_lines += 1
                    continue

                try:
                    with db_session() as session:
                        rule_repo = RuleRepository(session)
                        mitre_repo = MitreRepository(session)
                        elastic_source = self.get_or_create_source(session)

                        self.processed_count += 1
                        rule_json = json.loads(line_str)
                        self.process_rule_line(
                            rule_json=rule_json,
                            rule_repo=rule_repo,
                            mitre_repo=mitre_repo,
                            source_id=elastic_source.id,
                            session=session
                        )
                except Exception as e:
                    self.error_count += 1
                    logger.error(f"Failed to process line due to: {e}. Line: {line_str}", exc_info=True)
        except Exception as e:
            self.error_count += 1
            logger.error(f"Fatal error processing S3 object s3://{bucket}/{key}: {e}", exc_info=True)

        logger.info(
            f"Processing finished. Rules: {self.processed_count}, "
            f"MITRE Mappings: {self.mitre_mappings_created}, CVE Mappings: {self.cve_mappings_created}, "
            f"Created: {self.created_count}, Updated: {self.updated_count}, Errors: {self.error_count}"
        )


def lambda_handler(event: Dict[str, Any], context: object) -> Dict[str, Any]:
    processor = ElasticRuleProcessor()
    for record in event.get('Records', []):
        s3_info = record.get('s3', {})
        bucket = s3_info.get('bucket', {}).get('name')
        key = s3_info.get('object', {}).get('key')

        if not bucket or not key or not key.endswith('.ndjson'):
            continue
        processor.process_s3_object(bucket=bucket, key=key)

    response_body = {
        'message': 'Elastic rule processing completed.',
        'results': {
            'rules_processed': processor.processed_count,
            'lines_skipped': processor.skipped_lines,
            'rules_created': processor.created_count,
            'rules_updated': processor.updated_count,
            'mitre_mappings_created': processor.mitre_mappings_created,
            'cve_mappings_created': processor.cve_mappings_created,
            'errors': processor.error_count
        },
        'timestamp': datetime.now(timezone.utc).isoformat()
    }
    return {
        'statusCode': 200 if processor.error_count == 0 else 207,
        'body': json.dumps(response_body)
    }
