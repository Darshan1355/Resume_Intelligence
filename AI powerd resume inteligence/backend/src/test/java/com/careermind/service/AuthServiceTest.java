package com.careermind.service;

import com.careermind.dto.AuthRequest;
import com.careermind.dto.AuthResponse;
import com.careermind.dto.RegisterRequest;
import com.careermind.entity.User;
import com.careermind.exception.BadRequestException;
import com.careermind.repository.UserRepository;
import com.careermind.security.JwtService;
import com.careermind.security.UserPrincipal;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private AuthenticationManager authenticationManager;

    @InjectMocks
    private AuthService authService;

    private User user;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id(1L)
                .name("Aditya Test")
                .email("aditya@example.com")
                .passwordHash("encodedPassword")
                .role("ROLE_USER")
                .build();
    }

    @Test
    void testRegisterSuccess() {
        RegisterRequest request = RegisterRequest.builder()
                .name("Aditya Test")
                .email("aditya@example.com")
                .password("password123")
                .build();

        when(userRepository.existsByEmail("aditya@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(user);
        when(jwtService.generateToken(any(UserPrincipal.class))).thenReturn("mockJwtToken");

        AuthResponse response = authService.register(request);

        assertNotNull(response);
        assertEquals("mockJwtToken", response.getToken());
        assertEquals("aditya@example.com", response.getUser().getEmail());
        assertEquals("Aditya Test", response.getUser().getName());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void testRegisterDuplicateEmailThrowsBadRequest() {
        RegisterRequest request = RegisterRequest.builder()
                .name("Aditya Test")
                .email("aditya@example.com")
                .password("password123")
                .build();

        when(userRepository.existsByEmail("aditya@example.com")).thenReturn(true);

        assertThrows(BadRequestException.class, () -> authService.register(request));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void testLoginSuccess() {
        AuthRequest request = AuthRequest.builder()
                .email("aditya@example.com")
                .password("password123")
                .build();

        UserPrincipal principal = UserPrincipal.create(user);
        Authentication auth = mock(Authentication.class);
        when(auth.getPrincipal()).thenReturn(principal);

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(auth);
        when(jwtService.generateToken(principal)).thenReturn("mockJwtToken");
        when(userRepository.findByEmail("aditya@example.com")).thenReturn(Optional.of(user));

        AuthResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("mockJwtToken", response.getToken());
        assertEquals("aditya@example.com", response.getUser().getEmail());
    }
}
