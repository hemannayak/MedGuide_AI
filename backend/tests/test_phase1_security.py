import uuid
import pytest
from datetime import date
from sqlalchemy.orm import Session

from app.models.users import User
from app.models.profiles import PatientProfile, HealthcareWorkerProfile
from app.models.audit import AuditLog
from app.schemas.auth import UserRegisterRequest
from app.schemas.medication import MedicationCreateRequest, MedicationScheduleCreateRequest
from app.core.security import hash_password
from app.models.roles import Role
from app.services.auth_service import register_patient_user
from app.services.patient_service import get_patient_profile_by_user
from app.services.medication_service import (
    create_medication,
    verify_medication,
    create_medication_schedule,
    get_patient_medications,
)
from app.services.access_service import (
    grant_worker_patient_access,
    revoke_worker_patient_access,
    is_patient_accessible_by_worker,
)
from app.services.hcw_service import get_authorized_patients, get_patient_summary_for_worker


def _get_or_create_patient(db: Session, email_prefix: str) -> tuple[User, PatientProfile]:
    email = f"{email_prefix}_{uuid.uuid4().hex[:6]}@medguide.ai"
    reg = UserRegisterRequest(
        login_identifier=email,
        password="SecurePassword123!",
        display_name="Test Patient",
        preferred_language="en",
    )
    user = register_patient_user(db, reg)
    profile = get_patient_profile_by_user(db, user)
    return user, profile


