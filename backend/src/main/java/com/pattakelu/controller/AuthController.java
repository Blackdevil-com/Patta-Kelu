package com.pattakelu.controller;

import com.pattakelu.dto.request.ForgotPasswordRequest;
import com.pattakelu.dto.request.LoginRequest;
import com.pattakelu.dto.request.RefreshTokenRequest;
import com.pattakelu.dto.request.RegisterRequest;
import com.pattakelu.dto.request.ResetPasswordRequest;
import com.pattakelu.dto.response.ApiResponse;
import com.pattakelu.dto.response.AuthResponse;
import com.pattakelu.exception.UnauthorizedException;
import com.pattakelu.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Endpoints for user registration, authentication, and session tokens")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @Operation(summary = "Register a new user account")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @Valid @RequestBody RegisterRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        AuthResponse response = authService.register(request, httpRequest.getRemoteAddr(), httpRequest.getHeader("User-Agent"));
        attachRefreshTokenCookie(httpResponse, response.getRefreshToken());
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Registration successful", response));
    }

    @PostMapping("/login")
    @Operation(summary = "Authenticate user with email/username and password")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        AuthResponse response = authService.login(request, httpRequest.getRemoteAddr(), httpRequest.getHeader("User-Agent"));
        attachRefreshTokenCookie(httpResponse, response.getRefreshToken());
        return ResponseEntity.ok(ApiResponse.ok("Login successful", response));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Rotate refresh token and issue new access token")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(
            @RequestBody(required = false) RefreshTokenRequest request,
            @CookieValue(name = "refresh_token", required = false) String cookieToken,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        String token = (cookieToken != null && !cookieToken.isBlank()) ? cookieToken : (request != null ? request.getRefreshToken() : null);
        if (token == null || token.isBlank()) {
            throw new UnauthorizedException("No refresh token provided");
        }
        AuthResponse response = authService.refresh(token, httpRequest.getRemoteAddr(), httpRequest.getHeader("User-Agent"));
        attachRefreshTokenCookie(httpResponse, response.getRefreshToken());
        return ResponseEntity.ok(ApiResponse.ok("Token refreshed successfully", response));
    }

    @PostMapping("/logout")
    @Operation(summary = "Revoke current refresh token and clear session cookie")
    public ResponseEntity<ApiResponse<Void>> logout(
            @RequestBody(required = false) RefreshTokenRequest request,
            @CookieValue(name = "refresh_token", required = false) String cookieToken,
            HttpServletResponse httpResponse) {
        String token = (cookieToken != null && !cookieToken.isBlank()) ? cookieToken : (request != null ? request.getRefreshToken() : null);
        authService.logout(token);
        clearRefreshTokenCookie(httpResponse);
        return ResponseEntity.ok(ApiResponse.ok("Logged out successfully", null));
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Initiate password reset via email")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        return ResponseEntity.ok(ApiResponse.ok("If the email exists, a password reset link has been dispatched", null));
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Reset password using verified reset token")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(ApiResponse.ok("Password successfully updated", null));
    }

    private void attachRefreshTokenCookie(HttpServletResponse response, String refreshToken) {
        Cookie cookie = new Cookie("refresh_token", refreshToken);
        cookie.setHttpOnly(true);
        cookie.setSecure(false);
        cookie.setPath("/api/v1/auth");
        cookie.setMaxAge(7 * 24 * 60 * 60);
        response.addCookie(cookie);
    }

    private void clearRefreshTokenCookie(HttpServletResponse response) {
        Cookie cookie = new Cookie("refresh_token", "");
        cookie.setHttpOnly(true);
        cookie.setPath("/api/v1/auth");
        cookie.setMaxAge(0);
        response.addCookie(cookie);
    }
}
