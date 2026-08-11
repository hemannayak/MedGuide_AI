import uuid
from datetime import datetime
from typing import TYPE_CHECKING, List, Optional
from sqlalchemy import DateTime, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base, TimestampMixin, uuid_pk

if TYPE_CHECKING:
    from app.models.roles import Role
    from app.models.profiles import PatientProfile, HealthcareWorkerProfile
    from app.models.audit import AuditLog, SyncOperation


class User(Base, TimestampMixin):
    """Authenticated user accounts."""

    __tablename__ = "users"

    id: Mapped[uuid.UUID] = uuid_pk()

    role_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("roles.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    login_identifier: Mapped[str] = mapped_column(
        String(255), unique=True, index=True, nullable=False
    )
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="ACTIVE", nullable=False)
    last_login_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    role: Mapped["Role"] = relationship("Role", back_populates="users")
    patient_profile: Mapped[Optional["PatientProfile"]] = relationship(
        "PatientProfile", back_populates="user", uselist=False, cascade="all, delete-orphan"
    )
    healthcare_worker_profile: Mapped[Optional["HealthcareWorkerProfile"]] = relationship(
        "HealthcareWorkerProfile", back_populates="user", uselist=False, cascade="all, delete-orphan"
    )
    audit_logs: Mapped[List["AuditLog"]] = relationship(
        "AuditLog", back_populates="actor_user"
    )
    sync_operations: Mapped[List["SyncOperation"]] = relationship(
        "SyncOperation", back_populates="user", cascade="all, delete-orphan"
    )
