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
public class ResumeSummaryDto {
    private Long id;
    private String fileName;
    private Long fileSize;
    private String candidateName;
    private String candidateEmail;
    private Double candidateExperienceYears;
    private int skillsCount;
    private String status;
    private boolean archived;
    private LocalDateTime createdAt;
}
