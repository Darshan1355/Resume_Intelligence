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
public class ResumeDetailResponse {
    private Long id;
    private String fileName;
    private Long fileSize;
    private String rawText;
    private String candidateName;
    private String candidateEmail;
    private String candidatePhone;
    private String candidateEducation;
    private Double candidateExperienceYears;
    private String parsedSections;
    private String status;
    private List<SkillDto> skills;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
