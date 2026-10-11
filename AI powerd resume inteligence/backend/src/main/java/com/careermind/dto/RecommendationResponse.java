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
public class RecommendationResponse {
    private Long jobId;
    private String title;
    private String company;
    private String location;
    private Double experienceRequired;
    private Double recommendationScore; // 60% semantic + 40% skill match
    private Double semanticSimilarity;
    private Double skillMatchPercentage;
    private List<String> matchedSkills;
    private List<String> missingSkills;
    private String explanation;
}
