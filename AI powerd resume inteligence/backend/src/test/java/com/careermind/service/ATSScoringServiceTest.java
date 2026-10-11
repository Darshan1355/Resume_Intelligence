package com.careermind.service;

import com.careermind.dto.AtsScoreBreakdownDto;
import com.careermind.dto.SkillMatchDetailDto;
import com.careermind.entity.Job;
import com.careermind.entity.Resume;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class ATSScoringServiceTest {

    private ATSScoringService atsScoringService;

    @BeforeEach
    void setUp() {
        atsScoringService = new ATSScoringService();
    }

    @Test
    void testAtsFormulaAccurateWeighting() {
        Resume resume = Resume.builder()
                .id(1L)
                .candidateExperienceYears(5.0)
                .candidateEducation("Master of Computer Applications")
                .rawText("Architected and developed high-scale distributed backend microservices with 99.99% uptime and reduced latency by 45%. Education and Work History.")
                .build();

        Job job = Job.builder()
                .id(10L)
                .title("Senior Java Developer")
                .company("TechCorp")
                .experienceRequired(4.0)
                .educationRequired("Bachelor")
                .build();

        List<SkillMatchDetailDto> matched = List.of(
                SkillMatchDetailDto.builder().skill("Java").importance(1.0).build(),
                SkillMatchDetailDto.builder().skill("Spring Boot").importance(1.0).build()
        );
        List<SkillMatchDetailDto> missing = List.of(
                SkillMatchDetailDto.builder().skill("Kafka").isRequired(true).build()
        );

        double skillScore = 90.0;
        double semanticScore = 85.0;
        double tfidfScore = 80.0;

        AtsScoreBreakdownDto result = atsScoringService.calculateAtsScore(
                resume, job, semanticScore, skillScore, tfidfScore, matched, missing, List.of()
        );

        assertNotNull(result);
        assertEquals(90.0, result.getSkillScore());
        assertEquals(85.0, result.getSemanticScore());
        assertEquals(100.0, result.getExperienceScore()); // 5.0 >= 4.0
        assertEquals(100.0, result.getEducationScore());  // Master >= Bachelor
        assertEquals(80.0, result.getKeywordScore());

        // Expected final ATS score calculation:
        // 0.30*90 + 0.30*85 + 0.15*100 + 0.10*100 + 0.10*80 + 0.05*quality
        assertTrue(result.getFinalScore() >= 80.0 && result.getFinalScore() <= 100.0);
        assertFalse(result.getKeyStrengths().isEmpty());
        assertFalse(result.getMissingSkillsSummary().isEmpty());
        assertNotNull(result.getExecutiveSummary());
    }
}
