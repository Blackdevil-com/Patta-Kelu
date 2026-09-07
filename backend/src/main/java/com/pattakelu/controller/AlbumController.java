package com.pattakelu.controller;

import com.pattakelu.dto.response.AlbumResponse;
import com.pattakelu.dto.response.ApiResponse;
import com.pattakelu.dto.response.SongResponse;
import com.pattakelu.service.CatalogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/albums")
@RequiredArgsConstructor
@Tag(name = "Albums", description = "Browse albums and track listings")
public class AlbumController {

    private final CatalogService catalogService;

    @GetMapping("/{id}")
    @Operation(summary = "Get album details by ID")
    public ResponseEntity<ApiResponse<AlbumResponse>> getAlbumById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(catalogService.getAlbumById(id)));
    }

    @GetMapping("/{id}/songs")
    @Operation(summary = "Get album tracks ordered by track number")
    public ResponseEntity<ApiResponse<List<SongResponse>>> getAlbumSongs(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = userDetails != null ? UUID.fromString(userDetails.getUsername()) : null;
        return ResponseEntity.ok(ApiResponse.ok(catalogService.getAlbumSongs(id, userId)));
    }
}
