package com.careermind.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InterviewQuestionDto {
    private Long id;
    private String category;
    private String questionText;
    private List<String> expectedConcepts;
    private String sampleIdealAnswer;
    private String difficulty;
    private InterviewAnswerResponse answer;
}
