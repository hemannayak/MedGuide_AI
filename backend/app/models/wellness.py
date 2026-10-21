"""Patient-owned, optional self-reported context and daily wellness records."""
import uuid
from datetime import date, datetime
from sqlalchemy import String, Text, Integer, Float, Boolean, Date, DateTime, ForeignKey, UniqueConstraint, CheckConstraint
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID
from app.db.base_class import Base, TimestampMixin, uuid_pk

class PatientWellness(Base, TimestampMixin):
    __tablename__ = 'patient_wellness'
    patient_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey('patient_profiles.id', ondelete='CASCADE'), primary_key=True)
    gender: Mapped[str | None] = mapped_column(String(80))
    emergency_contact: Mapped[str | None] = mapped_column(String(255))
    conditions: Mapped[str | None] = mapped_column(Text)
    past_illnesses: Mapped[str | None] = mapped_column(Text)
    surgeries: Mapped[str | None] = mapped_column(Text)
    allergies: Mapped[str | None] = mapped_column(Text)
    accessibility_needs: Mapped[str | None] = mapped_column(Text)
    family_history: Mapped[str | None] = mapped_column(Text)
    treatment_history: Mapped[str | None] = mapped_column(Text)
    sleep_notes: Mapped[str | None] = mapped_column(Text)
    activity_notes: Mapped[str | None] = mapped_column(Text)
    dietary_preferences: Mapped[str | None] = mapped_column(Text)
    healthcare_provider: Mapped[str | None] = mapped_column(String(255))
    vaccination_notes: Mapped[str | None] = mapped_column(Text)
    lab_report_notes: Mapped[str | None] = mapped_column(Text)
    health_goals: Mapped[str | None] = mapped_column(Text)
    water_goal_ml: Mapped[int | None] = mapped_column(Integer)
    step_goal: Mapped[int | None] = mapped_column(Integer)
    large_controls: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    onboarding_step: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    onboarding_complete: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    health_notice_version: Mapped[str | None] = mapped_column(String(10))
    __table_args__ = (CheckConstraint('water_goal_ml IS NULL OR water_goal_ml BETWEEN 1 AND 20000'), CheckConstraint('step_goal IS NULL OR step_goal BETWEEN 1 AND 200000'), CheckConstraint('onboarding_step BETWEEN 0 AND 3'))

class WellnessEntry(Base, TimestampMixin):
    __tablename__ = 'wellness_entries'
    id: Mapped[uuid.UUID] = uuid_pk()
    patient_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey('patient_profiles.id', ondelete='CASCADE'), index=True)
    operation_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    day: Mapped[date] = mapped_column(Date, index=True)
    kind: Mapped[str] = mapped_column(String(20), nullable=False)
    amount: Mapped[int] = mapped_column(Integer, nullable=False)
    source: Mapped[str] = mapped_column(String(30), nullable=False)
    __table_args__ = (UniqueConstraint('patient_id', 'operation_id', name='uq_wellness_operation'), CheckConstraint("kind IN ('water', 'steps')"), CheckConstraint('amount BETWEEN 0 AND 200000'), CheckConstraint("source IN ('manual', 'foreground_sensor')"))

class PatientMeasurement(Base, TimestampMixin):
    __tablename__ = 'patient_measurements'
    id: Mapped[uuid.UUID] = uuid_pk()
    patient_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey('patient_profiles.id', ondelete='CASCADE'), index=True)
    operation_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    kind: Mapped[str] = mapped_column(String(30), nullable=False)
    value: Mapped[float] = mapped_column(Float, nullable=False)
    secondary_value: Mapped[float | None] = mapped_column(Float)
    unit: Mapped[str] = mapped_column(String(20), nullable=False)
    measured_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    source: Mapped[str] = mapped_column(String(20), default='manual', nullable=False)
    __table_args__ = (UniqueConstraint('patient_id', 'operation_id', name='uq_measurement_operation'), CheckConstraint('value > 0'), CheckConstraint("source = 'manual'"))
