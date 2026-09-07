package com.pattakelu.controller;

import com.pattakelu.dto.request.UpdateProfileRequest;
import com.pattakelu.dto.response.ApiResponse;
import com.pattakelu.dto.response.UserProfileResponse;
import com.pattakelu.security.SecurityUtils;
import com.pattakelu.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "User profile management")
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    @Operation(summary = "Get currently authenticated user profile")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = SecurityUtils.getAuthenticatedUserId(userDetails);
        return ResponseEntity.ok(ApiResponse.ok(userService.getCurrentUserProfile(userId)));
    }

    @PutMapping("/me")
    @Operation(summary = "Update authenticated user profile")
    public ResponseEntity<ApiResponse<UserProfileResponse>> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody UpdateProfileRequest request) {
        UUID userId = SecurityUtils.getAuthenticatedUserId(userDetails);
        return ResponseEntity.ok(ApiResponse.ok("Profile updated", userService.updateProfile(userId, request)));
    }

    @PostMapping(value = "/me/avatar", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload and update custom profile avatar")
    public ResponseEntity<ApiResponse<UserProfileResponse>> uploadAvatar(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam("avatar") org.springframework.web.multipart.MultipartFile file) {
        UUID userId = SecurityUtils.getAuthenticatedUserId(userDetails);
        return ResponseEntity.ok(ApiResponse.ok("Avatar updated", userService.uploadProfileImage(userId, file)));
    }
}
