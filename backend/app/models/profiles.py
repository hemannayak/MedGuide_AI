import uuid
from datetime import date
from typing import TYPE_CHECKING, List, Optional
from sqlalchemy import Date, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base, TimestampMixin, uuid_pk

if TYPE_CHECKING:
    from app.models.users import User
    from app.models.consent import Consent
    from app.models.symptoms import SymptomRecord
    from app.models.conversations import Conversation
    from app.models.prescriptions import Prescription
    from app.models.medications import Medication
    from app.models.timeline import HealthTimelineEvent, Alert, FollowUp


class PatientProfile(Base, TimestampMixin):
    """Patient demographic and language preferences."""

    __tablename__ = "patient_profiles"

    id: Mapped[uuid.UUID] = uuid_pk()
    user_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True,
    )
    display_name: Mapped[str] = mapped_column(String(255), nullable=False)
    date_of_birth: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    preferred_language: Mapped[str] = mapped_column(String(10), default="en", nullable=False)
    contact_reference: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    user: Mapped["User"] = relationship("User", back_populates="patient_profile")
    consents: Mapped[List["Consent"]] = relationship(
        "Consent", back_populates="patient", cascade="all, delete-orphan"
    )
    symptom_records: Mapped[List["SymptomRecord"]] = relationship(
        "SymptomRecord", back_populates="patient", cascade="all, delete-orphan"
    )
    conversations: Mapped[List["Conversation"]] = relationship(
        "Conversation", back_populates="patient", cascade="all, delete-orphan"
    )
    prescriptions: Mapped[List["Prescription"]] = relationship(
        "Prescription", back_populates="patient", cascade="all, delete-orphan"
    )
    medications: Mapped[List["Medication"]] = relationship(
        "Medication", back_populates="patient", cascade="all, delete-orphan"
    )
    timeline_events: Mapped[List["HealthTimelineEvent"]] = relationship(
        "HealthTimelineEvent", back_populates="patient", cascade="all, delete-orphan"
    )
    alerts: Mapped[List["Alert"]] = relationship(
        "Alert", back_populates="patient", cascade="all, delete-orphan"
    )
    follow_ups: Mapped[List["FollowUp"]] = relationship(
        "FollowUp", back_populates="patient", cascade="all, delete-orphan"
    )


class HealthcareWorkerProfile(Base, TimestampMixin):
    """Healthcare worker professional profile."""

    __tablename__ = "healthcare_worker_profiles"

    id: Mapped[uuid.UUID] = uuid_pk()

    user_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True,
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    worker_type: Mapped[str] = mapped_column(String(100), nullable=False)
    organization: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="ACTIVE", nullable=False)

    user: Mapped["User"] = relationship("User", back_populates="healthcare_worker_profile")
    managed_follow_ups: Mapped[List["FollowUp"]] = relationship(
        "FollowUp", back_populates="healthcare_worker"
    )
