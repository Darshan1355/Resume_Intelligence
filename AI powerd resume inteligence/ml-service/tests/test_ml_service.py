import pytest
from app.preprocessing.text_cleaner import TextCleaner
from app.taxonomy.skill_taxonomy import SkillTaxonomy
from app.ner.entity_extractor import EntityExtractor
from app.baseline.tfidf_matcher import TfidfMatcher
from app.embeddings.transformer_service import TransformerService
from app.matching.semantic_matcher import SemanticMatcher

def test_text_cleaner_and_section_split():
    text = """
    John Doe
    john.doe@example.com

    EXPERIENCE
    Senior Java Developer at TechCorp. Built microservices using Spring Boot.

    EDUCATION
    Master of Computer Science from Stanford University.

    SKILLS
    Java, Spring Boot, MySQL, Docker, Kubernetes.
    """
    cleaned = TextCleaner.clean_text(text)
    assert "John Doe" in cleaned
    assert len(cleaned) > 0

    sections = TextCleaner.extract_sections(text)
    assert "experience" in sections or "skills" in sections or "education" in sections

def test_skill_taxonomy_normalization():
    norm_sb = SkillTaxonomy.normalize_skill("springboot")
    assert norm_sb is not None
    assert norm_sb[0] == "Spring Boot"
    assert norm_sb[1] == "Backend"

    norm_py = SkillTaxonomy.normalize_skill("python3")
    assert norm_py is not None
    assert norm_py[0] == "Python"
    assert norm_py[1] == "Programming Languages"

    norm_k8s = SkillTaxonomy.normalize_skill("k8s")
    assert norm_k8s is not None
    assert norm_k8s[0] == "Kubernetes"
    assert norm_k8s[1] == "DevOps"

def test_entity_extractor():
    sample_resume = """
    Aditya Sharma
    aditya.sharma@example.com | (555) 123-4567
    5+ years of experience in backend development.

    EDUCATION
    Master of Science in Computer Engineering

    EXPERIENCE
    Developed REST APIs in Java, Spring Boot, Hibernate, MySQL, and Docker.
    """
    entities = EntityExtractor.extract_entities(sample_resume)
    assert entities["candidate_email"] == "aditya.sharma@example.com"
    assert entities["candidate_experience_years"] >= 5.0
    assert "Master" in entities["candidate_education"]

    skill_names = [s.canonical_name for s in entities["skills"]]
    assert "Java" in skill_names
    assert "Spring Boot" in skill_names
    assert "MySQL" in skill_names
    assert "Docker" in skill_names

def test_tfidf_matcher_baseline():
    doc1 = "Java Spring Boot developer with microservices, MySQL and REST API experience."
    doc2 = "Looking for Senior Java Spring Boot Engineer to design microservices and MySQL databases."
    doc3 = "Veterinarian with experience in animal surgery and veterinary medicine."

    matcher = TfidfMatcher()
    sim_high = matcher.calculate_similarity(doc1, doc2)
    sim_low = matcher.calculate_similarity(doc1, doc3)

    assert sim_high > sim_low
    assert sim_high > 0.20
    assert sim_low <= 0.10

def test_transformer_service_embeddings():
    service = TransformerService.get_instance()
    emb1 = service.encode("Senior backend engineer building cloud microservices")
    emb2 = service.encode("Lead software developer creating distributed backend systems")
    emb3 = service.encode("Pastry chef baking artisan sourdough bread")

    assert len(emb1) == 384
    sim_similar = service.calculate_cosine_similarity(emb1, emb2)
    sim_different = service.calculate_cosine_similarity(emb1, emb3)

    assert sim_similar > sim_different

def test_skill_gap_analysis():
    matcher = SemanticMatcher()
    resume_skills = ["Java", "Spring Boot", "MySQL", "Docker"]
    required_skills = ["Java", "Spring Boot", "PostgreSQL", "Kafka"]
    preferred_skills = ["Kubernetes"]

    result = matcher.analyze_skill_gaps(resume_skills, required_skills, preferred_skills)

    matched_names = [m.canonical_name for m in result.matched_skills]
    assert "Java" in matched_names
    assert "Spring Boot" in matched_names

    # MySQL -> PostgreSQL should be partial match
    partial_names = [p.canonical_name for p in result.partially_matched_skills]
    assert "PostgreSQL" in partial_names

    # Kafka should be missing
    missing_names = [m.canonical_name for m in result.missing_skills]
    assert "Apache Kafka" in missing_names or "Kafka" in missing_names

    assert 0.0 <= result.skill_score <= 100.0
