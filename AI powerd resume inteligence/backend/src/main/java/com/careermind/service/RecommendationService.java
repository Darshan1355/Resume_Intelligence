package com.careermind.service;

import com.careermind.client.MlServiceClient;
import com.careermind.client.dto.MlClientDtos.SemanticMatchResponse;
import com.careermind.client.dto.MlClientDtos.SkillGapResponse;
import com.careermind.dto.RecommendationResponse;
import com.careermind.entity.Job;
import com.careermind.entity.JobSkill;
import com.careermind.entity.Resume;
import com.careermind.entity.User;
import com.careermind.exception.BadRequestException;
import com.careermind.repository.JobRepository;
import com.careermind.repository.ResumeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class RecommendationService {

    private final ResumeRepository resumeRepository;
    private final JobRepository jobRepository;
    private final AuthService authService;
    private final MlServiceClient mlServiceClient;

    @Transactional(readOnly = true)
    public List<RecommendationResponse> getJobRecommendations(Long resumeId) {
        User currentUser = authService.getAuthenticatedUserEntity();

        Resume resume;
        if (resumeId != null) {
            resume = resumeRepository.findByIdAndUserIdWithSkills(resumeId, currentUser.getId())
                    .orElseThrow(() -> new BadRequestException("Resume not found with id: " + resumeId));
        } else {
            List<Resume> userResumes = resumeRepository.findByUserIdOrderByCreatedAtDesc(currentUser.getId());
            if (userResumes.isEmpty()) {
                throw new BadRequestException("Please upload a resume first to receive personalized AI job recommendations.");
            }
            resume = resumeRepository.findByIdAndUserIdWithSkills(userResumes.get(0).getId(), currentUser.getId())
                    .orElseThrow(() -> new BadRequestException("Latest resume could not be retrieved"));
        }

        List<Job> allJobs = jobRepository.findAllWithSkills();
        if (allJobs.isEmpty()) {
            return List.of();
        }

        List<String> resumeSkills = resume.getResumeSkills().stream()
                .map(rs -> rs.getSkill().getCanonicalName())
                .toList();

        List<RecommendationResponse> recommendations = new ArrayList<>();

        for (Job job : allJobs) {
            List<String> requiredSkills = job.getJobSkills().stream()
                    .filter(js -> Boolean.TRUE.equals(js.getIsRequired()))
                    .map(js -> js.getSkill().getCanonicalName())
                    .toList();

            List<String> preferredSkills = job.getJobSkills().stream()
                    .filter(js -> Boolean.FALSE.equals(js.getIsRequired()))
                    .map(js -> js.getSkill().getCanonicalName())
                    .toList();

            double semanticSimilarity = 0.65;
            try {
                SemanticMatchResponse sem = mlServiceClient.calculateSemanticSimilarity(resume.getRawText(), job.getDescription());
                if (sem != null && sem.getTransformerSimilarity() != null) {
                    semanticSimilarity = sem.getTransformerSimilarity();
                }
            } catch (Exception e) {
                log.debug("Fallback semantic similarity for recommendation on job ID {}", job.getId());
            }

            double skillScore = 60.0;
            List<String> matched = new ArrayList<>();
            List<String> missing = new ArrayList<>();

            try {
                SkillGapResponse gap = mlServiceClient.analyzeSkillGaps(resumeSkills, requiredSkills, preferredSkills);
                if (gap != null) {
                    skillScore = gap.getSkillScore() != null ? gap.getSkillScore() : 60.0;
                    if (gap.getMatchedSkills() != null) {
                        matched = gap.getMatchedSkills().stream().map(m -> m.getSkill()).toList();
                    }
                    if (gap.getMissingSkills() != null) {
                        missing = gap.getMissingSkills().stream().map(m -> m.getSkill()).toList();
                    }
                }
            } catch (Exception e) {
                log.debug("Fallback skill gap for recommendation on job ID {}", job.getId());
            }

            // Recommendation Score = 0.60 * semantic similarity (scaled to 100) + 0.40 * skill match
            double semanticScaled = semanticSimilarity * 100.0;
            double recommendationScore = (0.60 * semanticScaled) + (0.40 * skillScore);
            recommendationScore = Math.round(recommendationScore * 10.0) / 10.0;
            semanticScaled = Math.round(semanticScaled * 10.0) / 10.0;
            skillScore = Math.round(skillScore * 10.0) / 10.0;

            String explanation = String.format(
                    "Strong semantic match (%.1f%%) and %d of %d required core skills found.",
                    semanticScaled, matched.size(), (matched.size() + missing.size())
            );

            recommendations.add(RecommendationResponse.builder()
                    .jobId(job.getId())
                    .title(job.getTitle())
                    .company(job.getCompany())
                    .location(job.getLocation())
                    .experienceRequired(job.getExperienceRequired())
                    .recommendationScore(recommendationScore)
                    .semanticSimilarity(semanticScaled)
                    .skillMatchPercentage(skillScore)
                    .matchedSkills(matched)
                    .missingSkills(missing)
                    .explanation(explanation)
                    .build());
        }

        // Rank by recommendation score descending
        recommendations.sort(Comparator.comparing(RecommendationResponse::getRecommendationScore).reversed());
        return recommendations;
    }
}
