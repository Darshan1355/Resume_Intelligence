package com.careermind.service;

import com.careermind.client.MlServiceClient;
import com.careermind.entity.InterviewSession;
import com.careermind.entity.Job;
import com.careermind.entity.Resume;
import com.careermind.entity.User;
import com.careermind.exception.ConflictException;
import com.careermind.repository.InterviewSessionRepository;
import com.careermind.repository.JobRepository;
import com.careermind.repository.ResumeRepository;
import com.careermind.repository.UserRepository;
import com.careermind.util.FileStorageUtil;
import com.careermind.util.PdfExtractorUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

@DataJpaTest
@ActiveProfiles("test")
@Import(ResumeService.class)
class ResumeDeletionPersistenceTest {

    @Autowired
    private ResumeService resumeService;

    @Autowired
    private ResumeRepository resumeRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private InterviewSessionRepository interviewSessionRepository;

    @MockBean
    private AuthService authService;

    @MockBean
    private FileStorageUtil fileStorageUtil;

    @MockBean
    private PdfExtractorUtil pdfExtractorUtil;

    @MockBean
    private MlServiceClient mlServiceClient;

    @MockBean
    private ObjectMapper objectMapper;

    private User user;
    private Job job;

    @BeforeEach
    void setUp() {
        user = userRepository.saveAndFlush(User.builder()
                .name("Resume Owner")
                .email("resume-owner@example.com")
                .passwordHash("test-hash")
                .build());
        job = jobRepository.saveAndFlush(Job.builder()
                .title("Software Engineer")
                .company("Example Co")
                .description("Build software")
                .build());
        when(authService.getAuthenticatedUserEntity()).thenReturn(user);
    }

    @Test
    void deletingResumeWithInterviewSessionPreservesRowsAndReturnsConflict() {
        Resume resume = saveResume();
        interviewSessionRepository.saveAndFlush(InterviewSession.builder()
                .user(user)
                .resume(resume)
                .job(job)
                .build());

        assertThrows(ConflictException.class, () -> resumeService.deleteResume(resume.getId()));

        assertTrue(resumeRepository.existsById(resume.getId()));
        assertTrue(interviewSessionRepository.existsByResumeId(resume.getId()));
    }

    @Test
    void deletingResumeWithoutHistoryRemovesPersistedRow() {
        Resume resume = saveResume();

        resumeService.deleteResume(resume.getId());

        assertTrue(!resumeRepository.existsById(resume.getId()));
    }

        @Test
        void archivingHidesResumeFromActiveListButKeepsHistoricalResumeAccessible() {
        Resume resume = saveResume();
        interviewSessionRepository.saveAndFlush(InterviewSession.builder()
            .user(user)
            .resume(resume)
            .job(job)
            .build());

        resumeService.archiveResume(resume.getId());

        assertTrue(resumeRepository.findByUserIdAndArchivedOrderByCreatedAtDesc(user.getId(), true)
            .stream().anyMatch(item -> item.getId().equals(resume.getId())));
        assertFalse(resumeRepository.findByUserIdAndArchivedOrderByCreatedAtDesc(user.getId(), false)
            .stream().anyMatch(item -> item.getId().equals(resume.getId())));
        assertTrue(resumeService.getResumeById(resume.getId()).isArchived());
        assertEquals(1, interviewSessionRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).size());
        }

    private Resume saveResume() {
        return resumeRepository.saveAndFlush(Resume.builder()
                .user(user)
                .fileName("resume.pdf")
                .storedFileName("stored-resume.pdf")
                .fileSize(128L)
                .rawText("Resume text")
                .candidateName(user.getName())
                .candidateEmail(user.getEmail())
                .build());
    }
}