import numpy as np
from fastapi import APIRouter, HTTPException
from app.models.schemas import InterviewEvalRequest, InterviewEvalResponse
from app.embeddings.transformer_service import TransformerService
from app.baseline.tfidf_matcher import TfidfMatcher

router = APIRouter(prefix="/interview", tags=["Interview Evaluation"])

@router.post("/evaluate", response_model=InterviewEvalResponse)
def evaluate_candidate_answer(request: InterviewEvalRequest):
    """
    Evaluates candidate interview response along 4 core dimensions:
    1. Relevance Score (semantic closeness to question & ideal answer)
    2. Concept Coverage Score (presence and depth of required technical concepts)
    3. Completeness Score (elaboration and clarity of explanation)
    4. Overall Composite Technical Score
    """
    try:
        transformer = TransformerService.get_instance()
        tfidf = TfidfMatcher()

        candidate_ans = request.candidate_answer.strip()
        if not candidate_ans or len(candidate_ans) < 10:
            return InterviewEvalResponse(
                relevance_score=25.0,
                concept_coverage_score=15.0,
                completeness_score=20.0,
                overall_score=20.0,
                feedback="Response is too brief to demonstrate technical competence. Please elaborate on underlying architectural concepts."
            )

        # 1. Semantic Relevance
        emb_cand = transformer.encode(candidate_ans)
        ref_text = request.sample_ideal_answer if request.sample_ideal_answer else request.question
        emb_ref = transformer.encode(ref_text)
        relevance_sim = transformer.calculate_cosine_similarity(emb_cand, emb_ref)
        relevance_score = round(min(100.0, max(30.0, relevance_sim * 100.0)), 1)

        # 2. Concept Coverage
        lower_ans = candidate_ans.lower()
        matched_concepts = []
        missing_concepts = []

        for concept in request.expected_concepts:
            if concept.lower() in lower_ans:
                matched_concepts.append(concept)
            else:
                missing_concepts.append(concept)

        total_concepts = len(request.expected_concepts)
        if total_concepts > 0:
            concept_coverage_score = round((len(matched_concepts) / total_concepts) * 100.0, 1)
        else:
            concept_coverage_score = 80.0

        # 3. Completeness (heuristic based on content length, technical term density)
        word_count = len(candidate_ans.split())
        completeness_score = round(min(100.0, max(40.0, (word_count / 60.0) * 100.0)), 1)

        # 4. Overall Score (Weighted: 40% Relevance + 40% Concept Coverage + 20% Completeness)
        overall = (0.40 * relevance_score) + (0.40 * concept_coverage_score) + (0.20 * completeness_score)
        overall_score = round(min(100.0, max(0.0, overall)), 1)

        # Structured feedback
        feedback_parts = []
        if matched_concepts:
            feedback_parts.append(f"Successfully addressed key concepts: {', '.join(matched_concepts)}.")
        if missing_concepts:
            feedback_parts.append(f"Could be strengthened by discussing: {', '.join(missing_concepts)}.")
        if word_count < 30:
            feedback_parts.append("Consider providing a concrete production example or deeper architectural walkthrough.")

        feedback = " ".join(feedback_parts) if feedback_parts else "Comprehensive and technically sound explanation."

        return InterviewEvalResponse(
            relevance_score=relevance_score,
            concept_coverage_score=concept_coverage_score,
            completeness_score=completeness_score,
            overall_score=overall_score,
            feedback=feedback
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Interview evaluation error: {str(e)}")
