from typing import List, Dict, Tuple
from app.embeddings.transformer_service import TransformerService
from app.baseline.tfidf_matcher import TfidfMatcher
from app.taxonomy.skill_taxonomy import SkillTaxonomy
from app.models.schemas import SkillGapItem, SkillGapResponse, SemanticMatchResponse

class SemanticMatcher:

    def __init__(self):
        self.transformer_service = TransformerService.get_instance()
        self.tfidf_matcher = TfidfMatcher()

    def calculate_semantic_match(self, resume_text: str, job_description: str) -> SemanticMatchResponse:
        # 1. Deep Learning Transformer Cosine Similarity
        emb_resume = self.transformer_service.encode(resume_text)
        emb_job = self.transformer_service.encode(job_description)
        transformer_sim = self.transformer_service.calculate_cosine_similarity(emb_resume, emb_job)

        # Scale to 0-100
        transformer_score = round(transformer_sim * 100.0, 1)

        # 2. Classical TF-IDF Baseline Cosine Similarity
        tfidf_sim = self.tfidf_matcher.calculate_similarity(resume_text, job_description)
        tfidf_score = round(tfidf_sim * 100.0, 1)

        return SemanticMatchResponse(
            transformer_similarity=round(transformer_sim, 4),
            transformer_score=transformer_score,
            tfidf_similarity=round(tfidf_sim, 4),
            tfidf_score=tfidf_score
        )

    def analyze_skill_gaps(
        self,
        resume_skills: List[str],
        job_required_skills: List[str],
        job_preferred_skills: List[str] = None
    ) -> SkillGapResponse:
        if job_preferred_skills is None:
            job_preferred_skills = []

        # Canonical normalization of candidate skills
        candidate_canonical_map = {}
        for s in resume_skills:
            norm = SkillTaxonomy.normalize_skill(s)
            if norm:
                canon, cat = norm
                candidate_canonical_map[canon.lower()] = (canon, cat)
            else:
                candidate_canonical_map[s.strip().lower()] = (s.strip(), "General")

        matched_items: List[SkillGapItem] = []
        partial_items: List[SkillGapItem] = []
        missing_items: List[SkillGapItem] = []

        total_weight = 0.0
        earned_weight = 0.0

        all_job_skills = [(s, True, 1.0) for s in job_required_skills] + \
                         [(s, False, 0.7) for s in job_preferred_skills]

        # Skill category affinities for partial matches (e.g. Spring Framework -> Spring Boot)
        skill_affinity = {
            "spring boot": ["spring framework", "spring security", "hibernate", "java"],
            "react": ["javascript", "typescript", "html5", "css3"],
            "postgresql": ["mysql", "sql"],
            "mysql": ["postgresql", "sql"],
            "docker": ["kubernetes", "ci/cd", "linux"],
            "aws": ["azure", "gcp", "cloud"],
            "pytorch": ["tensorflow", "scikit-learn", "deep learning"],
            "fastapi": ["django", "flask", "python"]
        }

        for raw_job_skill, is_required, importance in all_job_skills:
            total_weight += importance
            norm = SkillTaxonomy.normalize_skill(raw_job_skill)
            job_canon, category = norm if norm else (raw_job_skill.strip(), "General")
            job_canon_lower = job_canon.lower()

            # Exact canonical match
            if job_canon_lower in candidate_canonical_map:
                matched_items.append(SkillGapItem(
                    skill=raw_job_skill,
                    canonical_name=job_canon,
                    category=category,
                    match_type="MATCHED",
                    importance=importance,
                    similarity_score=1.0,
                    is_required=is_required,
                    matched_with=job_canon
                ))
                earned_weight += importance
            else:
                # Check for partial / related affinity match
                related_candidates = skill_affinity.get(job_canon_lower, [])
                partial_match_found = None

                for rel in related_candidates:
                    if rel in candidate_canonical_map:
                        partial_match_found = candidate_canonical_map[rel][0]
                        break

                if partial_match_found:
                    partial_items.append(SkillGapItem(
                        skill=raw_job_skill,
                        canonical_name=job_canon,
                        category=category,
                        match_type="PARTIAL",
                        importance=importance,
                        similarity_score=0.7,
                        is_required=is_required,
                        matched_with=partial_match_found
                    ))
                    earned_weight += (importance * 0.7)
                else:
                    missing_items.append(SkillGapItem(
                        skill=raw_job_skill,
                        canonical_name=job_canon,
                        category=category,
                        match_type="MISSING",
                        importance=importance,
                        similarity_score=0.0,
                        is_required=is_required
                    ))

        skill_score = (earned_weight / total_weight * 100.0) if total_weight > 0 else 80.0
        skill_score = round(min(100.0, max(0.0, skill_score)), 1)

        return SkillGapResponse(
            skill_score=skill_score,
            matched_skills=matched_items,
            partially_matched_skills=partial_items,
            missing_skills=missing_items
        )
