from datetime import datetime, timezone
from typing import List
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.profiles import PatientProfile
from app.models.timeline import Alert


def get_patient_alerts(
    db: Session,
    patient_profile: PatientProfile,
) -> List[Alert]:
    """Fetch safety alerts for authenticated patient."""
    return (
        db.query(Alert)
        .filter(Alert.patient_id == patient_profile.id)
        .order_by(Alert.created_at.desc())
        .all()
    )


def get_alert_by_id(
    db: Session,
    patient_profile: PatientProfile,
    alert_id: str,
) -> Alert:
    """Fetch single alert detail with patient data boundary guard."""
    alert = (
        db.query(Alert)
        .filter(
            Alert.id == alert_id,
            Alert.patient_id == patient_profile.id,
        )
        .first()
    )
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alert not found or unauthorized access",
        )
    return alert


def update_alert_status(
    db: Session,
    alert_id: str,
    target_status: str,
) -> Alert:
    """Acknowledge or resolve a safety alert."""
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alert not found",
        )

    alert.status = target_status
    if target_status == "ACKNOWLEDGED":
        alert.acknowledged_at = datetime.now(timezone.utc)
    elif target_status == "RESOLVED":
        alert.resolved_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(alert)
    return alert
