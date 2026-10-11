package com.careermind.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobSkillDto {
    private Long id;
    private String name;
    private String canonicalName;
    private String category;
    private Double importance;
    private Boolean isRequired;
}
