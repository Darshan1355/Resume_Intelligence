package com.careermind.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "interview_answers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewAnswer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false, unique = true)
    private InterviewQuestion question;

    @Lob
    @Column(name = "candidate_answer", nullable = false, columnDefinition = "LONGTEXT")
    private String candidateAnswer;

    @Column(name = "relevance_score", nullable = false)
    @Builder.Default
    private Double relevanceScore = 0.0;

    @Column(name = "concept_coverage_score", nullable = false)
    @Builder.Default
    private Double conceptCoverageScore = 0.0;

    @Column(name = "completeness_score", nullable = false)
    @Builder.Default
    private Double completenessScore = 0.0;

    @Column(name = "overall_score", nullable = false)
    @Builder.Default
    private Double overallScore = 0.0;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String feedback;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
