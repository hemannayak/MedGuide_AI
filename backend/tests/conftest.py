import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture
def client():
    """Provide a TestClient instance for API tests."""
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def db_session():
    """Provide a SQLAlchemy database session for backend testing."""
    from app.db.session import SessionLocal
    db = SessionLocal()
    try:
        yield db
    finally:
        db.rollback()
        db.close()

