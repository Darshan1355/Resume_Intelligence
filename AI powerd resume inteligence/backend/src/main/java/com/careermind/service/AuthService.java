package com.careermind.service;

import com.careermind.dto.AuthRequest;
import com.careermind.dto.AuthResponse;
import com.careermind.dto.RegisterRequest;
import com.careermind.dto.UserDto;
import com.careermind.entity.User;
import com.careermind.exception.BadRequestException;
import com.careermind.repository.UserRepository;
import com.careermind.security.JwtService;
import com.careermind.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        log.info("Processing registration request for email: {}", request.getEmail());

        if (userRepository.existsByEmail(request.getEmail().trim().toLowerCase())) {
            throw new BadRequestException("An account with this email address already exists.");
        }

        User user = User.builder()
                .name(request.getName().trim())
                .email(request.getEmail().trim().toLowerCase())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role("ROLE_USER")
                .build();

        User savedUser = userRepository.save(user);
        UserPrincipal principal = UserPrincipal.create(savedUser);
        String token = jwtService.generateToken(principal);

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .user(mapToDto(savedUser))
                .build();
    }

    public AuthResponse login(AuthRequest request) {
        log.info("Processing login request for email: {}", request.getEmail());

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail().trim().toLowerCase(),
                        request.getPassword()
                )
        );

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        String token = jwtService.generateToken(principal);

        User user = userRepository.findByEmail(principal.getEmail())
                .orElseThrow(() -> new BadRequestException("User record not found"));

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .user(mapToDto(user))
                .build();
    }

    @Transactional(readOnly = true)
    public UserDto getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserPrincipal principal)) {
            throw new BadRequestException("No authenticated user found in session");
        }

        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new BadRequestException("Current user not found"));

        return mapToDto(user);
    }

    public User getAuthenticatedUserEntity() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserPrincipal principal)) {
            throw new BadRequestException("User must be authenticated");
        }

        return userRepository.findById(principal.getId())
                .orElseThrow(() -> new BadRequestException("Authenticated user record not found in database"));
    }

    private UserDto mapToDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