def _get_or_create_worker(db: Session, email_prefix: str) -> tuple[User, HealthcareWorkerProfile]:
    email = f"{email_prefix}_{uuid.uuid4().hex[:6]}@medguide.ai"
    hcw_role = db.query(Role).filter(Role.name == "HEALTHCARE_WORKER").first()
    if not hcw_role:
        hcw_role = Role(name="HEALTHCARE_WORKER")
        db.add(hcw_role)
        db.commit()
        db.refresh(hcw_role)

    user = User(
        role_id=hcw_role.id,
        login_identifier=email,
        password_hash=hash_password("SecurePassword123!"),
        status="ACTIVE",
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    profile = HealthcareWorkerProfile(
        user_id=user.id,
        name="Community Health Worker",
        worker_type="ASHA",
        organization="Primary Health Center",
    )
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return user, profile


def test_medication_created_as_pending(db_session: Session):
    """Safety: New medications must always start with PENDING verification status."""
    _, patient_profile = _get_or_create_patient(db_session, "p_med_pending")
    med_req = MedicationCreateRequest(
        medicine_name="Amoxicillin 500mg",
        dosage="500mg",
        instructions="Take after food",
    )
    med = create_medication(db_session, patient_profile, med_req)
    assert med.id is not None
    assert med.verification_status == "PENDING"

    # Verify audit log exists
    audit = (
        db_session.query(AuditLog)
        .filter(AuditLog.resource_id == med.id, AuditLog.action == "MEDICATION_CREATED")
        .first()
    )
    assert audit is not None


def test_cannot_schedule_pending_medication(db_session: Session):
    """Safety: Unverified medications cannot have active schedules attached."""
    from fastapi import HTTPException
    _, patient_profile = _get_or_create_patient(db_session, "p_sched_guard")
    med_req = MedicationCreateRequest(
        medicine_name="Metformin 500mg",
        dosage="500mg",
    )
    med = create_medication(db_session, patient_profile, med_req)
    assert med.verification_status == "PENDING"

    sched_req = MedicationScheduleCreateRequest(
        frequency="ONCE_DAILY",
        schedule_data={"times": ["08:00"]},
        start_date=date.today(),
    )
    with pytest.raises(HTTPException) as exc_info:
        create_medication_schedule(db_session, patient_profile, str(med.id), sched_req)
    assert exc_info.value.status_code == 422


def test_verify_medication_promotes_status(db_session: Session):
    """Workflow: Explicit verification promotes PENDING medication to VERIFIED."""
    _, patient_profile = _get_or_create_patient(db_session, "p_verify_flow")
    med_req = MedicationCreateRequest(
        medicine_name="Paracetamol 650mg",
        dosage="650mg",
    )
    med = create_medication(db_session, patient_profile, med_req)
    assert med.verification_status == "PENDING"

    verified_med = verify_medication(db_session, patient_profile, str(med.id))
    assert verified_med.verification_status == "VERIFIED"

    # Now schedule creation succeeds
    sched_req = MedicationScheduleCreateRequest(
        frequency="TWICE_DAILY",
        schedule_data={"times": ["08:00", "20:00"]},
        start_date=date.today(),
    )
    sched = create_medication_schedule(db_session, patient_profile, str(verified_med.id), sched_req)
    assert sched.id is not None
    assert sched.status == "ACTIVE"


def test_hcw_authorization_scoping(db_session: Session):
    """Security: HCWs must only access patients who have explicitly granted access."""
    patient_user, patient_profile = _get_or_create_patient(db_session, "p_hcw_auth")
    worker_user, worker_profile = _get_or_create_worker(db_session, "w_hcw_auth")

    # Initially, worker has no access
    assert not is_patient_accessible_by_worker(db_session, worker_user, patient_profile.id)
    patients = get_authorized_patients(db_session, worker_user)
    assert not any(p.id == patient_profile.id for p in patients)

    # Accessing summary without permission raises 403 HTTPException
    from fastapi import HTTPException
    with pytest.raises(HTTPException) as exc_info:
        get_patient_summary_for_worker(db_session, worker_user, str(patient_profile.id))
    assert exc_info.value.status_code == 403

    # Grant access
    access = grant_worker_patient_access(db_session, worker_user, patient_profile.id)
    assert access.status == "ACTIVE"
    assert is_patient_accessible_by_worker(db_session, worker_user, patient_profile.id)

    # Now worker can see patient in authorized list and retrieve summary
    auth_patients = get_authorized_patients(db_session, worker_user)
    assert any(p.id == patient_profile.id for p in auth_patients)

    summary = get_patient_summary_for_worker(db_session, worker_user, str(patient_profile.id))
    assert summary is not None
    assert summary.patient_id == patient_profile.id

    # Revoke access
    revoke_worker_patient_access(db_session, worker_user, patient_profile.id)
    assert not is_patient_accessible_by_worker(db_session, worker_user, patient_profile.id)

    with pytest.raises(HTTPException) as exc_info:
        get_patient_summary_for_worker(db_session, worker_user, str(patient_profile.id))
    assert exc_info.value.status_code == 403


def test_verify_medication_endpoint_api(client):
    """API: Test POST /api/v1/medications/{id}/verify HTTP route."""
    from tests.test_api_v1 import create_test_user_session
    _, _, headers, _ = create_test_user_session("PATIENT")

    # 1. Create medication
    create_resp = client.post(
        "/api/v1/medications",
        json={
            "medicine_name": "Cetirizine 10mg",
            "dosage": "10mg",
            "instructions": "Take at night",
        },
        headers=headers,
    )
    assert create_resp.status_code == 201
    med_data = create_resp.json()["data"]
    med_id = med_data["id"]
    assert med_data["verification_status"] == "PENDING"

    # 2. Verify medication via endpoint
    verify_resp = client.post(
        f"/api/v1/medications/{med_id}/verify",
        headers=headers,
    )
    assert verify_resp.status_code == 200
    verified_data = verify_resp.json()["data"]
    assert verified_data["verification_status"] == "VERIFIED"

    # 3. Schedule can now be created via API
    sched_resp = client.post(
        f"/api/v1/medications/{med_id}/schedules",
        json={
            "frequency": "ONCE_DAILY",
            "schedule_data": {"times": ["21:00"]},
            "start_date": str(date.today()),
        },
        headers=headers,
    )
    assert sched_resp.status_code == 201
    assert sched_resp.json()["data"]["status"] == "ACTIVE"

