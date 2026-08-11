import uuid
from datetime import date, datetime, timezone
from typing import TYPE_CHECKING, Any, Dict, List, Optional
from sqlalchemy import Date, DateTime, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base, TimestampMixin, uuid_pk

if TYPE_CHECKING:
    from app.models.profiles import PatientProfile
    from app.models.prescriptions import Prescription


class Medication(Base, TimestampMixin):
    """Individual medication records for patients."""

    __tablename__ = "medications"

    id: Mapped[uuid.UUID] = uuid_pk()
    patient_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("patient_profiles.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    prescription_id: Mapped[Optional[UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("prescriptions.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    medicine_name: Mapped[str] = mapped_column(String(255), nullable=False)
    dosage: Mapped[str] = mapped_column(String(100), nullable=False)
    route: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    instructions: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    verification_status: Mapped[str] = mapped_column(
        String(50), default="PENDING", nullable=False
    )

    patient: Mapped["PatientProfile"] = relationship("PatientProfile", back_populates="medications")
    prescription: Mapped[Optional["Prescription"]] = relationship("Prescription", back_populates="medications")
    schedules: Mapped[List["MedicationSchedule"]] = relationship(
        "MedicationSchedule", back_populates="medication", cascade="all, delete-orphan"
    )


class MedicationSchedule(Base, TimestampMixin):
    """Medication timing and dosage frequency configuration."""

    __tablename__ = "medication_schedules"

    id: Mapped[uuid.UUID] = uuid_pk()
    medication_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("medications.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    frequency: Mapped[str] = mapped_column(String(100), nullable=False)
    schedule_data: Mapped[Dict[str, Any]] = mapped_column(JSONB, nullable=False)
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    timezone: Mapped[str] = mapped_column(String(50), default="UTC", nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="ACTIVE", nullable=False)

    medication: Mapped["Medication"] = relationship("Medication", back_populates="schedules")
    adherences: Mapped[List["MedicationAdherence"]] = relationship(
        "MedicationAdherence", back_populates="medication_schedule", cascade="all, delete-orphan"
    )


class MedicationAdherence(Base):
    """Recorded medication compliance intake events."""

    __tablename__ = "medication_adherences"

    id: Mapped[uuid.UUID] = uuid_pk()

    medication_schedule_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("medication_schedules.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    scheduled_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, index=True
    )
    recorded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    status: Mapped[str] = mapped_column(String(50), nullable=False)
    source: Mapped[str] = mapped_column(String(50), default="PATIENT", nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    medication_schedule: Mapped["MedicationSchedule"] = relationship(
        "MedicationSchedule", back_populates="adherences"
    )
