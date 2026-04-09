"""
Shared Pydantic schemas - pagination, responses, common types
"""

from pydantic import BaseModel
from typing import TypeVar, Generic, Optional, List
from datetime import datetime


T = TypeVar("T")


class PaginationParams(BaseModel):
    """Pagination query parameters"""
    page: int = 1
    page_size: int = 20

    @property
    def offset(self) -> int:
        return (self.page - 1) * self.page_size


class PaginatedResponse(BaseModel, Generic[T]):
    """Paginated response wrapper"""
    items: List[T]
    total: int
    page: int
    page_size: int
    total_pages: int


class MessageResponse(BaseModel):
    """Generic message response"""
    message: str
    success: bool = True


class ErrorResponse(BaseModel):
    """Error response"""
    detail: str
    error_code: Optional[str] = None


class TimestampMixin(BaseModel):
    """Mixin for timestamp fields in responses"""
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
