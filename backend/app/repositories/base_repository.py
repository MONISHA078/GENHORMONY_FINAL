from typing import Any, Dict, Generic, List, Optional, Type, TypeVar, Union

from sqlalchemy.orm import Session
from app.database.session import Base

ModelType = TypeVar("ModelType", bound=Base)


class BaseRepository(Generic[ModelType]):
    def __init__(self, model: Type[ModelType]):
        self.model = model

    def get(self, db: Session, id: Any) -> Optional[ModelType]:
        return db.get(self.model, id)

    def get_multi(
        self, db: Session, *, skip: int = 0, limit: int = 100
    ) -> List[ModelType]:
        return db.query(self.model).offset(skip).limit(limit).all()

    def create(self, db: Session, *, obj_in: Any) -> ModelType:
        if isinstance(obj_in, self.model):
            db_obj = obj_in
        else:
            # Convert Pydantic models to dict if necessary
            if hasattr(obj_in, "model_dump"):
                obj_in_data = obj_in.model_dump()
            elif hasattr(obj_in, "dict"):
                obj_in_data = obj_in.dict()
            elif isinstance(obj_in, dict):
                obj_in_data = obj_in
            else:
                obj_in_data = obj_in.__dict__.copy()
                obj_in_data.pop("_sa_instance_state", None)

            db_obj = self.model(**obj_in_data)
            
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update(
        self, db: Session, *, db_obj: ModelType, obj_in: Union[Any, Dict[str, Any]]
    ) -> ModelType:
        if isinstance(obj_in, dict):
            update_data = obj_in
        elif hasattr(obj_in, "model_dump"):
            update_data = obj_in.model_dump(exclude_unset=True)
        elif hasattr(obj_in, "dict"):
            update_data = obj_in.dict(exclude_unset=True)
        else:
            update_data = obj_in.__dict__

        for field in update_data:
            if hasattr(db_obj, field):
                setattr(db_obj, field, update_data[field])

        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def remove(self, db: Session, *, id: Any) -> Optional[ModelType]:
        obj = db.get(self.model, id)
        if obj:
            db.delete(obj)
            db.commit()
        return obj
