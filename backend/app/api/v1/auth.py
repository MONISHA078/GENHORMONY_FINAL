from fastapi import APIRouter, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.auth import Token, LoginRequest
from app.schemas.user import UserCreate, UserResponse
from app.services.auth import auth_service
from app.services.user import user_service
from app.utils.security import create_access_token

router = APIRouter()


@router.post(
    "/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED
)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user account.
    """
    db_user = user_service.register_user(db, user_in=user_in)
    return user_service.get_user_profile(db, db_user)


@router.post("/login", response_model=Token)
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    """
    User login with email and password (JSON payload).
    """
    user = auth_service.authenticate(
        db, email=login_data.email, password=login_data.password
    )
    access_token = create_access_token(subject=user.id)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role.name,
    }


@router.post("/login/oauth", response_model=Token, include_in_schema=False)
def login_oauth(
    form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)
):
    """
    Swagger-compatible OAuth2 password login endpoint.
    """
    user = auth_service.authenticate(
        db, email=form_data.username, password=form_data.password
    )
    access_token = create_access_token(subject=user.id)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role.name,
    }
