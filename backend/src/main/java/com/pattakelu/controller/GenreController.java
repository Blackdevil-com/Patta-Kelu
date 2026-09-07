package com.pattakelu.controller;

import com.pattakelu.dto.response.ApiResponse;
import com.pattakelu.dto.response.GenreResponse;
import com.pattakelu.service.CatalogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/genres")
@RequiredArgsConstructor
@Tag(name = "Genres", description = "Music genres catalog")
public class GenreController {

    private final CatalogService catalogService;

    @GetMapping
    @Operation(summary = "Get all music genres")
    public ResponseEntity<ApiResponse<List<GenreResponse>>> getAllGenres() {
        return ResponseEntity.ok(ApiResponse.ok(catalogService.getAllGenres()));
    }
}
