package com.careermind.repository;

import com.careermind.entity.MatchResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MatchResultRepository extends JpaRepository<MatchResult, Long> {
    List<MatchResult> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<MatchResult> findByResumeIdOrderByCreatedAtDesc(Long resumeId);
    boolean existsByResumeId(Long resumeId);
    Optional<MatchResult> findByIdAndUserId(Long id, Long userId);

    @Query("SELECT m FROM MatchResult m LEFT JOIN FETCH m.skillResults sr LEFT JOIN FETCH sr.skill WHERE m.id = :id AND m.user.id = :userId")
    Optional<MatchResult> findByIdAndUserIdWithSkills(@Param("id") Long id, @Param("userId") Long userId);
}
