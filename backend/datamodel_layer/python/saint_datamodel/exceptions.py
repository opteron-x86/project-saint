"""
Custom exceptions for the data model layer
"""

class SaintDataModelError(Exception):
    """Base exception for data model layer"""
    pass

class ValidationError(SaintDataModelError):
    """Validation error"""
    pass

class NotFoundError(SaintDataModelError):
    """Entity not found error"""
    pass

class DuplicateError(SaintDataModelError):
    """Duplicate entity error"""
    pass

class DatabaseError(SaintDataModelError):
    """Database operation error"""
    pass
