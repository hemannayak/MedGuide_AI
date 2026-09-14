import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING, Optional

from sqlalchemy import DateTime, ForeignKey, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base, TimestampMixin, uuid_pk

if TYPE_CHECKING:
    from app.models.profiles import HealthcareWorkerProfile, PatientProfile


class PatientWorkerAccess(Base, TimestampMixin):
    """
    Explicit authorization relationship between a healthcare worker and a patient.

    A healthcare worker can only access a patient's information when an ACTIVE
    record exists in this table. Access is revocable; revoked records are retained
    for audit history rather than deleted.

    Uniqueness is enforced on (healthcare_worker_profile_id, patient_profile_id)
    to prevent duplicate active grants.
    """

    __tablename__ = "patient_worker_accesses"

    __table_args__ = (
        UniqueConstraint(
            "healthcare_worker_profile_id",
            "patient_profile_id",
            name="uq_worker_patient_access",
        ),
    )

    id: Mapped[uuid.UUID] = uuid_pk()

    healthcare_worker_profile_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("healthcare_worker_profiles.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    patient_profile_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("patient_profiles.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    status: Mapped[str] = mapped_column(
        String(50),
        default="ACTIVE",
        nullable=False,
        index=True,
    )
    granted_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=True,
    )
    revoked_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    healthcare_worker: Mapped["HealthcareWorkerProfile"] = relationship(
        "HealthcareWorkerProfile",
        back_populates="patient_accesses",
    )
    patient: Mapped["PatientProfile"] = relationship(
        "PatientProfile",
        back_populates="worker_accesses",
    )
