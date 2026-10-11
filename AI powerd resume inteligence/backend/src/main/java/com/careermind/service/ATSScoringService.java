package com.careermind.service;

import com.careermind.dto.AtsScoreBreakdownDto;
import com.careermind.dto.SkillMatchDetailDto;
import com.careermind.entity.Job;
import com.careermind.entity.Resume;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
@Slf4j
public class ATSScoringService {

    /**
     * Non-negotiable ATS Scoring Formula:
     * ATS Score = 0.30 * SkillScore
     *           + 0.30 * SemanticScore
     *           + 0.15 * ExperienceScore
     *           + 0.10 * EducationScore
     *           + 0.10 * KeywordScore
     *           + 0.05 * QualityScore
     */
    public AtsScoreBreakdownDto calculateAtsScore(
            Resume resume,
            Job job,
            double semanticScore,
            double skillScore,
            double tfidfScore,
            List<SkillMatchDetailDto> matchedSkills,
            List<SkillMatchDetailDto> missingSkills,
            List<SkillMatchDetailDto> partialSkills
    ) {
        log.debug("Calculating explainable ATS score for resume ID {} vs job ID {}", resume.getId(), job.getId());

        // 1. Skill Score (30%) - Normalized 0-100
        double normSkillScore = Math.min(100.0, Math.max(0.0, skillScore));

        // 2. Semantic Score (30%) - Normalized 0-100 (from Sentence-BERT / all-MiniLM-L6-v2)
        double normSemanticScore = Math.min(100.0, Math.max(0.0, semanticScore));

        // 3. Experience Score (15%) - Normalized 0-100
        double normExpScore = calculateExperienceScore(resume.getCandidateExperienceYears(), job.getExperienceRequired());

        // 4. Education Score (10%) - Normalized 0-100
        double normEduScore = calculateEducationScore(resume.getCandidateEducation(), job.getEducationRequired());

        // 5. Keyword Score (10%) - Normalized 0-100 (from TF-IDF & term coverage)
        double normKeywordScore = Math.min(100.0, Math.max(0.0, tfidfScore));

        // 6. Resume Quality Score (5%) - Normalized 0-100 (action verbs, structure, readability)
        double normQualityScore = calculateQualityScore(resume.getRawText());

        // Final Composite Score
        double finalScore = (0.30 * normSkillScore)
                + (0.30 * normSemanticScore)
                + (0.15 * normExpScore)
                + (0.10 * normEduScore)
                + (0.10 * normKeywordScore)
                + (0.05 * normQualityScore);

        // Round to 1 decimal place
        finalScore = Math.round(finalScore * 10.0) / 10.0;
        normSkillScore = Math.round(normSkillScore * 10.0) / 10.0;
        normSemanticScore = Math.round(normSemanticScore * 10.0) / 10.0;
        normExpScore = Math.round(normExpScore * 10.0) / 10.0;
        normEduScore = Math.round(normEduScore * 10.0) / 10.0;
        normKeywordScore = Math.round(normKeywordScore * 10.0) / 10.0;
        normQualityScore = Math.round(normQualityScore * 10.0) / 10.0;

        // Generate explainability breakdown
        List<String> keyStrengths = generateStrengths(normSkillScore, normSemanticScore, normExpScore, matchedSkills);
        List<String> missingSkillsSummary = generateMissingSummary(missingSkills, partialSkills);
        List<String> recommendations = generateRecommendations(missingSkills, normExpScore, normQualityScore);
        String executiveSummary = generateExecutiveSummary(finalScore, job.getTitle(), job.getCompany(), normSkillScore, normSemanticScore);

        return AtsScoreBreakdownDto.builder()
                .finalScore(finalScore)
                .skillScore(normSkillScore)
                .semanticScore(normSemanticScore)
                .experienceScore(normExpScore)
                .educationScore(normEduScore)
                .keywordScore(normKeywordScore)
                .qualityScore(normQualityScore)
                .baselineTfidfScore(normKeywordScore)
                .keyStrengths(keyStrengths)
                .missingSkillsSummary(missingSkillsSummary)
                .improvementRecommendations(recommendations)
                .executiveSummary(executiveSummary)
                .build();
    }

    private double calculateExperienceScore(Double candidateYears, Double requiredYears) {
        if (requiredYears == null || requiredYears <= 0.0) {
            return 100.0;
        }
        double candidate = (candidateYears != null) ? candidateYears : 0.0;
        if (candidate >= requiredYears) {
            return 100.0;
        }
        // Proportional score with diminishing penalty
        double ratio = candidate / requiredYears;
        return Math.min(100.0, Math.max(20.0, ratio * 100.0));
    }

    private double calculateEducationScore(String candidateEdu, String requiredEdu) {
        if (requiredEdu == null || requiredEdu.isBlank() || requiredEdu.equalsIgnoreCase("any")) {
            return 100.0;
        }
        if (candidateEdu == null || candidateEdu.isBlank()) {
            return 60.0;
        }

        String cand = candidateEdu.toLowerCase(Locale.ROOT);
        String req = requiredEdu.toLowerCase(Locale.ROOT);

        int candRank = getEducationRank(cand);
        int reqRank = getEducationRank(req);

        if (candRank >= reqRank) {
            return 100.0;
        } else if (candRank == reqRank - 1) {
            return 80.0;
        } else {
            return 60.0;
        }
    }

