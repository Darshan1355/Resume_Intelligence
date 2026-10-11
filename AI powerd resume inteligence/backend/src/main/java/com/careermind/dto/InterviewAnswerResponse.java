package com.careermind.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InterviewAnswerResponse {
    private Long id;
    private Long questionId;
    private String candidateAnswer;
    private Double relevanceScore;
    private Double conceptCoverageScore;
    private Double completenessScore;
    private Double overallScore;
    private String feedback;
    private LocalDateTime createdAt;
}
