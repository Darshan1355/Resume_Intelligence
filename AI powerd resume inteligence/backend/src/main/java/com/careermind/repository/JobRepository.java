package com.careermind.repository;

import com.careermind.entity.Job;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface JobRepository extends JpaRepository<Job, Long> {
    List<Job> findAllByOrderByCreatedAtDesc();

    @Query("SELECT j FROM Job j LEFT JOIN FETCH j.jobSkills js LEFT JOIN FETCH js.skill WHERE j.id = :id")
    Optional<Job> findByIdWithSkills(@Param("id") Long id);

    @Query("SELECT DISTINCT j FROM Job j LEFT JOIN FETCH j.jobSkills js LEFT JOIN FETCH js.skill")
    List<Job> findAllWithSkills();
}
