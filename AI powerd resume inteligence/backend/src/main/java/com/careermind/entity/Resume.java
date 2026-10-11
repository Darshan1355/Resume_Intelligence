package com.careermind.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "resumes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Resume {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "file_name", nullable = false)
    private String fileName;

    @Column(name = "stored_file_name", nullable = false)
    private String storedFileName;

    @Column(name = "file_size", nullable = false)
    private Long fileSize;

    @Lob
    @Column(name = "raw_text", columnDefinition = "LONGTEXT", nullable = false)
    private String rawText;

    @Column(name = "candidate_name", length = 150)
    private String candidateName;

    @Column(name = "candidate_email", length = 150)
    private String candidateEmail;

    @Column(name = "candidate_phone", length = 50)
    private String candidatePhone;

    @Column(name = "candidate_education", length = 255)
    private String candidateEducation;

    @Column(name = "candidate_experience_years")
    @Builder.Default
    private Double candidateExperienceYears = 0.0;

    @Lob
    @Column(name = "parsed_sections", columnDefinition = "JSON")
    private String parsedSections;

    @Column(nullable = false, length = 50)
    @Builder.Default
    private String status = "PROCESSED";

    @OneToMany(mappedBy = "resume", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ResumeSkill> resumeSkills = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public void addResumeSkill(ResumeSkill resumeSkill) {
        resumeSkills.add(resumeSkill);
        resumeSkill.setResume(this);
    }
}
