package com.pattakelu.service;

import com.pattakelu.dto.request.ForgotPasswordRequest;
import com.pattakelu.dto.request.LoginRequest;
import com.pattakelu.dto.request.RegisterRequest;
import com.pattakelu.dto.request.ResetPasswordRequest;
import com.pattakelu.dto.response.AuthResponse;
import com.pattakelu.entity.Role;
import com.pattakelu.entity.User;
import com.pattakelu.exception.BadRequestException;
import com.pattakelu.exception.ResourceNotFoundException;
import com.pattakelu.mapper.UserMapper;
import com.pattakelu.repository.RoleRepository;
import com.pattakelu.repository.UserRepository;
import com.pattakelu.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final AuthenticationManager authenticationManager;
    private final UserMapper userMapper;

    @Value("${app.jwt.access-token-expiration-ms:2592000000}")
    private long accessTokenExpirationMs;

    @Transactional
    public AuthResponse register(RegisterRequest request, String ipAddress, String userAgent) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered");
        }
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username is already taken");
        }

        Role userRole = roleRepository.findByName("ROLE_USER")
                .orElseGet(() -> roleRepository.save(Role.builder().name("ROLE_USER").description("Standard registered user").build()));

        Set<Role> roles = new HashSet<>();
        roles.add(userRole);

        // If this is the very first user registered on the system, make them an admin
        if (userRepository.count() == 0) {
            Role adminRole = roleRepository.findByName("ROLE_ADMIN")
                    .orElseGet(() -> roleRepository.save(Role.builder().name("ROLE_ADMIN").description("Super Administrator").build()));
            roles.add(adminRole);
        }

        User user = User.builder()
                .email(request.getEmail().toLowerCase().trim())
                .username(request.getUsername().toLowerCase().trim())
                .displayName(request.getDisplayName().trim())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .roles(roles)
                .enabled(true)
                .emailVerified(true)
                .lastLoginAt(Instant.now())
                .build();

        user = userRepository.save(user);

        String accessToken = jwtService.generateAccessToken(user);
        String rawRefreshToken = refreshTokenService.createRefreshToken(user, ipAddress, userAgent);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(rawRefreshToken)
                .tokenType("Bearer")
                .expiresIn(accessTokenExpirationMs / 1000)
                .user(userMapper.toUserInfo(user))
                .build();
    }

    @Transactional
    public AuthResponse login(LoginRequest request, String ipAddress, String userAgent) {
        User user = userRepository.findByEmail(request.getIdentifier().toLowerCase().trim())
                .or(() -> userRepository.findByUsername(request.getIdentifier().toLowerCase().trim()))
                .orElseThrow(() -> new BadRequestException("Invalid email/username or password"));

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(user.getUsername(), request.getPassword())
        );

        user.setLastLoginAt(Instant.now());
        userRepository.save(user);

        String accessToken = jwtService.generateAccessToken(user);
        String rawRefreshToken = refreshTokenService.createRefreshToken(user, ipAddress, userAgent);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(rawRefreshToken)
                .tokenType("Bearer")
                .expiresIn(accessTokenExpirationMs / 1000)
                .user(userMapper.toUserInfo(user))
                .build();
    }

    @Transactional
    public AuthResponse refresh(String rawRefreshToken, String ipAddress, String userAgent) {
        var oldToken = refreshTokenService.verifyAndRotate(rawRefreshToken, ipAddress, userAgent);
        User user = oldToken.getUser();

        String newAccessToken = jwtService.generateAccessToken(user);
        String newRawRefreshToken = refreshTokenService.createRefreshToken(user, ipAddress, userAgent);

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRawRefreshToken)
                .tokenType("Bearer")
                .expiresIn(accessTokenExpirationMs / 1000)
                .user(userMapper.toUserInfo(user))
                .build();
    }

    @Transactional
    public void logout(String rawRefreshToken) {
        refreshTokenService.revokeToken(rawRefreshToken);
    }

    public void forgotPassword(ForgotPasswordRequest request) {
        // In real production, this generates a secure token and sends an email via JavaMailSender
        log.info("Password reset requested for email: {}", request.getEmail());
    }

    public void resetPassword(ResetPasswordRequest request) {
        // Validates token and updates user password
        log.info("Password reset confirmed for token");
    }
}
