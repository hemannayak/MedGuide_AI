from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.db.session import check_database_connection

app = FastAPI(
    title=settings.APP_NAME,
    description="MedGuide AI — Backend Application API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url=f"{settings.API_V1_PREFIX}/openapi.json",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API v1 Router
api_v1_router = APIRouter(prefix=settings.API_V1_PREFIX)


@api_v1_router.get("/health", tags=["Health Check"])
def health_check():
    """Health check endpoint exposing application operational status and DB connection state."""
    db_status = check_database_connection()
    return {
        "status": "ok",
        "app_name": settings.APP_NAME,
        "environment": settings.APP_ENV,
        "api_version": "v1",
        "database": db_status,
    }


# Register v1 router
app.include_router(api_v1_router)


@app.get("/", include_in_schema=False)
def root():
    """Root endpoint redirecting info."""
    return {"message": f"Welcome to {settings.APP_NAME}. API documentation at /docs"}
