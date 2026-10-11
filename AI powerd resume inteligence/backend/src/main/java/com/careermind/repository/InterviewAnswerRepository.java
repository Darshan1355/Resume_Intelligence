package com.careermind.repository;

import com.careermind.entity.InterviewAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InterviewAnswerRepository extends JpaRepository<InterviewAnswer, Long> {
    Optional<InterviewAnswer> findByQuestionId(Long questionId);
}
