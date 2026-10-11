ALTER TABLE resumes
    ADD COLUMN archived BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX idx_resumes_user_archived_created
    ON resumes (user_id, archived, created_at);