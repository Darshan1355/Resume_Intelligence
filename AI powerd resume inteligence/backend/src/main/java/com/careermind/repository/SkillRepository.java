package com.careermind.repository;

import com.careermind.entity.Skill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SkillRepository extends JpaRepository<Skill, Long> {
    Optional<Skill> findByNameIgnoreCase(String name);
    Optional<Skill> findByCanonicalNameIgnoreCase(String canonicalName);
    List<Skill> findByCategory(String category);
}
