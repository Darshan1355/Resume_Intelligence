-- ==========================================================
-- CareerMind — AI Resume Intelligence & Job Matching Platform
-- Normalized MySQL 8.0+ Database Schema
-- ==========================================================

CREATE DATABASE IF NOT EXISTS careermind_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE careermind_db;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'ROLE_USER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Skills Table (Taxonomy & Canonical names)
CREATE TABLE IF NOT EXISTS skills (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    canonical_name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_skills_name (name),
    INDEX idx_skills_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Resumes Table
CREATE TABLE IF NOT EXISTS resumes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    stored_file_name VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    raw_text LONGTEXT NOT NULL,
    candidate_name VARCHAR(150),
    candidate_email VARCHAR(150),
    candidate_phone VARCHAR(50),
    candidate_education VARCHAR(255),
    candidate_experience_years DOUBLE DEFAULT 0.0,
    parsed_sections JSON,
    status VARCHAR(50) NOT NULL DEFAULT 'PROCESSED',
    archived BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_resumes_user_id (user_id),
    INDEX idx_resumes_user_archived_created (user_id, archived, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Resume Skills Table (Skills extracted from resume)
CREATE TABLE IF NOT EXISTS resume_skills (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    resume_id BIGINT NOT NULL,
    skill_id BIGINT NOT NULL,
    confidence DOUBLE NOT NULL DEFAULT 1.0,
    context_snippet VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE,
    UNIQUE KEY uq_resume_skill (resume_id, skill_id),
    INDEX idx_resume_skills_resume (resume_id),
    INDEX idx_resume_skills_skill (skill_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Jobs Table
CREATE TABLE IF NOT EXISTS jobs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    company VARCHAR(150) NOT NULL,
    description LONGTEXT NOT NULL,
    location VARCHAR(150) NOT NULL DEFAULT 'Remote',
    experience_required DOUBLE NOT NULL DEFAULT 0.0,
    education_required VARCHAR(100) DEFAULT 'Bachelor',
    embedding_vector JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_jobs_title (title),
    INDEX idx_jobs_company (company)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Job Skills Table
CREATE TABLE IF NOT EXISTS job_skills (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    job_id BIGINT NOT NULL,
    skill_id BIGINT NOT NULL,
    importance DOUBLE NOT NULL DEFAULT 1.0,
    is_required BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE,
    UNIQUE KEY uq_job_skill (job_id, skill_id),
    INDEX idx_job_skills_job (job_id),
    INDEX idx_job_skills_skill (skill_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Match Results Table
CREATE TABLE IF NOT EXISTS match_results (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    resume_id BIGINT NOT NULL,
    job_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    semantic_score DOUBLE NOT NULL,
    skill_score DOUBLE NOT NULL,
    experience_score DOUBLE NOT NULL,
    education_score DOUBLE NOT NULL,
    keyword_score DOUBLE NOT NULL,
    quality_score DOUBLE NOT NULL,
    final_ats_score DOUBLE NOT NULL,
    baseline_tfidf_score DOUBLE NOT NULL DEFAULT 0.0,
    explanation_json JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_match_resume (resume_id),
    INDEX idx_match_job (job_id),
    INDEX idx_match_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Match Skill Results Table (Breakdown of matched, missing, and partial skills)
CREATE TABLE IF NOT EXISTS match_skill_results (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    match_result_id BIGINT NOT NULL,
    skill_id BIGINT NOT NULL,
    match_type ENUM('MATCHED', 'PARTIAL', 'MISSING') NOT NULL,
    importance DOUBLE NOT NULL DEFAULT 1.0,
    similarity_score DOUBLE NOT NULL DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (match_result_id) REFERENCES match_results(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE,
    INDEX idx_msr_match (match_result_id),
    INDEX idx_msr_skill (skill_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Interview Sessions Table
CREATE TABLE IF NOT EXISTS interview_sessions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    resume_id BIGINT NOT NULL,
    job_id BIGINT NOT NULL,
    overall_score DOUBLE DEFAULT 0.0,
    status VARCHAR(50) NOT NULL DEFAULT 'IN_PROGRESS',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    INDEX idx_interview_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Interview Questions Table
CREATE TABLE IF NOT EXISTS interview_questions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_id BIGINT NOT NULL,
    category VARCHAR(50) NOT NULL,
    question_text TEXT NOT NULL,
    expected_concepts JSON,
    sample_ideal_answer TEXT,
    difficulty VARCHAR(30) DEFAULT 'MEDIUM',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES interview_sessions(id) ON DELETE CASCADE,
    INDEX idx_iq_session (session_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Interview Answers Table
CREATE TABLE IF NOT EXISTS interview_answers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    question_id BIGINT NOT NULL,
    candidate_answer LONGTEXT NOT NULL,
    relevance_score DOUBLE NOT NULL DEFAULT 0.0,
    concept_coverage_score DOUBLE NOT NULL DEFAULT 0.0,
    completeness_score DOUBLE NOT NULL DEFAULT 0.0,
    overall_score DOUBLE NOT NULL DEFAULT 0.0,
    feedback TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (question_id) REFERENCES interview_questions(id) ON DELETE CASCADE,
    INDEX idx_ia_question (question_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================================
-- Initial Skill Taxonomy Seeds
-- ==========================================================
INSERT IGNORE INTO skills (name, canonical_name, category) VALUES
('Java', 'Java', 'Programming Languages'),
('Python', 'Python', 'Programming Languages'),
('JavaScript', 'JavaScript', 'Programming Languages'),
('TypeScript', 'TypeScript', 'Programming Languages'),
('C++', 'C++', 'Programming Languages'),
('Go', 'Go', 'Programming Languages'),
('SQL', 'SQL', 'Database'),
('Spring Boot', 'Spring Boot', 'Backend'),
('Spring Framework', 'Spring Boot', 'Backend'),
('Spring Security', 'Spring Security', 'Backend'),
('Hibernate', 'Hibernate', 'Backend'),
('JPA', 'JPA', 'Backend'),
('FastAPI', 'FastAPI', 'Backend'),
('Django', 'Django', 'Backend'),
('Flask', 'Flask', 'Backend'),
('Node.js', 'Node.js', 'Backend'),
('Express', 'Express.js', 'Backend'),
('React', 'React', 'Frontend'),
('React.js', 'React', 'Frontend'),
('Angular', 'Angular', 'Frontend'),
('Vue.js', 'Vue.js', 'Frontend'),
('HTML5', 'HTML5', 'Frontend'),
('CSS3', 'CSS3', 'Frontend'),
('Tailwind CSS', 'Tailwind CSS', 'Frontend'),
('Bootstrap', 'Bootstrap', 'Frontend'),
('MySQL', 'MySQL', 'Database'),
('PostgreSQL', 'PostgreSQL', 'Database'),
('MongoDB', 'MongoDB', 'Database'),
('Redis', 'Redis', 'Database'),
('Docker', 'Docker', 'DevOps'),
('Kubernetes', 'Kubernetes', 'DevOps'),
('CI/CD', 'CI/CD', 'DevOps'),
('Jenkins', 'Jenkins', 'DevOps'),
('GitHub Actions', 'GitHub Actions', 'DevOps'),
('AWS', 'AWS', 'Cloud'),
('Azure', 'Azure', 'Cloud'),
('Google Cloud Platform', 'GCP', 'Cloud'),
('GCP', 'GCP', 'Cloud'),
('Kafka', 'Apache Kafka', 'Backend'),
('RabbitMQ', 'RabbitMQ', 'Backend'),
('PyTorch', 'PyTorch', 'Deep Learning'),
('TensorFlow', 'TensorFlow', 'Deep Learning'),
('Keras', 'Keras', 'Deep Learning'),
('scikit-learn', 'scikit-learn', 'Machine Learning'),
('pandas', 'pandas', 'Data Science'),
('NumPy', 'NumPy', 'Data Science'),
('spaCy', 'spaCy', 'NLP'),
('NLTK', 'NLTK', 'NLP'),
('Hugging Face Transformers', 'Transformers', 'NLP'),
('BERT', 'BERT', 'NLP'),
('Sentence-BERT', 'Sentence-BERT', 'NLP'),
('REST APIs', 'REST APIs', 'Backend'),
('Microservices', 'Microservices', 'Backend'),
('System Design', 'System Design', 'Backend'),
('JUnit', 'JUnit', 'Testing'),
('Mockito', 'Mockito', 'Testing'),
('PyTest', 'PyTest', 'Testing'),
('Git', 'Git', 'Tools'),
('Maven', 'Maven', 'Tools'),
('Gradle', 'Gradle', 'Tools'),
('Linux', 'Linux', 'Tools');
