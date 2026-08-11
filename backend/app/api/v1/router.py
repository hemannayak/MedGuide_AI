from fastapi import APIRouter

from app.api.v1.endpoints import (
    ai,
    alerts,
    auth,
    consent,
    follow_ups,
    healthcare_workers,
    medications,
    patients,
    symptoms,
    timeline,
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(patients.router, prefix="/patients", tags=["Patient Profiles"])
api_router.include_router(symptoms.router, prefix="/symptoms", tags=["Symptoms & Triage"])
api_router.include_router(ai.router, prefix="/ai", tags=["AI Companion & RAG"])
api_router.include_router(medications.router, prefix="/medications", tags=["Medications & Adherence"])
api_router.include_router(timeline.router, prefix="/timeline", tags=["Health Timeline"])
api_router.include_router(alerts.router, prefix="/alerts", tags=["Safety Alerts"])
api_router.include_router(consent.router, prefix="/consent", tags=["Consent Management"])
api_router.include_router(healthcare_workers.router, prefix="/healthcare-workers", tags=["Healthcare Worker"])
api_router.include_router(follow_ups.router, prefix="/follow-ups", tags=["Care Follow-Ups"])
