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
    public ResponseEntity<List<ResumeSummaryDto>> getUserResumes(
            @RequestParam(defaultValue = "false") boolean archived) {
        List<ResumeSummaryDto> resumes = resumeService.getUserResumes(archived);
        return ResponseEntity.ok(resumes);
    }

    @PostMapping("/{id}/archive")
    @Operation(summary = "Archive resume", description = "Removes a resume from the active list while preserving its interview and matching history")
    public ResponseEntity<Map<String, String>> archiveResume(@PathVariable Long id) {
        resumeService.archiveResume(id);
        return ResponseEntity.ok(Map.of("message", "Resume archived. Its interview and matching history remains available."));
    }

    @PostMapping("/{id}/restore")
    @Operation(summary = "Restore archived resume", description = "Restores an archived resume to the active resume list")
    public ResponseEntity<Map<String, String>> restoreResume(@PathVariable Long id) {
        resumeService.restoreResume(id);
        return ResponseEntity.ok(Map.of("message", "Resume restored to your active list."));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get resume details by ID", description = "Fetches complete resume details, extracted skills, and parsed sections")
    public ResponseEntity<ResumeDetailResponse> getResumeById(@PathVariable Long id) {
        ResumeDetailResponse resume = resumeService.getResumeById(id);
        return ResponseEntity.ok(resume);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete resume", description = "Deletes an owned resume only when it has no interview or job-matching history")
    public ResponseEntity<Map<String, String>> deleteResume(@PathVariable Long id) {
        resumeService.deleteResume(id);
        return ResponseEntity.ok(Map.of("message", "Resume successfully deleted"));
    }
}
