package com.careermind.client;

import com.careermind.client.dto.MlClientDtos.*;
import com.careermind.exception.MlServiceException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientRequestException;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.time.Duration;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class MlServiceClient {

    private final WebClient mlServiceWebClient;

    @Value("${app.ml-service.timeout-ms:15000}")
    private long timeoutMs;

    public ResumeParseResponse parseResume(String rawText) {
        log.info("Invoking ML service for resume parsing (text length: {} chars)", rawText.length());
        try {
            return mlServiceWebClient.post()
                    .uri("/nlp/extract")
                    .bodyValue(SkillExtractRequest.builder().text(rawText).build())
                    .retrieve()
                    .bodyToMono(ResumeParseResponse.class)
                    .timeout(Duration.ofMillis(timeoutMs))
                    .block();
        } catch (WebClientResponseException e) {
            log.error("ML service returned error status {}: {}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new MlServiceException("ML service error during resume parsing: " + e.getMessage(), e);
        } catch (WebClientRequestException e) {
            log.error("ML service connection failure: {}", e.getMessage());
            throw new MlServiceException("Unable to connect to ML NLP service at configured URL. Please ensure FastAPI service is running.", e);
        } catch (Exception e) {
            log.error("Unexpected error calling ML service: {}", e.getMessage());
            throw new MlServiceException("Failed to process resume NLP: " + e.getMessage(), e);
        }
    }

    public List<ExtractedSkillItem> extractSkills(String text) {
        log.info("Invoking ML service for skill extraction (text length: {} chars)", text.length());
        try {
            return mlServiceWebClient.post()
                    .uri("/nlp/skills")
                    .bodyValue(SkillExtractRequest.builder().text(text).build())
                    .retrieve()
                    .bodyToFlux(ExtractedSkillItem.class)
                    .collectList()
                    .timeout(Duration.ofMillis(timeoutMs))
                    .block();
        } catch (Exception e) {
            log.error("Failed to extract skills via ML service: {}", e.getMessage());
            throw new MlServiceException("Failed to extract skills: " + e.getMessage(), e);
        }
    }

    public SemanticMatchResponse calculateSemanticSimilarity(String resumeText, String jobDescription) {
        log.info("Invoking ML service for semantic similarity calculation");
        try {
            return mlServiceWebClient.post()
                    .uri("/matching/semantic")
                    .bodyValue(SemanticMatchRequest.builder()
                            .resumeText(resumeText)
                            .jobDescription(jobDescription)
                            .build())
                    .retrieve()
                    .bodyToMono(SemanticMatchResponse.class)
                    .timeout(Duration.ofMillis(timeoutMs))
                    .block();
        } catch (Exception e) {
            log.error("Failed to calculate semantic similarity via ML service: {}", e.getMessage());
            throw new MlServiceException("Failed to compute semantic similarity: " + e.getMessage(), e);
        }
    }

    public SkillGapResponse analyzeSkillGaps(List<String> resumeSkills, List<String> jobRequiredSkills, List<String> jobPreferredSkills) {
        log.info("Invoking ML service for skill gap analysis (resume skills: {}, job required: {})",
                resumeSkills.size(), jobRequiredSkills.size());
        try {
            return mlServiceWebClient.post()
                    .uri("/matching/gap")
                    .bodyValue(SkillGapRequest.builder()
                            .resumeSkills(resumeSkills)
                            .jobRequiredSkills(jobRequiredSkills)
                            .jobPreferredSkills(jobPreferredSkills)
                            .build())
                    .retrieve()
                    .bodyToMono(SkillGapResponse.class)
                    .timeout(Duration.ofMillis(timeoutMs))
                    .block();
        } catch (Exception e) {
            log.error("Failed to analyze skill gaps via ML service: {}", e.getMessage());
            throw new MlServiceException("Failed to analyze skill gaps: " + e.getMessage(), e);
        }
    }

    public InterviewEvalResponse evaluateInterviewAnswer(String question, List<String> expectedConcepts, String sampleIdealAnswer, String candidateAnswer) {
        log.info("Invoking ML service for interview answer evaluation");
        try {
            return mlServiceWebClient.post()
                    .uri("/interview/evaluate")
                    .bodyValue(InterviewEvalRequest.builder()
                            .question(question)
                            .expectedConcepts(expectedConcepts)
                            .sampleIdealAnswer(sampleIdealAnswer)
                            .candidateAnswer(candidateAnswer)
                            .build())
                    .retrieve()
                    .bodyToMono(InterviewEvalResponse.class)
                    .timeout(Duration.ofMillis(timeoutMs))
                    .block();
        } catch (Exception e) {
            log.error("Failed to evaluate interview answer via ML service: {}", e.getMessage());
            throw new MlServiceException("Failed to evaluate interview answer: " + e.getMessage(), e);
        }
    }
}
