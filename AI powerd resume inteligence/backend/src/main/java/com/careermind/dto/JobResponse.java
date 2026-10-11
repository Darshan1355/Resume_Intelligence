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
public class JobResponse {
    private Long id;
    private String title;
    private String company;
    private String description;
    private String location;
    private Double experienceRequired;
    private String educationRequired;
    private List<JobSkillDto> skills;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
