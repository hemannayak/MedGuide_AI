import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING, Any, Dict, Optional
from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base, TimestampMixin, uuid_pk

if TYPE_CHECKING:
    from app.models.profiles import PatientProfile


class SymptomRecord(Base, TimestampMixin):
    """Patient-reported symptom inputs and structured information."""

    __tablename__ = "symptom_records"

    id: Mapped[uuid.UUID] = uuid_pk()

    patient_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("patient_profiles.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    source: Mapped[str] = mapped_column(String(50), nullable=False)
    raw_input_reference: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    structured_data: Mapped[Dict[str, Any]] = mapped_column(JSONB, nullable=False)
    reported_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
        index=True,
    )

    patient: Mapped["PatientProfile"] = relationship(
        "PatientProfile", back_populates="symptom_records"
    )
