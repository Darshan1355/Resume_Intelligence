package com.careermind.controller;

import com.careermind.dto.ResumeDetailResponse;
import com.careermind.dto.ResumeSummaryDto;
import com.careermind.dto.ResumeUploadResponse;
import com.careermind.service.ResumeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/resumes")
@RequiredArgsConstructor
@Tag(name = "Resumes", description = "Endpoints for uploading, parsing, extracting skills, and managing candidate resumes")
public class ResumeController {

    private final ResumeService resumeService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload PDF Resume", description = "Extracts text using Apache PDFBox, calls NLP microservice for NER & skills, and persists metadata")
    public ResponseEntity<ResumeUploadResponse> uploadResume(@RequestParam("file") MultipartFile file) {
        ResumeUploadResponse response = resumeService.uploadResume(file);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    @Operation(summary = "List user's uploaded resumes", description = "Returns all resumes owned by the authenticated user")
    public ResponseEntity<List<ResumeSummaryDto>> getUserResumes() {
        List<ResumeSummaryDto> resumes = resumeService.getUserResumes();
        return ResponseEntity.ok(resumes);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get resume details by ID", description = "Fetches complete resume details, extracted skills, and parsed sections")
    public ResponseEntity<ResumeDetailResponse> getResumeById(@PathVariable Long id) {
        ResumeDetailResponse resume = resumeService.getResumeById(id);
        return ResponseEntity.ok(resume);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete resume", description = "Securely removes resume file and associated records owned by the authenticated user")
    public ResponseEntity<Map<String, String>> deleteResume(@PathVariable Long id) {
        resumeService.deleteResume(id);
        return ResponseEntity.ok(Map.of("message", "Resume successfully deleted"));
    }
}
