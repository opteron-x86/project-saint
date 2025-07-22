# trinity_cyber_downloader.py
"""
Lambda function to download the latest ruleset from the Trinity Cyber GraphQL API
and save it to an S3 bucket for processing.
"""
import os
import json
import logging
import requests
import boto3
from datetime import datetime, timezone

# --- Logging Setup ---
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# --- Configuration ---
TC_API_URL = "https://portal.trinitycyber.com/graphql"
DESTINATION_S3_BUCKET_ENV = os.environ.get('DESTINATION_S3_BUCKET')
TC_API_SECRET_ARN = os.environ.get('TC_API_SECRET_ARN')
USER_AGENT = "SAINT-Data-Processor/1.0"

s3_client = boto3.client('s3')
secrets_client = boto3.client('secretsmanager')

def get_api_key() -> str:
    """Retrieves the Trinity Cyber API key from AWS Secrets Manager."""
    if not TC_API_SECRET_ARN:
        raise ValueError("TC_API_SECRET_ARN environment variable not set.")
    try:
        response = secrets_client.get_secret_value(SecretId=TC_API_SECRET_ARN)
        secret = json.loads(response['SecretString'])
        return secret['api_key']
    except Exception as e:
        logger.error(f"Failed to retrieve API key from Secrets Manager: {e}")
        raise

def build_graphql_query(end_cursor: str = None) -> str:
    """
    Constructs the GraphQL query for the 'formulas' endpoint,
    supporting pagination via an 'after' cursor.
    """
    # The 'after' argument is only included if an end_cursor is provided.
    after_arg = f', after: "{end_cursor}"' if end_cursor else ""
    
    # This query structure is based on your reference 'trinitycyber_connector.py'
    return f"""
        query GetRuleset {{
          formulas(first: 100{after_arg}) {{
            edges {{
              node {{
                formulaId
                title
                descriptions {{
                  description
                }}
                tags {{
                  category
                  value
                }}
                cves {{
                  id
                }}
                createTime
                updateTime
              }}
            }}
            pageInfo {{
              hasNextPage
              endCursor
            }}
          }}
        }}
    """

def lambda_handler(event, context):
    """Main handler to fetch all rules via paginated GraphQL and upload to S3."""
    if not DESTINATION_S3_BUCKET_ENV:
        logger.error("DESTINATION_S3_BUCKET environment variable is not set.")
        return {'statusCode': 500, 'body': json.dumps({'error': 'Configuration error.'})}

    try:
        # Correctly parse the bucket name from the environment variable (ARN or name)
        bucket_name = DESTINATION_S3_BUCKET_ENV
        if bucket_name.startswith('arn:'):
            bucket_name = bucket_name.split(':')[-1]

        api_key = get_api_key()
        headers = {
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json',
            'User-Agent': USER_AGENT
        }
        
        all_rules = []
        has_next_page = True
        end_cursor = None

        logger.info("Starting ruleset download from Trinity Cyber API with pagination.")
        
        while has_next_page:
            graphql_query = build_graphql_query(end_cursor)
            graphql_payload = {'query': graphql_query}

            logger.info(f"Fetching page with cursor: {end_cursor}")
            response = requests.post(TC_API_URL, headers=headers, json=graphql_payload, timeout=90)
            response.raise_for_status()
            
            response_data = response.json()

            if 'errors' in response_data:
                logger.error(f"GraphQL API returned errors: {response_data['errors']}")
                raise Exception("GraphQL query failed.")
            
            formulas_data = response_data.get('data', {}).get('formulas', {})
            page_info = formulas_data.get('pageInfo', {})
            
            page_rules = [edge['node'] for edge in formulas_data.get('edges', []) if 'node' in edge]
            all_rules.extend(page_rules)
            
            has_next_page = page_info.get('hasNextPage', False)
            end_cursor = page_info.get('endCursor')

        if not all_rules:
            logger.warning("Trinity Cyber API returned no rules.")
            return {'statusCode': 200, 'body': json.dumps({'message': 'No rules returned from API.'})}

        # Define the output filename with the 'trinitycyber/' prefix
        timestamp = datetime.now(timezone.utc).strftime('%Y-%m-%d-%H%M%S')
        file_key = f"trinitycyber/trinity-cyber-ruleset-{timestamp}.json"
        
        logger.info(f"Uploading {len(all_rules)} total rules to s3://{bucket_name}/{file_key}")
        
        s3_client.put_object(
            Bucket=bucket_name,
            Key=file_key,
            Body=json.dumps(all_rules, indent=2),
            ContentType='application/json'
        )
        
        success_message = f"Successfully downloaded and saved {len(all_rules)} rules to {file_key}."
        logger.info(success_message)
        return {
            'statusCode': 200,
            'body': json.dumps({'message': success_message, 'file': file_key})
        }

    except requests.exceptions.RequestException as e:
        logger.error(f"Failed to connect to Trinity Cyber API: {e}", exc_info=True)
        return {'statusCode': 502, 'body': json.dumps({'error': 'Could not connect to the ruleset API.'})}
    except Exception as e:
        logger.error(f"An unexpected error occurred: {e}", exc_info=True)
        return {'statusCode': 500, 'body': json.dumps({'error': 'An internal error occurred.'})}
