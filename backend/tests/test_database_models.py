import uuid
import pytest
from sqlalchemy import inspect, text
from sqlalchemy.orm import Session

from app.db.session import engine
from app.models import (
    Role,
    User,
    PatientProfile,
    HealthcareWorkerProfile,
    Consent,
    SymptomRecord,
    Conversation,
    ConversationMessage,
    Prescription,
    PrescriptionImage,
    OCRResult,
    Medication,
    MedicationSchedule,
    MedicationAdherence,
    HealthTimelineEvent,
    Alert,
    FollowUp,
    MedicalDocument,
    KnowledgeChunk,
    AuditLog,
    SyncOperation,
)


def test_database_tables_exist():
    """Verify all 21 entities exist in PostgreSQL information_schema."""
    inspector = inspect(engine)
    existing_tables = set(inspector.get_table_names())

    expected_tables = {
        "roles",
        "users",
        "patient_profiles",
        "healthcare_worker_profiles",
        "consents",
        "symptom_records",
        "conversations",
        "conversation_messages",
        "prescriptions",
        "prescription_images",
        "ocr_results",
        "medications",
        "medication_schedules",
        "medication_adherences",
        "health_timeline_events",
        "alerts",
        "follow_ups",
        "medical_documents",
        "knowledge_chunks",
        "audit_logs",
        "sync_operations",
        "alembic_version",
    }

    assert expected_tables.issubset(existing_tables), (
        f"Missing tables: {expected_tables - existing_tables}"
    )


def test_pgvector_extension_active():
    """Verify pgvector extension is enabled in medguide_ai_dev."""
    with engine.connect() as conn:
        result = conn.execute(
            text("SELECT extname FROM pg_extension WHERE extname = 'vector';")
        ).fetchone()
        assert result is not None
        assert result[0] == "vector"


def test_pgvector_vector_query():
    """Verify vector distance calculation using pgvector operator."""
    with engine.connect() as conn:
        result = conn.execute(
            text("SELECT '[1,2,3]'::vector <-> '[1,2,4]'::vector AS distance;")
        ).fetchone()
        assert result is not None
        assert result[0] == 1.0


def test_model_crud_and_relationships():
    """Verify model instantiation, persistence, and FK relationships in DB."""
    uid = uuid.uuid4().hex[:8]
    role_name = f"PATIENT_TEST_{uid}"
    user_identifier = f"test_user_{uid}@medguide.ai"

    with Session(engine) as db:
        patient_role = None
        user = None
        doc = None
        try:
            # Create Role
            patient_role = Role(name=role_name)
            db.add(patient_role)
            db.commit()
            db.refresh(patient_role)
            assert patient_role.id is not None

            # Create User
            user = User(
                role_id=patient_role.id,
                login_identifier=user_identifier,
                password_hash="hashed_secret_password",
            )
            db.add(user)
            db.commit()
            db.refresh(user)

            # Create PatientProfile
            profile = PatientProfile(
                user_id=user.id,
                display_name="Test Patient M2",
                preferred_language="te",
            )
            db.add(profile)
            db.commit()

            # Create MedicalDocument & KnowledgeChunk with Vector(384)
            doc = MedicalDocument(
                title="Test Guideline",
                publisher="WHO",
                language="en",
            )
            db.add(doc)
            db.commit()

            dummy_vector = [0.1] * 384
            chunk = KnowledgeChunk(
                document_id=doc.id,
                chunk_index=0,
                content="Sample medical text chunk for testing pgvector.",
                embedding=dummy_vector,
                metadata_={"category": "fever_management"},
            )
            db.add(chunk)
            db.commit()
            db.refresh(chunk)

            assert chunk.embedding is not None
            assert len(chunk.embedding) == 384
            assert chunk.metadata_["category"] == "fever_management"
        finally:
            if doc and doc.id:
                db.delete(doc)
            if user and user.id:
                db.delete(user)
            if patient_role and patient_role.id:
                db.delete(patient_role)
            db.commit()
