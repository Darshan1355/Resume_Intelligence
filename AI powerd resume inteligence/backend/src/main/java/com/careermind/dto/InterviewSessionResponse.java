package com.careermind.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InterviewSessionResponse {
    private Long id;
    private Long resumeId;
    private String resumeFileName;
    private Long jobId;
    private String jobTitle;
    private String jobCompany;
    private Double overallScore;
    private String status;
    private List<InterviewQuestionDto> questions;
    private LocalDateTime createdAt;
}
