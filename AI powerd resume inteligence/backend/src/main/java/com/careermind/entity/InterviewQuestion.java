package com.careermind.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "interview_questions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private InterviewSession session;

    @Column(nullable = false, length = 50)
    private String category;

    @Lob
    @Column(name = "question_text", nullable = false, columnDefinition = "TEXT")
    private String questionText;

    @Lob
    @Column(name = "expected_concepts", columnDefinition = "JSON")
    private String expectedConcepts;

    @Lob
    @Column(name = "sample_ideal_answer", columnDefinition = "TEXT")
    private String sampleIdealAnswer;

    @Column(length = 30)
    @Builder.Default
    private String difficulty = "MEDIUM";

    @OneToOne(mappedBy = "question", cascade = CascadeType.ALL, orphanRemoval = true)
    private InterviewAnswer answer;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
