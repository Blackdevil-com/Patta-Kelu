package com.pattakelu.service;

import com.pattakelu.entity.RefreshToken;
import com.pattakelu.entity.User;
import com.pattakelu.exception.UnauthorizedException;
import com.pattakelu.repository.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.HexFormat;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private static final Logger log = LoggerFactory.getLogger(RefreshTokenService.class);

    private final RefreshTokenRepository refreshTokenRepository;

    @Value("${app.jwt.refresh-token-expiration-ms:604800000}")
    private long refreshTokenExpirationMs;

    public String createRefreshToken(User user, String ipAddress, String userAgent) {
        String rawToken = UUID.randomUUID().toString();
        String tokenHash = hashToken(rawToken);

        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .tokenHash(tokenHash)
                .expiresAt(Instant.now().plusMillis(refreshTokenExpirationMs))
                .revoked(false)
                .ipAddress(ipAddress)
                .userAgent(userAgent)
                .build();

        refreshTokenRepository.save(refreshToken);
        return rawToken;
    }

    @Transactional
    public RefreshToken verifyAndRotate(String rawToken, String ipAddress, String userAgent) {
        if (rawToken == null || rawToken.isBlank()) {
            throw new UnauthorizedException("Refresh token is required");
        }

        String tokenHash = hashToken(rawToken);
        RefreshToken token = refreshTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new UnauthorizedException("Invalid refresh token"));

        // Refresh token reuse detection
        if (token.getRevoked()) {
            log.warn("SECURITY ALERT: Attempted reuse of revoked refresh token for user {}. Revoking all tokens.",
                    token.getUser().getEmail());
            refreshTokenRepository.revokeAllUserTokens(token.getUser());
            throw new UnauthorizedException("Invalid session state. Please login again.");
        }

        if (token.isExpired()) {
            token.setRevoked(true);
            refreshTokenRepository.save(token);
            throw new UnauthorizedException("Refresh token has expired");
        }

        // Revoke the old token
        token.setRevoked(true);
        refreshTokenRepository.save(token);

        return token;
    }

    @Transactional
    public void revokeToken(String rawToken) {
        if (rawToken == null || rawToken.isBlank()) return;
        String tokenHash = hashToken(rawToken);
        refreshTokenRepository.findByTokenHash(tokenHash).ifPresent(token -> {
            token.setRevoked(true);
            refreshTokenRepository.save(token);
        });
    }

    @Transactional
    public void revokeAllUserTokens(User user) {
        refreshTokenRepository.revokeAllUserTokens(user);
    }

    public String hashToken(String rawToken) {
        if (rawToken == null || rawToken.isBlank()) {
            throw new UnauthorizedException("Invalid refresh token");
        }
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(rawToken.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not available", e);
        }
    }
}
