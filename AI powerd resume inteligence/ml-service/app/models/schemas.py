from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class SkillExtractRequest(BaseModel):
    text: str = Field(..., description="Raw text of resume or job description")

class ExtractedSkill(BaseModel):
    name: str
    canonical_name: str
    category: str
    confidence: float = 1.0
    context_snippet: Optional[str] = None

class ResumeParseResponse(BaseModel):
    candidate_name: Optional[str] = None
    candidate_email: Optional[str] = None
    candidate_phone: Optional[str] = None
    candidate_education: Optional[str] = None
    candidate_experience_years: float = 0.0
    skills: List[ExtractedSkill] = []
    sections: Dict[str, str] = {}

class EmbeddingRequest(BaseModel):
    text: str

class BatchEmbeddingRequest(BaseModel):
    texts: List[str]

class EmbeddingResponse(BaseModel):
    dimension: int
    embedding: List[float]

class SemanticMatchRequest(BaseModel):
    resume_text: str
    job_description: str

class SemanticMatchResponse(BaseModel):
    transformer_similarity: float
    transformer_score: float
    tfidf_similarity: float
    tfidf_score: float

class SkillGapRequest(BaseModel):
    resume_skills: List[str]
    job_required_skills: List[str]
    job_preferred_skills: Optional[List[str]] = []

class SkillGapItem(BaseModel):
    skill: str
    canonical_name: str
    category: str
    match_type: str  # MATCHED, PARTIAL, MISSING
    importance: float = 1.0
    similarity_score: float = 0.0
    is_required: bool = True
    matched_with: Optional[str] = None

class SkillGapResponse(BaseModel):
    skill_score: float
    matched_skills: List[SkillGapItem] = []
    partially_matched_skills: List[SkillGapItem] = []
    missing_skills: List[SkillGapItem] = []

class InterviewEvalRequest(BaseModel):
    question: str
    expected_concepts: List[str]
    sample_ideal_answer: Optional[str] = None
    candidate_answer: str

class InterviewEvalResponse(BaseModel):
    relevance_score: float
    concept_coverage_score: float
    completeness_score: float
    overall_score: float
    feedback: str
