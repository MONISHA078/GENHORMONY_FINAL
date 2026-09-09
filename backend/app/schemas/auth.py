from pydantic import BaseModel, EmailStr
from typing import Optional


class Token(BaseModel):
    access_token: str
    token_type: str
    role: str


class TokenPayload(BaseModel):
    sub: Optional[str] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str
