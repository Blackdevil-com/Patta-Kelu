package com.pattakelu.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlbumResponse {
    private UUID id;
    private String title;
    private UUID artistId;
    private String artistName;
    private String coverImageUrl;
    private String albumType;
    private LocalDate releaseDate;
    private Integer totalTracks;
}
