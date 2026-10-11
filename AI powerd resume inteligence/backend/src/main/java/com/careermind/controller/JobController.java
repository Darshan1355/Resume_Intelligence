package com.careermind.controller;

import com.careermind.dto.JobCreateRequest;
import com.careermind.dto.JobResponse;
import com.careermind.service.JobService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
@Tag(name = "Jobs", description = "Endpoints for creating and browsing job postings")
public class JobController {

    private final JobService jobService;

    @PostMapping
    @Operation(summary = "Create a job posting", description = "Creates a new job with required/preferred skills or automatically extracts them via NLP")
    public ResponseEntity<JobResponse> createJob(@Valid @RequestBody JobCreateRequest request) {
        JobResponse response = jobService.createJob(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    @Operation(summary = "Get all job postings", description = "Returns a list of all active jobs along with required skills")
    public ResponseEntity<List<JobResponse>> getAllJobs() {
        List<JobResponse> jobs = jobService.getAllJobs();
        return ResponseEntity.ok(jobs);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get job details by ID", description = "Fetches job description and requirements")
    public ResponseEntity<JobResponse> getJobById(@PathVariable Long id) {
        JobResponse job = jobService.getJobById(id);
        return ResponseEntity.ok(job);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete job posting", description = "Deletes a job posting and its associated skills")
    public ResponseEntity<Map<String, String>> deleteJob(@PathVariable Long id) {
        jobService.deleteJob(id);
        return ResponseEntity.ok(Map.of("message", "Job successfully deleted"));
    }
}
