"""Run tests against a separate synthetic PostgreSQL database, never the app DB."""
import os
import subprocess
import sys
from pathlib import Path

from sqlalchemy import create_engine, text
from sqlalchemy.engine import make_url
from app.core.config import settings


def main():
    root = Path(__file__).resolve().parent
    source = make_url(settings.sqlalchemy_database_url)
    test_name = "medguide_ai_test"
    if source.database == test_name:
        raise SystemExit("Run this script with the application database configured.")
    admin = create_engine(source.set(database="postgres"), isolation_level="AUTOCOMMIT")
    with admin.connect() as connection:
        exists = connection.execute(text("SELECT 1 FROM pg_database WHERE datname = :name"), {"name": test_name}).scalar()
        if not exists:
            connection.execute(text('CREATE DATABASE "medguide_ai_test"'))
    admin.dispose()
    env = os.environ.copy()
    env.update(DATABASE_URL=source.set(database=test_name).render_as_string(hide_password=False),
               AI_PROVIDER="mock", TRANSLATION_PROVIDER="mock", OCR_PROVIDER="mock", APP_ENV="test", DEBUG="false")
    env["PYTHONPATH"] = str(root)
    subprocess.run([sys.executable, "-m", "alembic", "upgrade", "head"], cwd=root, env=env, check=True)
    result = subprocess.run([sys.executable, "-m", "pytest", "backend/tests", "-q", "-p", "no:cacheprovider", *sys.argv[1:]], cwd=root.parent, env=env)
    return result.returncode


if __name__ == "__main__":
    raise SystemExit(main())
