from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.user import User
from app.repositories.user import user_repository
from app.schemas.user import UserCreate, UserResponse


class UserService:
    def register_user(self, db: Session, user_in: UserCreate) -> User:
        user_in.email = user_in.email.lower().strip()
        # Check if email is already taken
        existing_user = user_repository.get_by_email(db, email=user_in.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A user with this email address already exists.",
            )

        # Get default role "USER"
        user_role = user_repository.get_role_by_name(db, name="USER")
        if not user_role:
            from app.models.role import Role

            user_role = Role(name="USER")
            db.add(user_role)
            db.commit()
            db.refresh(user_role)


        return user_repository.create_user(db, obj_in=user_in, role_id=user_role.id)

    def get_user_profile(self, db: Session, user: User) -> UserResponse:
        return UserResponse(
            id=user.id,
            email=user.email,
            first_name=user.first_name,
            last_name=user.last_name,
            role_id=user.role_id,
            role_name=user.role.name,
            is_active=user.is_active,
            created_at=user.created_at,
        )


user_service = UserService()
