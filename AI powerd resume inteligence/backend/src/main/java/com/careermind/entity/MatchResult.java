package com.careermind.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "match_results")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MatchResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resume_id", nullable = false)
    private Resume resume;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id", nullable = false)
    private Job job;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "semantic_score", nullable = false)
    private Double semanticScore;

    @Column(name = "skill_score", nullable = false)
    private Double skillScore;

    @Column(name = "experience_score", nullable = false)
    private Double experienceScore;

    @Column(name = "education_score", nullable = false)
    private Double educationScore;

    @Column(name = "keyword_score", nullable = false)
    private Double keywordScore;

    @Column(name = "quality_score", nullable = false)
    private Double qualityScore;

    @Column(name = "final_ats_score", nullable = false)
    private Double finalAtsScore;

    @Column(name = "baseline_tfidf_score", nullable = false)
    @Builder.Default
    private Double baselineTfidfScore = 0.0;

    @Lob
    @Column(name = "explanation_json", columnDefinition = "LONGTEXT")
    private String explanationJson;

    @OneToMany(mappedBy = "matchResult", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<MatchSkillResult> skillResults = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public void addSkillResult(MatchSkillResult matchSkillResult) {
        skillResults.add(matchSkillResult);
        matchSkillResult.setMatchResult(this);
    }
}
