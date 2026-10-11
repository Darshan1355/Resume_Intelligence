package com.careermind.service;

import com.careermind.client.MlServiceClient;
import com.careermind.client.dto.MlClientDtos.SemanticMatchResponse;
import com.careermind.client.dto.MlClientDtos.SkillGapItem;
import com.careermind.client.dto.MlClientDtos.SkillGapResponse;
import com.careermind.dto.AtsScoreBreakdownDto;
import com.careermind.dto.MatchRequest;
import com.careermind.dto.MatchResponse;
import com.careermind.dto.SkillMatchDetailDto;
import com.careermind.entity.*;
import com.careermind.exception.ResourceNotFoundException;
import com.careermind.repository.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class MatchingService {

    private final ResumeRepository resumeRepository;
    private final JobRepository jobRepository;
    private final MatchResultRepository matchResultRepository;
    private final SkillRepository skillRepository;
    private final AuthService authService;
    private final MlServiceClient mlServiceClient;
    private final ATSScoringService atsScoringService;
    private final ObjectMapper objectMapper;

    @Transactional
    public MatchResponse analyzeMatch(MatchRequest request) {
        User currentUser = authService.getAuthenticatedUserEntity();
        log.info("Analyzing match for user ID: {}, resume ID: {}, job ID: {}",
                currentUser.getId(), request.getResumeId(), request.getJobId());

        Resume resume = resumeRepository.findByIdAndUserIdWithSkills(request.getResumeId(), currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found with id: " + request.getResumeId()));

        Job job = jobRepository.findByIdWithSkills(request.getJobId())
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with id: " + request.getJobId()));

        // 1. Gather candidate skills and job skills
        List<String> resumeSkillNames = resume.getResumeSkills().stream()
                .map(rs -> rs.getSkill().getCanonicalName())
                .toList();

        List<String> jobRequiredSkills = job.getJobSkills().stream()
                .filter(js -> Boolean.TRUE.equals(js.getIsRequired()))
                .map(js -> js.getSkill().getCanonicalName())
                .toList();

        List<String> jobPreferredSkills = job.getJobSkills().stream()
                .filter(js -> Boolean.FALSE.equals(js.getIsRequired()))
                .map(js -> js.getSkill().getCanonicalName())
                .toList();

        // 2. Call ML Service: Semantic Transformer + TF-IDF Baseline Matching
        SemanticMatchResponse semanticMatch;
        try {
            semanticMatch = mlServiceClient.calculateSemanticSimilarity(resume.getRawText(), job.getDescription());
        } catch (Exception e) {
            log.warn("Semantic matching call failed: {}. Using heuristic similarity.", e.getMessage());
            semanticMatch = SemanticMatchResponse.builder()
                    .transformerScore(70.0)
                    .transformerSimilarity(0.70)
                    .tfidfScore(65.0)
                    .tfidfSimilarity(0.65)
                    .build();
        }

        // 3. Call ML Service: Skill Gap & Taxonomy Matching
        SkillGapResponse skillGap;
        try {
            skillGap = mlServiceClient.analyzeSkillGaps(resumeSkillNames, jobRequiredSkills, jobPreferredSkills);
        } catch (Exception e) {
            log.warn("Skill gap analysis call failed: {}. Using fallback gap analysis.", e.getMessage());
            skillGap = fallbackSkillGap(resumeSkillNames, jobRequiredSkills, jobPreferredSkills);
        }

        // 4. Map DTO skill details
        List<SkillMatchDetailDto> matchedDtos = mapSkillGapItems(skillGap.getMatchedSkills());
        List<SkillMatchDetailDto> partialDtos = mapSkillGapItems(skillGap.getPartiallyMatchedSkills());
        List<SkillMatchDetailDto> missingDtos = mapSkillGapItems(skillGap.getMissingSkills());

        // 5. Calculate Explainable ATS Score (30% Skill + 30% Semantic + 15% Exp + 10% Edu + 10% Keyword + 5% Quality)
        AtsScoreBreakdownDto scoreBreakdown = atsScoringService.calculateAtsScore(
                resume,
                job,
                semanticMatch.getTransformerScore() != null ? semanticMatch.getTransformerScore() : 70.0,
                skillGap.getSkillScore() != null ? skillGap.getSkillScore() : 70.0,
                semanticMatch.getTfidfScore() != null ? semanticMatch.getTfidfScore() : 60.0,
                matchedDtos,
                missingDtos,
                partialDtos
        );

        String explanationJson = "{}";
        try {
            explanationJson = objectMapper.writeValueAsString(scoreBreakdown);
        } catch (Exception ignored) {}

        // 6. Persist MatchResult entity
        MatchResult matchResult = MatchResult.builder()
                .user(currentUser)
                .resume(resume)
                .job(job)
                .semanticScore(scoreBreakdown.getSemanticScore())
                .skillScore(scoreBreakdown.getSkillScore())
                .experienceScore(scoreBreakdown.getExperienceScore())
                .educationScore(scoreBreakdown.getEducationScore())
                .keywordScore(scoreBreakdown.getKeywordScore())
                .qualityScore(scoreBreakdown.getQualityScore())
                .finalAtsScore(scoreBreakdown.getFinalScore())
                .baselineTfidfScore(scoreBreakdown.getBaselineTfidfScore())
                .explanationJson(explanationJson)
                .build();

        // 7. Persist MatchSkillResult entries
        saveSkillResults(matchResult, matchedDtos, MatchSkillResult.MatchType.MATCHED);
        saveSkillResults(matchResult, partialDtos, MatchSkillResult.MatchType.PARTIAL);
        saveSkillResults(matchResult, missingDtos, MatchSkillResult.MatchType.MISSING);

        MatchResult savedResult = matchResultRepository.save(matchResult);

        return MatchResponse.builder()
                .id(savedResult.getId())
                .resumeId(resume.getId())
                .resumeFileName(resume.getFileName())
                .jobId(job.getId())
                .jobTitle(job.getTitle())
                .jobCompany(job.getCompany())
                .scoreBreakdown(scoreBreakdown)
                .matchedSkills(matchedDtos)
                .partiallyMatchedSkills(partialDtos)
                .missingSkills(missingDtos)
                .createdAt(savedResult.getCreatedAt())
                .build();
    }

    @Transactional(readOnly = true)
    public MatchResponse getMatchResultById(Long id) {
        User currentUser = authService.getAuthenticatedUserEntity();
        MatchResult matchResult = matchResultRepository.findByIdAndUserIdWithSkills(id, currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Match result not found with id: " + id));

        AtsScoreBreakdownDto breakdown;
        try {
            breakdown = objectMapper.readValue(matchResult.getExplanationJson(), AtsScoreBreakdownDto.class);
        } catch (Exception e) {
            breakdown = AtsScoreBreakdownDto.builder()
                    .finalScore(matchResult.getFinalAtsScore())
                    .skillScore(matchResult.getSkillScore())
                    .semanticScore(matchResult.getSemanticScore())
                    .experienceScore(matchResult.getExperienceScore())
                    .educationScore(matchResult.getEducationScore())
                    .keywordScore(matchResult.getKeywordScore())
                    .qualityScore(matchResult.getQualityScore())
                    .baselineTfidfScore(matchResult.getBaselineTfidfScore())
                    .build();
        }

        List<SkillMatchDetailDto> matched = new ArrayList<>();
        List<SkillMatchDetailDto> partial = new ArrayList<>();
        List<SkillMatchDetailDto> missing = new ArrayList<>();

        for (MatchSkillResult msr : matchResult.getSkillResults()) {
            SkillMatchDetailDto dto = SkillMatchDetailDto.builder()
                    .skill(msr.getSkill().getName())
                    .canonicalName(msr.getSkill().getCanonicalName())
                    .category(msr.getSkill().getCategory())
                    .matchType(msr.getMatchType().name())
                    .importance(msr.getImportance())
                    .similarityScore(msr.getSimilarityScore())
                    .build();

            if (msr.getMatchType() == MatchSkillResult.MatchType.MATCHED) matched.add(dto);
            else if (msr.getMatchType() == MatchSkillResult.MatchType.PARTIAL) partial.add(dto);
            else missing.add(dto);
        }

        return MatchResponse.builder()
                .id(matchResult.getId())
                .resumeId(matchResult.getResume().getId())
                .resumeFileName(matchResult.getResume().getFileName())
                .jobId(matchResult.getJob().getId())
                .jobTitle(matchResult.getJob().getTitle())
                .jobCompany(matchResult.getJob().getCompany())
                .scoreBreakdown(breakdown)
                .matchedSkills(matched)
                .partiallyMatchedSkills(partial)
                .missingSkills(missing)
                .createdAt(matchResult.getCreatedAt())
                .build();
    }

    private void saveSkillResults(MatchResult matchResult, List<SkillMatchDetailDto> dtos, MatchSkillResult.MatchType type) {
        if (dtos == null) return;
        for (SkillMatchDetailDto dto : dtos) {
            Skill skill = skillRepository.findByNameIgnoreCase(dto.getSkill())
                    .orElseGet(() -> skillRepository.save(Skill.builder()
                            .name(dto.getSkill())
                            .canonicalName(dto.getCanonicalName() != null ? dto.getCanonicalName() : dto.getSkill())
                            .category(dto.getCategory() != null ? dto.getCategory() : "General")
                            .build()));

            MatchSkillResult msr = MatchSkillResult.builder()
                    .matchResult(matchResult)
                    .skill(skill)
                    .matchType(type)
                    .importance(dto.getImportance() != null ? dto.getImportance() : 1.0)
                    .similarityScore(dto.getSimilarityScore() != null ? dto.getSimilarityScore() : 1.0)
                    .build();

            matchResult.addSkillResult(msr);
        }
    }

    private List<SkillMatchDetailDto> mapSkillGapItems(List<SkillGapItem> items) {
        if (items == null) return new ArrayList<>();
        return items.stream()
                .map(item -> SkillMatchDetailDto.builder()
                        .skill(item.getSkill())
                        .canonicalName(item.getCanonicalName())
                        .category(item.getCategory())
                        .matchType(item.getMatchType())
                        .importance(item.getImportance())
                        .similarityScore(item.getSimilarityScore())
                        .isRequired(item.getIsRequired())
                        .matchedWith(item.getMatchedWith())
                        .build())
                .toList();
    }

    private SkillGapResponse fallbackSkillGap(List<String> resumeSkills, List<String> required, List<String> preferred) {
        List<SkillGapItem> matched = new ArrayList<>();
        List<SkillGapItem> missing = new ArrayList<>();

        List<String> resumeLower = resumeSkills.stream().map(String::toLowerCase).toList();

        for (String req : required) {
            if (resumeLower.contains(req.toLowerCase())) {
                matched.add(SkillGapItem.builder().skill(req).canonicalName(req).category("General").matchType("MATCHED").importance(1.0).similarityScore(1.0).isRequired(true).build());
            } else {
                missing.add(SkillGapItem.builder().skill(req).canonicalName(req).category("General").matchType("MISSING").importance(1.0).similarityScore(0.0).isRequired(true).build());
            }
        }

        int total = required.size() + preferred.size();
        double score = total > 0 ? ((double) matched.size() / total) * 100.0 : 75.0;

        return SkillGapResponse.builder()
                .skillScore(score)
                .matchedSkills(matched)
                .partiallyMatchedSkills(List.of())
                .missingSkills(missing)
                .build();
    }
}
