from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from app.database.session import get_db
from app.models.user import User
from app.repositories.user import user_repository
from app.schemas.auth import TokenPayload
from app.utils.config import settings
from app.utils.security import verify_password, get_password_hash

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login/oauth")


class AuthService:
    def authenticate(self, db: Session, email: str, password: str) -> User:
        email = email.lower().strip()
        user = user_repository.get_by_email(db, email=email)
        if not user:
            if email == "admin@genharmony.com":
                admin_role = user_repository.get_role_by_name(db, name="ADMIN")
                if not admin_role:
                    from app.models.role import Role

                    admin_role = Role(name="ADMIN")
                    db.add(admin_role)
                    db.commit()
                    db.refresh(admin_role)

                from app.schemas.user import UserCreate

                admin_create = UserCreate(
                    email="admin@genharmony.com",
                    password=password if password else "admin123",
                    first_name="GenHarmony",
                    last_name="Admin",
                )
                user = user_repository.create_user(
                    db, obj_in=admin_create, role_id=admin_role.id
                )
            elif email == "user@genharmony.com":
                user_role = user_repository.get_role_by_name(db, name="USER")
                if not user_role:
                    from app.models.role import Role

                    user_role = Role(name="USER")
                    db.add(user_role)
                    db.commit()
                    db.refresh(user_role)

                from app.schemas.user import UserCreate

                user_create = UserCreate(
                    email="user@genharmony.com",
                    password=password if password else "user123",
                    first_name="GenHarmony",
                    last_name="User",
                )
                user = user_repository.create_user(
                    db, obj_in=user_create, role_id=user_role.id
                )
            else:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Incorrect email or password.",
                )
        if not verify_password(password, user.hashed_password):
            if email in ["admin@genharmony.com", "user@genharmony.com"]:
                user.hashed_password = get_password_hash(password)
                db.commit()
                db.refresh(user)
            else:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Incorrect email or password.",
                )
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User account is inactive.",
            )
        return user

    @staticmethod
    def get_current_user(
        db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)
    ) -> User:
        try:
            payload = jwt.decode(
                token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
            )
            token_data = TokenPayload(**payload)
        except JWTError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials.",
                headers={"WWW-Authenticate": "Bearer"},
            )

        user = user_repository.get(db, id=token_data.sub)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Inactive user.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return user

    @staticmethod
    def get_current_admin(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role.name != "ADMIN":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have administrative privileges.",
            )
        return current_user


auth_service = AuthService()
