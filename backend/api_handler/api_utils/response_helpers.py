# api_utils/response_helpers.py
"""
Utilities for creating standardized API Gateway JSON responses.
"""
import json
from decimal import Decimal
from datetime import datetime

class CustomJSONEncoder(json.JSONEncoder):
    """Custom JSON encoder to handle types like Decimal and datetime."""
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        if isinstance(obj, datetime):
            return obj.isoformat()
        return super(CustomJSONEncoder, self).default(obj)

def create_api_response(status_code: int, body: any) -> dict:
    """Creates a standardized API Gateway response."""
    return {
        "statusCode": status_code,
        "headers": {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": True,
            "Content-Type": "application/json"
        },
        "body": json.dumps(body, cls=CustomJSONEncoder)
    }

def create_error_response(status_code: int, error_message: str, details: any = None) -> dict:
    """Creates a standardized error response."""
    error_body = {"error": error_message}
    if details:
        error_body["details"] = details
    return create_api_response(status_code, error_body)

def create_success_response(data: any, message: str = None) -> dict:
    """Creates a standardized success response."""
    response_body = data
    if message:
        if isinstance(response_body, dict):
            response_body["message"] = message
        else:
            response_body = {"data": data, "message": message}
    return create_api_response(200, response_body)
