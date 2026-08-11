import uuid
from typing import TYPE_CHECKING, List
from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base, TimestampMixin, uuid_pk

if TYPE_CHECKING:
    from app.models.users import User


class Role(Base, TimestampMixin):
    """System roles (PATIENT, HEALTHCARE_WORKER, ADMIN)."""

    __tablename__ = "roles"

    id: Mapped[uuid.UUID] = uuid_pk()

    name: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)

    users: Mapped[List["User"]] = relationship("User", back_populates="role")
