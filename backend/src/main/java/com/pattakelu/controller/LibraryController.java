package com.pattakelu.controller;

import com.pattakelu.dto.response.ApiResponse;
import com.pattakelu.dto.response.ArtistResponse;
import com.pattakelu.dto.response.PagedResponse;
import com.pattakelu.dto.response.SongResponse;
import com.pattakelu.security.SecurityUtils;
import com.pattakelu.service.LibraryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/library")
@RequiredArgsConstructor
@Tag(name = "Library", description = "User personal library: liked songs, followed artists, saved albums")
public class LibraryController {

    private final LibraryService libraryService;

    @PostMapping("/likes/{songId}")
    @Operation(summary = "Like a song")
    public ResponseEntity<ApiResponse<Void>> likeSong(
            @PathVariable UUID songId,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = SecurityUtils.getAuthenticatedUserId(userDetails);
        libraryService.likeSong(userId, songId);
        return ResponseEntity.ok(ApiResponse.ok("Song added to liked songs", null));
    }

    @DeleteMapping("/likes/{songId}")
    @Operation(summary = "Remove a song from liked songs")
    public ResponseEntity<ApiResponse<Void>> unlikeSong(
            @PathVariable UUID songId,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = SecurityUtils.getAuthenticatedUserId(userDetails);
        libraryService.unlikeSong(userId, songId);
        return ResponseEntity.ok(ApiResponse.ok("Song removed from liked songs", null));
    }

    @GetMapping("/likes")
    @Operation(summary = "Get authenticated user's liked songs")
    public ResponseEntity<ApiResponse<PagedResponse<SongResponse>>> getLikedSongs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = SecurityUtils.getAuthenticatedUserId(userDetails);
        return ResponseEntity.ok(ApiResponse.ok(libraryService.getLikedSongs(userId, page, size)));
    }

    @PostMapping("/artists/{artistId}/follow")
    @Operation(summary = "Follow an artist")
    public ResponseEntity<ApiResponse<Void>> followArtist(
            @PathVariable UUID artistId,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = SecurityUtils.getAuthenticatedUserId(userDetails);
        libraryService.followArtist(userId, artistId);
        return ResponseEntity.ok(ApiResponse.ok("Artist followed", null));
    }

    @DeleteMapping("/artists/{artistId}/follow")
    @Operation(summary = "Unfollow an artist")
    public ResponseEntity<ApiResponse<Void>> unfollowArtist(
            @PathVariable UUID artistId,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = SecurityUtils.getAuthenticatedUserId(userDetails);
        libraryService.unfollowArtist(userId, artistId);
        return ResponseEntity.ok(ApiResponse.ok("Artist unfollowed", null));
    }

    @GetMapping("/artists")
    @Operation(summary = "Get user's followed artists")
    public ResponseEntity<ApiResponse<PagedResponse<ArtistResponse>>> getFollowedArtists(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = SecurityUtils.getAuthenticatedUserId(userDetails);
        return ResponseEntity.ok(ApiResponse.ok(libraryService.getFollowedArtists(userId, page, size)));
    }
}
