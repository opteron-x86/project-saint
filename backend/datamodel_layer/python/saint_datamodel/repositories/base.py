"""
Base repository pattern implementation
"""

from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any, Tuple, Type, TypeVar, Generic

from sqlalchemy import func
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from ..models.base import Base

T = TypeVar('T', bound=Base)

class BaseRepository(Generic[T], ABC):
    """Base repository with common CRUD operations"""
    
    def __init__(self, session: Session, model_class: Type[T]):
        self.session = session
        self.model_class = model_class
    
    def get_by_id(self, id: int) -> Optional[T]:
        """Get entity by ID"""
        return self.session.get(self.model_class, id)
    
    def get_all(self, offset: int = 0, limit: int = 100) -> List[T]:
        """Get all entities with pagination"""
        return (
            self.session.query(self.model_class)
            .offset(offset)
            .limit(limit)
            .all()
        )
    
    def create(self, **kwargs) -> T:
        """Create new entity"""
        entity = self.model_class(**kwargs)
        self.session.add(entity)
        self.session.flush()
        return entity
    
    def update(self, id: int, **kwargs) -> Optional[T]:
        """Update entity by ID"""
        entity = self.get_by_id(id)
        if entity:
            for key, value in kwargs.items():
                if hasattr(entity, key):
                    setattr(entity, key, value)
            self.session.flush()
        return entity
    
    def delete(self, id: int) -> bool:
        """Delete entity by ID"""
        entity = self.get_by_id(id)
        if entity:
            self.session.delete(entity)
            self.session.flush()
            return True
        return False
    
    def count(self) -> int:
        """Count total entities"""
        return self.session.query(func.count(self.model_class.id)).scalar()
