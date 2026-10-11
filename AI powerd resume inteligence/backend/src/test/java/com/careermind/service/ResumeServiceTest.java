package com.careermind.service;

import com.careermind.client.MlServiceClient;
import com.careermind.entity.Resume;
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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ResumeServiceTest {

    @Mock
    private ResumeRepository resumeRepository;

    @Mock
    private InterviewSessionRepository interviewSessionRepository;

    @Mock
    private MatchResultRepository matchResultRepository;

    @Mock
    private SkillRepository skillRepository;

    @Mock
    private AuthService authService;

    @Mock
    private PdfExtractorUtil pdfExtractorUtil;

    @Mock
    private FileStorageUtil fileStorageUtil;

    @Mock
    private MlServiceClient mlServiceClient;

    @Mock
    private ObjectMapper objectMapper;

    @InjectMocks
    private ResumeService resumeService;

    private User currentUser;
    private Resume resume;

    @BeforeEach
    void setUp() {
        currentUser = User.builder().id(1L).build();
        resume = Resume.builder()
                .id(10L)
                .user(currentUser)
                .storedFileName("resume.pdf")
                .build();
        when(authService.getAuthenticatedUserEntity()).thenReturn(currentUser);
    }

    @Test
    void deleteResumeWithoutHistoryDeletesRecordAndFile() {
        when(resumeRepository.findById(10L)).thenReturn(Optional.of(resume));
        when(interviewSessionRepository.existsByResumeId(10L)).thenReturn(false);
        when(matchResultRepository.existsByResumeId(10L)).thenReturn(false);

        resumeService.deleteResume(10L);

        verify(resumeRepository).delete(resume);
        verify(resumeRepository).flush();
        verify(fileStorageUtil).deleteFile("resume.pdf");
    }

    @Test
    void deleteMissingResumeThrowsNotFound() {
        when(resumeRepository.findById(10L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> resumeService.deleteResume(10L));

        verify(interviewSessionRepository, never()).existsByResumeId(10L);
        verify(matchResultRepository, never()).existsByResumeId(10L);
        verify(resumeRepository, never()).delete(resume);
        verify(fileStorageUtil, never()).deleteFile("resume.pdf");
    }

    @Test
    void deleteResumeWithInterviewSessionsReturnsConflictAndPreservesData() {
        when(resumeRepository.findById(10L)).thenReturn(Optional.of(resume));
        when(interviewSessionRepository.existsByResumeId(10L)).thenReturn(true);

        assertThrows(ConflictException.class, () -> resumeService.deleteResume(10L));

        verify(matchResultRepository, never()).existsByResumeId(10L);
        verify(resumeRepository, never()).delete(resume);
        verify(fileStorageUtil, never()).deleteFile("resume.pdf");
    }

    @Test
    void deleteResumeWithMatchHistoryReturnsConflictAndPreservesData() {
        when(resumeRepository.findById(10L)).thenReturn(Optional.of(resume));
        when(interviewSessionRepository.existsByResumeId(10L)).thenReturn(false);
        when(matchResultRepository.existsByResumeId(10L)).thenReturn(true);

        assertThrows(ConflictException.class, () -> resumeService.deleteResume(10L));

        verify(resumeRepository, never()).delete(resume);
        verify(fileStorageUtil, never()).deleteFile("resume.pdf");
    }

    @Test
    void deleteAnotherUsersResumeIsForbidden() {
        User anotherUser = User.builder().id(2L).build();
        resume.setUser(anotherUser);
        when(resumeRepository.findById(10L)).thenReturn(Optional.of(resume));

        assertThrows(UnauthorizedException.class, () -> resumeService.deleteResume(10L));

        verify(interviewSessionRepository, never()).existsByResumeId(10L);
        verify(matchResultRepository, never()).existsByResumeId(10L);
        verify(resumeRepository, never()).delete(resume);
        verify(fileStorageUtil, never()).deleteFile("resume.pdf");
    }

    @Test
    void archiveResumeMarksOwnedResumeArchived() {
        when(resumeRepository.findById(10L)).thenReturn(Optional.of(resume));

        resumeService.archiveResume(10L);

        assertTrue(resume.isArchived());
        verify(resumeRepository).save(resume);
    }

    @Test
    void restoreResumeMakesOwnedResumeActive() {
        resume.setArchived(true);
        when(resumeRepository.findById(10L)).thenReturn(Optional.of(resume));

        resumeService.restoreResume(10L);

        assertFalse(resume.isArchived());
        verify(resumeRepository).save(resume);
    }

    @Test
    void archiveMissingResumeThrowsNotFound() {
        when(resumeRepository.findById(10L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> resumeService.archiveResume(10L));

        verify(resumeRepository, never()).save(resume);
    }

    @Test
    void archiveAnotherUsersResumeIsForbidden() {
        resume.setUser(User.builder().id(2L).build());
        when(resumeRepository.findById(10L)).thenReturn(Optional.of(resume));

        assertThrows(UnauthorizedException.class, () -> resumeService.archiveResume(10L));

        verify(resumeRepository, never()).save(resume);
    }

    @Test
    void listingResumesPassesRequestedArchiveStateToOwnerScopedRepositoryQuery() {
        when(resumeRepository.findByUserIdAndArchivedOrderByCreatedAtDesc(1L, false))
                .thenReturn(List.of(resume));

        var activeResumes = resumeService.getUserResumes();

        assertEquals(1, activeResumes.size());
        assertFalse(activeResumes.get(0).isArchived());
        verify(resumeRepository).findByUserIdAndArchivedOrderByCreatedAtDesc(1L, false);
    }
}