package com.careermind.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MatchRequest {

    @NotNull(message = "Resume ID is required")
    private Long resumeId;

    @NotNull(message = "Job ID is required")
    private Long jobId;
}
