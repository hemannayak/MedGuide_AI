import pytest
from pydantic import ValidationError
from sqlalchemy.engine import make_url
from app.core.config import Settings


def test_database_password_is_url_encoded():
    config = Settings(_env_file=None, DATABASE_URL=None, POSTGRES_PASSWORD="p@ss:/?#%")
    assert make_url(config.sqlalchemy_database_url).password == "p@ss:/?#%"


@pytest.mark.parametrize("overrides", [
    {"DEBUG": True},
    {"SECRET_KEY": "short"},
    {"SECRET_KEY": "change-this-in-production-super-secret-key-32bytes"},
    {"AI_PROVIDER": "mock"},
    {"TRANSLATION_PROVIDER": "mock"},
    {"CORS_ORIGINS": ["*"]},
])
def test_production_rejects_unsafe_configuration(overrides):
    values = dict(APP_ENV="production", DEBUG=False, SECRET_KEY="x" * 48,
                  AI_PROVIDER="ollama", TRANSLATION_PROVIDER="disabled")
    values.update(overrides)
    with pytest.raises(ValidationError):
        Settings(_env_file=None, **values)
