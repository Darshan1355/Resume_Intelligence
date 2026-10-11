package com.careermind.repository;

import com.careermind.entity.Resume;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ResumeRepository extends JpaRepository<Resume, Long> {
    List<Resume> findByUserIdAndArchivedOrderByCreatedAtDesc(Long userId, boolean archived);
    Optional<Resume> findByIdAndUserId(Long id, Long userId);

    @Query("SELECT r FROM Resume r LEFT JOIN FETCH r.resumeSkills rs LEFT JOIN FETCH rs.skill WHERE r.id = :id AND r.user.id = :userId")
    Optional<Resume> findByIdAndUserIdWithSkills(@Param("id") Long id, @Param("userId") Long userId);
}
