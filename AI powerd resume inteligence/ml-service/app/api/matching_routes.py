from fastapi import APIRouter, HTTPException
from app.models.schemas import (
    SemanticMatchRequest,
    SemanticMatchResponse,
    SkillGapRequest,
    SkillGapResponse
)
from app.matching.semantic_matcher import SemanticMatcher

router = APIRouter(prefix="/matching", tags=["Matching & Similarity"])
matcher = SemanticMatcher()

@router.post("/semantic", response_model=SemanticMatchResponse)
def compute_semantic_similarity(request: SemanticMatchRequest):
    """
    Computes semantic similarity comparing Classical TF-IDF baseline against Deep Learning Transformer.
    """
    try:
        return matcher.calculate_semantic_match(request.resume_text, request.job_description)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error computing semantic match: {str(e)}")

@router.post("/gap", response_model=SkillGapResponse)
def analyze_skill_gap(request: SkillGapRequest):
    """
    Evaluates matched, partially matched (synonyms/affinities), and missing skills.
    """
    try:
        return matcher.analyze_skill_gaps(
            resume_skills=request.resume_skills,
            job_required_skills=request.job_required_skills,
            job_preferred_skills=request.job_preferred_skills or []
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error in skill gap analysis: {str(e)}")
