package com.careermind.controller;

import com.careermind.dto.MatchRequest;
import com.careermind.dto.MatchResponse;
import com.careermind.service.MatchingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/matching")
@RequiredArgsConstructor
@Tag(name = "Matching & ATS Scoring", description = "Endpoints for analyzing resume vs job description semantic fit, skill gaps, and explainable ATS scores")
public class MatchingController {

    private final MatchingService matchingService;

    @PostMapping("/analyze")
    @Operation(summary = "Analyze resume against job description", description = "Executes hybrid DL transformer + TF-IDF baseline + skill gap analysis and calculates explainable 6-factor ATS score")
    public ResponseEntity<MatchResponse> analyzeMatch(@Valid @RequestBody MatchRequest request) {
        MatchResponse response = matchingService.analyzeMatch(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get historical match analysis by ID", description = "Retrieves stored ATS match result, breakdown, and skill comparison")
    public ResponseEntity<MatchResponse> getMatchResultById(@PathVariable Long id) {
        MatchResponse response = matchingService.getMatchResultById(id);
        return ResponseEntity.ok(response);
    }
}
