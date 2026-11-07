from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.deps import get_current_user, get_db
from app.schemas.auth import StandardResponse
from app.schemas.public_health import CareAccessSearch, PublicHealthSearch
from app.services.public_health_retrieval import search_care_access, search_public_health
from app.services.knowledge_service import EmbeddingUnavailableError

router = APIRouter()


@router.post("/care-access/search", response_model=StandardResponse)
def care_access(req: CareAccessSearch, user=Depends(get_current_user), db: Session=Depends(get_db)):
    """Authenticated, source-attributed programme information; no availability claims.

    401/403 authentication, 422 invalid filters, 503 unavailable encoder.
    """
    try:
        matches = search_care_access(db, req)
    except EmbeddingUnavailableError:
        raise HTTPException(503, "Care information search is temporarily unavailable") from None
    return StandardResponse(success=True, data={"matches": matches,
        "scope": "service_navigation", "geography": req.geography,
        "population_setting": req.population_setting,
        "notice": "These sources describe care programmes, not live local availability. Ask your local ASHA or health centre about current services and dates."})


@router.post("/search", response_model=StandardResponse)
def search(req: PublicHealthSearch, user=Depends(get_current_user), db: Session=Depends(get_db)):
    """Authenticated source search; dates/geography required, no generated medical advice.

    401/403: authentication; 422: invalid filters; 503: embedding unavailable.
    No matches is a successful empty result, never fabricated statistics.
    """
    try:
        matches = search_public_health(db, req)
    except EmbeddingUnavailableError:
        raise HTTPException(503, "Evidence search is temporarily unavailable") from None
    return StandardResponse(success=True, data={"matches":matches,
        "scope":"population_surveillance", "period_start":req.period_start,
        "period_end":req.period_end, "geography":req.geography, "population_setting":req.population_setting,
        "notice":"Historical population evidence. It does not determine your personal risk or diagnosis. No matches does not mean no disease or outbreak."})
