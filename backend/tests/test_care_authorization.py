"""Synthetic integration tests for patient ownership and worker access boundaries."""
import uuid
from datetime import datetime, timedelta, timezone
from unittest.mock import patch
import pytest
from app.core.security import create_access_token, hash_password
from app.models.users import User
from app.models.roles import Role
from app.models.profiles import PatientProfile, HealthcareWorkerProfile
from app.models.timeline import Alert, FollowUp
from app.models.medications import Medication
from app.models.prescriptions import Prescription
from app.schemas.auth import UserRegisterRequest
from app.services.auth_service import register_patient_user
from app.services.ocr_service import OCRError, create_ocr_gateway


@pytest.fixture
def accounts(db_session):
    def patient():
        user = register_patient_user(db_session, UserRegisterRequest(
            login_identifier=f"SYN-care-{uuid.uuid4().hex}@example.invalid", password="SyntheticOnly123!",
            display_name="SYN Patient", preferred_language="en"))
        profile = db_session.query(PatientProfile).filter_by(user_id=user.id).one()
        return user, profile
    def staff(role_name):
        role = db_session.query(Role).filter_by(name=role_name).first()
        if not role:
            role = Role(name=role_name); db_session.add(role); db_session.flush()
        user = User(role_id=role.id, login_identifier=f"SYN-{uuid.uuid4().hex}@example.invalid", password_hash=hash_password("SyntheticOnly123!"), status="ACTIVE")
        db_session.add(user); db_session.flush()
        if role_name == "HEALTHCARE_WORKER":
            db_session.add(HealthcareWorkerProfile(user_id=user.id, name="SYN Worker", worker_type="TEST"))
        db_session.commit()
        return user
    a, b = patient(), patient()
    worker, admin = staff("HEALTHCARE_WORKER"), staff("ADMIN")
    return a, b, worker, admin


def headers(user):
    return {"Authorization": f"Bearer {create_access_token(user.id, user.role.name)}"}


def grant(client, worker, admin, patient):
    response = client.post(f"/api/v1/healthcare-workers/patients/{patient.id}/access", params={"worker_user_id": str(worker.id)}, headers=headers(admin))
    assert response.status_code == 201


def test_development_never_bypasses_authentication(client, accounts):
    with patch("app.api.deps.settings.DEBUG", True), patch("app.api.deps.settings.APP_ENV", "development"):
        for token in [None, "mock_patient_token_2026", "mock_hcw_token_2026", "invalid"]:
            response = client.get("/api/v1/auth/me", headers={} if token is None else {"Authorization": f"Bearer {token}"})
            assert response.status_code == 401


def test_only_admin_can_grant_worker_access_and_revocation_is_enforced(client, accounts):
    a, b, worker, admin = accounts
    response = client.post(f"/api/v1/healthcare-workers/patients/{a[1].id}/access", params={"worker_user_id": str(worker.id)}, headers=headers(worker))
    assert response.status_code == 403
    grant(client, worker, admin, a[1])
    response = client.get("/api/v1/healthcare-workers/patients", headers=headers(worker))
    assert [p["id"] for p in response.json()["data"]] == [str(a[1].id)]
    assert client.get(f"/api/v1/healthcare-workers/patients/{b[1].id}/records", headers=headers(worker)).status_code == 403
    assert client.get(f"/api/v1/healthcare-workers/patients/{a[1].id}/records", headers=headers(worker)).status_code == 200
    assert client.delete(f"/api/v1/healthcare-workers/patients/{a[1].id}/access", headers=headers(worker)).status_code == 200
    assert client.get(f"/api/v1/healthcare-workers/patients/{a[1].id}/records", headers=headers(worker)).status_code == 403


def test_followups_are_scoped_and_mutations_require_worker_authorization(client, accounts):
    a, b, worker, admin = accounts
    grant(client, worker, admin, a[1])
    data = {"patient_id": str(a[1].id), "reason": "SYN continuity check", "scheduled_at": (datetime.now(timezone.utc) + timedelta(days=1)).isoformat()}
    assert client.post("/api/v1/follow-ups", json=data, headers=headers(a[0])).status_code == 403
    denied = {**data, "patient_id": str(b[1].id)}
    assert client.post("/api/v1/follow-ups", json=denied, headers=headers(worker)).status_code == 403
    created = client.post("/api/v1/follow-ups", json=data, headers=headers(worker))
    assert created.status_code == 201
    followup_id = created.json()["data"]["id"]
    assert client.get("/api/v1/follow-ups", headers=headers(b[0])).json()["data"] == []
    assert len(client.get("/api/v1/follow-ups", headers=headers(a[0])).json()["data"]) == 1
    assert client.patch(f"/api/v1/follow-ups/{followup_id}", json={"status": "COMPLETED"}, headers=headers(worker)).status_code == 200
    assert client.patch(f"/api/v1/follow-ups/{followup_id}", json={"status": "UNKNOWN"}, headers=headers(worker)).status_code == 422
    client.delete(f"/api/v1/healthcare-workers/patients/{a[1].id}/access", headers=headers(worker))
    assert client.patch(f"/api/v1/follow-ups/{followup_id}", json={"status": "CANCELLED"}, headers=headers(worker)).status_code == 403
    assert client.get("/api/v1/follow-ups", headers=headers(worker)).json()["data"] == []


