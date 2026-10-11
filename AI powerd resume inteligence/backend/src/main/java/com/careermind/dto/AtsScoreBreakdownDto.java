package com.careermind.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AtsScoreBreakdownDto {
    private Double finalScore;
    private Double skillScore;         // 30% weight
    private Double semanticScore;      // 30% weight
    private Double experienceScore;    // 15% weight
    private Double educationScore;     // 10% weight
    private Double keywordScore;       // 10% weight
    private Double qualityScore;       // 5% weight
    private Double baselineTfidfScore; // Classical NLP baseline for comparison

    private List<String> keyStrengths;
    private List<String> missingSkillsSummary;
    private List<String> improvementRecommendations;
    private String executiveSummary;
}
