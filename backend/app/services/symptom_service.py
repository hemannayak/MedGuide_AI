from datetime import datetime, timezone
from typing import Optional, Tuple
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.triage import evaluate_symptom_triage
from app.models.profiles import PatientProfile
from app.models.symptoms import SymptomRecord
from app.models.timeline import Alert, HealthTimelineEvent
from app.schemas.symptom import SymptomAnalyzeResponse, SymptomSubmitRequest, SymptomSubmitResponse


def record_patient_symptom(
    db: Session,
    patient_profile: PatientProfile,
    req: SymptomSubmitRequest,
) -> SymptomSubmitResponse:
    """Record patient reported symptom narrative."""
    record = SymptomRecord(
        patient_id=patient_profile.id,
        source="PATIENT_REPORTED",
        raw_input_reference=req.text,
        structured_data={
            "input_type": req.input_type,
            "text": req.text,
            "language": req.language,
        },
        reported_at=datetime.now(timezone.utc),
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    # Log to Health Timeline
    timeline_event = HealthTimelineEvent(
        patient_id=patient_profile.id,
        event_type="SYMPTOM_REPORTED",
        reference_id=record.id,
        event_time=record.reported_at,
        metadata_={"language": req.language},
    )
    db.add(timeline_event)
    db.commit()

    return SymptomSubmitResponse(
        symptom_record_id=record.id,
        status="RECORDED",
        reported_at=record.reported_at,
    )


def analyze_symptom_record(
    db: Session,
    patient_profile: PatientProfile,
    symptom_record_id: str,
) -> SymptomAnalyzeResponse:
    """Execute deterministic safety triage evaluation on recorded symptoms."""
    record = (
        db.query(SymptomRecord)
        .filter(
            SymptomRecord.id == symptom_record_id,
            SymptomRecord.patient_id == patient_profile.id,
        )
        .first()
    )
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Symptom record not found",
        )

    text_content = record.structured_data.get("text", "")
    risk_level, red_flags, guidance, escalation_required = evaluate_symptom_triage(
        text_input=text_content
    )

    created_alert_id: Optional[str] = None
    if escalation_required:
        alert = Alert(
            patient_id=patient_profile.id,
            alert_type="TRIAGE_RED_FLAG",
            severity=risk_level,
            source="TRIAGE_ENGINE",
            status="OPEN",
        )
        db.add(alert)
        db.commit()
        db.refresh(alert)
        created_alert_id = alert.id

    return SymptomAnalyzeResponse(
        symptom_record_id=record.id,
        risk_level=risk_level,
        red_flags=red_flags,
        guidance=guidance,
        escalation_required=escalation_required,
        created_alert_id=created_alert_id,
    )