def test_alert_update_enforces_patient_ownership(client, db_session, accounts):
    a, b, _, _ = accounts
    alert = Alert(patient_id=a[1].id, alert_type="SYN_TEST", severity="TEST", source="TEST", status="OPEN")
    db_session.add(alert); db_session.commit()
    path = f"/api/v1/alerts/{alert.id}"
    assert client.patch(path, json={"status": "RESOLVED"}, headers=headers(b[0])).status_code == 404
    db_session.refresh(alert); assert alert.status == "OPEN"
    assert client.patch(path, json={"status": "UNKNOWN"}, headers=headers(a[0])).status_code == 422
    assert client.patch(path, json={"status": "ACKNOWLEDGED"}, headers=headers(a[0])).status_code == 200


def test_medication_cannot_link_another_patients_prescription(client, db_session, accounts):
    a, b, _, _ = accounts
    prescription = Prescription(patient_id=b[1].id, source="SYN_TEST", status="ACTIVE", verification_status="PENDING")
    db_session.add(prescription); db_session.commit()
    response = client.post("/api/v1/medications", headers=headers(a[0]), json={"medicine_name": "SYN Medicine", "dosage": "SYN dosage", "prescription_id": str(prescription.id)})
    assert response.status_code == 404


def test_worker_verification_is_scoped_and_audited(client, db_session, accounts):
    a, b, worker, admin = accounts
    grant(client, worker, admin, a[1])
    med = Medication(patient_id=a[1].id, medicine_name="SYN Medicine", dosage="SYN dosage", verification_status="PENDING")
    db_session.add(med); db_session.commit()
    wrong = f"/api/v1/healthcare-workers/patients/{b[1].id}/medications/{med.id}/verify"
    assert client.post(wrong, headers=headers(worker)).status_code == 403
    path = f"/api/v1/healthcare-workers/patients/{a[1].id}/medications/{med.id}/verify"
    assert client.post(path, headers=headers(worker)).status_code == 200
    from app.models.audit import AuditLog
    log = db_session.query(AuditLog).filter_by(action="MEDICATION_VERIFIED", resource_id=med.id).one()
    assert log.actor_user_id == worker.id


def test_ocr_unavailable_does_not_create_prescription(client, db_session, accounts):
    a, _, _, _ = accounts
    with patch("app.services.prescription_service.create_ocr_gateway", side_effect=OCRError("private failure")):
        response = client.post("/api/v1/prescriptions/upload", headers=headers(a[0]), files={"file": ("SYN.png", b"SYN", "image/png")})
    assert response.status_code == 503
    assert "private failure" not in response.text
    assert db_session.query(Prescription).filter_by(patient_id=a[1].id).count() == 0


def test_ocr_never_falls_back_to_synthetic_results(monkeypatch):
    monkeypatch.setenv("OCR_PROVIDER", "tesseract")
    with patch("app.services.ocr_service.TesseractOCRGateway", side_effect=OCRError("Unavailable")):
        with pytest.raises(OCRError): create_ocr_gateway()


def test_live_environment_rejects_mock_ocr(monkeypatch):
    monkeypatch.setenv("OCR_PROVIDER", "mock")
    with patch("app.core.config.settings.APP_ENV", "production"):
        with pytest.raises(OCRError): create_ocr_gateway()


def test_admin_revokes_named_worker_and_inactive_profiles_are_denied(client, db_session, accounts):
    a, _, worker, admin = accounts
    grant(client, worker, admin, a[1])
    path = f"/api/v1/healthcare-workers/patients/{a[1].id}/access"
    assert client.delete(path, headers=headers(admin)).status_code == 422
    assert client.delete(path, params={"worker_user_id": str(admin.id)}, headers=headers(worker)).status_code == 403
    assert client.delete(path, params={"worker_user_id": str(worker.id)}, headers=headers(admin)).status_code == 200
    assert client.get(f"/api/v1/healthcare-workers/patients/{a[1].id}/records", headers=headers(worker)).status_code == 403
    from app.models.audit import AuditLog
    log = db_session.query(AuditLog).filter_by(action="WORKER_PATIENT_ACCESS_REVOKED").order_by(AuditLog.timestamp.desc()).first()
    assert log.actor_user_id == admin.id
    grant(client, worker, admin, a[1])
    profile = db_session.query(HealthcareWorkerProfile).filter_by(user_id=worker.id).one()
    profile.status = "INACTIVE"; db_session.commit()
    assert client.get("/api/v1/healthcare-workers/patients", headers=headers(worker)).status_code == 403


def test_profile_updates_are_owned_validated_and_audited(client, db_session, accounts):
    a, b, _, _ = accounts
    response = client.patch("/api/v1/patients/me", headers=headers(a[0]), json={"display_name": "SYN Updated", "preferred_language": "te"})
    assert response.status_code == 200
    assert response.json()["data"]["display_name"] == "SYN Updated"
    assert client.get("/api/v1/patients/me", headers=headers(b[0])).json()["data"]["display_name"] == "SYN Patient"
    for data in [{"display_name": ""}, {"display_name": "S" * 256}, {"preferred_language": "unsupported"}]:
        assert client.patch("/api/v1/patients/me", headers=headers(a[0]), json=data).status_code == 422
    from app.models.audit import AuditLog
    log = db_session.query(AuditLog).filter_by(action="PATIENT_PROFILE_MODIFIED", resource_id=a[1].id).one()
    assert log.actor_user_id == a[0].id
    assert "SYN Updated" not in str(log.metadata_)
