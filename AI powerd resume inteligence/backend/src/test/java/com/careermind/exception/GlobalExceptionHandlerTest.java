package com.careermind.exception;

import org.junit.jupiter.api.Test;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.http.ResponseEntity;

import static org.junit.jupiter.api.Assertions.assertEquals;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler exceptionHandler = new GlobalExceptionHandler();

    @Test
    void conflictReturnsHttp409AndUserFriendlyMessage() {
        String message = "This resume is linked to interview or job-matching history and cannot be deleted. Keep the resume to preserve that history.";
        MockHttpServletRequest request = new MockHttpServletRequest();

        ResponseEntity<ErrorResponse> response = exceptionHandler.handleConflict(
                new ConflictException(message), request);

        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
        assertEquals("CONFLICT", response.getBody().getError());
        assertEquals(message, response.getBody().getMessage());
    }

    @Test
    void databaseConstraintViolationReturnsHttp409() {
        MockHttpServletRequest request = new MockHttpServletRequest();

        ResponseEntity<ErrorResponse> response = exceptionHandler.handleDataIntegrityViolation(
                new DataIntegrityViolationException("foreign key constraint"), request);

        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
        assertEquals("This record is linked to other data and cannot be deleted.", response.getBody().getMessage());
    }
}