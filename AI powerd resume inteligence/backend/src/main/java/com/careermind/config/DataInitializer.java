package com.careermind.config;

import com.careermind.dto.JobCreateRequest;
import com.careermind.entity.User;
import com.careermind.repository.JobRepository;
import com.careermind.repository.UserRepository;
import com.careermind.service.JobService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final JobRepository jobRepository;
    private final JobService jobService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {
            User demoUser = User.builder()
                    .name("Aditya Sharma")
                    .email("aditya@example.com")
                    .passwordHash(passwordEncoder.encode("password123"))
                    .role("ROLE_USER")
                    .build();
            userRepository.save(demoUser);
            log.info("Seeded default developer demo user: aditya@example.com");
        }

        if (jobRepository.count() == 0) {
            log.info("Seeding initial realistic job postings into CareerMind database...");

            List<JobCreateRequest> initialJobs = List.of(
                JobCreateRequest.builder()
                    .title("Senior Java Spring Boot Engineer")
                    .company("FinTech Solutions Inc.")
                    .location("Remote / New York")
                    .experienceRequired(5.0)
                    .educationRequired("Bachelor")
                    .description("We are looking for a Senior Java Developer with strong expertise in Spring Boot, Spring Security, REST APIs, Microservices, MySQL, and Kafka. Experience in cloud deployment and Docker containerization is required.")
                    .requiredSkills(List.of("Java", "Spring Boot", "Spring Security", "Hibernate", "MySQL", "REST APIs", "Microservices"))
                    .preferredSkills(List.of("Apache Kafka", "Docker", "Kubernetes", "AWS"))
                    .build(),

                JobCreateRequest.builder()
                    .title("Full-Stack Developer (React & Node.js)")
                    .company("Modern SaaS Labs")
                    .location("Remote / San Francisco")
                    .experienceRequired(3.0)
                    .educationRequired("Bachelor")
                    .description("Seeking a Full-Stack Engineer skilled in React, TypeScript, Tailwind CSS, Node.js, Express.js, and PostgreSQL. Experience with JWT authentication, state management, and modern component-driven UI architecture is essential.")
                    .requiredSkills(List.of("React", "TypeScript", "JavaScript", "Node.js", "Express.js", "PostgreSQL", "Tailwind CSS"))
                    .preferredSkills(List.of("Redux", "Docker", "REST APIs", "Next.js"))
                    .build(),

                JobCreateRequest.builder()
                    .title("AI / NLP & Deep Learning Engineer")
                    .company("Cognitive AI Systems")
                    .location("Remote / Austin")
                    .experienceRequired(4.0)
                    .educationRequired("Master")
                    .description("Hiring an AI/NLP Specialist to design transformer-based embedding pipelines, semantic similarity algorithms, text extraction services, and named entity recognition models using PyTorch, Sentence-BERT, spaCy, and FastAPI.")
                    .requiredSkills(List.of("Python", "PyTorch", "Transformers", "Sentence-BERT", "spaCy", "scikit-learn", "FastAPI"))
                    .preferredSkills(List.of("Docker", "NumPy", "pandas", "AWS"))
                    .build(),

                JobCreateRequest.builder()
                    .title("Cloud DevOps & Kubernetes Engineer")
                    .company("ScaleInfrastructure Cloud")
                    .location("Remote / Seattle")
                    .experienceRequired(4.0)
                    .educationRequired("Bachelor")
                    .description("Looking for a Cloud DevOps Engineer to build automated CI/CD pipelines, manage Kubernetes clusters on AWS, configure Infrastructure as Code using Terraform, and ensure 99.99% system reliability.")
                    .requiredSkills(List.of("AWS", "Docker", "Kubernetes", "Terraform", "CI/CD", "GitHub Actions", "Linux"))
                    .preferredSkills(List.of("Jenkins", "Python", "Go"))
                    .build(),

                JobCreateRequest.builder()
                    .title("Senior Frontend Engineer (React & TypeScript)")
                    .company("Pulse UI Technologies")
                    .location("Remote / Chicago")
                    .experienceRequired(4.0)
                    .educationRequired("Bachelor")
                    .description("Senior React Engineer needed to architect high-performance React/TypeScript applications with Next.js, Tailwind CSS, Redux Toolkit, modern responsive CSS design systems, and robust REST API integrations.")
                    .requiredSkills(List.of("React", "TypeScript", "JavaScript", "HTML5", "CSS3", "Tailwind CSS", "Redux"))
                    .preferredSkills(List.of("Next.js", "Jest", "Git"))
                    .build(),

                JobCreateRequest.builder()
                    .title("Python & FastAPI Microservices Backend Developer")
                    .company("Nexus Streaming Platform")
                    .location("Remote / Boston")
                    .experienceRequired(3.0)
                    .educationRequired("Bachelor")
                    .description("Python Backend Engineer specializing in asynchronous REST APIs with FastAPI, Pydantic, SQLAlchemy, PostgreSQL, Redis in-memory caching, and Docker microservices containerization.")
                    .requiredSkills(List.of("Python", "FastAPI", "PostgreSQL", "Redis", "REST APIs", "Docker"))
                    .preferredSkills(List.of("Django", "Apache Kafka", "Git"))
                    .build(),

                JobCreateRequest.builder()
                    .title("Database Administrator & Big Data Engineer")
                    .company("DataMatrix Systems")
                    .location("Remote / Denver")
                    .experienceRequired(5.0)
                    .educationRequired("Bachelor")
                    .description("Lead DBA & Data Engineer: MySQL, PostgreSQL, performance tuning, indexing strategies, NoSQL databases (MongoDB, Redis), and real-time Kafka event streaming pipelines.")
                    .requiredSkills(List.of("SQL", "MySQL", "PostgreSQL", "MongoDB", "Redis", "Apache Kafka"))
                    .preferredSkills(List.of("Docker", "Linux", "Python"))
                    .build(),

                JobCreateRequest.builder()
                    .title("QA Automation Engineer (SDET)")
                    .company("QualityShield Software")
                    .location("Remote / Atlanta")
                    .experienceRequired(3.0)
                    .educationRequired("Bachelor")
                    .description("SDET / QA Automation Engineer experienced in writing automated test suites, REST API verification, unit and integration testing with JUnit and PyTest, and continuous integration pipeline automation.")
                    .requiredSkills(List.of("Java", "Python", "JUnit", "PyTest", "CI/CD", "Git"))
                    .preferredSkills(List.of("Docker", "Linux", "REST APIs"))
                    .build(),

                JobCreateRequest.builder()
                    .title("Cloud Security & DevSecOps Architect")
                    .company("CyberDefense Global")
                    .location("Remote / Washington DC")
                    .experienceRequired(5.0)
                    .educationRequired("Bachelor")
                    .description("Cloud Security Specialist: OWASP Top 10 mitigation, AWS cloud security, Terraform infrastructure security gates, container vulnerability scanning, and secure CI/CD pipelines.")
                    .requiredSkills(List.of("AWS", "Docker", "Kubernetes", "Terraform", "CI/CD", "Linux"))
                    .preferredSkills(List.of("Java", "Python", "Spring Security"))
                    .build(),

                JobCreateRequest.builder()
                    .title("Modern C++ Systems Engineer")
                    .company("Apex Embedded Systems")
                    .location("Remote / Austin")
                    .experienceRequired(4.0)
                    .educationRequired("Bachelor")
                    .description("Low-latency systems software engineer experienced in Modern C++, multithreading, memory management, Linux systems programming, and high-performance network sockets.")
                    .requiredSkills(List.of("C++", "Linux", "Git"))
                    .preferredSkills(List.of("Docker", "Python"))
                    .build()
            );

            for (JobCreateRequest jobReq : initialJobs) {
                jobService.createJob(jobReq);
            }

            log.info("Successfully seeded {} realistic target job postings.", initialJobs.size());
        }
    }
}
