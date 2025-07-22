"""
Database connection and session management for AWS Lambda
"""

import os
import json
import logging
from contextlib import contextmanager
from typing import Generator, Optional, Dict, Any

import boto3
from botocore.exceptions import ClientError, BotoCoreError
from sqlalchemy import create_engine, event
from sqlalchemy.engine import Engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import NullPool

# Configure logging
logger = logging.getLogger(__name__)

class DatabaseManager:
    """Singleton database manager optimized for AWS Lambda"""
    
    _instance: Optional['DatabaseManager'] = None
    _engine: Optional[Engine] = None
    _session_factory: Optional[sessionmaker] = None
    _cached_secret: Optional[Dict[str, Any]] = None
    
    def __new__(cls) -> 'DatabaseManager':
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self):
        if not hasattr(self, '_initialized'):
            self._initialized = True
            self._setup_database()
    
    def _get_secret_from_arn(self, secret_arn: str) -> Dict[str, Any]:
        """Retrieve database credentials from AWS Secrets Manager"""
        
        # Return cached secret if available (for Lambda container reuse)
        if self._cached_secret is not None:
            return self._cached_secret
        
        try:
            # Create Secrets Manager client
            session = boto3.session.Session()
            client = session.client('secretsmanager')
            
            # Retrieve the secret
            response = client.get_secret_value(SecretId=secret_arn)
            
            # Parse the secret string
            secret_dict = json.loads(response['SecretString'])
            
            # Cache the secret for this Lambda execution
            self._cached_secret = secret_dict
            
            logger.info(f"Successfully retrieved secret from ARN: {secret_arn}")
            return secret_dict
            
        except ClientError as e:
            error_code = e.response['Error']['Code']
            if error_code == 'DecryptionFailureException':
                logger.error("Secrets Manager can't decrypt the protected secret text using the provided KMS key")
            elif error_code == 'InternalServiceErrorException':
                logger.error("An error occurred on the server side")
            elif error_code == 'InvalidParameterException':
                logger.error("Invalid parameter provided to Secrets Manager")
            elif error_code == 'InvalidRequestException':
                logger.error("Invalid request to Secrets Manager")
            elif error_code == 'ResourceNotFoundException':
                logger.error(f"Secret not found: {secret_arn}")
            else:
                logger.error(f"Unexpected error retrieving secret: {e}")
            raise
        except (BotoCoreError, json.JSONDecodeError) as e:
            logger.error(f"Error retrieving or parsing secret from {secret_arn}: {e}")
            raise
    
    def _get_database_url(self) -> str:
        """Construct database URL from environment variables and Secrets Manager"""
        db_host = os.getenv('DB_HOST', 'localhost')
        db_port = os.getenv('DB_PORT', '5432')
        db_name = os.getenv('DB_NAME', 'saint')
        db_user = os.getenv('DB_USER', 'postgres')
        
        # Get password from Secrets Manager or environment variable (fallback)
        db_secret_arn = os.getenv('DB_SECRET_ARN')
        
        if db_secret_arn:
            try:
                secret_dict = self._get_secret_from_arn(db_secret_arn)
                
                # Try different common key names for the password in the secret
                db_password = (
                    secret_dict.get('password') or 
                    secret_dict.get('Password') or 
                    secret_dict.get('db_password') or 
                    secret_dict.get('DB_PASSWORD')
                )
                
                if not db_password:
                    available_keys = list(secret_dict.keys())
                    logger.error(f"Password not found in secret. Available keys: {available_keys}")
                    raise ValueError("Password key not found in secret")
                
                # Override other connection parameters if present in secret
                db_host = secret_dict.get('host', db_host)
                db_port = secret_dict.get('port', db_port)
                db_name = secret_dict.get('dbname', secret_dict.get('database', db_name))
                db_user = secret_dict.get('username', secret_dict.get('user', db_user))
                
                logger.info("Using database credentials from Secrets Manager")
                
            except Exception as e:
                logger.error(f"Failed to retrieve database credentials from Secrets Manager: {e}")
                raise
        else:
            # Fallback to environment variable (not recommended for production)
            db_password = os.getenv('DB_PASSWORD', '')
            logger.warning("DB_SECRET_ARN not set, falling back to DB_PASSWORD environment variable")
        
        return f"postgresql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"
    
    def _setup_database(self) -> None:
        """Initialize database connection"""
        database_url = self._get_database_url()
        
        # Optimized for Lambda - no connection pooling
        self._engine = create_engine(
            database_url,
            poolclass=NullPool,  # No connection pooling for Lambda
            echo=os.getenv('DB_ECHO', 'false').lower() == 'true',
            connect_args={
                "connect_timeout": 30,
                "application_name": "saint-lambda"
            }
        )
        
        # Configure session factory
        self._session_factory = sessionmaker(
            bind=self._engine,
            autoflush=False,
            autocommit=False
        )
        
        # Add connection event listeners
        self._setup_event_listeners()
    
    def _setup_event_listeners(self) -> None:
        """Setup SQLAlchemy event listeners for monitoring"""
        @event.listens_for(self._engine, "connect")
        def set_sqlite_pragma(dbapi_connection, connection_record):
            # PostgreSQL-specific optimizations can go here
            pass
        
        @event.listens_for(self._engine, "before_cursor_execute")
        def receive_before_cursor_execute(conn, cursor, statement, parameters, context, executemany):
            context._query_start_time = logger.getEffectiveLevel() <= logging.DEBUG
    
    def get_session(self) -> Session:
        """Get a new database session"""
        if self._session_factory is None:
            self._setup_database()
        return self._session_factory()
    
    @contextmanager
    def session_scope(self) -> Generator[Session, None, None]:
        """Provide a transactional scope around a series of operations"""
        session = self.get_session()
        try:
            yield session
            session.commit()
        except Exception:
            session.rollback()
            raise
        finally:
            session.close()

# Global database manager instance
db_manager = DatabaseManager()

def get_db_session() -> Session:
    """Get a database session - convenience function"""
    return db_manager.get_session()

@contextmanager
def db_session() -> Generator[Session, None, None]:
    """Context manager for database sessions"""
    with db_manager.session_scope() as session:
        yield session
