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
public class MatchResponse {
    private Long id;
    private Long resumeId;
    private String resumeFileName;
    private Long jobId;
    private String jobTitle;
    private String jobCompany;

    private AtsScoreBreakdownDto scoreBreakdown;

    private List<SkillMatchDetailDto> matchedSkills;
    private List<SkillMatchDetailDto> missingSkills;
    private List<SkillMatchDetailDto> partiallyMatchedSkills;

    private LocalDateTime createdAt;
}
