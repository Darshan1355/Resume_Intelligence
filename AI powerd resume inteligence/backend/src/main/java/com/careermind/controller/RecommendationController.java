package com.careermind.controller;

import com.careermind.dto.RecommendationResponse;
import com.careermind.service.RecommendationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/recommendations")
@RequiredArgsConstructor
@Tag(name = "Job Recommendations", description = "Endpoints for AI-driven job recommendations matching candidate profiles")
public class RecommendationController {

    private final RecommendationService recommendationService;

    @GetMapping
    @Operation(summary = "Get personalized job recommendations", description = "Ranks all available jobs using 60% semantic similarity + 40% skill match formula against the user's resume")
    public ResponseEntity<List<RecommendationResponse>> getRecommendations(
            @RequestParam(value = "resumeId", required = false) Long resumeId
    ) {
        List<RecommendationResponse> recommendations = recommendationService.getJobRecommendations(resumeId);
        return ResponseEntity.ok(recommendations);
    }
}
