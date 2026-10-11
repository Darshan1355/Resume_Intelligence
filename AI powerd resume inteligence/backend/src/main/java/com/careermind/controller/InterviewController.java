package com.careermind.controller;

import com.careermind.dto.InterviewAnswerRequest;
import com.careermind.dto.InterviewAnswerResponse;
import com.careermind.dto.InterviewSessionRequest;
import com.careermind.dto.InterviewSessionResponse;
import com.careermind.service.InterviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/interview")
@RequiredArgsConstructor
@Tag(name = "AI Interview Preparation", description = "Endpoints for generating role-targeted interview questions and evaluating candidate answers")
public class InterviewController {

    private final InterviewService interviewService;

    @PostMapping("/sessions")
    @Operation(summary = "Generate new interview prep session", description = "Generates targeted technical and architectural questions based on candidate resume and job requirements")
    public ResponseEntity<InterviewSessionResponse> createSession(@Valid @RequestBody InterviewSessionRequest request) {
        InterviewSessionResponse response = interviewService.createSession(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/sessions")
    @Operation(summary = "List user interview prep sessions", description = "Returns all interview sessions for the authenticated user")
    public ResponseEntity<List<InterviewSessionResponse>> getUserSessions() {
        List<InterviewSessionResponse> sessions = interviewService.getUserSessions();
        return ResponseEntity.ok(sessions);
    }

    @GetMapping("/sessions/{id}")
    @Operation(summary = "Get interview session details", description = "Fetches interview session with questions and answers")
    public ResponseEntity<InterviewSessionResponse> getSessionById(@PathVariable Long id) {
        InterviewSessionResponse session = interviewService.getSessionById(id);
        return ResponseEntity.ok(session);
    }

    @PostMapping("/questions/{id}/answer")
    @Operation(summary = "Submit and evaluate interview answer", description = "Evaluates candidate answer against expected concepts for relevance, concept coverage, and completeness")
    public ResponseEntity<InterviewAnswerResponse> submitAnswer(
            @PathVariable Long id,
            @Valid @RequestBody InterviewAnswerRequest request
    ) {
        InterviewAnswerResponse response = interviewService.submitAnswer(id, request);
        return ResponseEntity.ok(response);
    }
}
