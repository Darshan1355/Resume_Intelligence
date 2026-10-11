package com.careermind.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SkillMatchDetailDto {
    private String skill;
    private String canonicalName;
    private String category;
    private String matchType; // MATCHED, PARTIAL, MISSING
    private Double importance;
    private Double similarityScore;
    private Boolean isRequired;
    private String matchedWith;
}
