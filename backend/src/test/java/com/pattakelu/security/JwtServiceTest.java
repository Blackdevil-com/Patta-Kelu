package com.pattakelu.security;

import com.pattakelu.entity.Role;
import com.pattakelu.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "jwtSecret", "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970");
        ReflectionTestUtils.setField(jwtService, "accessTokenExpirationMs", 900000L);
    }

    @Test
    void shouldGenerateAndValidateAccessToken() {
        User user = User.builder()
                .id(UUID.randomUUID())
                .username("testuser")
                .email("test@pattakelu.com")
                .roles(Set.of(Role.builder().name("ROLE_USER").build()))
                .build();

        String token = jwtService.generateAccessToken(user);

        assertNotNull(token);
        assertTrue(jwtService.isTokenValid(token));
        assertEquals(user.getId().toString(), jwtService.extractUserId(token));
    }
}
