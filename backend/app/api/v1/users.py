from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.user import User
from app.schemas.user import UserResponse, UserUpdate, PasswordUpdate
from app.services.auth import auth_service
from app.services.user import user_service
from app.repositories.user import user_repository
from app.utils.security import get_password_hash, verify_password

router = APIRouter()


@router.get("/profile", response_model=UserResponse)
def get_profile(
    current_user: User = Depends(auth_service.get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get the profile details of the current logged-in user.
    """
    return user_service.get_user_profile(db, current_user)


@router.put("/profile", response_model=UserResponse)
def update_profile(
    update_data: UserUpdate,
    current_user: User = Depends(auth_service.get_current_user),
    db: Session = Depends(get_db),
):
    """
    Update profile details for the current logged-in user.
    """
    if update_data.email:
        update_data.email = update_data.email.lower().strip()

    # If email is updating, check if it's already taken
    if update_data.email and update_data.email != current_user.email:
        existing = user_repository.get_by_email(db, email=update_data.email)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email address is already in use by another user.",
            )

    # Hash password if it is updated
    update_dict = update_data.dict(exclude_unset=True)
    if "email" in update_dict:
        update_dict["email"] = update_dict["email"].lower().strip()
    if "password" in update_dict:
        update_dict["hashed_password"] = get_password_hash(update_dict.pop("password"))

    updated_user = user_repository.update(db, db_obj=current_user, obj_in=update_dict)
    return user_service.get_user_profile(db, updated_user)


@router.put("/profile/password", status_code=status.HTTP_204_NO_CONTENT)
def change_password(
    pwd_data: PasswordUpdate,
    current_user: User = Depends(auth_service.get_current_user),
    db: Session = Depends(get_db),
):
    """
    Update password for the current logged-in user.
    """
    if not verify_password(pwd_data.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect current password.",
        )

    user_repository.update(
        db,
        db_obj=current_user,
        obj_in={"hashed_password": get_password_hash(pwd_data.new_password)},
    )
    return None
