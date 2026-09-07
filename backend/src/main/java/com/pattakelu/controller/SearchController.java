package com.pattakelu.controller;

import com.pattakelu.dto.response.ApiResponse;
import com.pattakelu.dto.response.SearchResultResponse;
import com.pattakelu.service.SearchService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/search")
@RequiredArgsConstructor
@Tag(name = "Search", description = "Global multi-entity search across catalog and playlists")
public class SearchController {

    private final SearchService searchService;

    @GetMapping
    @Operation(summary = "Search songs, artists, albums, and playlists")
    public ResponseEntity<ApiResponse<SearchResultResponse>> search(
            @RequestParam String q,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = null;
        if (userDetails != null && userDetails.getUsername() != null) {
            try {
                userId = UUID.fromString(userDetails.getUsername());
            } catch (Exception ignored) {}
        }
        return ResponseEntity.ok(ApiResponse.ok(searchService.search(q, userId)));
    }
}
