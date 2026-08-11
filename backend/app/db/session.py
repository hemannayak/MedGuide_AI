from typing import Generator
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

from app.core.config import settings
from app.db.base_class import Base



# Create SQLAlchemy engine
engine = create_engine(
    settings.sqlalchemy_database_url,
    pool_pre_ping=True,
    echo=False,
)

# Session factory for API requests
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator:
    """Dependency to provide database sessions per request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def check_database_connection() -> dict:
    """Safely check if the database is reachable without throwing unhandled exceptions."""
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        return {"status": "connected", "details": "Database connection verified"}
    except Exception as exc:
        return {"status": "disconnected", "details": str(exc)}
