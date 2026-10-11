package com.careermind.repository;

import com.careermind.entity.MatchSkillResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MatchSkillResultRepository extends JpaRepository<MatchSkillResult, Long> {
    List<MatchSkillResult> findByMatchResultId(Long matchResultId);
}
