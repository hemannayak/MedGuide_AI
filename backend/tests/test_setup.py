from unittest.mock import patch

from app.core.config import Settings
from app.db.session import check_database_connection


def test_default_cors_is_limited_to_local_frontend():
    config = Settings(_env_file=None)
    assert "*" not in config.CORS_ORIGINS
    assert "http://localhost:3000" in config.CORS_ORIGINS


def test_database_failure_does_not_expose_connection_details():
    with patch("app.db.session.engine.connect", side_effect=RuntimeError("private-password")):
        result = check_database_connection()
    assert result == {
        "status": "disconnected", "details": "Database connection unavailable"
    }


def test_cors_preflight_allows_local_frontend(client):
    response = client.options("/api/v1/health", headers={
        "Origin": "http://localhost:3000",
        "Access-Control-Request-Method": "GET",
    })
    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "http://localhost:3000"


def test_cors_preflight_rejects_unknown_origin(client):
    response = client.options("/api/v1/health", headers={
        "Origin": "https://untrusted.example",
        "Access-Control-Request-Method": "GET",
    })
    assert response.status_code == 400
    assert "access-control-allow-origin" not in response.headers
