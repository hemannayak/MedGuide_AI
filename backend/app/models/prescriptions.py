import uuid
from datetime import date, datetime, timezone
from typing import TYPE_CHECKING, List, Optional
from sqlalchemy import BigInteger, Date, DateTime, Float, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base, TimestampMixin, uuid_pk

if TYPE_CHECKING:
    from app.models.profiles import PatientProfile
    from app.models.medications import Medication


class Prescription(Base, TimestampMixin):
    """Prescription record header."""

    __tablename__ = "prescriptions"

    id: Mapped[uuid.UUID] = uuid_pk()
    patient_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("patient_profiles.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    source: Mapped[str] = mapped_column(String(50), nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="ACTIVE", nullable=False)
    verification_status: Mapped[str] = mapped_column(
        String(50), default="PENDING", nullable=False
    )
    prescribed_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)

    patient: Mapped["PatientProfile"] = relationship(
        "PatientProfile", back_populates="prescriptions"
    )
    images: Mapped[List["PrescriptionImage"]] = relationship(
        "PrescriptionImage", back_populates="prescription", cascade="all, delete-orphan"
    )
    medications: Mapped[List["Medication"]] = relationship(
        "Medication", back_populates="prescription"
    )


class PrescriptionImage(Base):
    """Prescription image metadata and storage references."""

    __tablename__ = "prescription_images"

    id: Mapped[uuid.UUID] = uuid_pk()
    prescription_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("prescriptions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    storage_reference: Mapped[str] = mapped_column(String(512), nullable=False)
    file_type: Mapped[str] = mapped_column(String(50), nullable=False)
    file_size: Mapped[int] = mapped_column(BigInteger, nullable=False)
    checksum: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    uploaded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    prescription: Mapped["Prescription"] = relationship(
        "Prescription", back_populates="images"
    )
    ocr_results: Mapped[List["OCRResult"]] = relationship(
        "OCRResult", back_populates="prescription_image", cascade="all, delete-orphan"
    )


class OCRResult(Base):
    """Raw OCR extraction results from prescription images."""

    __tablename__ = "ocr_results"

    id: Mapped[uuid.UUID] = uuid_pk()

    prescription_image_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("prescription_images.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    engine: Mapped[str] = mapped_column(String(100), nullable=False)
    model_version: Mapped[str] = mapped_column(String(50), nullable=False)
    raw_text: Mapped[str] = mapped_column(Text, nullable=False)
    confidence: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    status: Mapped[str] = mapped_column(String(50), nullable=False)
    processed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    prescription_image: Mapped["PrescriptionImage"] = relationship(
        "PrescriptionImage", back_populates="ocr_results"
    )
