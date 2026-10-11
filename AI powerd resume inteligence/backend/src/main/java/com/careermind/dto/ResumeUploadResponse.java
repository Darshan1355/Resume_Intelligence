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
public class ResumeUploadResponse {
    private Long resumeId;
    private String fileName;
    private Long fileSize;
    private int extractedTextLength;
    private String status;
    private String candidateName;
    private String candidateEmail;
    private Double candidateExperienceYears;
    private int skillsCount;
    private List<SkillDto> extractedSkills;
    private LocalDateTime createdAt;
}
