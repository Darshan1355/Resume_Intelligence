package com.careermind.service;

import com.careermind.client.MlServiceClient;
import com.careermind.client.dto.MlClientDtos.ExtractedSkillItem;
import com.careermind.dto.JobCreateRequest;
import com.careermind.dto.JobResponse;
import com.careermind.dto.JobSkillDto;
import com.careermind.entity.Job;
import com.careermind.entity.JobSkill;
import com.careermind.entity.Skill;
import com.careermind.exception.ResourceNotFoundException;
import com.careermind.repository.JobRepository;
import com.careermind.repository.SkillRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class JobService {

    private final JobRepository jobRepository;
    private final SkillRepository skillRepository;
    private final MlServiceClient mlServiceClient;

    @Transactional
    public JobResponse createJob(JobCreateRequest request) {
        log.info("Creating job posting: {} at {}", request.getTitle(), request.getCompany());

        Job job = Job.builder()
                .title(request.getTitle().trim())
                .company(request.getCompany().trim())
                .description(request.getDescription().trim())
                .location(request.getLocation() != null ? request.getLocation().trim() : "Remote")
                .experienceRequired(request.getExperienceRequired() != null ? request.getExperienceRequired() : 0.0)
                .educationRequired(request.getEducationRequired() != null ? request.getEducationRequired() : "Bachelor")
                .build();

        Set<String> processedSkills = new HashSet<>();

        // Add explicit required skills
        if (request.getRequiredSkills() != null) {
            for (String skillName : request.getRequiredSkills()) {
                if (skillName != null && !skillName.isBlank() && processedSkills.add(skillName.trim().toLowerCase())) {
                    Skill skill = getOrCreateSkill(skillName.trim(), skillName.trim(), "General");
                    JobSkill jobSkill = JobSkill.builder()
                            .job(job)
                            .skill(skill)
                            .importance(1.0)
                            .isRequired(true)
                            .build();
                    job.addJobSkill(jobSkill);
                }
            }
        }

        // Add explicit preferred skills
        if (request.getPreferredSkills() != null) {
            for (String skillName : request.getPreferredSkills()) {
                if (skillName != null && !skillName.isBlank() && processedSkills.add(skillName.trim().toLowerCase())) {
                    Skill skill = getOrCreateSkill(skillName.trim(), skillName.trim(), "General");
                    JobSkill jobSkill = JobSkill.builder()
                            .job(job)
                            .skill(skill)
                            .importance(0.7)
                            .isRequired(false)
                            .build();
                    job.addJobSkill(jobSkill);
                }
            }
        }

        // If no explicit skills provided, extract via NLP from description
        if (job.getJobSkills().isEmpty()) {
            try {
                List<ExtractedSkillItem> nlpSkills = mlServiceClient.extractSkills(request.getDescription());
                if (nlpSkills != null) {
                    for (ExtractedSkillItem item : nlpSkills) {
                        if (processedSkills.add(item.getName().trim().toLowerCase())) {
                            Skill skill = getOrCreateSkill(item.getName(), item.getCanonicalName(), item.getCategory());
                            JobSkill jobSkill = JobSkill.builder()
                                    .job(job)
                                    .skill(skill)
                                    .importance(1.0)
                                    .isRequired(true)
                                    .build();
                            job.addJobSkill(jobSkill);
                        }
                    }
                }
            } catch (Exception e) {
                log.warn("Could not auto-extract skills for job description: {}", e.getMessage());
            }
        }

        Job savedJob = jobRepository.save(job);
        return mapToResponse(savedJob);
    }

    @Transactional(readOnly = true)
    public List<JobResponse> getAllJobs() {
        return jobRepository.findAllWithSkills().stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public JobResponse getJobById(Long id) {
        Job job = jobRepository.findByIdWithSkills(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with id: " + id));
        return mapToResponse(job);
    }

    @Transactional
    public void deleteJob(Long id) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with id: " + id));
        jobRepository.delete(job);
        log.info("Deleted job posting ID: {}", id);
    }

    public Job getJobEntity(Long id) {
        return jobRepository.findByIdWithSkills(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with id: " + id));
    }

    private Skill getOrCreateSkill(String name, String canonicalName, String category) {
        return skillRepository.findByNameIgnoreCase(name)
                .orElseGet(() -> skillRepository.save(Skill.builder()
                        .name(name)
                        .canonicalName(canonicalName != null ? canonicalName : name)
                        .category(category != null ? category : "General")
                        .build()));
    }

    private JobResponse mapToResponse(Job job) {
        List<JobSkillDto> skillDtos = new ArrayList<>();
        if (job.getJobSkills() != null) {
            for (JobSkill js : job.getJobSkills()) {
                skillDtos.add(JobSkillDto.builder()
                        .id(js.getSkill().getId())
                        .name(js.getSkill().getName())
                        .canonicalName(js.getSkill().getCanonicalName())
                        .category(js.getSkill().getCategory())
                        .importance(js.getImportance())
                        .isRequired(js.getIsRequired())
                        .build());
            }
        }

        return JobResponse.builder()
                .id(job.getId())
                .title(job.getTitle())
                .company(job.getCompany())
                .description(job.getDescription())
                .location(job.getLocation())
                .experienceRequired(job.getExperienceRequired())
                .educationRequired(job.getEducationRequired())
                .skills(skillDtos)
                .createdAt(job.getCreatedAt())
                .updatedAt(job.getUpdatedAt())
                .build();
    }
}
