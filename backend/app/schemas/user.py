from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class UserBase(BaseModel):
    email: EmailStr
    first_name: Optional[str] = None
    last_name: Optional[str] = None


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    password: Optional[str] = None
    is_active: Optional[bool] = None


class UserResponse(UserBase):
    id: str
    role_id: str
    role_name: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class PasswordUpdate(BaseModel):
    current_password: str
    new_password: str
