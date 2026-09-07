package com.pattakelu.controller;

import com.pattakelu.dto.response.AlbumResponse;
import com.pattakelu.dto.response.ApiResponse;
import com.pattakelu.dto.response.ArtistResponse;
import com.pattakelu.dto.response.PagedResponse;
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
@RequestMapping("/api/v1/artists")
@RequiredArgsConstructor
@Tag(name = "Artists", description = "Browse artists, profile details, albums, and discography")
public class ArtistController {

    private final CatalogService catalogService;

    @GetMapping
    @Operation(summary = "Get paginated artists sorted by monthly listeners")
    public ResponseEntity<ApiResponse<PagedResponse<ArtistResponse>>> getAllArtists(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = extractUserId(userDetails);
        return ResponseEntity.ok(ApiResponse.ok(catalogService.getAllArtists(page, size, userId)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get artist profile by ID")
    public ResponseEntity<ApiResponse<ArtistResponse>> getArtistById(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = extractUserId(userDetails);
        return ResponseEntity.ok(ApiResponse.ok(catalogService.getArtistById(id, userId)));
    }

    @GetMapping("/{id}/songs")
    @Operation(summary = "Get top songs by artist")
    public ResponseEntity<ApiResponse<List<SongResponse>>> getArtistSongs(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = extractUserId(userDetails);
        return ResponseEntity.ok(ApiResponse.ok(catalogService.getArtistSongs(id, userId)));
    }

    @GetMapping("/{id}/albums")
    @Operation(summary = "Get albums released by artist")
    public ResponseEntity<ApiResponse<List<AlbumResponse>>> getArtistAlbums(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(catalogService.getArtistAlbums(id)));
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
