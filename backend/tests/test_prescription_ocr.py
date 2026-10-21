import io
import uuid
import pytest
from fastapi import status
from fastapi.testclient import TestClient

from app.core.security import create_access_token
from app.models.medications import Medication
from app.models.prescriptions import Prescription
from app.models.profiles import PatientProfile
from app.models.users import User
from app.schemas.auth import UserRegisterRequest
from app.services.auth_service import register_patient_user
from app.services.ocr_service import MockOCRGateway, extract_medication_entities


def test_ocr_metadata_is_not_promoted_to_medication():
    text = ('SYNTHETIC TEST DOCUMENT - NOT FOR TREATMENT\n'
            'Patient: SYN-P001\nParacetamol 500 mg\n'
            'This is generated OCR test data only.\nDate: 2026-10-11\n')
    candidates = extract_medication_entities(text)
    assert len(candidates) == 1
    assert candidates[0].medicine_name.value == 'Paracetamol'
    assert candidates[0].dosage is not None
    assert candidates[0].dosage.value == '500 mg'
    assert candidates[0].verification_status == 'PENDING'


def test_ocr_skips_demographic_strength_like_values():
    candidates = extract_medication_entities('Patient: SYN\nAge: 50\nPhone: 500123\nName: SYN\nTab Metformin 500mg')
    assert [item.medicine_name.value for item in candidates] == ['Metformin']
from app.services.patient_service import get_patient_profile_by_user


@pytest.fixture(autouse=True)
def synthetic_ocr_gateway(monkeypatch):
    """These fixture-based API tests must not depend on the live OCR provider."""
    monkeypatch.setattr('app.services.prescription_service.create_ocr_gateway', MockOCRGateway)


def _create_test_patient(db) -> tuple[User, PatientProfile, str]:
    email = f"ocr_test_{uuid.uuid4().hex[:6]}@medguide.ai"
    reg = UserRegisterRequest(
        login_identifier=email,
        password="SecurePassword123!",
        display_name="OCR Test Patient",
        preferred_language="en",
    )
    user = register_patient_user(db, reg)
    profile = get_patient_profile_by_user(db, user)
    token = create_access_token(user.id, "PATIENT")
    return user, profile, token


def test_mock_ocr_fixtures_coverage():
    """Verify all 10+ synthetic prescription test fixtures return text and high confidence."""
    gateway = MockOCRGateway()
    fixtures = ["malaria", "hypertension", "tb", "diabetes", "respiratory", "minimal", "gastro", "anemia", "asthma", "default"]
    
    for fix in fixtures:
        output = gateway.process_image(b"fake_image_bytes", filename=f"prescription_{fix}.png")
        assert output.raw_text, f"Fixture '{fix}' produced empty raw text"
        assert output.confidence is not None
        assert output.confidence >= 0.85
        assert output.engine == "mock_ocr"


def test_conservative_extraction_no_hallucinations():
    """Verify entity extractor never infers missing dosage or frequency when not in text."""
    # Minimal text with no dosage/instructions
    raw_text = "Rx\nAzithromycin\nPantoprazole\n"
    candidates = extract_medication_entities(raw_text)
    
    assert len(candidates) == 2
    assert candidates[0].medicine_name.value == "Azithromycin"
    assert candidates[0].dosage is None  # Must NOT infer 500mg
    assert candidates[0].frequency is None  # Must NOT infer once daily
    assert candidates[0].instructions is None
    assert candidates[0].verification_status == "PENDING"

    # Multi-line prescription with explicit dosage and frequency
    complex_text = (
        "Rx\n"
        "Amlodipine 5mg\n"
        "1 tablet once daily in morning\n"
        "Metformin 500mg\n"
        "1 tablet twice daily after meals\n"
    )
    candidates_complex = extract_medication_entities(complex_text)
    assert len(candidates_complex) == 2
    
    amlodipine = candidates_complex[0]
    assert "Amlodipine" in (amlodipine.medicine_name.value or "")
    assert amlodipine.dosage is not None
    assert "5mg" in (amlodipine.dosage.value or "")
    assert amlodipine.dosage.confidence > 0.8
    assert amlodipine.frequency is not None
    assert "Once daily" in (amlodipine.frequency.value or "")
    assert amlodipine.verification_status == "PENDING"


