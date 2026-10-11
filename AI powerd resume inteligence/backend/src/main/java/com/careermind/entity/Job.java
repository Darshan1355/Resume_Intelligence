package com.careermind.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "jobs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Job {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, length = 150)
    private String company;

    @Lob
    @Column(nullable = false, columnDefinition = "LONGTEXT")
    private String description;

    @Column(nullable = false, length = 150)
    @Builder.Default
    private String location = "Remote";

    @Column(name = "experience_required", nullable = false)
    @Builder.Default
    private Double experienceRequired = 0.0;

    @Column(name = "education_required", length = 100)
    @Builder.Default
    private String educationRequired = "Bachelor";

    @Lob
    @Column(name = "embedding_vector", columnDefinition = "JSON")
    private String embeddingVector;

    @OneToMany(mappedBy = "job", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<JobSkill> jobSkills = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public void addJobSkill(JobSkill jobSkill) {
        jobSkills.add(jobSkill);
        jobSkill.setJob(this);
    }
}
