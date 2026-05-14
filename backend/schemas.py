from pydantic import BaseModel, field_validator
from typing import List, Optional
import auth_utils

class UserLogin(BaseModel):
    username: str
    password: str
    role: Optional[str] = None

class UserRegister(BaseModel):
    username: str
    password: str
    role: str  

    @field_validator("password")
    @classmethod
    def password_complexity(cls, v: str) -> str:
        is_valid, error_msg = auth_utils.validate_password_strength(v)
        if not is_valid:
            raise ValueError(error_msg)
        return v

    @field_validator("username")
    @classmethod
    def username_format(cls, v: str, info) -> str:
        role = info.data.get("role")
        if not role:
            return v
        expected_start = role.lower()
        if not v.lower().startswith(expected_start) or not v.lower().endswith("@streeling.ac.uk"):
            raise ValueError(f"Username must follow the structure '{expected_start}...@streeling.ac.uk'")
        return v

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    username: str

class TokenData(BaseModel):
    username: Optional[str] = None
    role: Optional[str] = None

class BookBase(BaseModel):
    id: str
    name: str 
    author: str
    status: str
    category: str
    releaseDate: str
    description: Optional[str] = None
    total_copies: Optional[int] = 3
    available_copies: Optional[int] = 3

class BookCreate(BookBase):
    pass

class Book(BookBase):
    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    password: Optional[str] = None
    is_locked: Optional[bool] = None

    @field_validator("password")
    @classmethod
    def password_complexity(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            is_valid, error_msg = auth_utils.validate_password_strength(v)
            if not is_valid:
                raise ValueError(error_msg)
        return v

class BookUpdate(BaseModel):
    name: Optional[str] = None
    author: Optional[str] = None
    status: Optional[str] = None
    category: Optional[str] = None
    releaseDate: Optional[str] = None
    description: Optional[str] = None
    total_copies: Optional[int] = None
    available_copies: Optional[int] = None

class LoanCreate(BaseModel):
    book_id: str
    book_name: str

class LoanUpdate(BaseModel):
    status: Optional[str] = None
    due_date: Optional[str] = None
    denial_reason: Optional[str] = None

class Loan(BaseModel):
    id: int
    user_id: int
    username: str
    book_id: str
    book_name: str
    status: str
    borrow_date: str
    due_date: Optional[str] = None
    denial_reason: Optional[str] = None

    class Config:
        from_attributes = True

class User(BaseModel):
    username: str
    role: str
    class Config:
        from_attributes = True

class SupplierCreate(BaseModel):
    id: str
    name: str
    contact: str
    phone: str
    status: str
    risk: str

class ProcurementOrderCreate(BaseModel):
    book_id: str
    book_name: str
    supplier_id: str
    quantity: int

class ProcurementOrderUpdate(BaseModel):
    status: Optional[str] = None
    received_date: Optional[str] = None

# Profile schemas
class UserProfile(BaseModel):
    id: int
    username: str
    role: str
    full_name: Optional[str] = None
    phone: Optional[str] = None
    location: str = "Streeling University Campus"
    organization: str = "Streeling University"
    avatar_path: Optional[str] = None
    
    class Config:
        from_attributes = True

class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    organization: Optional[str] = None

class AdminUserCreate(BaseModel):
    username: str
    password: str
    role: str
    full_name: str
    phone: Optional[str] = None

    @field_validator("password")
    @classmethod
    def password_complexity(cls, v: str) -> str:
        is_valid, error_msg = auth_utils.validate_password_strength(v)
        if not is_valid:
            raise ValueError(error_msg)
        return v
