package com.careermind.repository;

import com.careermind.entity.InterviewSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InterviewSessionRepository extends JpaRepository<InterviewSession, Long> {
    List<InterviewSession> findByUserIdOrderByCreatedAtDesc(Long userId);
    Optional<InterviewSession> findByIdAndUserId(Long id, Long userId);

    @Query("SELECT s FROM InterviewSession s LEFT JOIN FETCH s.questions q LEFT JOIN FETCH q.answer WHERE s.id = :id AND s.user.id = :userId")
    Optional<InterviewSession> findByIdAndUserIdWithQuestionsAndAnswers(@Param("id") Long id, @Param("userId") Long userId);
}
