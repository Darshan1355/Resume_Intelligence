package com.careermind.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobCreateRequest {

    @NotBlank(message = "Job title is required")
    @Size(min = 2, max = 200, message = "Job title must be between 2 and 200 characters")
    private String title;

    @NotBlank(message = "Company name is required")
    @Size(min = 2, max = 150, message = "Company name must be between 2 and 150 characters")
    private String company;

    @NotBlank(message = "Job description is required")
    private String description;

    @Builder.Default
    private String location = "Remote";

    @Builder.Default
    private Double experienceRequired = 0.0;

    @Builder.Default
    private String educationRequired = "Bachelor";

    private List<String> requiredSkills;
    private List<String> preferredSkills;
}
