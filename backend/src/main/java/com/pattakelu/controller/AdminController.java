package com.pattakelu.controller;

import com.pattakelu.dto.request.StatusChangeRequest;
import com.pattakelu.dto.response.*;
import com.pattakelu.entity.AuditLog;
import com.pattakelu.service.AdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Administration", description = "Admin dashboard metrics, user moderation, song uploads, and audit logs")
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/stats")
    @Operation(summary = "Get platform overview metrics and statistics")
    public ResponseEntity<ApiResponse<AdminDashboardStatsResponse>> getStats() {
        return ResponseEntity.ok(ApiResponse.ok(adminService.getDashboardStats()));
    }

    @GetMapping("/users")
    @Operation(summary = "Get paginated user list for moderation")
    public ResponseEntity<ApiResponse<PagedResponse<UserProfileResponse>>> getUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.ok(adminService.getAllUsers(page, size)));
    }

    @PatchMapping("/users/{id}/status")
    @Operation(summary = "Suspend or reactivate user account")
    public ResponseEntity<ApiResponse<Void>> updateUserStatus(
            @PathVariable UUID id,
            @RequestBody StatusChangeRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID adminId = UUID.fromString(userDetails.getUsername());
        adminService.updateUserStatus(id, request.getEnabled(), adminId);
        return ResponseEntity.ok(ApiResponse.ok("User status updated", null));
    }

    @PostMapping(value = "/songs", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload and register new song with audio and cover artwork")
    public ResponseEntity<ApiResponse<SongResponse>> uploadSong(
            @RequestParam("title") String title,
            @RequestParam("artistName") String artistName,
            @RequestParam(value = "albumTitle", required = false) String albumTitle,
            @RequestParam(value = "genreName", required = false) String genreName,
            @RequestParam(value = "duration", defaultValue = "180") Integer duration,
            @RequestPart(value = "audioFile", required = false) MultipartFile audioFile,
            @RequestPart(value = "coverImageFile", required = false) MultipartFile coverImageFile,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID adminId = UUID.fromString(userDetails.getUsername());
        SongResponse response = adminService.uploadSong(
                title, artistName, albumTitle, genreName, audioFile, coverImageFile, duration, adminId);
        return ResponseEntity.ok(ApiResponse.ok("Song uploaded successfully", response));
    }

    @DeleteMapping("/songs/{id}")
    @Operation(summary = "Permanently delete song and its associations (admin only)")
    public ResponseEntity<ApiResponse<Void>> deleteSong(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID adminId = UUID.fromString(userDetails.getUsername());
        adminService.deleteSong(id, adminId);
        return ResponseEntity.ok(ApiResponse.ok("Song permanently deleted", null));
    }

    @GetMapping("/audit-logs")
    @Operation(summary = "Get paginated security and moderation audit logs")
    public ResponseEntity<ApiResponse<PagedResponse<AuditLog>>> getAuditLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        return ResponseEntity.ok(ApiResponse.ok(adminService.getAuditLogs(page, size)));
    }
}
