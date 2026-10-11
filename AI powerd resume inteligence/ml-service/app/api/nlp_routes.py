from fastapi import APIRouter, HTTPException
from typing import List
from app.models.schemas import SkillExtractRequest, ExtractedSkill, ResumeParseResponse
from app.ner.entity_extractor import EntityExtractor

router = APIRouter(prefix="/nlp", tags=["NLP & Information Extraction"])

@router.post("/extract", response_model=ResumeParseResponse)
def extract_resume_info(request: SkillExtractRequest):
    """
    Extracts structured entities, contact details, education, experience,
    and normalized skills from raw resume text.
    """
    try:
        entities = EntityExtractor.extract_entities(request.text)
        return ResumeParseResponse(**entities)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error extracting resume information: {str(e)}")

@router.post("/skills", response_model=List[ExtractedSkill])
def extract_skills_only(request: SkillExtractRequest):
    """
    Extracts canonical skills with category mappings and context from text.
    """
    try:
        skills = EntityExtractor.extract_skills(request.text)
        return skills
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error extracting skills: {str(e)}")
