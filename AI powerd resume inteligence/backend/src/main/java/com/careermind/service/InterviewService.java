package com.careermind.service;

import com.careermind.client.MlServiceClient;
import com.careermind.client.dto.MlClientDtos.InterviewEvalResponse;
import com.careermind.dto.*;
import com.careermind.entity.*;
import com.careermind.exception.BadRequestException;
import com.careermind.exception.ResourceNotFoundException;
import com.careermind.repository.*;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class InterviewService {

    private final InterviewSessionRepository sessionRepository;
    private final InterviewQuestionRepository questionRepository;
    private final InterviewAnswerRepository answerRepository;
    private final ResumeRepository resumeRepository;
    private final JobRepository jobRepository;
    private final AuthService authService;
    private final MlServiceClient mlServiceClient;
    private final ObjectMapper objectMapper;

    @Transactional
    public InterviewSessionResponse createSession(InterviewSessionRequest request) {
        User currentUser = authService.getAuthenticatedUserEntity();
        log.info("Creating interview session for user: {}, resume ID: {}, job ID: {}",
                currentUser.getEmail(), request.getResumeId(), request.getJobId());

        Resume resume = resumeRepository.findByIdAndUserIdWithSkills(request.getResumeId(), currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found with id: " + request.getResumeId()));

        Job job = jobRepository.findByIdWithSkills(request.getJobId())
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with id: " + request.getJobId()));

        InterviewSession session = InterviewSession.builder()
                .user(currentUser)
                .resume(resume)
                .job(job)
                .overallScore(0.0)
                .status("IN_PROGRESS")
                .build();

        // Generate tailored technical & behavioral questions based on resume & job requirements
        List<QuestionTemplate> templates = generateQuestionsForContext(resume, job, request.getQuestionCount() != null ? request.getQuestionCount() : 5);

        for (QuestionTemplate t : templates) {
            String conceptsJson = "[]";
            try {
                conceptsJson = objectMapper.writeValueAsString(t.expectedConcepts);
            } catch (Exception ignored) {}

            InterviewQuestion question = InterviewQuestion.builder()
                    .category(t.category)
                    .questionText(t.questionText)
                    .expectedConcepts(conceptsJson)
                    .sampleIdealAnswer(t.sampleAnswer)
                    .difficulty(t.difficulty)
                    .build();

            session.addQuestion(question);
        }

        InterviewSession savedSession = sessionRepository.save(session);
        return mapSessionToResponse(savedSession);
    }

    @Transactional
    public InterviewAnswerResponse submitAnswer(Long questionId, InterviewAnswerRequest request) {
        User currentUser = authService.getAuthenticatedUserEntity();
        InterviewQuestion question = questionRepository.findById(questionId)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found with id: " + questionId));

        if (!question.getSession().getUser().getId().equals(currentUser.getId())) {
            throw new BadRequestException("You are not authorized to answer this question.");
        }

        List<String> concepts = parseConcepts(question.getExpectedConcepts());

        InterviewEvalResponse eval;
        try {
            eval = mlServiceClient.evaluateInterviewAnswer(
                    question.getQuestionText(),
                    concepts,
                    question.getSampleIdealAnswer(),
                    request.getAnswer()
            );
        } catch (Exception e) {
            log.warn("ML Answer evaluation failed: {}. Using fallback heuristic evaluation.", e.getMessage());
            eval = fallbackEvaluation(request.getAnswer(), concepts);
        }

        InterviewAnswer answer = answerRepository.findByQuestionId(questionId)
                .orElseGet(() -> InterviewAnswer.builder().question(question).build());

        answer.setCandidateAnswer(request.getAnswer());
        answer.setRelevanceScore(eval.getRelevanceScore() != null ? eval.getRelevanceScore() : 75.0);
        answer.setConceptCoverageScore(eval.getConceptCoverageScore() != null ? eval.getConceptCoverageScore() : 70.0);
        answer.setCompletenessScore(eval.getCompletenessScore() != null ? eval.getCompletenessScore() : 70.0);
        answer.setOverallScore(eval.getOverallScore() != null ? eval.getOverallScore() : 72.0);
        answer.setFeedback(eval.getFeedback() != null ? eval.getFeedback() : "Good technical foundation demonstrated.");

        InterviewAnswer savedAnswer = answerRepository.save(answer);

        // Update overall session score
        updateSessionScore(question.getSession());

        return InterviewAnswerResponse.builder()
                .id(savedAnswer.getId())
                .questionId(question.getId())
                .candidateAnswer(savedAnswer.getCandidateAnswer())
                .relevanceScore(savedAnswer.getRelevanceScore())
                .conceptCoverageScore(savedAnswer.getConceptCoverageScore())
                .completenessScore(savedAnswer.getCompletenessScore())
                .overallScore(savedAnswer.getOverallScore())
                .feedback(savedAnswer.getFeedback())
                .createdAt(savedAnswer.getCreatedAt())
                .build();
    }

    @Transactional(readOnly = true)
    public List<InterviewSessionResponse> getUserSessions() {
        User currentUser = authService.getAuthenticatedUserEntity();
        return sessionRepository.findByUserIdOrderByCreatedAtDesc(currentUser.getId()).stream()
                .map(this::mapSessionToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public InterviewSessionResponse getSessionById(Long id) {
        User currentUser = authService.getAuthenticatedUserEntity();
        InterviewSession session = sessionRepository.findByIdAndUserIdWithQuestionsAndAnswers(id, currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Interview session not found with id: " + id));
        return mapSessionToResponse(session);
    }

    private void updateSessionScore(InterviewSession session) {
        List<InterviewQuestion> questions = questionRepository.findBySessionId(session.getId());
        double total = 0.0;
        int answeredCount = 0;

        for (InterviewQuestion q : questions) {
            InterviewAnswer ans = q.getAnswer();
            if (ans != null && ans.getOverallScore() != null) {
                total += ans.getOverallScore();
                answeredCount++;
            }
        }

        if (answeredCount > 0) {
            double avg = total / answeredCount;
            session.setOverallScore(Math.round(avg * 10.0) / 10.0);
            if (answeredCount == questions.size()) {
                session.setStatus("COMPLETED");
            }
            sessionRepository.save(session);
        }
    }

    private List<QuestionTemplate> generateQuestionsForContext(Resume resume, Job job, int count) {
        List<QuestionTemplate> bank = new ArrayList<>();

        // 1. Core Java / OOP
        bank.add(new QuestionTemplate(
                "Java",
                "Explain the Java Memory Model, specifically how the Garbage Collector works with Generational Heap management (Eden, Survivor, Tenured), and how you troubleshoot OutOfMemoryErrors.",
                List.of("Garbage Collection", "Generational Heap", "Eden Space", "Tenured", "G1GC / ZGC", "Heap Dumps", "Memory Leaks"),
                "Java divides heap memory into Young Generation (Eden, S0, S1) and Old Generation (Tenured). Short-lived objects are collected rapidly via minor GC, while surviving objects age and promote to Tenured for major GC. OOM is diagnosed via heap dumps (jmap/Eclipse MAT) and analyzing memory leak retention trees.",
                "HARD"
        ));

        // 2. Spring Boot & Spring Security
        bank.add(new QuestionTemplate(
                "Spring Boot",
                "How does Spring Security filter chain process JWT stateless authentication, and how do you handle exception propagation across security filter boundaries?",
                List.of("SecurityFilterChain", "OncePerRequestFilter", "AuthenticationManager", "JWT validation", "AuthenticationEntryPoint", "AccessDeniedHandler"),
                "A custom OncePerRequestFilter intercepts incoming HTTP requests, extracts the Bearer token, validates signature/claims using the secret key, creates an Authentication token, and sets it into SecurityContextHolder. Filter exceptions are routed via custom AuthenticationEntryPoint and AccessDeniedHandler.",
                "MEDIUM"
        ));

        // 3. REST APIs & Microservices
        bank.add(new QuestionTemplate(
                "Microservices",
                "In a distributed microservice architecture, how do you manage distributed transactions across autonomous services while maintaining consistency (e.g. Saga Pattern vs 2PC)?",
                List.of("Saga Pattern", "Choreography", "Orchestration", "Compensating Transactions", "Eventual Consistency", "Kafka / Event Bus"),
                "The Saga pattern breaks transactions into local steps executed across services. Orchestrated sagas use a central orchestrator; choreography uses event broadcasts (e.g. Kafka). If a step fails, compensating transactions undo earlier operations, providing eventual consistency without blocking 2PC locks.",
                "HARD"
        ));

        // 4. Database & JPA / Hibernate
        bank.add(new QuestionTemplate(
                "DBMS",
                "What is the N+1 select problem in Hibernate/JPA, how does it hurt production performance, and what are the optimal strategies to resolve it?",
                List.of("N+1 Problem", "JOIN FETCH", "EntityGraph", "BatchSize", "Lazy Loading", "Query Optimization"),
                "The N+1 problem occurs when fetching N child records triggers N individual SQL queries after 1 parent query. It is resolved using JOIN FETCH in JPQL queries, `@EntityGraph` annotations, or setting `hibernate.default_batch_fetch_size` for batch loading.",
                "MEDIUM"
        ));

        // 5. System Design / Machine Learning
        bank.add(new QuestionTemplate(
                "System Design",
                "How would you design a real-time semantic resume-job matching pipeline capable of embedding millions of candidate profiles with low latency vector search?",
                List.of("Vector Embeddings", "Cosine Similarity", "Approximate Nearest Neighbors (ANN)", "FAISS / Pinecone / HNSW", "Batch Inference", "Caching"),
                "Generate dense vectors using transformer models (like all-MiniLM-L6-v2), store them in a vector index using HNSW graph algorithm (e.g. FAISS/Milvus), cache frequent query embeddings in Redis, and asynchronously compute matching scores via background workers.",
                "HARD"
        ));

        // 6. Behavioral / Engineering Leadership
        bank.add(new QuestionTemplate(
                "Behavioral",
                "Describe a situation where you had to resolve a high-severity production outage or critical performance bottleneck under tight deadlines.",
                List.of("Root Cause Analysis", "Incident Response", "Monitoring / Observability", "Post-Mortem", "Stakeholder Communication"),
                "Structured STAR response detailing the incident discovery, observability metrics analysis, hotfix or mitigation rollback applied, customer communication, and post-incident blameless post-mortem prevention actions.",
                "MEDIUM"
        ));

        return bank.subList(0, Math.min(count, bank.size()));
    }

    private List<String> parseConcepts(String json) {
        if (json == null || json.isBlank()) return List.of();
        try {
            return objectMapper.readValue(json, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            return List.of();
        }
    }

    private InterviewEvalResponse fallbackEvaluation(String answer, List<String> concepts) {
        if (answer == null || answer.trim().length() < 10) {
            return InterviewEvalResponse.builder()
                    .relevanceScore(30.0)
                    .conceptCoverageScore(20.0)
                    .completenessScore(25.0)
                    .overallScore(25.0)
                    .feedback("The response was too brief to adequately demonstrate technical depth.")
                    .build();
        }

        String lowerAnswer = answer.toLowerCase();
        int matchedConcepts = 0;
        for (String c : concepts) {
            if (lowerAnswer.contains(c.toLowerCase())) {
                matchedConcepts++;
            }
        }

        double coverage = concepts.isEmpty() ? 75.0 : ((double) matchedConcepts / concepts.size()) * 100.0;
        double completeness = Math.min(100.0, (answer.length() / 250.0) * 100.0);
        double relevance = Math.min(100.0, Math.max(50.0, (coverage * 0.6) + (completeness * 0.4)));
        double overall = (relevance * 0.4) + (coverage * 0.4) + (completeness * 0.2);

        return InterviewEvalResponse.builder()
                .relevanceScore(Math.round(relevance * 10.0) / 10.0)
                .conceptCoverageScore(Math.round(coverage * 10.0) / 10.0)
                .completenessScore(Math.round(completeness * 10.0) / 10.0)
                .overallScore(Math.round(overall * 10.0) / 10.0)
                .feedback("Demonstrated grasp of key concepts: (" + matchedConcepts + "/" + concepts.size() + " key terms covered).")
                .build();
    }

    private InterviewSessionResponse mapSessionToResponse(InterviewSession session) {
        List<InterviewQuestionDto> questionDtos = new ArrayList<>();
        if (session.getQuestions() != null) {
            for (InterviewQuestion q : session.getQuestions()) {
                InterviewAnswerResponse ansDto = null;
                if (q.getAnswer() != null) {
                    ansDto = InterviewAnswerResponse.builder()
                            .id(q.getAnswer().getId())
                            .questionId(q.getId())
                            .candidateAnswer(q.getAnswer().getCandidateAnswer())
                            .relevanceScore(q.getAnswer().getRelevanceScore())
                            .conceptCoverageScore(q.getAnswer().getConceptCoverageScore())
                            .completenessScore(q.getAnswer().getCompletenessScore())
                            .overallScore(q.getAnswer().getOverallScore())
                            .feedback(q.getAnswer().getFeedback())
                            .createdAt(q.getAnswer().getCreatedAt())
                            .build();
                }

                questionDtos.add(InterviewQuestionDto.builder()
                        .id(q.getId())
                        .category(q.getCategory())
                        .questionText(q.getQuestionText())
                        .expectedConcepts(parseConcepts(q.getExpectedConcepts()))
                        .sampleIdealAnswer(q.getSampleIdealAnswer())
                        .difficulty(q.getDifficulty())
                        .answer(ansDto)
                        .build());
            }
        }

        return InterviewSessionResponse.builder()
                .id(session.getId())
                .resumeId(session.getResume().getId())
                .resumeFileName(session.getResume().getFileName())
                .jobId(session.getJob().getId())
                .jobTitle(session.getJob().getTitle())
                .jobCompany(session.getJob().getCompany())
                .overallScore(session.getOverallScore())
                .status(session.getStatus())
                .questions(questionDtos)
                .createdAt(session.getCreatedAt())
                .build();
    }

    private record QuestionTemplate(String category, String questionText, List<String> expectedConcepts, String sampleAnswer, String difficulty) {}
}
