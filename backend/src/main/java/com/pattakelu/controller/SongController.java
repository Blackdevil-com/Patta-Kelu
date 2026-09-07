package com.pattakelu.controller;

import com.pattakelu.dto.request.PlayEventRequest;
import com.pattakelu.dto.response.ApiResponse;
import com.pattakelu.dto.response.PagedResponse;
import com.pattakelu.dto.response.SongResponse;
import com.pattakelu.service.CatalogService;
import com.pattakelu.service.StreamService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/songs")
@RequiredArgsConstructor
@Tag(name = "Songs", description = "Endpoints for song catalog browsing, metadata, and audio streaming")
public class SongController {

    private final CatalogService catalogService;
    private final StreamService streamService;

    @GetMapping
    @Operation(summary = "Get paginated list of catalog songs")
    public ResponseEntity<ApiResponse<PagedResponse<SongResponse>>> getAllSongs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = extractUserId(userDetails);
        return ResponseEntity.ok(ApiResponse.ok(catalogService.getAllSongs(page, size, userId)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get song details by ID")
    public ResponseEntity<ApiResponse<SongResponse>> getSongById(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = extractUserId(userDetails);
        return ResponseEntity.ok(ApiResponse.ok(catalogService.getSongById(id, userId)));
    }

    @GetMapping("/{id}/stream")
    @Operation(summary = "Stream audio via HTTP byte-range request (RFC 7233)")
    public ResponseEntity<Resource> streamSong(
            @PathVariable UUID id,
            @RequestHeader(value = "Range", required = false) String rangeHeader) {
        return streamService.streamSong(id, rangeHeader);
    }

    @PostMapping("/{id}/play")
    @Operation(summary = "Log song playback session and increment play counter")
    public ResponseEntity<ApiResponse<Void>> recordPlayEvent(
            @PathVariable UUID id,
            @RequestBody(required = false) PlayEventRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        if (request == null) {
            request = new PlayEventRequest();
        }
        request.setSongId(id);
        UUID userId = extractUserId(userDetails);
        catalogService.recordPlayEvent(userId, request);
        return ResponseEntity.ok(ApiResponse.ok("Play recorded", null));
    }

    private UUID extractUserId(UserDetails userDetails) {
        if (userDetails != null && userDetails.getUsername() != null) {
            try {
                return UUID.fromString(userDetails.getUsername());
            } catch (IllegalArgumentException ignored) {}
        }
        return null;
    }
}
