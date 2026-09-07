package com.pattakelu.service;

import com.pattakelu.dto.request.RegisterRequest;
import com.pattakelu.dto.response.AuthResponse;
import com.pattakelu.entity.Role;
import com.pattakelu.entity.User;
import com.pattakelu.mapper.UserMapper;
import com.pattakelu.repository.RoleRepository;
import com.pattakelu.repository.UserRepository;
import com.pattakelu.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private RoleRepository roleRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtService jwtService;
    @Mock private RefreshTokenService refreshTokenService;
    @Mock private AuthenticationManager authenticationManager;
    @Mock private UserMapper userMapper;

    @InjectMocks private AuthService authService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(authService, "accessTokenExpirationMs", 900000L);
    }

    @Test
    void shouldRegisterNewUserSuccessfully() {
        RegisterRequest req = new RegisterRequest();
        req.setEmail("newuser@pattakelu.com");
        req.setUsername("newuser");
        req.setDisplayName("New User");
        req.setPassword("Secret@123");

        when(userRepository.existsByEmail(any())).thenReturn(false);
        when(userRepository.existsByUsername(any())).thenReturn(false);
        when(roleRepository.findByName("ROLE_USER")).thenReturn(Optional.of(Role.builder().id(1L).name("ROLE_USER").build()));
        when(passwordEncoder.encode(any())).thenReturn("hashed_password");
        when(userRepository.count()).thenReturn(1L);

        User savedUser = User.builder()
                .id(UUID.randomUUID())
                .email(req.getEmail())
                .username(req.getUsername())
                .displayName(req.getDisplayName())
                .build();
        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        when(jwtService.generateAccessToken(any(User.class))).thenReturn("mock-access-token");
        when(refreshTokenService.createRefreshToken(any(User.class), any(), any())).thenReturn("mock-refresh-token");
        when(userMapper.toUserInfo(any(User.class))).thenReturn(new AuthResponse.UserInfo(savedUser.getId(), savedUser.getEmail(), savedUser.getUsername(), savedUser.getDisplayName(), null, null));

        AuthResponse resp = authService.register(req, "127.0.0.1", "test-agent");

        assertNotNull(resp);
        assertEquals("mock-access-token", resp.getAccessToken());
        assertEquals("mock-refresh-token", resp.getRefreshToken());
        assertEquals("Bearer", resp.getTokenType());
        verify(userRepository, times(1)).save(any(User.class));
    }
}
