from sqlalchemy.orm import Session
from typing import Optional
from app.repositories.base_repository import BaseRepository
from app.models.user import User
from app.models.role import Role
from app.schemas.user import UserCreate
from app.utils.security import get_password_hash


class UserRepository(BaseRepository[User]):
    def get_by_email(self, db: Session, email: str) -> Optional[User]:
        return db.query(User).filter(User.email == email.lower()).first()

    def get_role_by_name(self, db: Session, name: str) -> Optional[Role]:
        return db.query(Role).filter(Role.name == name).first()

    def create_user(self, db: Session, *, obj_in: UserCreate, role_id: str) -> User:
        db_obj = User(
            email=obj_in.email.lower(),
            hashed_password=get_password_hash(obj_in.password),
            first_name=obj_in.first_name,
            last_name=obj_in.last_name,
            role_id=role_id,
            is_active=True,
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj


user_repository = UserRepository(User)
