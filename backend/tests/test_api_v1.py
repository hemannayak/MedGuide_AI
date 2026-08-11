import uuid
import pytest
from fastapi.testclient import TestClient

from app.core.triage import evaluate_symptom_triage
from app.main import app

client = TestClient(app)


# Helper helper to register and obtain auth header
def create_test_user_session(role: str = "PATIENT"):
    uid = uuid.uuid4().hex[:8]
    email = f"user_{role.lower()}_{uid}@medguide.ai"
    password = "StrongPassword123!"

    reg_resp = client.post(
        "/api/v1/auth/register",
        json={
            "login_identifier": email,
            "password": password,
            "display_name": f"Test User {uid}",
            "preferred_language": "en",
        },
    )
    assert reg_resp.status_code == 201

    login_resp = client.post(
        "/api/v1/auth/login",
        json={"login_identifier": email, "password": password},
    )
    assert login_resp.status_code == 200
    token = login_resp.json()["data"]["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    return email, token, headers, uid


def test_authentication_and_authorization_audit():
    email, token, headers, uid = create_test_user_session("PATIENT")

    # 1. Duplicate Registration Failure
    dup_resp = client.post(
        "/api/v1/auth/register",
        json={
            "login_identifier": email,
            "password": "Password123!",
            "display_name": "Duplicate User",
            "preferred_language": "en",
        },
    )
    assert dup_resp.status_code == 409

    # 2. Incorrect Password Login Failure
    bad_login = client.post(
        "/api/v1/auth/login",
        json={"login_identifier": email, "password": "WrongPassword!"},
    )
    assert bad_login.status_code == 401

    # 3. Invalid Bearer Token Request Failure
    bad_token_resp = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": "Bearer invalid_junk_token_xyz"},
    )
    assert bad_token_resp.status_code == 401

    # 4. Missing Token Request Failure
    no_token_resp = client.get("/api/v1/auth/me")
    assert no_token_resp.status_code == 401

    # 5. Role Restrictions (PATIENT attempting worker route)
    role_block_resp = client.get("/api/v1/healthcare-workers/patients", headers=headers)
    assert role_block_resp.status_code == 403

    # 6. Logout Execution
    logout_resp = client.post("/api/v1/auth/logout", headers=headers)
    assert logout_resp.status_code == 200


def test_patient_data_isolation_audit():
    """Verify Patient A cannot access Patient B's records."""
    _, _, headers_a, _ = create_test_user_session("PATIENT")
    _, _, headers_b, _ = create_test_user_session("PATIENT")

    # Patient A creates a medication
    med_a_resp = client.post(
        "/api/v1/medications",
        json={"medicine_name": "Patient A Medicine", "dosage": "100mg"},
        headers=headers_a,
    )
    assert med_a_resp.status_code == 201
    med_a_id = med_a_resp.json()["data"]["id"]

    # Patient B attempts to access Patient A's medication detail
    med_b_access = client.get(f"/api/v1/medications/{med_a_id}", headers=headers_b)
    assert med_b_access.status_code == 404

    # Patient A creates a symptom record and gets an alert
    sym_a_resp = client.post(
        "/api/v1/symptoms",
        json={"text": "chest pain and shortness of breath"},
        headers=headers_a,
    )
    assert sym_a_resp.status_code == 201
    sym_a_id = sym_a_resp.json()["data"]["symptom_record_id"]

    an_a_resp = client.post(
        "/api/v1/symptoms/analyze",
        json={"symptom_record_id": sym_a_id},
        headers=headers_a,
    )
    assert an_a_resp.status_code == 200
    alert_a_id = an_a_resp.json()["data"]["created_alert_id"]

    # Patient B attempts to access Patient A's alert detail
    alert_b_access = client.get(f"/api/v1/alerts/{alert_a_id}", headers=headers_b)
    assert alert_b_access.status_code == 404


def test_deterministic_safety_triage_engine_audit():
    """Verify deterministic safety triage logic without LLM dependency."""
    # Routine Case
    level, flags, guide, esc = evaluate_symptom_triage("I have mild fatigue and a slight headache")
    assert level == "ROUTINE"
    assert len(flags) == 0
    assert esc is False

    # Urgent Case
    level, flags, guide, esc = evaluate_symptom_triage("I have high fever and severe abdominal pain")
    assert level == "URGENT"
    assert len(flags) >= 1
    assert esc is True

    # Emergency Case
    level, flags, guide, esc = evaluate_symptom_triage("I have severe chest pain and severe difficulty breathing")
    assert level == "EMERGENCY"
    assert len(flags) >= 1
    assert esc is True

    # Multiple Symptoms & Invalid/Empty input
    level, flags, guide, esc = evaluate_symptom_triage("")
    assert level == "ROUTINE"


def test_multilingual_input_output_audit():
    """Audit English, Telugu, and Hindi symptom and AI companion processing."""
    _, _, headers, _ = create_test_user_session("PATIENT")

    # Telugu Symptom Input
    telugu_symptom = client.post(
        "/api/v1/symptoms",
        json={
            "text": "నాకు తీవ్రమైన జ్వరం ఉంది",
            "language": "te",
        },
        headers=headers,
    )
    assert telugu_symptom.status_code == 201

    # Hindi AI Chat Input
    hindi_ai = client.post(
        "/api/v1/ai/chat",
        json={
            "message": "मुझे तेज बुखार है",
            "language": "hi",
        },
        headers=headers,
    )
    assert hindi_ai.status_code == 200
    assert hindi_ai.json()["data"]["language"] == "hi"


def test_pydantic_validation_audit():
    """Verify robust validation error responses for malformed requests."""
    _, _, headers, _ = create_test_user_session("PATIENT")

    # Invalid UUID format for symptom analysis
    bad_uuid_resp = client.post(
        "/api/v1/symptoms/analyze",
        json={"symptom_record_id": "not-a-valid-uuid"},
        headers=headers,
    )
    assert bad_uuid_resp.status_code == 422

    # Missing required field on medication creation
    missing_field_resp = client.post(
        "/api/v1/medications",
        json={"dosage": "500mg"},
        headers=headers,
    )
    assert missing_field_resp.status_code == 422
