from fastapi import APIRouter
from app.models.schemas import BugMatchRequest, BugMatchResponse
from app.defects.historical_bug_service import HistoricalBugService

router = APIRouter(prefix="/defects", tags=["Historical Defects"])
_service = HistoricalBugService()

@router.post("/match", response_model=BugMatchResponse)
def match_historical_defects(request: BugMatchRequest):
    matches = _service.find_similar_defects(request.code_diff, top_k=request.top_k)
    return BugMatchResponse(matches=matches)
