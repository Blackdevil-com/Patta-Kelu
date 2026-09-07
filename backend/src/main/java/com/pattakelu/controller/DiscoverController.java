package com.pattakelu.controller;

import com.pattakelu.dto.response.ApiResponse;
import com.pattakelu.dto.response.HomeFeedResponse;
import com.pattakelu.service.RecommendationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/discover")
@RequiredArgsConstructor
@Tag(name = "Discovery & Recommendations", description = "Trending music, tailored recommendations, and home feeds")
public class DiscoverController {

    private final RecommendationService recommendationService;

    @GetMapping("/home")
    @Operation(summary = "Get aggregated home discovery feed")
    public ResponseEntity<ApiResponse<HomeFeedResponse>> getHomeFeed(@AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = null;
        if (userDetails != null && userDetails.getUsername() != null) {
            try {
                userId = UUID.fromString(userDetails.getUsername());
            } catch (Exception ignored) {}
        }
        return ResponseEntity.ok(ApiResponse.ok(recommendationService.getHomeFeed(userId)));
    }
}
