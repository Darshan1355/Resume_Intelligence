package com.careermind.service;

import com.careermind.client.MlServiceClient;
import com.careermind.client.dto.MlClientDtos.ExtractedSkillItem;
import com.careermind.client.dto.MlClientDtos.ResumeParseResponse;
import com.careermind.dto.ResumeDetailResponse;
import com.careermind.dto.ResumeSummaryDto;
import com.careermind.dto.ResumeUploadResponse;
import com.careermind.dto.SkillDto;
import com.careermind.entity.Resume;
import com.careermind.entity.ResumeSkill;
import com.careermind.entity.Skill;
import com.careermind.entity.User;
import com.careermind.exception.ConflictException;
import com.careermind.exception.ResourceNotFoundException;
import com.careermind.exception.UnauthorizedException;
import com.careermind.repository.InterviewSessionRepository;
import com.careermind.repository.MatchResultRepository;
import com.careermind.repository.ResumeRepository;
import com.careermind.repository.SkillRepository;
import com.careermind.util.FileStorageUtil;
import com.careermind.util.PdfExtractorUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ResumeService {

    private final ResumeRepository resumeRepository;
        private final InterviewSessionRepository interviewSessionRepository;
        private final MatchResultRepository matchResultRepository;
    private final SkillRepository skillRepository;
    private final AuthService authService;
    private final PdfExtractorUtil pdfExtractorUtil;
    private final FileStorageUtil fileStorageUtil;
    private final MlServiceClient mlServiceClient;
    private final ObjectMapper objectMapper;

    @Transactional
    public ResumeUploadResponse uploadResume(MultipartFile file) {
        User currentUser = authService.getAuthenticatedUserEntity();
        log.info("Processing resume upload for user: {} ({})", currentUser.getName(), currentUser.getEmail());

        // 1. Extract text using PDFBox
        String extractedText = pdfExtractorUtil.extractTextFromPdf(file);

        // 2. Safely store the file
        String storedFileName = fileStorageUtil.storeFile(file, currentUser.getId());

        // 3. Call ML Service for NLP & NER extraction
        ResumeParseResponse parseResponse;
        try {
            parseResponse = mlServiceClient.parseResume(extractedText);
        } catch (Exception e) {
            log.warn("ML Service parsing failed or unavailable, fallback to basic parsing: {}", e.getMessage());
            parseResponse = ResumeParseResponse.builder()
                    .candidateName(currentUser.getName())
                    .candidateEmail(currentUser.getEmail())
                    .candidateEducation("Bachelor")
                    .candidateExperienceYears(1.0)
                    .skills(List.of())
                    .sections(java.util.Collections.emptyMap())
                    .build();
        }

        String parsedSectionsJson = "{}";
        try {
            if (parseResponse.getSections() != null) {
                parsedSectionsJson = objectMapper.writeValueAsString(parseResponse.getSections());
            }
        } catch (Exception ignored) {}

        // 4. Create Resume entity
        Resume resume = Resume.builder()
                .user(currentUser)
                .fileName(file.getOriginalFilename())
                .storedFileName(storedFileName)
                .fileSize(file.getSize())
                .rawText(extractedText)
                .candidateName(parseResponse.getCandidateName() != null ? parseResponse.getCandidateName() : currentUser.getName())
                .candidateEmail(parseResponse.getCandidateEmail() != null ? parseResponse.getCandidateEmail() : currentUser.getEmail())
                .candidatePhone(parseResponse.getCandidatePhone())
                .candidateEducation(parseResponse.getCandidateEducation() != null ? parseResponse.getCandidateEducation() : "Bachelor")
                .candidateExperienceYears(parseResponse.getCandidateExperienceYears() != null ? parseResponse.getCandidateExperienceYears() : 0.0)
                .parsedSections(parsedSectionsJson)
                .status("PROCESSED")
                .build();

        // 5. Link Extracted Skills
        List<SkillDto> extractedSkillDtos = new ArrayList<>();
        if (parseResponse.getSkills() != null) {
            for (ExtractedSkillItem item : parseResponse.getSkills()) {
                Skill skill = getOrCreateSkill(item.getName(), item.getCanonicalName(), item.getCategory());
                ResumeSkill resumeSkill = ResumeSkill.builder()
                        .resume(resume)
                        .skill(skill)
                        .confidence(item.getConfidence() != null ? item.getConfidence() : 1.0)
                        .contextSnippet(item.getContextSnippet())
                        .build();
                resume.addResumeSkill(resumeSkill);

                extractedSkillDtos.add(SkillDto.builder()
                        .id(skill.getId())
                        .name(skill.getName())
                        .canonicalName(skill.getCanonicalName())
                        .category(skill.getCategory())
                        .confidence(resumeSkill.getConfidence())
                        .contextSnippet(resumeSkill.getContextSnippet())
                        .build());
            }
        }

        Resume savedResume = resumeRepository.save(resume);

        return ResumeUploadResponse.builder()
                .resumeId(savedResume.getId())
                .fileName(savedResume.getFileName())
                .fileSize(savedResume.getFileSize())
                .extractedTextLength(savedResume.getRawText().length())
                .status(savedResume.getStatus())
                .archived(savedResume.isArchived())
                .candidateName(savedResume.getCandidateName())
                .candidateEmail(savedResume.getCandidateEmail())
                .candidateExperienceYears(savedResume.getCandidateExperienceYears())
                .skillsCount(savedResume.getResumeSkills().size())
                .extractedSkills(extractedSkillDtos)
                .createdAt(savedResume.getCreatedAt())
                .build();
    }

    @Transactional(readOnly = true)
    public List<ResumeSummaryDto> getUserResumes() {
                return getUserResumes(false);
        }

        @Transactional(readOnly = true)
        public List<ResumeSummaryDto> getUserResumes(boolean archived) {
        User currentUser = authService.getAuthenticatedUserEntity();
                List<Resume> resumes = resumeRepository.findByUserIdAndArchivedOrderByCreatedAtDesc(currentUser.getId(), archived);
        return resumes.stream()
                .map(r -> ResumeSummaryDto.builder()
                        .id(r.getId())
                        .fileName(r.getFileName())
                        .fileSize(r.getFileSize())
                        .candidateName(r.getCandidateName())
                        .candidateEmail(r.getCandidateEmail())
                        .candidateExperienceYears(r.getCandidateExperienceYears())
                        .skillsCount(r.getResumeSkills() != null ? r.getResumeSkills().size() : 0)
                        .status(r.getStatus())
                        .archived(r.isArchived())
                        .createdAt(r.getCreatedAt())
                        .build())
                .toList();
    }

    @Transactional(readOnly = true)
    public ResumeDetailResponse getResumeById(Long id) {
        User currentUser = authService.getAuthenticatedUserEntity();
        Resume resume = resumeRepository.findByIdAndUserIdWithSkills(id, currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found with id: " + id));

        List<SkillDto> skills = resume.getResumeSkills().stream()
                .map(rs -> SkillDto.builder()
                        .id(rs.getSkill().getId())
                        .name(rs.getSkill().getName())
                        .canonicalName(rs.getSkill().getCanonicalName())
                        .category(rs.getSkill().getCategory())
                        .confidence(rs.getConfidence())
                        .contextSnippet(rs.getContextSnippet())
                        .build())
                .toList();

        return ResumeDetailResponse.builder()
                .id(resume.getId())
                .fileName(resume.getFileName())
                .fileSize(resume.getFileSize())
                .rawText(resume.getRawText())
                .candidateName(resume.getCandidateName())
                .candidateEmail(resume.getCandidateEmail())
                .candidatePhone(resume.getCandidatePhone())
                .candidateEducation(resume.getCandidateEducation())
                .candidateExperienceYears(resume.getCandidateExperienceYears())
                .parsedSections(resume.getParsedSections())
                .status(resume.getStatus())
                .archived(resume.isArchived())
                .skills(skills)
                .createdAt(resume.getCreatedAt())
                .updatedAt(resume.getUpdatedAt())
                .build();
    }

        @Transactional
        public void archiveResume(Long id) {
                setResumeArchived(id, true);
        }

        @Transactional
        public void restoreResume(Long id) {
                setResumeArchived(id, false);
        }

        private void setResumeArchived(Long id, boolean archived) {
                User currentUser = authService.getAuthenticatedUserEntity();
                Resume resume = resumeRepository.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException("Resume not found with id: " + id));

                if (!resume.getUser().getId().equals(currentUser.getId())) {
                        throw new UnauthorizedException("You do not have permission to update this resume");
                }

                if (resume.isArchived() != archived) {
                        resume.setArchived(archived);
                        resumeRepository.save(resume);
                        log.info("{} resume ID: {} for user ID: {}", archived ? "Archived" : "Restored", id, currentUser.getId());
                }
        }

    @Transactional
    public void deleteResume(Long id) {
        User currentUser = authService.getAuthenticatedUserEntity();
        Resume resume = resumeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found with id: " + id));

        if (!resume.getUser().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("You do not have permission to delete this resume");
        }

        if (interviewSessionRepository.existsByResumeId(id) || matchResultRepository.existsByResumeId(id)) {
            throw new ConflictException("This resume is linked to interview or job-matching history and cannot be deleted. Archive it to remove it from your active list while preserving that history.");
        }

        resumeRepository.delete(resume);
        resumeRepository.flush();
        fileStorageUtil.deleteFile(resume.getStoredFileName());
        log.info("Deleted resume ID: {} for user ID: {}", id, currentUser.getId());
    }

    private Skill getOrCreateSkill(String name, String canonicalName, String category) {
        String skillName = (name != null && !name.isBlank()) ? name.trim() : "General";
        String canon = (canonicalName != null && !canonicalName.isBlank()) ? canonicalName.trim() : skillName;
        String cat = (category != null && !category.isBlank()) ? category.trim() : "General";

        return skillRepository.findByNameIgnoreCase(skillName)
                .orElseGet(() -> skillRepository.save(Skill.builder()
                        .name(skillName)
                        .canonicalName(canon)
                        .category(cat)
                        .build()));
    }
}