def test_prescription_upload_and_pending_medication_creation(client: TestClient, db_session):
    """
    Test uploading a prescription image:
    1. Uploads PNG image
    2. OCR runs and extracts medications
    3. All medications are strictly PENDING
    4. Timeline event created
    """
    _, _, token = _create_test_patient(db_session)
    headers = {"Authorization": f"Bearer {token}"}
    fake_image = io.BytesIO(b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDRfake_png_content_for_malaria")
    
    response = client.post(
        "/api/v1/prescriptions/upload",
        headers=headers,
        files={"file": ("prescription_malaria.png", fake_image, "image/png")},
        data={"prescribed_date": "2026-09-14"},
    )
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()["data"]
    
    assert data["prescription_id"]
    assert data["verification_status"] == "PENDING"
    assert data["ocr_engine"] == "mock_ocr"
    assert len(data["extracted_medications"]) >= 2
    
    # Assert every extracted candidate has PENDING verification status
    for med in data["extracted_medications"]:
        assert med["verification_status"] == "PENDING"
        assert med["id"] is not None
        
        # Verify in database
        db_med = db_session.query(Medication).filter(Medication.id == med["id"]).first()
        assert db_med is not None
        assert db_med.verification_status == "PENDING"
        assert str(db_med.prescription_id) == data["prescription_id"]


def test_cannot_schedule_unverified_ocr_medication(client: TestClient, db_session):
    """
    SAFETY INVARIANT TEST:
    An OCR-extracted medication cannot be scheduled until explicitly verified.
    """
    _, _, token = _create_test_patient(db_session)
    headers = {"Authorization": f"Bearer {token}"}
    fake_image = io.BytesIO(b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDRfake_hypertension")
    
    # 1. Upload prescription
    upload_res = client.post(
        "/api/v1/prescriptions/upload",
        headers=headers,
        files={"file": ("prescription_hypertension.png", fake_image, "image/png")},
    )
    assert upload_res.status_code == status.HTTP_201_CREATED
    med_id = upload_res.json()["data"]["extracted_medications"][0]["id"]
    
    # 2. Attempt to create dosage schedule (must fail with HTTP 422)
    sched_payload = {
        "frequency": "ONCE_DAILY",
        "schedule_data": {"times": ["08:00"]},
        "start_date": "2026-09-14",
    }
    sched_res = client.post(
        f"/api/v1/medications/{med_id}/schedules",
        headers=headers,
        json=sched_payload,
    )
    assert sched_res.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY or sched_res.status_code == 422
    assert "unverified medication" in sched_res.json()["detail"].lower()

    # 3. Explicitly verify the medication
    verify_res = client.post(
        f"/api/v1/medications/{med_id}/verify",
        headers=headers,
    )
    assert verify_res.status_code == status.HTTP_200_OK
    assert verify_res.json()["data"]["verification_status"] == "VERIFIED"

    # 4. Now schedule creation succeeds
    sched_success = client.post(
        f"/api/v1/medications/{med_id}/schedules",
        headers=headers,
        json=sched_payload,
    )
    assert sched_success.status_code == status.HTTP_201_CREATED


def test_list_and_get_prescription_detail(client: TestClient, db_session):
    """Test retrieving prescription history and full detail with OCR results."""
    _, _, token = _create_test_patient(db_session)
    headers = {"Authorization": f"Bearer {token}"}
    fake_image = io.BytesIO(b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDRfake_tb_rx")
    
    # Upload
    upload_res = client.post(
        "/api/v1/prescriptions/upload",
        headers=headers,
        files={"file": ("prescription_tb.png", fake_image, "image/png")},
    )
    assert upload_res.status_code == status.HTTP_201_CREATED
    presc_id = upload_res.json()["data"]["prescription_id"]

    # List prescriptions
    list_res = client.get("/api/v1/prescriptions", headers=headers)
    assert list_res.status_code == status.HTTP_200_OK
    prescriptions = list_res.json()["data"]
    assert len(prescriptions) >= 1
    assert any(p["id"] == presc_id for p in prescriptions)

    # Get single prescription detail
    detail_res = client.get(f"/api/v1/prescriptions/{presc_id}", headers=headers)
    assert detail_res.status_code == status.HTTP_200_OK
    detail = detail_res.json()["data"]
    assert detail["id"] == presc_id
    assert len(detail["images"]) >= 1
    assert len(detail["ocr_results"]) >= 1
    assert detail["ocr_results"][0]["raw_text"]
    assert len(detail["medications"]) >= 1


def test_unsupported_file_type_rejected(client: TestClient, db_session):
    """Test that non-image/non-PDF files are rejected with HTTP 415."""
    _, _, token = _create_test_patient(db_session)
    headers = {"Authorization": f"Bearer {token}"}
    fake_file = io.BytesIO(b"executable content or script")
    
    res = client.post(
        "/api/v1/prescriptions/upload",
        headers=headers,
        files={"file": ("malicious_script.exe", fake_file, "application/x-msdownload")},
    )
    assert res.status_code == status.HTTP_415_UNSUPPORTED_MEDIA_TYPE


def test_unauthenticated_prescription_access_blocked(client: TestClient):
    """Test that unauthenticated requests to prescription endpoints return 401."""
    res_list = client.get("/api/v1/prescriptions")
    assert res_list.status_code == status.HTTP_401_UNAUTHORIZED

    fake_file = io.BytesIO(b"fake image")
    res_upload = client.post(
        "/api/v1/prescriptions/upload",
        files={"file": ("rx.png", fake_file, "image/png")},
    )
    assert res_upload.status_code == status.HTTP_401_UNAUTHORIZED
