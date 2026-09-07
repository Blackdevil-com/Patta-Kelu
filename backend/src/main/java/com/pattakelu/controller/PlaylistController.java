package com.pattakelu.controller;

import com.pattakelu.dto.request.AddSongToPlaylistRequest;
import com.pattakelu.dto.request.CreatePlaylistRequest;
import com.pattakelu.dto.request.UpdatePlaylistRequest;
import com.pattakelu.dto.response.ApiResponse;
import com.pattakelu.dto.response.PagedResponse;
import com.pattakelu.dto.response.PlaylistResponse;
import com.pattakelu.security.SecurityUtils;
import com.pattakelu.service.PlaylistService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/playlists")
@RequiredArgsConstructor
@Tag(name = "Playlists", description = "Create, modify, view, and manage playlists")
public class PlaylistController {

    private final PlaylistService playlistService;

    @GetMapping("/me")
    @Operation(summary = "Get playlists created by authenticated user")
    public ResponseEntity<ApiResponse<PagedResponse<PlaylistResponse>>> getMyPlaylists(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = SecurityUtils.getAuthenticatedUserId(userDetails);
        return ResponseEntity.ok(ApiResponse.ok(playlistService.getUserPlaylists(userId, page, size)));
    }

    @PostMapping
    @Operation(summary = "Create a new playlist")
    public ResponseEntity<ApiResponse<PlaylistResponse>> createPlaylist(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody CreatePlaylistRequest request) {
        UUID userId = SecurityUtils.getAuthenticatedUserId(userDetails);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Playlist created", playlistService.createPlaylist(userId, request)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get playlist by ID with tracks (Enforces private access control)")
    public ResponseEntity<ApiResponse<PlaylistResponse>> getPlaylistById(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = SecurityUtils.getOptionalUserId(userDetails);
        return ResponseEntity.ok(ApiResponse.ok(playlistService.getPlaylistById(id, userId)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update playlist metadata (owner only)")
    public ResponseEntity<ApiResponse<PlaylistResponse>> updatePlaylist(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody UpdatePlaylistRequest request) {
        UUID userId = SecurityUtils.getAuthenticatedUserId(userDetails);
        return ResponseEntity.ok(ApiResponse.ok("Playlist updated", playlistService.updatePlaylist(id, userId, request)));
    }

    @PostMapping(value = "/{id}/cover", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload and update playlist cover artwork (owner only)")
    public ResponseEntity<ApiResponse<PlaylistResponse>> uploadPlaylistCover(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam("cover") org.springframework.web.multipart.MultipartFile file) {
        UUID userId = SecurityUtils.getAuthenticatedUserId(userDetails);
        return ResponseEntity.ok(ApiResponse.ok("Playlist cover updated", playlistService.uploadPlaylistCover(id, userId, file)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete playlist (owner only)")
    public ResponseEntity<ApiResponse<Void>> deletePlaylist(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = SecurityUtils.getAuthenticatedUserId(userDetails);
        playlistService.deletePlaylist(id, userId);
        return ResponseEntity.ok(ApiResponse.ok("Playlist deleted", null));
    }

    @PostMapping("/{id}/songs")
    @Operation(summary = "Add a song to playlist (owner only)")
    public ResponseEntity<ApiResponse<Void>> addSongToPlaylist(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody AddSongToPlaylistRequest request) {
        UUID userId = SecurityUtils.getAuthenticatedUserId(userDetails);
        playlistService.addSongToPlaylist(id, request.getSongId(), userId);
        return ResponseEntity.ok(ApiResponse.ok("Song added to playlist", null));
    }

    @DeleteMapping("/{id}/songs/{songId}")
    @Operation(summary = "Remove a song from playlist (owner only)")
    public ResponseEntity<ApiResponse<Void>> removeSongFromPlaylist(
            @PathVariable UUID id,
            @PathVariable UUID songId,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = SecurityUtils.getAuthenticatedUserId(userDetails);
        playlistService.removeSongFromPlaylist(id, songId, userId);
        return ResponseEntity.ok(ApiResponse.ok("Song removed from playlist", null));
    }
}