    private int getEducationRank(String edu) {
        if (edu.contains("phd") || edu.contains("doctor") || edu.contains("ph.d")) return 4;
        if (edu.contains("master") || edu.contains("m.tech") || edu.contains("ms") || edu.contains("mba")) return 3;
        if (edu.contains("bachelor") || edu.contains("b.tech") || edu.contains("bs") || edu.contains("be") || edu.contains("degree")) return 2;
        if (edu.contains("diploma") || edu.contains("associate")) return 1;
        return 2; // Default reasonable baseline
    }

    private double calculateQualityScore(String rawText) {
        if (rawText == null || rawText.isBlank()) {
            return 40.0;
        }
        double score = 60.0;
        String lower = rawText.toLowerCase(Locale.ROOT);

        // Action verbs presence
        String[] actionVerbs = {"architected", "developed", "built", "implemented", "designed", "optimized", "managed", "deployed", "scaled", "led"};
        int verbCount = 0;
        for (String verb : actionVerbs) {
            if (lower.contains(verb)) verbCount++;
        }
        score += Math.min(20.0, verbCount * 2.5);

        // Quantifiable metrics / numbers check (e.g., %, $, numbers)
        if (rawText.matches(".*\\b\\d+%.*") || rawText.matches(".*\\b\\d+\\+?\\s*(users|requests|ms|latency|million|k).*")) {
            score += 10.0;
        }

        // Section structure check
        if (lower.contains("experience") || lower.contains("work history")) score += 5.0;
        if (lower.contains("education")) score += 2.5;
        if (lower.contains("skills") || lower.contains("technical skills")) score += 2.5;

        return Math.min(100.0, score);
    }

    private List<String> generateStrengths(double skillScore, double semanticScore, double expScore, List<SkillMatchDetailDto> matched) {
        List<String> strengths = new ArrayList<>();
        if (skillScore >= 80.0) {
            strengths.add("Strong technical skill overlap covering major core requirements.");
        }
        if (semanticScore >= 75.0) {
            strengths.add("High contextual and semantic relevance with the role's responsibilities.");
        }
        if (expScore >= 90.0) {
            strengths.add("Candidate experience level meets or exceeds the required tenure.");
        }
        if (!matched.isEmpty()) {
            List<String> topSkills = matched.stream().limit(4).map(SkillMatchDetailDto::getSkill).toList();
            strengths.add("Matched high-value core competencies: " + String.join(", ", topSkills) + ".");
        }
        if (strengths.isEmpty()) {
            strengths.add("Found foundational domain knowledge relevant to the target role.");
        }
        return strengths;
    }

    private List<String> generateMissingSummary(List<SkillMatchDetailDto> missing, List<SkillMatchDetailDto> partial) {
        List<String> summary = new ArrayList<>();
        for (SkillMatchDetailDto m : missing) {
            String reqStr = Boolean.TRUE.equals(m.getIsRequired()) ? " (Required)" : " (Preferred)";
            summary.add("Missing: " + m.getSkill() + reqStr);
        }
        for (SkillMatchDetailDto p : partial) {
            summary.add("Partially matched: " + p.getSkill() + " (related to candidate's " + p.getMatchedWith() + ")");
        }
        if (summary.isEmpty()) {
            summary.add("No critical missing skills detected. Excellent skill coverage!");
        }
        return summary;
    }

    private List<String> generateRecommendations(List<SkillMatchDetailDto> missing, double expScore, double qualityScore) {
        List<String> recs = new ArrayList<>();
        if (!missing.isEmpty()) {
            List<String> reqMissing = missing.stream()
                    .filter(s -> Boolean.TRUE.equals(s.getIsRequired()))
                    .map(SkillMatchDetailDto::getSkill)
                    .toList();
            if (!reqMissing.isEmpty()) {
                recs.add("Prioritize upskilling or highlighting hands-on project experience in: " + String.join(", ", reqMissing));
            }
        }
        if (expScore < 70.0) {
            recs.add("Elaborate on complex production projects to better demonstrate experience depth.");
        }
        if (qualityScore < 75.0) {
            recs.add("Enhance resume bullet points with quantifiable impact metrics (e.g. latency reduction %, user scale).");
        }
        if (recs.isEmpty()) {
            recs.add("Resume is well-optimized. Prepare for in-depth system architecture and technical discussions.");
        }
        return recs;
    }

    private String generateExecutiveSummary(double finalScore, String title, String company, double skillScore, double semanticScore) {
        String fitLevel = finalScore >= 80.0 ? "Strong Fit" : finalScore >= 60.0 ? "Moderate Fit" : "Potential Growth Fit";
        return String.format(
                "Evaluated candidate match for '%s' at '%s'. Overall candidate readiness is categorized as %s with an ATS score of %.1f/100 (Skill match: %.1f%%, Semantic match: %.1f%%).",
                title, company, fitLevel, finalScore, skillScore, semanticScore
        );
    }
}
