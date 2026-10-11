package com.careermind.client.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

public class MlClientDtos {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SkillExtractRequest {
        private String text;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ExtractedSkillItem {
        private String name;
        @JsonProperty("canonical_name")
        private String canonicalName;
        private String category;
        private Double confidence;
        @JsonProperty("context_snippet")
        private String contextSnippet;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ResumeParseResponse {
        @JsonProperty("candidate_name")
        private String candidateName;
        @JsonProperty("candidate_email")
        private String candidateEmail;
        @JsonProperty("candidate_phone")
        private String candidatePhone;
        @JsonProperty("candidate_education")
        private String candidateEducation;
        @JsonProperty("candidate_experience_years")
        private Double candidateExperienceYears;
        private List<ExtractedSkillItem> skills;
        private Map<String, String> sections;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SemanticMatchRequest {
        @JsonProperty("resume_text")
        private String resumeText;
        @JsonProperty("job_description")
        private String jobDescription;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SemanticMatchResponse {
        @JsonProperty("transformer_similarity")
        private Double transformerSimilarity;
        @JsonProperty("transformer_score")
        private Double transformerScore;
        @JsonProperty("tfidf_similarity")
        private Double tfidfSimilarity;
        @JsonProperty("tfidf_score")
        private Double tfidfScore;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SkillGapRequest {
        @JsonProperty("resume_skills")
        private List<String> resumeSkills;
        @JsonProperty("job_required_skills")
        private List<String> jobRequiredSkills;
        @JsonProperty("job_preferred_skills")
        private List<String> jobPreferredSkills;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SkillGapItem {
        private String skill;
        @JsonProperty("canonical_name")
        private String canonicalName;
        private String category;
        @JsonProperty("match_type")
        private String matchType; // MATCHED, PARTIAL, MISSING
        private Double importance;
        @JsonProperty("similarity_score")
        private Double similarityScore;
        @JsonProperty("is_required")
        private Boolean isRequired;
        @JsonProperty("matched_with")
        private String matchedWith;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SkillGapResponse {
        @JsonProperty("skill_score")
        private Double skillScore;
        @JsonProperty("matched_skills")
        private List<SkillGapItem> matchedSkills;
        @JsonProperty("partially_matched_skills")
        private List<SkillGapItem> partiallyMatchedSkills;
        @JsonProperty("missing_skills")
        private List<SkillGapItem> missingSkills;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InterviewEvalRequest {
        private String question;
        @JsonProperty("expected_concepts")
        private List<String> expectedConcepts;
        @JsonProperty("sample_ideal_answer")
        private String sampleIdealAnswer;
        @JsonProperty("candidate_answer")
        private String candidateAnswer;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InterviewEvalResponse {
        @JsonProperty("relevance_score")
        private Double relevanceScore;
        @JsonProperty("concept_coverage_score")
        private Double conceptCoverageScore;
        @JsonProperty("completeness_score")
        private Double completenessScore;
        @JsonProperty("overall_score")
        private Double overallScore;
        private String feedback;
    }
}
