"""
Base model classes and mixins
"""

from datetime import datetime
from typing import Dict, Any

from sqlalchemy import Column, Integer, String, Text, Boolean, TIMESTAMP, text
from sqlalchemy.orm import Mapped, mapped_column, declarative_base
from sqlalchemy.dialects.postgresql import JSONB

# Base class for all models
Base = declarative_base()

class TimestampMixin:
    """Mixin for created/updated timestamps"""
    created_date: Mapped[datetime] = mapped_column(
        TIMESTAMP, 
        default=datetime.utcnow,
        server_default=text('CURRENT_TIMESTAMP')
    )
    updated_date: Mapped[datetime] = mapped_column(
        TIMESTAMP,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        server_default=text('CURRENT_TIMESTAMP')
    )
