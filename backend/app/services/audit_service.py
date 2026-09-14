"""
Audit logging service for MedGuide AI.

Provides a single write point for all security-relevant and sensitive-data
access events. All audit writes happen within the caller's database transaction
so that an audit record is never created if the associated operation rolls back.

PRIVACY RULE: metadata must describe WHO/WHAT/WHICH/WHEN only.
Never store passwords, tokens, symptom narratives, prescription contents,
or full conversation text in audit metadata.
"""
from __future__ import annotations

import uuid
from typing import Any, Dict, Optional

from sqlalchemy.orm import Session

from app.models.audit import AuditLog

# ---------------------------------------------------------------------------
# Approved audit action constants
# ---------------------------------------------------------------------------
ACTION_LOGIN_SUCCESS = "LOGIN_SUCCESS"
ACTION_LOGIN_FAILURE = "LOGIN_FAILURE"
ACTION_PATIENT_ACCESSED = "PATIENT_ACCESSED"
ACTION_PATIENT_LIST_ACCESSED = "PATIENT_LIST_ACCESSED"
ACTION_PATIENT_PROFILE_MODIFIED = "PATIENT_PROFILE_MODIFIED"
ACTION_CONSENT_GRANTED = "CONSENT_GRANTED"
ACTION_CONSENT_WITHDRAWN = "CONSENT_WITHDRAWN"
ACTION_MEDICATION_CREATED = "MEDICATION_CREATED"
ACTION_MEDICATION_VERIFIED = "MEDICATION_VERIFIED"
ACTION_MEDICATION_SCHEDULE_BLOCKED = "MEDICATION_SCHEDULE_BLOCKED"
ACTION_ALERT_ACCESSED = "ALERT_ACCESSED"
ACTION_FOLLOW_UP_CREATED = "FOLLOW_UP_CREATED"
ACTION_WORKER_ACCESS_GRANTED = "WORKER_PATIENT_ACCESS_GRANTED"
ACTION_WORKER_ACCESS_REVOKED = "WORKER_PATIENT_ACCESS_REVOKED"

# ---------------------------------------------------------------------------
# Resource type constants
# ---------------------------------------------------------------------------
RESOURCE_USER = "USER"
RESOURCE_PATIENT = "PATIENT"
RESOURCE_MEDICATION = "MEDICATION"
RESOURCE_MEDICATION_SCHEDULE = "MEDICATION_SCHEDULE"
RESOURCE_CONSENT = "CONSENT"
RESOURCE_ALERT = "ALERT"
RESOURCE_FOLLOW_UP = "FOLLOW_UP"
RESOURCE_WORKER_ACCESS = "WORKER_ACCESS"


def log_audit_event(
    db: Session,
    action: str,
    resource_type: str,
    actor_user_id: Optional[uuid.UUID] = None,
    resource_id: Optional[uuid.UUID] = None,
    metadata: Optional[Dict[str, Any]] = None,
) -> None:
    """
    Write a single audit record within the current SQLAlchemy session.

    The record is added to the session but NOT committed here — the caller's
    transaction boundary controls when the write is flushed to the database.
    This ensures audit records are only persisted when the associated
    operation itself succeeds.

    Args:
        db:            The current SQLAlchemy session.
        action:        A constant from this module, e.g. ACTION_LOGIN_SUCCESS.
        resource_type: The type of resource accessed, e.g. RESOURCE_PATIENT.
        actor_user_id: The UUID of the authenticated user performing the action.
                       May be None for unauthenticated actions (e.g. LOGIN_FAILURE).
        resource_id:   The UUID of the specific resource record involved.
        metadata:      Optional dict with non-sensitive context (e.g. role name,
                       HTTP method). Never include health data.
    """
    record = AuditLog(
        actor_user_id=actor_user_id,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        metadata_=metadata,
    )
    db.add(record)
