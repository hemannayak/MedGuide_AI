from unittest.mock import patch


# Deterministic DB response used by tests that need the health endpoint.
# Keeps tests runnable on any machine regardless of PostgreSQL availability.
_MOCK_DB_CONNECTED = {"status": "connected", "details": "Mocked for test isolation"}


def test_app_importable():
    """Verify FastAPI application can be imported cleanly."""
    from app.main import app
    assert app is not None


def test_health_check_endpoint(client):
    """Verify GET /api/v1/health returns 200 OK with expected JSON keys.

    check_database_connection is patched at app.main (the call-site) so this
    test never opens a real PostgreSQL connection and is runnable on any
    machine without a database installed.
    """
    with patch("app.main.check_database_connection", return_value=_MOCK_DB_CONNECTED):
        response = client.get("/api/v1/health")

    assert response.status_code == 200

    data = response.json()
    assert data["status"] == "ok"
    assert data["api_version"] == "v1"
    assert "app_name" in data
    assert "environment" in data
    assert "database" in data
    assert data["database"]["status"] == "connected"


def test_health_returns_503_when_database_unavailable(client):
    with patch("app.main.check_database_connection", return_value={"status": "disconnected", "details": "Database unavailable"}):
        response = client.get("/api/v1/health")
    assert response.status_code == 503
    assert response.json()["status"] == "unavailable"


def test_cors_allows_configured_frontend(client):
    from app.core.config import settings
    response = client.options("/api/v1/auth/login", headers={
        "Origin": settings.CORS_ORIGINS[0],
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "authorization,content-type",
    })
    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == settings.CORS_ORIGINS[0]


def test_cors_rejects_unknown_origin(client):
    response = client.options("/api/v1/auth/login", headers={
        "Origin": "https://untrusted.example",
        "Access-Control-Request-Method": "POST",
    })
    assert response.status_code == 400
    assert "access-control-allow-origin" not in response.headers
